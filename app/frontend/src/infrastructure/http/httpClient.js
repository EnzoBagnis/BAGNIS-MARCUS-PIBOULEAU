import { API_BASE_URL } from './config';

export class HttpError extends Error {
  constructor(status, payload, message) {
    super(message ?? `HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.payload = payload;
  }
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(method, endpoint, { body, headers, ...rest } = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  // Pour un upload multipart (FormData), on laisse le navigateur poser lui-même
  // le Content-Type (avec la boundary) et on n'encode pas le corps en JSON.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const finalHeaders = {
    Accept: 'application/json',
    ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    ...rest,
  });

  const payload = await parseBody(response);

  if (!response.ok) {
    throw new HttpError(response.status, payload);
  }

  return payload;
}

export const httpClient = {
  get(endpoint, options = {}) {
    return request('GET', endpoint, options);
  },
  post(endpoint, body, options = {}) {
    return request('POST', endpoint, { ...options, body });
  },
  put(endpoint, body, options = {}) {
    return request('PUT', endpoint, { ...options, body });
  },
  delete(endpoint, options = {}) {
    return request('DELETE', endpoint, options);
  },
};
