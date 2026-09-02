/**
 * ThemePicker Component
 */
import { THEMES, getSavedTheme, setTheme } from '../utils/theme.js';

/**
 * Returns HTML string for the Theme Picker buttons
 * @returns {string}
 */
export function renderThemePicker() {
  const current = getSavedTheme();
  return `
    <div class="theme-picker" title="Change Theme">
      ${THEMES.map(t => `
        <button type="button" class="theme-btn ${current === t.id ? 'active' : ''}" 
                data-theme-val="${t.id}" title="${t.name}">
          ${t.icon}
        </button>
      `).join('')}
    </div>
  `;
}

/**
 * Binds click events to all theme buttons inside the root container or document
 * @param {HTMLElement|Document} root 
 */
export function bindThemePickerEvents(root = document) {
  root.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setTheme(btn.dataset.themeVal);
    });
  });
}
