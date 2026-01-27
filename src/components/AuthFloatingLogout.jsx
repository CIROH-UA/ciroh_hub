import React from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { apiFetch } from '@site/src/utils/apiClient';
import { consumeJwtFromUrl, getStoredJwt, clearStoredJwt } from '@site/src/utils/authToken';
import { useApiBaseUrl } from '@site/src/utils/useApiBaseUrl';

export default function AuthFloatingLogout() {
  const isBrowser = useIsBrowser();
  const apiBaseUrl = useApiBaseUrl();
  const [user, setUser] = React.useState(null);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!isBrowser) return;
    consumeJwtFromUrl();
    let cancelled = false;

    const run = async () => {
      try {
        const token = getStoredJwt();
        if (!token) {
          if (!cancelled) setUser(null);
          return;
        }

        const res = await apiFetch(apiBaseUrl, 'me', {
          method: 'GET',
          token,
        });
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setChecked(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isBrowser, apiBaseUrl]);

  if (!isBrowser) return null;
  if (!checked) return null;
  if (!user?.login) return null;

  const logout = async () => {
    try {
      clearStoredJwt();
    } finally {
      window.location.href = '/';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        top: 'calc(var(--ifm-navbar-height) + 16px)',
        zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={logout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(15,23,42,0.85)',
          color: 'white',
          cursor: 'pointer',
        }}
        aria-label="Logout"
      >
        <span style={{ fontWeight: 700, fontSize: 13 }}>Logout</span>
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user?.name || user?.login}
            style={{ width: 22, height: 22, borderRadius: 8, objectFit: 'cover' }}
          />
        ) : null}
      </button>
    </div>
  );
}
