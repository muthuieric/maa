'use client';
import { useState, useEffect, useCallback } from 'react';

export type Role = 'collect' | 'translate' | 'review' | null;

const KEY = 'nenoguard-role';

export function getRole(): Role {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(KEY);
  return v === 'collect' || v === 'translate' || v === 'review' ? v : null;
}

export function useRole() {
  const [role, setRoleState] = useState<Role>(null);
  useEffect(() => {
    setRoleState(getRole());
    const onChange = () => setRoleState(getRole());
    window.addEventListener('nenoguard-role-change', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('nenoguard-role-change', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);
  const setRole = useCallback((r: Role) => {
    try {
      if (r) window.localStorage.setItem(KEY, r);
      else window.localStorage.removeItem(KEY);
    } catch {}
    window.dispatchEvent(new Event('nenoguard-role-change'));
  }, []);
  return { role, setRole };
}
