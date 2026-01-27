export const DEFAULT_API_BASE_URL =
  'https://67h5z9ih7j.execute-api.us-east-1.amazonaws.com/default';

export function normalizeApiBaseUrl(apiBaseUrl) {
  const raw = (apiBaseUrl || '').trim();
  const base = raw || DEFAULT_API_BASE_URL;
  return base.replace(/\/+$/, '');
}

export function buildApiUrl(apiBaseUrl, endpointOrPath) {
  const base = normalizeApiBaseUrl(apiBaseUrl);
  const path = String(endpointOrPath || '').replace(/^\/+/, '');
  const withPrefix = path.startsWith('api/') ? path : `api/${path}`;
  return `${base}/${withPrefix}`;
}

export async function apiFetch(apiBaseUrl, endpoint, options = {}) {
  const {
    token,
    headers,
    credentials,
    body,
    ...rest
  } = options;

  const url = buildApiUrl(apiBaseUrl, endpoint);

  const finalHeaders = {
    ...(headers || {}),
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let finalBody = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isString = typeof body === 'string';

  if (body != null && !isFormData && !isString && typeof body === 'object') {
    if (!finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json';
    }
    finalBody = JSON.stringify(body);
  }

  return fetch(url, {
    // CORS-friendly (JWT only, no cookies)
    credentials: credentials || 'omit',
    headers: finalHeaders,
    body: finalBody,
    ...rest,
  });
}
