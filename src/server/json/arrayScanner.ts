/**
 * Pulls finished elements of one top-level array out of a JSON document that is
 * still arriving.
 *
 * The model streams the whole plan as a single JSON object, which cannot be
 * parsed until its last brace lands — fifteen seconds of nothing. This scanner
 * tracks just enough of the grammar (nesting depth, whether it is inside a
 * string, the current top-level key) to notice the moment an element of the
 * target array closes, and hands back that element's raw text to be parsed and
 * validated on its own. It is not a JSON parser and does not need to be: every
 * element it returns still goes through `JSON.parse` and the schema.
 */
export type ArrayScanner = {
  /** Feeds the next chunk and returns the raw text of any elements it completed. */
  push: (chunk: string) => string[];
  /** Everything received so far. */
  text: () => string;
};

export function createArrayScanner(key: string): ArrayScanner {
  let buffer = '';
  let position = 0;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let stringStart = -1;
  let lastString = '';
  let topLevelKey: string | null = null;
  let inTargetArray = false;
  let elementStart = -1;

  return {
    text: () => buffer,
    push(chunk) {
      buffer += chunk;
      const completed: string[] = [];

      for (; position < buffer.length; position += 1) {
        const char = buffer[position];

        if (inString) {
          if (escaped) escaped = false;
          else if (char === '\\') escaped = true;
          else if (char === '"') {
            inString = false;
            lastString = buffer.slice(stringStart + 1, position);
          }
          continue;
        }

        switch (char) {
          case '"':
            inString = true;
            stringStart = position;
            break;
          case ':':
            // Only keys of the root object matter; the array lives directly on it.
            if (depth === 1) topLevelKey = lastString;
            break;
          case '[':
            depth += 1;
            if (depth === 2 && topLevelKey === key) inTargetArray = true;
            break;
          case '{':
            depth += 1;
            if (inTargetArray && depth === 3) elementStart = position;
            break;
          case '}':
            if (inTargetArray && depth === 3 && elementStart !== -1) {
              completed.push(buffer.slice(elementStart, position + 1));
              elementStart = -1;
            }
            depth -= 1;
            break;
          case ']':
            if (inTargetArray && depth === 2) inTargetArray = false;
            depth -= 1;
            break;
        }
      }

      return completed;
    },
  };
}
