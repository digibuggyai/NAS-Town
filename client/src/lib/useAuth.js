import { useCallback, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

// Staff session. The server re-checks the role on every request; this only
// decides what to render.
export function useAuth() {
  const [state, setState] = useState({ user: null, loading: Boolean(getToken()) });

  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    api.me()
      .then(({ user }) => alive && setState({ user, loading: false }))
      .catch(() => alive && setState({ user: null, loading: false }));
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login(email, password);
    setToken(token);
    setState({ user, loading: false });
    return user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setState({ user: null, loading: false });
  }, []);

  return { ...state, login, logout };
}
