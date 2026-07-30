import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { STORAGE_KEYS } from '../config/apiConfig';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

const authStorage = Platform.OS === 'web'
  ? {
      async getItemAsync(key) {
        return globalThis.localStorage?.getItem(key) ?? null;
      },
      async setItemAsync(key, value) {
        globalThis.localStorage?.setItem(key, value);
      },
      async deleteItemAsync(key) {
        globalThis.localStorage?.removeItem(key);
      },
    }
  : SecureStore;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const savedToken = await authStorage.getItemAsync(STORAGE_KEYS.token);
      const savedUser = await authStorage.getItemAsync(STORAGE_KEYS.user);

      if (savedToken && savedUser) {
        setToken(savedToken);
        const cachedUser = JSON.parse(savedUser);
        setUser(cachedUser);

        apiRequest('/api/auth/me', { token: savedToken })
          .then(async (freshUser) => {
            await authStorage.setItemAsync(STORAGE_KEYS.user, JSON.stringify(freshUser));
            setUser(freshUser);
          })
          .catch(() => {});
      }

      setBooting(false);
    }

    loadSession();
  }, []);

  const signIn = useCallback(async (email, senha) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: email.trim(), senha },
    });

    await authStorage.setItemAsync(STORAGE_KEYS.token, data.token);
    await authStorage.setItemAsync(STORAGE_KEYS.user, JSON.stringify(data.usuario));
    setToken(data.token);
    setUser(data.usuario);

    return data.usuario;
  }, []);

  const signUpAdmin = useCallback(async (payload) => {
    const data = await apiRequest('/api/auth/cadastrar-admin', {
      method: 'POST',
      body: payload,
    });

    await authStorage.setItemAsync(STORAGE_KEYS.token, data.token);
    await authStorage.setItemAsync(STORAGE_KEYS.user, JSON.stringify(data.usuario));
    setToken(data.token);
    setUser(data.usuario);

    return data.usuario;
  }, []);

  const updateUser = useCallback(async (nextUser) => {
    await authStorage.setItemAsync(STORAGE_KEYS.user, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    await authStorage.deleteItemAsync(STORAGE_KEYS.token);
    await authStorage.deleteItemAsync(STORAGE_KEYS.user);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    booting,
    token,
    user,
    signIn,
    signUpAdmin,
    signOut,
    updateUser,
  }), [booting, token, user, signIn, signUpAdmin, signOut, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
