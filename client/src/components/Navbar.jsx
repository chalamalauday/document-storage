import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, FolderOpen, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      width: '100%',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '0 1.5rem',
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo / Brand */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            borderRadius: '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
          }}>
            <FolderOpen size={18} color="#fff" />
          </div>
          <div>
            <span style={{
              fontSize: '1.0625rem',
              fontWeight: 800,
              color: '#0f172a',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              letterSpacing: '-0.02em',
            }}>
              Doc<span style={{ color: '#2563eb' }}>Vault</span>
            </span>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', letterSpacing: '0.06em', fontWeight: 500, marginTop: '-2px' }}>
              DOCUMENT MANAGEMENT
            </div>
          </div>
        </div>

        {/* Right side — user info + logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* User badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '2rem',
              fontSize: '0.8125rem',
              color: '#475569',
              fontWeight: 500,
            }}>
              <div style={{
                width: 24, height: 24,
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={13} color="#2563eb" />
              </div>
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4375rem 0.875rem',
                background: '#fff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.borderColor = '#fecaca';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
