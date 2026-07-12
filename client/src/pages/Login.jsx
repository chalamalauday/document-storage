import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, FolderOpen, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) { setFormError('Please fill in all fields'); return; }
    const result = await login(email, password);
    if (result.success) navigate('/dashboard');
    else setFormError(result.error || 'Failed to login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f6ff 0%, #f8fafc 50%, #eff6ff 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: 320, height: 320,
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-60px',
        width: 280, height: 280,
        background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '26rem',
        background: '#ffffff',
        borderRadius: '1.25rem',
        boxShadow: '0 20px 40px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.06)',
        overflow: 'hidden',
        position: 'relative',
        animation: 'fadeInUp 250ms ease',
      }}>
        {/* Top gradient accent bar */}
        <div style={{
          height: 4,
          background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
        }} />

        <div style={{ padding: '2.5rem 2rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 56, height: 56,
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              borderRadius: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 20px rgba(59,130,246,0.3)',
            }}>
              <FolderOpen size={26} color="#fff" />
            </div>
            <h1 style={{
              fontSize: '1.625rem', fontWeight: 800, color: '#0f172a',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              letterSpacing: '-0.025em', marginBottom: '0.375rem',
            }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 400 }}>
              Sign in to access your document vault
            </p>
          </div>

          {/* Error alert */}
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
              <span>{formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon"><Mail size={16} /></span>
                <input
                  type="email"
                  id="login-email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.25rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In to DocVault'}
            </button>
          </form>

          {/* Footer link */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1.5rem' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Bottom trust strip */}
        <div style={{
          padding: '0.75rem 2rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
          fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500,
        }}>
          <ShieldCheck size={12} color="#10b981" />
          Secured with AES-256 encryption & AWS S3 storage
        </div>
      </div>
    </div>
  );
};

export default Login;
