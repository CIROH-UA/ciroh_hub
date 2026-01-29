import React, { useState, useEffect, useRef } from 'react';
import '@site/src/css/navbar-auth.css';
import { apiFetch, buildApiUrl } from '@site/src/utils/apiClient';
import { consumeJwtFromUrl, getStoredJwt, clearStoredJwt } from '@site/src/utils/authToken';
import { useApiBaseUrl } from '@site/src/utils/useApiBaseUrl';

export default function NavbarGithubAuth() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const apiBaseUrl = useApiBaseUrl();

  useEffect(() => {
    consumeJwtFromUrl();

    const checkAuth = async () => {
      try {
        const token = getStoredJwt();
        if (!token) {
          setUser(null);
          return;
        }

        const res = await apiFetch(apiBaseUrl, 'me', {
          method: 'GET',
          token,
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (e) {
        // Not logged in
      }
    };

    checkAuth();
  }, [apiBaseUrl]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      clearStoredJwt();
      setUser(null);
      window.location.href = '/';
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const handleLogin = () => {
    window.location.href = buildApiUrl(apiBaseUrl, 'github-login');
  };

  if (user) {
    return (
      <div className="navbar-user-menu navbar__item" ref={dropdownRef}>
        <button 
          className="navbar-user-button"
          onClick={() => setShowDropdown(!showDropdown)}
          onMouseEnter={() => setShowDropdown(true)}
        >
          <img 
            src={user.avatar_url || `https://github.com/${user.login}.png`} 
            alt={user.name || user.login}
            className="navbar-user-avatar"
          />
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="currentColor"
            className="navbar-dropdown-arrow"
          >
            <path d="M6 9L1 4h10z"/>
          </svg>
        </button>
        
        {showDropdown && (
          <div className="navbar-dropdown">
            <a href="/admin" className="navbar-dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Admin Panel
            </a>
            <button onClick={handleLogout} className="navbar-dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button className="navbar-github-login navbar__item" onClick={handleLogin}>
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="navbar-github-icon"
      >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      Login with GitHub
    </button>
  );
}
