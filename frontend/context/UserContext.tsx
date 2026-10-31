"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { resetUserHistory } from "@/lib/api";

export interface DemoProfile {
  id: string;
  name: string;
  badge: string;
  desc: string;
}

export const PRESET_PROFILES: DemoProfile[] = [
  { id: "101", name: "Sushant", badge: "Heavy Compound", desc: "Bench 80kg • Deadlift 130kg" },
  { id: "102", name: "Alex (Hypertrophy)", badge: "Volume Specialist", desc: "Squat 120kg • Incline 70kg" },
  { id: "103", name: "New Athlete", badge: "Clean Slate", desc: "Start fresh or test custom ID" },
];

interface UserContextType {
  userId: string;
  setUserId: (id: string) => void;
  isResetOpen: boolean;
  openResetModal: () => void;
  closeResetModal: () => void;
  eraseActiveUserHistory: (confirmationId: string) => Promise<{ success: boolean; message: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string>("101");
  const [isResetOpen, setIsResetOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ironledger_user_id");
    if (saved) setUserIdState(saved);
  }, []);

  const setUserId = (id: string) => {
    const clean = id.trim() || "101";
    setUserIdState(clean);
    localStorage.setItem("ironledger_user_id", clean);
  };

  const openResetModal = () => setIsResetOpen(true);
  const closeResetModal = () => setIsResetOpen(false);

  const eraseActiveUserHistory = async (confirmationId: string) => {
    const res = await resetUserHistory(userId, confirmationId);
    return res;
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        isResetOpen,
        openResetModal,
        closeResetModal,
        eraseActiveUserHistory,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
