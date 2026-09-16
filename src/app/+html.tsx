import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { colors } from '@/theme';

/**
 * The HTML document for web, rendered on the server. Native builds never load it.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover hands the safe-area insets to notched phones in a browser too. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta
          name="description"
          content="Five techniques, not five hundred. Learn any hobby without the rabbit hole."
        />
        <meta name="theme-color" content={colors.surface.canvas} />

        {/* The body does not scroll; screens scroll inside their own ScrollViews, as on native. */}
        <ScrollViewStyleReset />

        {/* The ground is painted before any script runs, so the first frame is not a flash of a different colour. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `html, body { background-color: ${colors.surface.canvas}; }`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
