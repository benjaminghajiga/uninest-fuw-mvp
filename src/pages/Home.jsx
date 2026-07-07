import React from 'react';

export default function Home() {
  return (
    <div>
      <div className="card" style={{ padding: 24, borderRadius: 16, boxShadow: '0 16px 40px rgba(15, 26, 19, 0.08)' }}>
        <div className="card-header" style={{ marginBottom: 18 }}>
          <div>
            <div className="card-title">Welcome to UniNest FUW</div>
            <div className="card-sub" style={{ marginTop: 6 }}>
              Access landlord management, application processing, and escrow workflows from the platform.
            </div>
          </div>
        </div>
        <p style={{ color: 'var(--text2)', lineHeight: 1.8, marginBottom: 20 }}>
          This platform helps you manage student housing operations in one place. Use the sidebar to navigate between applications, verified landlords, and payment tracking.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="feature-pill" style={{ background: 'rgba(242, 247, 246, 0.95)', color: 'var(--text)', border: '1px solid rgba(15, 26, 19, 0.08)' }}>
            Listings and landlord verification
          </div>
          <div className="feature-pill" style={{ background: 'rgba(242, 247, 246, 0.95)', color: 'var(--text)', border: '1px solid rgba(15, 26, 19, 0.08)' }}>
            Payments and escrow tracking
          </div>
        </div>
      </div>
    </div>
  );
}
