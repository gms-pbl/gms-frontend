import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('gms-theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('gms-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Apply initial theme synchronously on first paint
  useEffect(() => {
    const saved = localStorage.getItem('gms-theme');
    document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
  }, []);

  return { isDark, toggleTheme: () => setIsDark(d => !d) };
}
