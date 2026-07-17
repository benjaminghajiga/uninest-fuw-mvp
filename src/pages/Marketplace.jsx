import React, { useState, useEffect } from 'react';

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBeds, setFilterBeds] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    // Fetch all available listings
    fetch('/api/listings')
      .then((r) => r.json())
      .then((data) => {
        setListings(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load listings:', err);
        setLoading(false);
      });
  }, []);

  const filtered = listings.filter((listing) => {
    if (listing.status !== 'available') return false;
    if (filterBeds !== 'all' && listing.bedrooms !== Number(filterBeds)) return false;
    if (search && !(`${listing.title} ${listing.location} ${listing.description}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'beds') return a.bedrooms - b.bedrooms;
    return 0;
  });

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ textAlign: 'center', color: 'var(--text2)' }}>Loading listings...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 8px 0' }}>Student Housing Marketplace</h1>
        <p style={{ color: 'var(--text2)', margin: 0 }}>Browse available properties from verified landlords</p>
      </div>

      {/* Search & Filters */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Search</label>
          <input
            type="text"
            placeholder="Location, title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, fontSize: 14 }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Bedrooms</label>
            <select
              value={filterBeds}
              onChange={(e) => setFilterBeds(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, fontSize: 14 }}
            >
              <option value="all">All</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, fontSize: 14 }}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="beds">Most Bedrooms</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ marginBottom: 12, fontSize: 14, color: 'var(--text2)' }}>
        {sorted.length} listing{sorted.length !== 1 ? 's' : ''} found
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <i className="ti ti-home-search"></i>
          <p style={{ fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>No listings found</p>
          <p>Try adjusting your filters or check back soon for new listings.</p>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: 16 }}>
          {sorted.map((listing) => (
            <div
              key={listing.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setSelectedListing(listing)}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)', e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = '')}
            >
              {listing.image && (
                <div style={{ width: '100%', height: 200, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px 8px 0 0', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>
                  [Property Image]
                </div>
              )}
              <div className="card-header" style={{ marginBottom: 12 }}>
                <div className="card-title">{listing.title}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
                  <i className="ti ti-map-pin"></i> {listing.location}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>
                  {listing.description.substring(0, 100)}...
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div className="kpi-mini">
                  <span className="kpi-mini-label">
                    <i className="ti ti-bed"></i> Beds
                  </span>
                  <span className="kpi-mini-val">{listing.bedrooms}</span>
                </div>
                <div className="kpi-mini">
                  <span className="kpi-mini-label">
                    <i className="ti ti-bath"></i> Baths
                  </span>
                  <span className="kpi-mini-val">{listing.bathrooms}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
                  GHS {listing.price.toLocaleString()} / mo
                </div>
                <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); }}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div
          className="auth-modal"
          style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
          onClick={() => setSelectedListing(null)}
        >
          <div
            className="card"
            style={{ width: 600, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>{selectedListing.title}</h2>
              <button
                onClick={() => setSelectedListing(null)}
                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text3)' }}
              >
                ×
              </button>
            </div>

            {selectedListing.image && (
              <div
                style={{
                  width: '100%',
                  height: 300,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                [Property Image]
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Location</div>
                <div style={{ fontWeight: 600 }}>{selectedListing.location}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Price per Month</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>GHS {selectedListing.price.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div className="kpi-mini">
                <span className="kpi-mini-label">
                  <i className="ti ti-bed"></i> Bedrooms
                </span>
                <span className="kpi-mini-val">{selectedListing.bedrooms}</span>
              </div>
              <div className="kpi-mini">
                <span className="kpi-mini-label">
                  <i className="ti ti-bath"></i> Bathrooms
                </span>
                <span className="kpi-mini-val">{selectedListing.bathrooms}</span>
              </div>
              <div className="kpi-mini">
                <span className="kpi-mini-label">Landlord</span>
                <span className="kpi-mini-val" style={{ fontSize: 12 }}>{selectedListing.landlordName}</span>
              </div>
              <div className="kpi-mini">
                <span className="kpi-mini-label">Available</span>
                <span className="kpi-mini-val" style={{ fontSize: 11 }}>{new Date(selectedListing.availableFrom).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>Description</div>
              <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>{selectedListing.description}</div>
            </div>

            {selectedListing.amenities && selectedListing.amenities.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, fontWeight: 600 }}>Amenities</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedListing.amenities.map((amenity, idx) => (
                    <span key={idx} className="badge badge-blue" style={{ fontSize: 12 }}>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={() => alert('Booking feature coming soon! Contact landlord: ' + selectedListing.landlordName)}>
                <i className="ti ti-mail"></i> Request to Book
              </button>
              <button className="btn btn-ghost" onClick={() => setSelectedListing(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
