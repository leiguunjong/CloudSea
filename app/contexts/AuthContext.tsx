import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  cloudseaId: string;
  username?: string | null;
  phone?: string | null;
  email?: string | null;
  gender?: string | null;
  birthday?: string | null;
  avatar?: string | null;
  coverImage?: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateUser: async () => {},
});

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const [token, userJson] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (token && userJson) {
          setState({ token, user: JSON.parse(userJson), loading: false });
        } else {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch {
        setState((s) => ({ ...s, loading: false }));
      }
    })();
  }, []);

  const signIn = useCallback(async (token: string, user: User) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
    setState({ token, user, loading: false });
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setState({ token: null, user: null, loading: false });
  }, []);

  const updateUser = useCallback(async (user: User) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    setState((s) => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
