import React, { useState } from 'react';
import { useStore, processAllPending, PRIORITY_VALUE } from '../store.js';

function statusBadge(status) {
  if (status === 'allocated') return <span className="badge badge-green">Allocated</span>;
  if (status === 'rejected') return <span className="badge badge-red">Rejected</span>;
  return <span className="badge badge-amber">Pending</span>;
}

function priorityLabel(app) {
  const score = PRIORITY_VALUE(app);
  if (score >= 100) return <span className="badge badge-red">Priority 1 (Disability)</span>;
  if (score >= 50) return <span className="badge badge-blue">High (Year 1)</span>;
  if (score >= 25) return <span className="badge badge-blue">Medium (Distant)</span>;
  return <span className="badge badge-gray">Standard</span>;
}

export default function Applications({ navigate }) {
  const { applications, beds } = useStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  async function handleProcessAll() {
    if (pendingCount === 0) return;
    try {
      await processAllPending();
    } catch (error) {
      alert(`Failed to process applications: ${error.message}`);
    }
  }

  const filtered = applications.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search && !(`${a.name} ${a.matric}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  if (applications.length === 0) {
    return (
      <div className="empty-state">
        <i className="ti ti-file-text"></i>
        <p style={{ fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>No applications yet</p>
        <p style={{ marginBottom: 16 }}>Once applications are submitted, they will appear here for review and processing.</p>
      </div>
    );
  }

  return (
    <>
      <div className="filter-bar">
        <div className="search-input">
          <i className="ti ti-search"></i>
          <input placeholder="Search by name or matric number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="allocated">Allocated</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={handleProcessAll} disabled={pendingCount === 0}>
          <i className="ti ti-cpu"></i> Process All Pending ({pendingCount})
        </button>
      </div>

      {beds.length === 0 && pendingCount > 0 && (
        <div className="alert alert-warning">
          <i className="ti ti-alert-triangle" style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}></i>
          <div>No bed inventory available — pending applications will be rejected until inventory is added.</div>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr><th>Applicant</th><th>Year</th><th>Priority</th><th>Gender</th><th>Status</th><th>Submitted</th></tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td><b>{a.name}</b><br /><span style={{ fontSize: 11, color: 'var(--text3)' }}>{a.matric}</span></td>
                <td>{a.year}</td>
                <td>{priorityLabel(a)}</td>
                <td>{a.gender}</td>
                <td>{statusBadge(a.status)}</td>
                <td style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(a.submittedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
