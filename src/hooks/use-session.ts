"use client";

import { useCallback, useEffect, useState } from "react";

const SESSION_KEY = "hackaton_user_id";

export function useSession() {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    setUserIdState(stored);
    setIsLoading(false);
  }, []);

  const setUserId = useCallback((id: string) => {
    localStorage.setItem(SESSION_KEY, id);
    setUserIdState(id);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUserIdState(null);
  }, []);

  return {
    userId,
    isLoading,
    isLoggedIn: !!userId,
    setUserId,
    clearSession,
  };
}
