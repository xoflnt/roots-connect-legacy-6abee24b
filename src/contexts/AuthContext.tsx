import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface CurrentUser {
  memberId: string;
  memberName: string;
  phone: string;
  hijriBirthDate?: string;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  isLoggedIn: boolean;
  login: (data: CurrentUser) => void;
  logout: () => void;
}

const STORAGE_KEY = "khunaini-current-user";

const AuthContext = createContext<AuthContextType | null>(null);

function loadUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(loadUser);

  const login = useCallback((data: CurrentUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem("hasSeenOnboarding", "true");
    setCurrentUser(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn: !!currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
