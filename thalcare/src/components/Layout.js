import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const tabs = [
  { to: '/dashboard',    label: 'Dashboard'    },
  { to: '/transfusions', label: 'Transfusions' },
  { to: '/medication',   label: 'Medication'   },
  { to: '/info',         label: 'About'        },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        background: 'var(--bg)', borderBottom: '0.5px solid var(--border)',
        padding: '0 1rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 52, position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🩸</span>
          <span style={{ fontWeight: 500, fontSize: 15 }}>ThalCare</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{user?.email}</span>
          <button onClick={handleSignOut} style={{ fontSize: 12, padding: '5px 12px' }}>
            Sign out
          </button>
        </div>
      </header>

      {/* Tab nav */}
      <nav style={{
        background: 'var(--bg)', borderBottom: '0.5px solid var(--border)',
        display: 'flex', padding: '0 1rem', gap: 4, overflowX: 'auto'
      }}>
        {tabs.map(t => (
          <NavLink
            key={t.to} to={t.to}
            style={({ isActive }) => ({
              display: 'block', padding: '10px 14px',
              fontSize: 13, fontWeight: isActive ? 500 : 400,
              color: isActive ? 'var(--teal-text)' : 'var(--text2)',
              borderBottom: isActive ? '2px solid var(--teal)' : '2px solid transparent',
              whiteSpace: 'nowrap', textDecoration: 'none'
            })}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '1.25rem 1rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
