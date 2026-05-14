import React, { createContext, useContext } from 'react';

const AuthContext = createContext({
  user: null,
  loading: false,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={{
      user: null,
      loading: false,
      isAdmin: false,
      login: async () => {},
      logout: async () => {},
  }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
