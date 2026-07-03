import React, { useState } from 'react';
import { useStore, addLandlord, verifyLandlord } from '../store.js';

export default function Landlords() {
  const { landlords, listings } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nin, setNin] = useState('');
  const [address, setAddress] = useState('');

  const verifiedCount = landlords.filter((l) => l.kycStatus === 'verified').length;
  const pendingCount = landlords.length - verifiedCount;

  function listingCount(landlordId) {
    return listings.filter((l) => l.landlordId === landlordId).length;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please enter landlord name and phone number.');
      return;
    }
    try {
      await addLandlord({ name: name.trim(), phone: phone.trim(), nin: nin.trim(), address: address.trim() });
      setName(''); setPhone(''); setNin(''); setAddress('');
      setShowForm(false);
    } catch (error) {
      alert(`Failed to add landlord: ${error.message}`);
    }
  }

  return (
    <>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-shield-check"></i></div>
          <div className="stat-value">{verifiedCount}</div>
          <div className="stat-label">Verified Landlords</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-clock"></i></div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Pending KYC</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-home"></i></div>
          <div className="stat-value">{listings.length}</div>
          <div className="stat-label">Total Listings</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Landlord Registry</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
            <i className="ti ti-plus"></i> {showForm ? 'Cancel' : 'Onboard Landlord'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 18, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" placeholder="Landlord full name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" placeholder="080XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">NIN / Government ID (10+ digits = auto-verified)</label>
              <input className="form-control" placeholder="National Identification Number" value={nin} onChange={(e) => setNin(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Property Address</label>
              <input className="form-control" placeholder="Full property address in Wukari" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit"><i className="ti ti-send"></i> Submit for KYC</button>
          </form>
        )}

        {landlords.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-user-check"></i>
            <p>No landlords onboarded yet.</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Landlord</th><th>Listings</th><th>KYC Status</th><th></th></tr></thead>
            <tbody>
              {landlords.map((l) => (
                <tr key={l.id}>
                  <td><b>{l.name}</b><br /><span style={{ fontSize: 11, color: 'var(--text3)' }}>{l.phone} {l.address ? `· ${l.address}` : ''}</span></td>
                  <td>{listingCount(l.id)}</td>
                  <td>
                    {l.kycStatus === 'verified'
                      ? <span className="badge badge-green"><i className="ti ti-check"></i> Verified</span>
                      : <span className="badge badge-amber"><i className="ti ti-clock"></i> KYC Pending</span>}
                  </td>
                  <td>
                    {l.kycStatus !== 'verified' && (
                      <button className="btn btn-primary btn-sm" onClick={() => verifyLandlord(l.id)}>Verify</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
