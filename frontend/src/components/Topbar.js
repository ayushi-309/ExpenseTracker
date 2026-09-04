/**
 * Topbar Component
 */
import { escapeHtml } from '../utils/helpers.js';
import { renderThemePicker, bindThemePickerEvents } from './ThemePicker.js';
import { toggleMobileSidebar } from './Sidebar.js';

/**
 * Renders Topbar HTML
 * @param {Object} user 
 * @returns {string}
 */
export function renderTopbar(user) {
  const userName = user?.name || 'User';

  return `
    <header class="topbar">
      <div class="topbar-left">
        <button class="mobile-menu-toggle" id="mobile-menu-btn" title="Toggle Navigation Menu" aria-label="Toggle Navigation Menu">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div class="topbar-title-wrapper">
          <div class="topbar-title-row">
            <h1 class="topbar-title">Dashboard</h1>
            <span class="topbar-badge">Overview</span>
          </div>
          <p class="topbar-subtitle">Welcome back, <span class="user-highlight">${escapeHtml(userName)}</span></p>
        </div>
      </div>

      <div class="topbar-right">
        <div class="topbar-utility desktop-theme-picker">
          ${renderThemePicker()}
        </div>

        <div class="topbar-actions">
          <button class="btn btn-csv btn-sm" id="export-csv-btn" title="Download Expenses as CSV">
            <span class="btn-icon">📥</span>
            <span class="btn-text">Export CSV</span>
          </button>
          <button class="btn btn-primary btn-sm" id="topbar-add-btn" title="Record New Expense">
            <span class="btn-icon">➕</span>
            <span class="btn-text">Add Expense</span>
          </button>
          <button class="btn btn-secondary btn-sm btn-logout" id="logout-btn" title="Sign Out">
            <span class="btn-icon">🚪</span>
            <span class="btn-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  `;
}

/**
 * Binds Topbar events
 * @param {Object} callbacks
 * @param {Function} callbacks.onLogout
 * @param {Function} callbacks.onAddExpense
 * @param {Function} callbacks.onExportCsv
 */
export function bindTopbarEvents({ onLogout, onAddExpense, onExportCsv } = {}) {
  bindThemePickerEvents();

  const mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileSidebar();
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && onLogout) {
    logoutBtn.addEventListener('click', onLogout);
  }

  const topbarAddBtn = document.getElementById('topbar-add-btn');
  if (topbarAddBtn && onAddExpense) {
    topbarAddBtn.addEventListener('click', onAddExpense);
  }

  const exportBtn = document.getElementById('export-csv-btn');
  if (exportBtn && onExportCsv) {
    exportBtn.addEventListener('click', onExportCsv);
  }
}

