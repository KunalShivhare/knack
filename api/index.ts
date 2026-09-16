import { createRequestHandler } from 'expo-server/adapter/vercel';

/**
 * The one Vercel function. `expo export` splits the web build in two: pages and
 * assets in dist/client, which Vercel serves as static files, and the API routes
 * plus anything that must render per request in dist/server, which this answers
 * for. vercel.json rewrites every path no static file matched to here.
 *
 * Vercel runs functions from the project root, where `includeFiles` places
 * dist/server.
 */
export default createRequestHandler({ build: `${process.cwd()}/dist/server` });
