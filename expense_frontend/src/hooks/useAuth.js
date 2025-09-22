/**
 * Authentication hook for Supabase.
 * Manages the current session and exposes basic auth methods.
 */
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// PUBLIC_INTERFACE
export function useAuth() {
  /** Provides session state and helpers for sign-in, sign-up, and sign-out. */
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // PUBLIC_INTERFACE
  async function signIn(email, password) {
    /** Sign in with email/password */
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  // PUBLIC_INTERFACE
  async function signUp(email, password) {
    /** Sign up with email/password and email redirect config */
    const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: siteUrl }
    });
    if (error) throw error;
  }

  // PUBLIC_INTERFACE
  async function signOut() {
    /** Signs out current user */
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return { session, loading, signIn, signUp, signOut };
}
