const TOKEN_KEY = 'ciroh_admin_jwt';
const RETURN_TO_KEY = 'ciroh_admin_returnTo';

export function getStoredJwt() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredJwt(token) {
  if (typeof window === 'undefined') return;
  if (!token) return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearStoredJwt() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function consumeJwtFromUrl() {
  if (typeof window === 'undefined') return null;

  try {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');

    if (!token) return null;

    setStoredJwt(token);
    url.searchParams.delete('token');

    // Keep the user on the same page, but remove the token from the address bar.
    window.history.replaceState({}, document.title, url.toString());

    return token;
  } catch {
    return null;
  }
}

export function setLoginReturnTo(path) {
  if (typeof window === 'undefined') return;
  const value = String(path || '').trim();
  if (!value) return;
  try {
    window.sessionStorage.setItem(RETURN_TO_KEY, value);
  } catch {
    // ignore
  }
}

export function consumeLoginReturnTo() {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.sessionStorage.getItem(RETURN_TO_KEY);
    if (!value) return null;
    window.sessionStorage.removeItem(RETURN_TO_KEY);
    return value;
  } catch {
    return null;
  }
}
