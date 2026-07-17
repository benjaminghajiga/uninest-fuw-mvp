import React, { useState, useEffect } from 'react';
import { confirmPayStripeSession } from './store.js';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import Applications from './pages/Applications.jsx';
import Landlords from './pages/Landlords.jsx';
import Payments from './pages/Payments.jsx';
import Settings from './pages/Settings.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Properties from './pages/Properties.jsx';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState(null); // 'signin' | 'signup' | null
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // check for existing auth token
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => {
          if (!r.ok) throw new Error('invalid');
          return r.json();
        })
        .then((data) => {
          setAuthenticated(true);
          setUser(data.user || JSON.parse(localStorage.getItem('auth_user') || 'null'));
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        });
    }

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id') || params.get('sessionId');
    if (sessionId) {
      confirmPayStripeSession(sessionId)
        .then((res) => {
          const url = new URL(window.location.href);
          url.searchParams.delete('session_id');
          url.searchParams.delete('sessionId');
          window.history.replaceState({}, document.title, url.toString());
          if (res && res.transaction) {
            alert('Payment confirmed. Transaction updated.');
          } else {
            console.log('Stripe session confirmed, but no transaction updated.', res);
          }
        })
        .catch((err) => {
          console.warn('Failed to confirm Stripe session:', err);
        });
    }
  }, []);

  if (!authenticated) {
    return (
      <div className="landing">
        <header className="landing-header" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>UniNest FUW</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Student Housing Platform</div>
            </div>
            <div>
              <button className="btn btn-ghost" onClick={() => setAuthMode('signin')}>Sign in</button>
              <button className="btn" style={{ marginLeft: 8 }} onClick={() => setAuthMode('signup')}>Create account</button>
            </div>
          </div>
        </header>

        <main className="landing-main" style={{ padding: 48, textAlign: 'left' }}>
          <h1 style={{ margin: 0 }}>UniNest FUW</h1>
          <p style={{ color: 'var(--text2)', maxWidth: 720 }}>
            Manage student housing applications, verified landlords, and payments from a single place. This
            simplified landing page gives a clear entry point for administrators and landlords.
          </p>
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary" onClick={() => setAuthMode('signin')}>Sign in</button>
            <button className="btn btn-outline" style={{ marginLeft: 12 }} onClick={() => setAuthMode('signup')}>Create account</button>
          </div>
        </main>

        <footer className="landing-footer" style={{ padding: 24, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          <small style={{ color: 'var(--text3)' }}>MVP — data stored locally unless a backend is connected.</small>
        </footer>

        {authMode && (
          <div className="auth-modal" style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.4)' }}>
            <div style={{ width: 760, maxWidth: '95%', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
              <Auth
                initialMode={authMode}
                onAuthSuccess={(data) => {
                  if (data?.token) {
                    localStorage.setItem('auth_token', data.token);
                    localStorage.setItem('auth_user', JSON.stringify(data.user || {}));
                    setAuthenticated(true);
                    setUser(data.user || null);
                  }
                  setAuthMode(null);
                }}
                onClose={() => setAuthMode(null)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  function handleLogout() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('/api/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setAuthenticated(false);
    setUser(null);
    setAuthMode(null);
    setCurrentPage('home');
  }

  // Navigation pages available to all roles
  const commonPages = [
    { id: 'home', label: 'Home', icon: 'ti-home' },
    { id: 'applications', label: 'Applications', icon: 'ti-forms' },
    { id: 'settings', label: 'Settings', icon: 'ti-settings' },
  ];

  // Role-specific pages
  const studentPages = [
    { id: 'home', label: 'Home', icon: 'ti-home' },
    { id: 'marketplace', label: 'Marketplace', icon: 'ti-home-search' },
    { id: 'applications', label: 'My Applications', icon: 'ti-forms' },
    { id: 'settings', label: 'Settings', icon: 'ti-settings' },
  ];

  const landlordPages = [
    { id: 'home', label: 'Home', icon: 'ti-home' },
    { id: 'properties', label: 'My Properties', icon: 'ti-home-2' },
    { id: 'payments', label: 'Payments', icon: 'ti-wallet' },
    { id: 'settings', label: 'Settings', icon: 'ti-settings' },
  ];

  const navPages = user?.role === 'landlord' ? landlordPages : studentPages;

  function renderPage() {
    switch (currentPage) {
      case 'home': return <Home />;
      case 'applications': return <Applications />;
      case 'landlords': return <Landlords />;
      case 'payments': return <Payments />;
      case 'settings': return <Settings user={user} onLogout={handleLogout} />;
      default: return <Home />;
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: 240, borderRight: '1px solid rgba(0,0,0,0.04)', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: 24, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>UniNest FUW</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            {user?.role === 'landlord' ? 'Landlord' : 'Student'}
          </div>
        </div>
        <nav style={{ flex: 1, padding: 12 }}>
          {navPages.map((page) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                marginBottom: 4,
                border: 'none',
                background: currentPage === page.id ? '#e5e7eb' : 'transparent',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: currentPage === page.id ? 600 : 500,
                color: currentPage === page.id ? 'var(--text)' : 'var(--text2)',
                transition: 'all 0.2s',
              }}
            >
              <i className={`ti ${page.icon}`} style={{ fontSize: 18 }}></i>
              {page.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 16px', marginBottom: 8 }}>
            {user?.email}
          </div>
          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <i className="ti ti-logout"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {renderPage()}
      </main>
    </div>
  );
}
