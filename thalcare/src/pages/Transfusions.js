import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const today = new Date().toISOString().split('T')[0]

export default function Transfusions() {
  const { user } = useAuth()
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ date: today, pints: 2, hb: '', notes: '' })
  const [error, setError] = useState('')

  async function loadTxs() {
    const { data } = await supabase.from('transfusions').select('*')
      .eq('user_id', user.id).order('date', { ascending: false })
    setTxs(data || [])
    setLoading(false)
  }

  useEffect(() => { loadTxs() }, [user.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const { error: err } = await supabase.from('transfusions').insert({
      user_id: user.id,
      date: form.date,
      pints: parseInt(form.pints),
      hb_level: form.hb ? parseFloat(form.hb) : null,
      notes: form.notes || null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setForm({ date: today, pints: 2, hb: '', notes: '' })
    loadTxs()
  }

  async function deleteTx(id) {
    if (!window.confirm('Remove this transfusion record?')) return
    await supabase.from('transfusions').delete().eq('id', id)
    setTxs(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Transfusions</h2>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>Log a transfusion</h3>
        <form onSubmit={handleSubmit}>
          <div className="two-col">
            <div className="form-row">
              <label>Date</label>
              <input type="date" value={form.date} required
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="form-row">
              <label>Pints given</label>
              <input type="number" value={form.pints} min="1" max="6" required
                onChange={e => setForm(f => ({ ...f, pints: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <label>Pre-transfusion Hb level (g/dL) — optional</label>
            <input type="number" value={form.hb} step="0.1" placeholder="e.g. 7.2"
              onChange={e => setForm(f => ({ ...f, hb: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Notes — optional</label>
            <input type="text" value={form.notes} placeholder="e.g. Muhimbili, Dr. Juma"
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          {error && (
            <div style={{ color: 'var(--red-text)', fontSize: 13, marginBottom: 10 }}>{error}</div>
          )}
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save transfusion'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>History</h3>
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : txs.length === 0 ? (
          <div className="empty-state">No transfusions logged yet</div>
        ) : (
          txs.map(tx => (
            <div key={tx.id} className="log-item">
              <div>
                <div style={{ fontWeight: 500 }}>{tx.date}</div>
                <div style={{ color: 'var(--text3)', fontSize: 11 }}>
                  {tx.pints} pint{tx.pints > 1 ? 's' : ''}
                  {tx.hb_level ? ` · Pre-Hb: ${tx.hb_level} g/dL` : ''}
                  {tx.notes ? ` · ${tx.notes}` : ''}
                </div>
              </div>
              <button className="danger" style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => deleteTx(tx.id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
