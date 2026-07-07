import React from 'react';
import { useStore, resetAll } from '../store.js';

export default function Settings({ user, onLogout }) {
  const { beds, applications, listings, landlords, transactions } = useStore();

  function handleReset() {
    if (window.confirm('This will permanently clear all platform data (beds, applications, listings, landlords, transactions). Continue?')) {
      resetAll();
    }
  }

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header"><div className="card-title">Account</div></div>
        <div className="kpi-mini"><span className="kpi-mini-label">Name</span><span className="kpi-mini-val">{user?.name || '—'}</span></div>
        <div className="kpi-mini"><span className="kpi-mini-label">Email</span><span className="kpi-mini-val">{user?.email || '—'}</span></div>
        <div className="kpi-mini"><span className="kpi-mini-label">Role</span><span className="badge" style={{ backgroundColor: user?.role === 'landlord' ? '#fbbf24' : '#60a5fa' }}>{user?.role || '—'}</span></div>
        <div className="kpi-mini"><span className="kpi-mini-label">User ID</span><span style={{ fontSize: 12, color: 'var(--text3)' }}>{user?.id || '—'}</span></div>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onLogout}>
            <i className="ti ti-logout"></i> Logout
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Platform Data</div></div>
        <div className="kpi-mini"><span className="kpi-mini-label">Applications</span><span className="kpi-mini-val">{applications.length}</span></div>
        <div className="kpi-mini"><span className="kpi-mini-label">Landlords</span><span className="kpi-mini-val">{landlords.length}</span></div>
        <div className="kpi-mini"><span className="kpi-mini-label">Listings</span><span className="kpi-mini-val">{listings.length}</span></div>
        <div className="kpi-mini"><span className="kpi-mini-label">Transactions</span><span className="kpi-mini-val">{transactions.length}</span></div>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-danger" onClick={handleReset}>
            <i className="ti ti-trash"></i> Reset All Data
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">About this MVP</div></div>
        <div className="alert alert-info" style={{ marginBottom: 12 }}>
          <i className="ti ti-info-circle" style={{ fontSize: 16, flexShrink: 0 }}></i>
          <div>
            All data is stored locally in your browser (localStorage). No backend or external
            services are connected. Clearing browser data or using a different browser/device
            will not carry data over.
          </div>
        </div>
        <div className="kpi-mini"><span className="kpi-mini-label">Allocation rule: gender match</span><span className="badge badge-green">Active</span></div>
        <div className="kpi-mini"><span className="kpi-mini-label">Allocation rule: anti-duplication</span><span className="badge badge-green">Active</span></div>
        <div className="kpi-mini"><span className="kpi-mini-label">Allocation rule: priority queue (batch)</span><span className="badge badge-green">Active</span></div>
      </div>
    </div>
  );
}
