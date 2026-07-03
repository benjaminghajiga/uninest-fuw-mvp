import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useStore, payWithPayStripe, releaseEscrow, disputeEscrow } from '../store.js';

export default function Payments() {
  const { transactions } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Hostel Fee');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const inEscrow = transactions.filter((t) => t.status === 'in_escrow');
  const released = transactions.filter((t) => t.status === 'confirmed');
  const disputed = transactions.filter((t) => t.status === 'disputed');

  const sum = (arr) => arr.reduce((s, t) => s + Number(t.amount || 0), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !amount) {
      alert('Please enter a name and amount.');
      return;
    }
    setProcessing(true);
    try {
      const response = await payWithPayStripe({ name: name.trim(), type, amount: Number(amount) });
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }
      const { sessionId } = response;
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      alert(`Payment failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <div className="grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Escrow Summary</div><span className="badge badge-green">Live</span></div>
          <div className="kpi-mini"><span className="kpi-mini-label">Total in escrow (holding)</span><span className="kpi-mini-val" style={{ color: 'var(--g1)' }}>₦{sum(inEscrow).toLocaleString()}</span></div>
          <div className="kpi-mini"><span className="kpi-mini-label">Released</span><span className="kpi-mini-val">₦{sum(released).toLocaleString()}</span></div>
          <div className="kpi-mini"><span className="kpi-mini-label">Disputed / frozen</span><span className="kpi-mini-val" style={{ color: 'var(--red)' }}>₦{sum(disputed).toLocaleString()} ({disputed.length})</span></div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Record a Payment</div></div>
          {!showForm ? (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}><i className="ti ti-plus"></i> New Transaction</button>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Student / Tenant Name</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                    <option>Hostel Fee</option>
                    <option>Off-Campus Rent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₦)</label>
                  <input className="form-control" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" type="submit" disabled={processing}>
                  <i className="ti ti-check"></i> {processing ? 'Processing...' : 'Pay with PayStripe'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)} disabled={processing}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Transactions</div></div>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-credit-card"></i>
            <p>No transactions recorded yet.</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Type</th><th>Amount</th><th>Status</th><th>Escrow</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td><b>{t.name}</b></td>
                  <td><span className={`badge ${t.type === 'Hostel Fee' ? 'badge-blue' : 'badge-green'}`}>{t.type}</span></td>
                  <td>₦{Number(t.amount).toLocaleString()}</td>
                  <td>
                    {t.status === 'confirmed' && <span className="badge badge-green">Confirmed</span>}
                    {t.status === 'in_escrow' && <span className="badge badge-amber">In Escrow</span>}
                    {t.status === 'disputed' && <span className="badge badge-red">Disputed</span>}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{t.escrow}</td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{t.date}</td>
                  <td>
                    {t.status === 'in_escrow' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-primary btn-sm" onClick={async () => {
                          try {
                            await releaseEscrow(t.id);
                          } catch (error) {
                            alert(`Release failed: ${error.message}`);
                          }
                        }}>Release</button>
                        <button className="btn btn-ghost btn-sm" onClick={async () => {
                          try {
                            await disputeEscrow(t.id);
                          } catch (error) {
                            alert(`Dispute failed: ${error.message}`);
                          }
                        }}>Dispute</button>
                      </div>
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
