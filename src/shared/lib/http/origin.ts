/**
 * Where the API routes are served from. On web, the page's own origin. On native,
 * expo-router's runtime points `window.location` at the dev server in development
 * and at the `origin` set on its config plugin in a release build — so the app
 * needs no separate API URL setting, and one relative path works everywhere.
 */
export function apiUrl(path: string): string {
  return `${globalThis.location?.origin ?? ''}${path}`;
}
