import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { isApiError, toApiError } from '../errors';

const response = (status: number, data?: unknown): AxiosResponse => ({
  status,
  data,
  statusText: '',
  headers: {},
  config: { headers: new AxiosHeaders() },
});

describe('toApiError', () => {
  it('reports a timeout as a timeout, not a network failure', () => {
    // A timed-out request carries no response, so ordering matters here.
    const error = new AxiosError('timeout of 20000ms exceeded', 'ECONNABORTED');

    expect(toApiError(error).kind).toBe('timeout');
  });

  it('reports an unreachable server as a network failure', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');

    const result = toApiError(error);

    expect(result.kind).toBe('network');
    expect(result.status).toBeUndefined();
  });

  it('keeps the status when the server answered', () => {
    const error = new AxiosError('Request failed', 'ERR_BAD_RESPONSE');
    error.response = response(500);

    const result = toApiError(error);

    expect(result.kind).toBe('http');
    expect(result.status).toBe(500);
  });

  it('prefers the server message over the generic one', () => {
    const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST');
    error.response = response(429, { message: 'Daily limit reached.' });

    expect(toApiError(error).message).toBe('Daily limit reached.');
  });

  it('ignores a non-string server message', () => {
    const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST');
    error.response = response(400, { message: { code: 12 } });

    expect(toApiError(error).message).toContain('went wrong');
  });

  it('normalises anything that is not an axios error', () => {
    expect(toApiError(new Error('boom')).kind).toBe('unknown');
    expect(toApiError('boom').kind).toBe('unknown');
  });
});

describe('isApiError', () => {
  it('accepts a normalised error and rejects a raw one', () => {
    expect(isApiError(toApiError(new Error('boom')))).toBe(true);
    expect(isApiError(new Error('boom'))).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});
