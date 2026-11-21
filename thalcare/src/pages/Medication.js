import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { localDateStr } from '../lib/dates'

export default function Medication() {
  const { user } = useAuth()
  const now = new Date()
  const todayStr = localDateStr(now)
  const monthStr = todayStr.slice(0, 7)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth = now.getDate()

  const [med, setMed] = useState(null)
  const [logs, setLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', dose: '' })

  async function load() {
    setError('')
    const [medRes, logRes] = await Promise.all([
      supabase.from('medications').select('*')
        .eq('user_id', user.id).eq('active', true)
        .order('created_at', { ascending: true }).limit(1),
      supabase.from('medication_logs').select('date,taken')
        .eq('user_id', user.id).gte('date', monthStr + '-01'),
    ])
    if (medRes.error || logRes.error) {
      setError('Could not load your data. Check your connection and refresh.')
    }
    setMed(medRes.data?.[0] ?? null)
    const map = {}
    logRes.data?.forEach(r => { map[r.date] = r.taken })
    setLogs(map)
    setLoading(false)
  }

  useEffect(() => { load() }, [user.id])

  async function toggleDay(dateStr, taken) {
    if (saving[dateStr]) return
    const previous = logs[dateStr]
    setSaving(s => ({ ...s, [dateStr]: true }))
    setLogs(prev => ({ ...prev, [dateStr]: taken }))
    const { error: err } = await supabase.from('medication_logs').upsert(
      { user_id: user.id, date: dateStr, taken, medication_id: med?.id ?? null },
      { onConflict: 'user_id,date' }
    )
    setSaving(s => ({ ...s, [dateStr]: false }))
    if (err) {
      setLogs(prev => ({ ...prev, [dateStr]: previous }))
      setError('Could not save that change. Check your connection and try again.')
    } else {
      setError('')
    }
  }

  async function addMedication(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return
    const dose = parseFloat(form.dose)
    const { data, error: err } = await supabase.from('medications').insert({
      user_id: user.id,
      name,
      dose_amount: Number.isFinite(dose) && dose > 0 ? dose : null,
    }).select().single()
    if (err) { setError(err.message); return }
    setMed(data)
    setForm({ name: '', dose: '' })
    setError('')
  }

  const takenCount = Object.values(logs).filter(Boolean).length
  const adherencePct = dayOfMonth > 0 ? Math.round((takenCount / dayOfMonth) * 100) : 0
  const barColor = adherencePct >= 90 ? '#1D9E75' : adherencePct >= 70 ? '#EF9F27' : '#E24B4A'

  // Every earlier day this month, newest first, so any missed day can be corrected.
  const pastDays = Array.from({ length: dayOfMonth - 1 }, (_, i) => {
    const d = dayOfMonth - 1 - i
    return monthStr + '-' + String(d).padStart(2, '0')
  })

  if (loading) return <div className="empty-state">Loading…</div>

  const medLabel = med
    ? med.name + (med.dose_amount ? ` ${Number(med.dose_amount)} ${med.dose_unit}` : '')
    : null

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Medication</h2>

      {error && (
        <div role="alert" style={{ color: 'var(--red-text)', fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      {!med ? (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Add your medication</h3>
          <form onSubmit={addMedication}>
            <div className="two-col">
              <div className="form-row">
                <label htmlFor="med-name">Name</label>
                <input id="med-name" type="text" value={form.name} required maxLength={100}
                  placeholder="e.g. Desferrioxamine"
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-row">
                <label htmlFor="med-dose">Dose (mg) — optional</label>
                <input id="med-dose" type="number" min="0" step="any" value={form.dose}
                  placeholder="e.g. 400"
                  onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="primary">Save medication</button>
          </form>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Today — {medLabel}</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 0 }}>
            <input type="checkbox" style={{ width: 18, height: 18 }}
              checked={!!logs[todayStr]}
              disabled={!!saving[todayStr]}
              onChange={e => toggleDay(todayStr, e.target.checked)}
            />
            <span style={{ fontSize: 14, color: 'var(--text)' }}>
              Taken today{med.instructions ? ` (${med.instructions})` : ''} — {todayStr}
            </span>
          </label>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>This month's adherence</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1
            const ds = monthStr + '-' + String(d).padStart(2, '0')
            const taken = logs[ds]
            const isPast = ds <= todayStr
            const isToday = ds === todayStr
            const status = taken ? 'taken' : isPast && !isToday ? 'missed' : isToday ? 'today, not yet taken' : 'upcoming'
            return (
              <div key={ds} className={`day-dot ${taken ? 'taken' : isPast && !isToday ? 'missed' : ''} ${isToday ? 'today' : ''}`}
                title={`${ds}: ${status}`} aria-label={`${ds}: ${status}`}>
                {d}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
          <span>{takenCount} of {dayOfMonth} days taken</span>
          <span style={{ fontWeight: 500 }}>{adherencePct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: adherencePct + '%', background: barColor }} />
        </div>
      </div>

      {med && pastDays.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Log past days</h3>
          {pastDays.map(ds => (
            <label key={ds} style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              padding: '9px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13
            }}>
              <input type="checkbox" style={{ width: 16, height: 16 }}
                checked={!!logs[ds]}
                disabled={!!saving[ds]}
                onChange={e => toggleDay(ds, e.target.checked)}
              />
              <span style={{ color: 'var(--text2)' }}>{ds}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
