import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function AuthPage() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, { data: { full_name: name } })
        if (error) throw error
        setMessage('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo / title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--teal-bg)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 24
          }}>🩸</div>
          <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>ThalCare</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>
            Your personal thalassemia care companion
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                style={{
                  flex: 1,
                  background: mode === m ? 'var(--teal-bg)' : 'transparent',
                  color: mode === m ? 'var(--teal-text)' : 'var(--text2)',
                  borderColor: mode === m ? 'var(--teal)' : 'var(--border)',
                  fontWeight: mode === m ? 500 : 400
                }}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-row">
                <label>Full name</label>
                <input
                  type="text" value={name} required
                  onChange={e => setName(e.target.value)}
                  placeholder="Abdul"
                />
              </div>
            )}
            <div className="form-row">
              <label>Email address</label>
              <input
                type="email" value={email} required
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-row" style={{ marginBottom: 18 }}>
              <label>Password</label>
              <input
                type="password" value={password} required minLength={6}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--red-bg)', color: 'var(--red-text)',
                border: '0.5px solid var(--red)', borderRadius: 'var(--radius)',
                padding: '8px 12px', fontSize: 13, marginBottom: 14
              }}>{error}</div>
            )}
            {message && (
              <div style={{
                background: 'var(--green-bg)', color: 'var(--green-text)',
                border: '0.5px solid var(--green)', borderRadius: 'var(--radius)',
                padding: '8px 12px', fontSize: 13, marginBottom: 14
              }}>{message}</div>
            )}

            <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 16 }}>
          Your health data is private and stored securely.
        </p>
      </div>
    </div>
  )
}
