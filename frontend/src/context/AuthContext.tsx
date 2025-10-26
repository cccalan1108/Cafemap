import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; 

interface AuthContextType {
  token: string | null;
  user: { userId: number; email: string } | null;
  login: (token: string) => void;
  logout: () => void;
}

//建立Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ userId: number; email: string } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decodedUser: { userId: number; email: string } = jwtDecode(storedToken);
        setUser(decodedUser);
      } catch (error) {
        console.error("Failed to decode token:", error);
        //如果token無效就清除它
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const decodedUser: { userId: number; email: string } = jwtDecode(newToken);
      setUser(decodedUser);
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}