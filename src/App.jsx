import React, { useState, useEffect } from 'react';
import { pageMap, navSections } from './data.js';
import AdminPortal from './pages/AdminPortal.jsx';
import Applications from './pages/Applications.jsx';
import Landlords from './pages/Landlords.jsx';
import Payments from './pages/Payments.jsx';
import Settings from './pages/Settings.jsx';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';

const pageComponents = {
  home: Home,
  dashboard: AdminPortal,
  applications: Applications,
  landlords: Landlords,
  payments: Payments,
  settings: Settings,
};

export default function App() {
  const [page, setPage] = useState('home');
  const [authenticated, setAuthenticated] = useState(false);
  const PageComponent = pageComponents[page];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id') || params.get('sessionId');
    if (sessionId) {
      import('./store.js').then(({ confirmPayStripeSession }) => {
        confirmPayStripeSession(sessionId).then((res) => {
          // remove the session_id from the URL
          const url = new URL(window.location.href);
          url.searchParams.delete('session_id');
          url.searchParams.delete('sessionId');
          window.history.replaceState({}, document.title, url.toString());
          if (res && res.transaction) {
            alert('Payment confirmed. Transaction updated.');
          } else {
            console.log('Stripe session confirmed, but no transaction updated.', res);
          }
        }).catch((err) => {
          console.warn('Failed to confirm Stripe session:', err);
        });
      });
    }
  }, []);

  if (!authenticated) {
    return <Auth onAuthSuccess={() => {
      setPage('home');
      setAuthenticated(true);
    }} />;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand">UniNest FUW</div>
          <div className="sub">Student Housing Platform</div>
        </div>

        {navSections.map((section) => (
          <div className="sidebar-section" key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => (
              <div
                key={item.key}
                className={`nav-item ${page === item.key ? 'active' : ''}`}
                onClick={() => setPage(item.key)}
              >
                <i className={`ti ${item.icon}`}></i> {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}

        <div className="sidebar-user">
          <div className="user-avatar">AD</div>
          <div>
            <div className="user-name">Admin Portal</div>
            <div className="user-role">FUW Housing Office</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">{pageMap[page].title}</div>
            <div className="topbar-subtitle">{pageMap[page].sub}</div>
          </div>
        </div>

        <div className="content">
          <PageComponent navigate={setPage} />
        </div>
      </main>
    </div>
  );
}
