/**
 * Theme Management Module
 */

export const THEMES = [
  { id: 'dark', name: 'Dark Indigo', icon: '🌙' },
  { id: 'emerald', name: 'Emerald Luxury', icon: '🌿' },
  { id: 'sapphire', name: 'Sapphire Blue', icon: '💎' },
  { id: 'light', name: 'Clean Light', icon: '☀️' }
];

export function getSavedTheme() {
  return localStorage.getItem('app-theme') || 'dark';
}

export function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('app-theme', themeName);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeVal === themeName);
  });
}

export function initTheme() {
  setTheme(getSavedTheme());
}
