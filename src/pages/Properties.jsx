import React, { useState, useEffect } from 'react';

export default function Properties({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '1',
    bathrooms: '1',
    location: '',
    amenities: '',
    availableFrom: new Date().toISOString().split('T')[0],
    status: 'available',
  });

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchListings();
  }, []);

  function fetchListings() {
    fetch('/api/my-listings', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load listings');
        return r.json();
      })
      .then((data) => {
        setListings(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.location) {
      alert('Title, price, and location are required');
      return;
    }

    const payload = {
      ...formData,
      amenities: formData.amenities ? formData.amenities.split(',').map((a) => a.trim()) : [],
    };

    const url = editingId ? `/api/listings/${editingId}` : '/api/listings';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to save listing');
        return r.json();
      })
      .then(() => {
        fetchListings();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          title: '',
          description: '',
          price: '',
          bedrooms: '1',
          bathrooms: '1',
          location: '',
          amenities: '',
          availableFrom: new Date().toISOString().split('T')[0],
          status: 'available',
        });
      })
      .catch((err) => alert(`Error: ${err.message}`));
  }

  function handleEdit(listing) {
    setEditingId(listing.id);
    setFormData({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      location: listing.location,
      amenities: listing.amenities.join(', '),
      availableFrom: listing.availableFrom,
      status: listing.status,
    });
    setShowForm(true);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this listing?')) return;
    fetch(`/api/listings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to delete');
        fetchListings();
      })
      .catch((err) => alert(`Error: ${err.message}`));
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      bedrooms: '1',
      bathrooms: '1',
      location: '',
      amenities: '',
      availableFrom: new Date().toISOString().split('T')[0],
      status: 'available',
    });
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ textAlign: 'center', color: 'var(--text2)' }}>Loading properties...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {!showForm ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: '0 0 8px 0' }}>My Properties</h1>
              <p style={{ color: 'var(--text2)', margin: 0 }}>Manage your rental listings</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <i className="ti ti-plus"></i> Add Property
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid-3" style={{ marginBottom: 24, gap: 16 }}>
            <div className="kpi-mini">
              <span className="kpi-mini-label">Total Listings</span>
              <span className="kpi-mini-val">{listings.length}</span>
            </div>
            <div className="kpi-mini">
              <span className="kpi-mini-label">Available</span>
              <span className="kpi-mini-val">{listings.filter((l) => l.status === 'available').length}</span>
            </div>
            <div className="kpi-mini">
              <span className="kpi-mini-label">Rented</span>
              <span className="kpi-mini-val">{listings.filter((l) => l.status === 'rented').length}</span>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="empty-state">
              <i className="ti ti-home-2"></i>
              <p style={{ fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>No properties yet</p>
              <p style={{ marginBottom: 16 }}>Create your first property listing to get started</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Add Your First Property
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {listings.map((listing) => (
                <div key={listing.id} className="card">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                    <div>
                      <div className="card-header" style={{ marginBottom: 12 }}>
                        <div className="card-title">{listing.title}</div>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: listing.status === 'available' ? '#22c55e' : listing.status === 'rented' ? '#f97316' : '#9ca3af',
                          }}
                        >
                          {listing.status === 'available' ? 'Available' : listing.status === 'rented' ? 'Rented' : 'Archived'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Location</div>
                          <div style={{ fontWeight: 600 }}>{listing.location}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Price/Month</div>
                          <div style={{ fontWeight: 600, color: 'var(--primary)' }}>GHS {listing.price.toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Bedrooms</div>
                          <div style={{ fontWeight: 600 }}>{listing.bedrooms}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Bathrooms</div>
                          <div style={{ fontWeight: 600 }}>{listing.bathrooms}</div>
                        </div>
                      </div>

                      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{listing.description}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button className="btn btn-sm btn-primary" onClick={() => handleEdit(listing)}>
                        <i className="ti ti-edit"></i> Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(listing.id)}>
                        <i className="ti ti-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ maxWidth: 800 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 8px 0' }}>{editingId ? 'Edit Property' : 'Add New Property'}</h2>
            <p style={{ color: 'var(--text2)', margin: 0 }}>Fill in the details about your rental property</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g., Modern 2-Bedroom Apartment near Campus"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Describe your property..."
                rows="4"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, fontFamily: 'inherit' }}
              />
            </div>

            <div className="grid-2" style={{ marginBottom: 16, gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="e.g., University Avenue, Legon"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Price per Month (GHS) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6 }}
                />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 16, gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleFormChange}
                  min="1"
                  max="10"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleFormChange}
                  min="1"
                  max="10"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6 }}
                />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 16, gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Available From
                </label>
                <input
                  type="date"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6 }}
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Amenities (comma-separated)
              </label>
              <input
                type="text"
                name="amenities"
                value={formData.amenities}
                onChange={handleFormChange}
                placeholder="e.g., WiFi, AC, Kitchen, Parking"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Property' : 'Add Property'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
