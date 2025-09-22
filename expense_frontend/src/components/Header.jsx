import React from 'react';
import { useAuth } from '../hooks/useAuth';

// PUBLIC_INTERFACE
export default function Header() {
  /** Top header content (scoped under the gradient bar) with greeting and sign out. */
  const { session, signOut } = useAuth();
  const email = session?.user?.email || 'User';

  return (
    <div className="row">
      <div className="col-12">
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <div className="kicker">Dashboard</div>
              <h2 style={{ marginTop: 6 }}>Welcome back, {email}</h2>
              <div className="subtle">Track your spending, upload receipts, and stay on budget.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn ghost" onClick={signOut} aria-label="Sign out">Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
