import { create } from 'axios';

import { attachInterceptors } from './interceptors';

/**
 * Empty on web, where the API is served from the same origin as the app. Native
 * builds have no origin to inherit, so they need the value set.
 */
const baseURL = process.env.EXPO_PUBLIC_API_URL ?? '';

const TIMEOUT_MS = 20_000;

export const api = attachInterceptors(
  create({
    baseURL,
    timeout: TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  }),
);
