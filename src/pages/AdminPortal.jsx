import React, { useState } from 'react';
import { useStore, addLandlord, verifyLandlord, addBeds, processAllPending, runAllocationEngine, submitApplication, addListing } from '../store.js';

export default function AdminPortal() {
  const { beds, applications, listings, landlords, transactions } = useStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // Admin form states
  const [landlordForm, setLandlordForm] = useState({ name: '', phone: '', nin: '', address: '' });
  const [bedsForm, setBedsForm] = useState({ block: 'A', gender: 'Male', roomsFrom: 1, roomsTo: 2, bedsPerRoom: 2 });

  const totalBeds = beds.length;
  const occupied = beds.filter((b) => b.status === 'occupied').length;
  const available = beds.filter((b) => b.status === 'available').length;

  function tryUnlock() {
    setUnlocking(true);
    const code = window.prompt('Enter admin passcode to unlock the portal');
    setUnlocking(false);
    if (code === 'admin') {
      setIsAdmin(true);
    } else if (code) {
      window.alert('Incorrect passcode');
    }
  }

  async function handleAddLandlord(e) {
    e.preventDefault();
    if (!landlordForm.name || !landlordForm.phone) return window.alert('Provide at least name and phone');

    try {
      await addLandlord(landlordForm);
      setLandlordForm({ name: '', phone: '', nin: '', address: '' });
    } catch (error) {
      window.alert(`Failed to add landlord: ${error.message}`);
    }
  }

  async function handleVerifyLandlord(id) {
    try {
      await verifyLandlord(id);
    } catch (error) {
      window.alert(`Failed to verify landlord: ${error.message}`);
    }
  }

  async function handleAddBeds(e) {
    e.preventDefault();
    try {
      await addBeds({
        block: bedsForm.block,
        gender: bedsForm.gender,
        roomsFrom: Number(bedsForm.roomsFrom),
        roomsTo: Number(bedsForm.roomsTo),
        bedsPerRoom: Number(bedsForm.bedsPerRoom),
      });
      setBedsForm({ block: 'A', gender: 'Male', roomsFrom: 1, roomsTo: 2, bedsPerRoom: 2 });
    } catch (error) {
      window.alert(`Failed to add beds: ${error.message}`);
    }
  }

  async function handleProcessAll() {
    try {
      const results = await processAllPending();
      const ok = results.filter((r) => r.result && r.result.success).length;
      window.alert(`Processed ${results.length} application(s). ${ok} allocated.`);
    } catch (error) {
      window.alert(`Failed to process applications: ${error.message}`);
    }
  }

  return (
    <div>
      {!isAdmin ? (
        <div className="card" style={{ padding: 28 }}>
          <div className="card-title">Admin Portal — Locked</div>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>This section is restricted to platform administrators and developers.</p>
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={tryUnlock} disabled={unlocking}>Unlock Admin Portal</button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><div className="card-title">Landlord Management</div></div>
              <form onSubmit={handleAddLandlord} style={{ marginBottom: 12 }}>
                <div className="grid-2">
                  <input className="form-control" placeholder="Name" value={landlordForm.name} onChange={(e) => setLandlordForm((s) => ({ ...s, name: e.target.value }))} />
                  <input className="form-control" placeholder="Phone" value={landlordForm.phone} onChange={(e) => setLandlordForm((s) => ({ ...s, phone: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input className="form-control" placeholder="NIN (optional)" value={landlordForm.nin} onChange={(e) => setLandlordForm((s) => ({ ...s, nin: e.target.value }))} />
                  <input className="form-control" placeholder="Address (optional)" value={landlordForm.address} onChange={(e) => setLandlordForm((s) => ({ ...s, address: e.target.value }))} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <button className="btn btn-primary">Add Landlord</button>
                </div>
              </form>

              <div>
                {landlords.length === 0 ? (
                  <div className="empty-state"><p>No landlords added yet.</p></div>
                ) : (
                  <table>
                    <thead><tr><th>Name</th><th>Phone</th><th>KYC</th><th></th></tr></thead>
                    <tbody>
                      {landlords.map((l) => (
                        <tr key={l.id}>
                          <td>{l.name}</td>
                          <td>{l.phone}</td>
                          <td>{l.kycStatus}</td>
                          <td>{l.kycStatus !== 'verified' && <button className="btn btn-sm btn-outline" onClick={() => handleVerifyLandlord(l.id)}>Verify</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Bed Blocks</div></div>
              <form onSubmit={handleAddBeds}>
                <div className="grid-2">
                  <input className="form-control" placeholder="Block" value={bedsForm.block} onChange={(e) => setBedsForm((s) => ({ ...s, block: e.target.value }))} />
                  <select className="form-control" value={bedsForm.gender} onChange={(e) => setBedsForm((s) => ({ ...s, gender: e.target.value }))}>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div className="grid-2" style={{ marginTop: 8 }}>
                  <input className="form-control" type="number" placeholder="Rooms from" value={bedsForm.roomsFrom} onChange={(e) => setBedsForm((s) => ({ ...s, roomsFrom: e.target.value }))} />
                  <input className="form-control" type="number" placeholder="Rooms to" value={bedsForm.roomsTo} onChange={(e) => setBedsForm((s) => ({ ...s, roomsTo: e.target.value }))} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <input className="form-control" type="number" placeholder="Beds per room" value={bedsForm.bedsPerRoom} onChange={(e) => setBedsForm((s) => ({ ...s, bedsPerRoom: e.target.value }))} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <button className="btn btn-primary">Add Beds</button>
                </div>
              </form>

              <div style={{ marginTop: 12 }}>
                <div className="kpi-mini"><span className="kpi-mini-label">Total beds</span><span className="kpi-mini-val">{totalBeds}</span></div>
                <div className="kpi-mini"><span className="kpi-mini-label">Available</span><span className="kpi-mini-val">{available}</span></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, marginBottom: 12 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">Quick Admin Actions</div></div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={async () => {
                  try {
                    const l = await addLandlord({ name: 'Sample Landlord', phone: '08000000000', nin: '12345678901', address: 'Wukari' });
                    await verifyLandlord(l.id);
                    await addListing({ title: 'Sample Studio — Near FUW Gate', price: 150000, type: 'Self-contained', distance: '0.6km', landlordId: l.id, features: ['Water','WiFi'] });
                    window.alert('Seeded sample landlord and listing.');
                  } catch (error) {
                    window.alert(`Seed failed: ${error.message}`);
                  }
                }}>Seed landlord + listing</button>

                <button className="btn btn-outline" onClick={async () => {
                  try {
                    await addBeds({ block: 'B', gender: 'Male', roomsFrom: 1, roomsTo: 3, bedsPerRoom: 2 });
                    await submitApplication({ matric: 'FUW001', name: 'Jane Student', year: 'Year 1', gender: 'Male', state: 'Other (distant)', disability: 'None' });
                    window.alert('Seeded sample application data.');
                  } catch (error) {
                    window.alert(`Seed failed: ${error.message}`);
                  }
                }}>Seed sample data</button>

                <button className="btn btn-primary" onClick={async () => {
                  try {
                    const results = await processAllPending();
                    const ok = results.filter((r) => r.result && r.result.success).length;
                    window.alert(`Processed ${results.length} application(s). ${ok} allocated.`);
                  } catch (error) {
                    window.alert(`Process failed: ${error.message}`);
                  }
                }}>Process pending applications</button>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 18 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">Application Processor</div></div>
              <p style={{ color: 'var(--text2)' }}>Process pending student applications from the queue.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={handleProcessAll}>Process All Pending</button>
              </div>
              <div style={{ marginTop: 12 }}>
                {applications.filter((a) => a.status === 'pending').length === 0 ? (
                  <div className="empty-state"><p>No pending applications</p></div>
                ) : (
                  <table>
                    <thead><tr><th>Matric</th><th>Name</th><th>Year</th><th></th></tr></thead>
                    <tbody>
                      {applications.filter((a) => a.status === 'pending').map((app) => (
                        <tr key={app.id}>
                          <td>{app.matric}</td>
                          <td>{app.name}</td>
                          <td>{app.year}</td>
                          <td><button className="btn btn-sm" onClick={async () => {
                            try {
                              const r = await runAllocationEngine(app.id);
                              if (r && r.success) window.alert(`Allocated bed ${r.bed.id}`);
                              else window.alert('Allocation failed');
                            } catch (error) {
                              window.alert(`Allocation error: ${error.message}`);
                            }
                          }}>Run</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Platform Activity</div></div>
              <div className="kpi-mini"><span className="kpi-mini-label">Live listings</span><span className="kpi-mini-val">{listings.filter((l) => l.status === 'live').length}</span></div>
              <div className="kpi-mini"><span className="kpi-mini-label">Verified landlords</span><span className="kpi-mini-val">{landlords.filter((l) => l.kycStatus === 'verified').length}</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
