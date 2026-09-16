/**
 * Yields a streamed body one line at a time, without the line break.
 *
 * Both ends of the plan stream are line-framed — Gemini's server-sent events on
 * the way in, newline-delimited JSON on the way out — so one reader serves the
 * API route and the app. `TextDecoder` in streaming mode rather than
 * `TextDecoderStream`, which React Native does not provide; `stream: true` keeps
 * a multi-byte character split across two chunks from decoding as garbage.
 */
export async function* readLines(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newline = buffer.indexOf('\n');
      while (newline !== -1) {
        yield buffer.slice(0, newline).replace(/\r$/, '');
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf('\n');
      }
    }

    buffer += decoder.decode();
    if (buffer.length > 0) yield buffer;
  } finally {
    reader.releaseLock();
  }
}
