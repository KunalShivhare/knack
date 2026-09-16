import { create } from 'axios';

import { attachInterceptors } from './interceptors';
import { apiUrl } from './origin';

const TIMEOUT_MS = 20_000;

export const api = attachInterceptors(
  create({
    baseURL: apiUrl(''),
    timeout: TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  }),
);
