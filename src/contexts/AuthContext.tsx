import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getMemberById } from "@/services/familyService";

export interface CurrentUser {
  memberId: string;
  memberName: string;
  phoneNumber: string;
  hijriBirthDate?: string;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  login: (user: CurrentUser) => void;
  logout: () => void;
  hasSeenOnboarding: boolean;
  markOnboardingSeen: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "khunaini_currentUser";
const ONBOARDING_KEY = "hasSeenOnboarding";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return null;
  });

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  });

  const login = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(ONBOARDING_KEY, "true");
    setHasSeenOnboarding(true);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const markOnboardingSeen = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setHasSeenOnboarding(true);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasSeenOnboarding, markOnboardingSeen }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
