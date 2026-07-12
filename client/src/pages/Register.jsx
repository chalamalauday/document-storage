import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Loader2, FolderOpen, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name || !email || !password || !confirmPassword) { setFormError('Please fill in all fields'); return; }
    if (password.length < 6) { setFormError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setFormError('Passwords do not match'); return; }
    const result = await register(name, email, password);
    if (result.success) navigate('/dashboard');
    else setFormError(result.error || 'Registration failed');
  };

  const fields = [
    { id: 'reg-name',     label: 'Full Name',       Icon: User,  value: name,            set: setName,            type: 'text',     placeholder: 'John Doe', pw: false },
    { id: 'reg-email',    label: 'Email Address',    Icon: Mail,  value: email,           set: setEmail,           type: 'email',    placeholder: 'you@example.com', pw: false },
    { id: 'reg-password', label: 'Password',         Icon: Lock,  value: password,        set: setPassword,        type: 'password', placeholder: 'Min. 6 characters', pw: true, show: showPassword, setShow: setShowPassword },
    { id: 'reg-confirm',  label: 'Confirm Password', Icon: Lock,  value: confirmPassword, set: setConfirmPassword, type: 'password', placeholder: 'Re-enter password', pw: true, show: showConfirm, setShow: setShowConfirm },
  ];

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
        <div style={{ height: 4, background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)' }} />

        <div style={{ padding: '2.25rem 2rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
              Create your account
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Start managing your documents securely
            </p>
          </div>

          {/* Error alert */}
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
              <span>{formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fields.map(({ id, label, Icon, value, set, type, placeholder, pw, show, setShow }) => (
              <div key={id}>
                <label className="form-label">{label}</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <span className="input-icon"><Icon size={16} /></span>
                  <input
                    type={pw ? (show ? 'text' : 'password') : type}
                    id={id}
                    className="form-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={e => set(e.target.value)}
                    disabled={loading}
                    required
                    style={pw ? { paddingRight: '2.5rem' } : {}}
                  />
                  {pw && (
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      style={{
                        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="submit"
              id="register-submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.25rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}
            >
              Sign in
            </Link>
          </p>
        </div>

        <div style={{
          padding: '0.75rem 2rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
          fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500,
        }}>
          <ShieldCheck size={12} color="#10b981" />
          Your data is encrypted and stored securely on AWS
        </div>
      </div>
    </div>
  );
};

export default Register;
