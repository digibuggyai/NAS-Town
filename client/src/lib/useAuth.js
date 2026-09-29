import { useCallback, useEffect, useState } from 'react';
import { api, getToken, setToken, SESSION_EXPIRED } from './api.js';

// Staff session. The server re-checks the role on every request; this only
// decides what to render.
export function useAuth() {
  const [state, setState] = useState({ user: null, loading: Boolean(getToken()), expired: false });

  // Any staff request answered with 401 (expired or revoked session) drops back to sign-in.
  useEffect(() => {
    const onExpired = () => setState((s) => (s.user ? { user: null, loading: false, expired: true } : s));
    window.addEventListener(SESSION_EXPIRED, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, onExpired);
  }, []);


  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    api.me()
      .then(({ user }) => alive && setState({ user, loading: false, expired: false }))
      .catch((err) => alive && setState({ user: null, loading: false, expired: err.status === 401 }));
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login(email, password);
    setToken(token);
    setState({ user, loading: false, expired: false });
    return user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setState({ user: null, loading: false, expired: false });
  }, []);

  return { ...state, login, logout };
}
