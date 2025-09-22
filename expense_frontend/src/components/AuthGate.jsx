import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

// PUBLIC_INTERFACE
export default function AuthGate() {
  /** Renders authentication form for sign-in/sign-up. */
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password);
      } else {
        await signUp(form.email, form.password);
        setMsg('Check your email for a confirmation link.');
      }
    } catch (e) {
      setMsg(e.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: 420, padding: 18 }}>
        <div className="card-header" style={{ borderBottom: 'none' }}>
          <div className="card-title">Ocean Budget</div>
        </div>

        <div className="modal-body" style={{ paddingTop: 0 }}>
          <div className="kicker">{mode === 'signin' ? 'Sign in' : 'Create account'}</div>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
          {msg && <div className="subtle" style={{ color: msg.includes('Check your email') ? 'var(--color-secondary)' : 'var(--color-error)' }}>{msg}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn" disabled={busy} onClick={submit}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
          <button className="btn ghost" onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}>
            {mode === 'signin' ? 'Create account' : 'Have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
