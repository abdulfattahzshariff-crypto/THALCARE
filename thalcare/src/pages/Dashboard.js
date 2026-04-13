import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

export default function Dashboard() {
  const { user } = useAuth()
  const todayStr = new Date().toISOString().split('T')[0]
  const [lastTx, setLastTx] = useState(null)
  const [medToday, setMedToday] = useState(false)
  const [medThisMonth, setMedThisMonth] = useState(0)
  const [txCount, setTxCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: txs }, { data: meds }] = await Promise.all([
        supabase.from('transfusions').select('*').eq('user_id', user.id)
          .order('date', { ascending: false }).limit(1),
        supabase.from('medication_logs').select('*').eq('user_id', user.id)
          .gte('date', todayStr.slice(0, 7) + '-01')
      ])
      const { count } = await supabase.from('transfusions').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setLastTx(txs?.[0] || null)
      setMedToday(meds?.some(m => m.date === todayStr && m.taken))
      setMedThisMonth(meds?.filter(m => m.taken).length || 0)
      setTxCount(count || 0)
      setLoading(false)
    }
    load()
  }, [user.id, todayStr])

  async function markMedToday() {
    await supabase.from('medication_logs').upsert(
      { user_id: user.id, date: todayStr, taken: true },
      { onConflict: 'user_id,date' }
    )
    setMedToday(true)
    setMedThisMonth(m => m + 1)
  }

  const daysAgo = lastTx ? daysBetween(lastTx.date, todayStr) : null
  const daysUntilNext = daysAgo !== null ? Math.max(0, 21 - daysAgo) : null
  const cyclePercent = daysAgo !== null ? Math.min(100, Math.round((daysAgo / 21) * 100)) : 0
  const dayOfMonth = new Date().getDate()
  const adherencePct = dayOfMonth > 0 ? Math.round((medThisMonth / dayOfMonth) * 100) : 0
  const nextDue = lastTx
    ? new Date(new Date(lastTx.date).getTime() + 21 * 86400000).toDateString()
    : null

  if (loading) return <div className="empty-state">Loading…</div>

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Dashboard</h2>

      <div className="metric-grid">
        <div className="metric">
          <div className="metric-label">Last transfusion</div>
          <div className="metric-value">{daysAgo !== null ? daysAgo + 'd ago' : '—'}</div>
          <div className="metric-sub">{lastTx?.date || 'Not logged yet'}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Next due in</div>
          <div className="metric-value" style={{
            color: daysUntilNext !== null && daysUntilNext <= 3
              ? 'var(--amber)' : 'var(--text)'
          }}>
            {daysUntilNext !== null ? daysUntilNext + 'd' : '—'}
          </div>
          <div className="metric-sub">Every 21 days</div>
        </div>
        <div className="metric">
          <div className="metric-label">Medication adherence</div>
          <div className="metric-value">{adherencePct}%</div>
          <div className="metric-sub">This month</div>
        </div>
        <div className="metric">
          <div className="metric-label">Transfusions logged</div>
          <div className="metric-value">{txCount}</div>
          <div className="metric-sub">Total</div>
        </div>
      </div>

      {/* Cycle tracker */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Transfusion cycle</h3>
        {lastTx ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>Day {Math.min(daysAgo, 21)} of 21</span>
              <span className={`badge ${daysUntilNext === 0 ? 'danger' : daysUntilNext <= 3 ? 'warning' : 'success'}`}>
                {daysUntilNext === 0 ? 'Due today' : daysUntilNext <= 3 ? 'Due soon' : 'On track'}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: cyclePercent + '%',
                background: cyclePercent > 85 ? '#E24B4A' : cyclePercent > 65 ? '#EF9F27' : '#1D9E75'
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              Next due: {nextDue}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ padding: '1rem 0' }}>
            <Link to="/transfusions">Log your first transfusion</Link> to see your cycle tracker
          </div>
        )}
      </div>

      {/* Today's medication */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Today's Desferrioxamine</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>400 mg · empty stomach · morning</span>
          <span className={`badge ${medToday ? 'success' : 'warning'}`}>
            {medToday ? 'Taken' : 'Not logged yet'}
          </span>
        </div>
        {!medToday && (
          <button className="primary" style={{ width: '100%', marginTop: 12 }} onClick={markMedToday}>
            Mark as taken today
          </button>
        )}
      </div>
    </div>
  )
}
