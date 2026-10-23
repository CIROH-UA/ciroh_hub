import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import DotGrid from './components/DotGrid';
import './styles.css';
import { apiFetch, buildApiUrl } from '@site/src/utils/apiClient';
import { clearStoredJwt, consumeJwtFromUrl, consumeLoginReturnTo, getStoredJwt, setLoginReturnTo } from '@site/src/utils/authToken';
import { useApiBaseUrl } from '@site/src/utils/useApiBaseUrl';

const AdminInner = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const apiBaseUrl = useApiBaseUrl();

  React.useEffect(() => {
    consumeJwtFromUrl();
  }, []);

  const logout = async () => {
    try {
      clearStoredJwt();
    } finally {
      window.location.href = '/';
    }
  };

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const token = getStoredJwt();
        if (!token) {
          setLoginReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
          window.location.href = buildApiUrl(apiBaseUrl, 'github-login');
          return;
        }

        const res = await apiFetch(apiBaseUrl, 'me', {
          method: 'GET',
          token,
        });

        if (res.status === 401) {
          setLoginReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
          window.location.href = buildApiUrl(apiBaseUrl, 'github-login');
          return;
        }

        const data = await res.json();
        if (!cancelled) setUser(data);

        // If we were redirected here after OAuth, send user back
        // to the originally requested admin page.
        const returnTo = consumeLoginReturnTo();
        if (returnTo && returnTo !== '/admin' && returnTo !== '/admin/') {
          window.location.href = returnTo;
          return;
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load admin session.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  const displayName = user?.name || user?.login || 'Admin';
  const initial = (displayName || 'A').trim().charAt(0).toUpperCase();
  const avatarSrc = user?.avatar_url || (user?.login ? `https://github.com/${user.login}.png` : null);

  return (
    <div className="admin-container">
      <div className="admin-background">
        <DotGrid
          dotSize={3}
          gap={25}
          baseColor="#334155"
          activeColor="#22d3ee"
          proximity={150}
          shockRadius={300}
          shockStrength={8}
          resistance={800}
          returnDuration={1.5}
        />
      </div>

      <div className="admin-content">
        {/* Header */}
        <header className="admin-header slide-in-right">
          <div className="admin-header-top">
            <div className="admin-header-text">
              <h1>Welcome Back, {displayName}</h1>
              <p>Manage your presence on CIROH Hub with ease</p>
              {error ? <p className="admin-header-error">{error}</p> : null}
            </div>

            <div className="admin-header-actions">
              <button className="admin-btn-notification" type="button" aria-label="Notifications">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="admin-notification-dot" />
              </button>

              <button type="button" onClick={logout} className="admin-btn-logout">
                Logout
              </button>

              <div className="admin-avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={displayName} />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
            </div>
          </div>
          <div className="admin-header-line" />
        </header>

        {/* Quick Actions Section */}
        <section className="admin-section">
          <h2 className="admin-section-title">Quick Actions</h2>
          <div className="admin-grid">
            <Link to="/admin/add-software" className="admin-card admin-card-blue delay-100">
              <div className="admin-card-inner">
                <div className="admin-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="admin-card-title">Add Software</h3>
                <p className="admin-card-desc">Create and manage your software catalog</p>
                <button type="button" className="admin-card-btn">Add New</button>
              </div>
            </Link>

            <Link to="/admin/add-blog" className="admin-card admin-card-purple delay-200">
              <div className="admin-card-inner">
                <div className="admin-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="admin-card-title">Add Blog</h3>
                <p className="admin-card-desc">Write and publish new blog posts</p>
                <button type="button" className="admin-card-btn">Create Post</button>
              </div>
            </Link>

            {/* <div className="admin-card admin-card-pink delay-300">
              <div className="admin-card-inner">
                <div className="admin-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="admin-card-title">Add Service</h3>
                <p className="admin-card-desc">Expand your service offerings</p>
                <button type="button" className="admin-card-btn">Add Service</button>
              </div>
            </div> */}

            {/* <div className="admin-card admin-card-emerald delay-400">
              <div className="admin-card-inner">
                <div className="admin-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="admin-card-title">View Analytics</h3>
                <p className="admin-card-desc">Track your performance metrics</p>
                <button type="button" className="admin-card-btn">View Stats</button>
              </div>
            </div> */}
          </div>
        </section>

        {/* Analytics Overview */}
        {/* <section className="admin-analytics-section fade-in-up delay-400">
          <h2 className="admin-section-title">Analytics Overview</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <div className="admin-stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="admin-stat-change">+12.5%</span>
              </div>
              <h4 className="admin-stat-label">Total Software</h4>
              <p className="admin-stat-value">2,847</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <div className="admin-stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <span className="admin-stat-change">+8.2%</span>
              </div>
              <h4 className="admin-stat-label">Blog Posts</h4>
              <p className="admin-stat-value">156</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <div className="admin-stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <span className="admin-stat-change">+15.3%</span>
              </div>
              <h4 className="admin-stat-label">Active Services</h4>
              <p className="admin-stat-value">42</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <div className="admin-stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="admin-stat-change">+23.1%</span>
              </div>
              <h4 className="admin-stat-label">Total Users</h4>
              <p className="admin-stat-value">18,492</p>
            </div>
          </div>

          <div className="admin-chart-box">
            <div className="admin-chart-inner">
              <div className="admin-chart-header">
                <h3 className="admin-chart-title">Performance Metrics</h3>
                <div className="admin-chart-buttons">
                  <button type="button" className="admin-chart-btn active">Week</button>
                  <button type="button" className="admin-chart-btn">Month</button>
                  <button type="button" className="admin-chart-btn">Year</button>
                </div>
              </div>
              <div className="admin-chart-container">
                <div className="admin-chart-bar admin-chart-bar-1" style={{ height: '60%' }} />
                <div className="admin-chart-bar admin-chart-bar-2" style={{ height: '75%' }} />
                <div className="admin-chart-bar admin-chart-bar-3" style={{ height: '45%' }} />
                <div className="admin-chart-bar admin-chart-bar-1" style={{ height: '85%' }} />
                <div className="admin-chart-bar admin-chart-bar-2" style={{ height: '55%' }} />
                <div className="admin-chart-bar admin-chart-bar-3" style={{ height: '90%' }} />
                <div className="admin-chart-bar admin-chart-bar-1" style={{ height: '70%' }} />
              </div>
              <div className="admin-chart-labels">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </section> */}

        {loading ? <div className="admin-loading">Loading session…</div> : null}
      </div>
    </div>
  );
};

export default function Admin() {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => <AdminInner />}
    </BrowserOnly>
  );
}