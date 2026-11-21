import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { localDateStr, parseLocalDate, addDays, daysBetween } from '../lib/dates'

const DEFAULT_CYCLE_DAYS = 21

export default function Dashboard() {
  const { user } = useAuth()
  const todayStr = localDateStr()
  const [lastTx, setLastTx] = useState(null)
  const [med, setMed] = useState(null)
  const [medToday, setMedToday] = useState(false)
  const [medThisMonth, setMedThisMonth] = useState(0)
  const [txCount, setTxCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [txRes, medLogRes, medRes, countRes] = await Promise.all([
        supabase.from('transfusions').select('*').eq('user_id', user.id)
          .order('date', { ascending: false }).limit(1),
        supabase.from('medication_logs').select('date,taken').eq('user_id', user.id)
          .gte('date', todayStr.slice(0, 7) + '-01'),
        supabase.from('medications').select('*').eq('user_id', user.id).eq('active', true)
          .order('created_at', { ascending: true }).limit(1),
        supabase.from('transfusions').select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ])
      if (txRes.error || medLogRes.error || medRes.error || countRes.error) {
        setError('Could not load some of your data. Check your connection and refresh.')
      }
      const meds = medLogRes.data
      setLastTx(txRes.data?.[0] || null)
      setMed(medRes.data?.[0] || null)
      setMedToday(!!meds?.some(m => m.date === todayStr && m.taken))
      setMedThisMonth(meds?.filter(m => m.taken).length || 0)
      setTxCount(countRes.count || 0)
      setLoading(false)
    }
    load()
  }, [user.id, todayStr])

  async function markMedToday() {
    if (saving) return
    setSaving(true)
    const { error: err } = await supabase.from('medication_logs').upsert(
      { user_id: user.id, date: todayStr, taken: true, medication_id: med?.id ?? null },
      { onConflict: 'user_id,date' }
    )
    setSaving(false)
    if (err) {
      setError('Could not save that. Check your connection and try again.')
      return
    }
    setError('')
    setMedToday(true)
    setMedThisMonth(m => m + 1)
  }

  // Cycle length comes from the "next due" date entered on the last transfusion,
  // falling back to 21 days when none was entered.
  const cycleDays = lastTx?.next_due_date
    ? Math.max(1, daysBetween(lastTx.date, lastTx.next_due_date))
    : DEFAULT_CYCLE_DAYS
  const daysAgo = lastTx ? Math.max(0, daysBetween(lastTx.date, todayStr)) : null
  const nextDueStr = lastTx ? addDays(lastTx.date, cycleDays) : null
  const daysUntilNext = lastTx ? daysBetween(todayStr, nextDueStr) : null
  const overdueDays = daysUntilNext !== null && daysUntilNext < 0 ? -daysUntilNext : 0
  const cyclePercent = daysAgo !== null ? Math.min(100, Math.round((daysAgo / cycleDays) * 100)) : 0
  const dayOfMonth = new Date().getDate()
  const adherencePct = dayOfMonth > 0 ? Math.round((medThisMonth / dayOfMonth) * 100) : 0

  const medName = med?.name || 'medication'
  const medDetail = med
    ? [med.dose_amount ? `${Number(med.dose_amount)} ${med.dose_unit}` : null, med.instructions]
        .filter(Boolean).join(' · ')
    : 'Set up your medication on the Medication page'

  let statusClass = 'success'
  let statusText = 'On track'
  if (daysUntilNext !== null) {
    if (daysUntilNext < 0) { statusClass = 'danger'; statusText = `Overdue by ${overdueDays}d` }
    else if (daysUntilNext === 0) { statusClass = 'danger'; statusText = 'Due today' }
    else if (daysUntilNext <= 3) { statusClass = 'warning'; statusText = 'Due soon' }
  }

  if (loading) return <div className="empty-state">Loading…</div>

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Dashboard</h2>

      {error && (
        <div role="alert" style={{ color: 'var(--red-text)', fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      <div className="metric-grid">
        <div className="metric">
          <div className="metric-label">Last transfusion</div>
          <div className="metric-value">{daysAgo !== null ? daysAgo + 'd ago' : '—'}</div>
          <div className="metric-sub">{lastTx?.date || 'Not logged yet'}</div>
        </div>
        <div className="metric">
          <div className="metric-label">{daysUntilNext !== null && daysUntilNext < 0 ? 'Overdue by' : 'Next due in'}</div>
          <div className="metric-value" style={{
            color: daysUntilNext !== null && daysUntilNext <= 3
              ? 'var(--amber)' : 'var(--text)'
          }}>
            {daysUntilNext !== null ? Math.abs(daysUntilNext) + 'd' : '—'}
          </div>
          <div className="metric-sub">Every {cycleDays} days</div>
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
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>Day {Math.min(daysAgo, cycleDays)} of {cycleDays}</span>
              <span className={`badge ${statusClass}`}>{statusText}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: cyclePercent + '%',
                background: cyclePercent > 85 ? '#E24B4A' : cyclePercent > 65 ? '#EF9F27' : '#1D9E75'
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              Next due: {parseLocalDate(nextDueStr).toDateString()}
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
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Today's {medName}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{medDetail}</span>
          <span className={`badge ${medToday ? 'success' : 'warning'}`}>
            {medToday ? 'Taken' : 'Not logged yet'}
          </span>
        </div>
        {med && !medToday && (
          <button className="primary" style={{ width: '100%', marginTop: 12 }}
            onClick={markMedToday} disabled={saving}>
            {saving ? 'Saving…' : 'Mark as taken today'}
          </button>
        )}
        {!med && (
          <Link to="/medication" style={{ display: 'inline-block', marginTop: 12, fontSize: 13 }}>
            Add your medication
          </Link>
        )}
      </div>
    </div>
  )
}
