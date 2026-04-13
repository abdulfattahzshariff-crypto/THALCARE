import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function Medication() {
  const { user } = useAuth()
  const todayStr = new Date().toISOString().split('T')[0]
  const monthStr = todayStr.slice(0, 7)
  const [logs, setLogs] = useState({})
  const [loading, setLoading] = useState(true)

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const dayOfMonth = new Date().getDate()

  async function loadLogs() {
    const { data } = await supabase.from('medication_logs').select('*')
      .eq('user_id', user.id).gte('date', monthStr + '-01')
    const map = {}
    data?.forEach(r => { map[r.date] = r.taken })
    setLogs(map)
    setLoading(false)
  }

  useEffect(() => { loadLogs() }, [user.id])

  async function toggleDay(dateStr, taken) {
    await supabase.from('medication_logs').upsert(
      { user_id: user.id, date: dateStr, taken },
      { onConflict: 'user_id,date' }
    )
    setLogs(prev => ({ ...prev, [dateStr]: taken }))
  }

  const takenCount = Object.values(logs).filter(Boolean).length
  const adherencePct = dayOfMonth > 0 ? Math.round((takenCount / dayOfMonth) * 100) : 0
  const barColor = adherencePct >= 90 ? '#1D9E75' : adherencePct >= 70 ? '#EF9F27' : '#E24B4A'

  const pastDays = Array.from({ length: Math.min(6, dayOfMonth - 1) }, (_, i) => {
    const d = dayOfMonth - 1 - i
    return monthStr + '-' + String(d).padStart(2, '0')
  })

  if (loading) return <div className="empty-state">Loading…</div>

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Medication</h2>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>
          Today — Desferrioxamine 400 mg
        </h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 0 }}>
          <input type="checkbox" style={{ width: 18, height: 18 }}
            checked={!!logs[todayStr]}
            onChange={e => toggleDay(todayStr, e.target.checked)}
          />
          <span style={{ fontSize: 14, color: 'var(--text)' }}>
            Taken this morning on empty stomach — {todayStr}
          </span>
        </label>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>This month's adherence</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1
            const ds = monthStr + '-' + String(d).padStart(2, '0')
            const taken = logs[ds]
            const isPast = ds <= todayStr
            const isToday = ds === todayStr
            return (
              <div key={ds} className={`day-dot ${taken ? 'taken' : isPast && !isToday ? 'missed' : ''} ${isToday ? 'today' : ''}`}
                title={ds}>
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

      {pastDays.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Log past days</h3>
          {pastDays.map(ds => (
            <label key={ds} style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              padding: '9px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13
            }}>
              <input type="checkbox" style={{ width: 16, height: 16 }}
                checked={!!logs[ds]}
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
