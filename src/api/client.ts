import { clearToken, getAuthHeader } from './auth-storage';
import type { ApiErrorBody } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export const API_BASE_URL = BASE_URL;

function handleUnauthorized(auth: boolean): void {
  if (!auth) return;
  clearToken();
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login';
  }
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  const data = await response.json().catch(() => ({}));
  return new ApiError(response.status, data as ApiErrorBody);
}

export class ApiError extends Error {
  status: number;
  error: string;
  details?: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || body.error);
    this.name = 'ApiError';
    this.status = status;
    this.error = body.error;
    this.details = body.details;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    Object.assign(requestHeaders, getAuthHeader());
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth) {
    handleUnauthorized(auth);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody);
  }

  return data as T;
}

export async function apiBlobRequest(path: string, auth = true): Promise<Blob> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: auth ? getAuthHeader() : {},
  });

  if (response.status === 401 && auth) {
    handleUnauthorized(auth);
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response.blob();
}

export async function apiFormRequest<T>(path: string, formData: FormData, auth = true): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: auth ? getAuthHeader() : {},
    body: formData,
  });

  if (response.status === 401 && auth) {
    handleUnauthorized(auth);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody);
  }

  return data as T;
}
