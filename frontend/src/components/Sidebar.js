/**
 * Sidebar Component
 */
import { escapeHtml, getInitials } from '../utils/helpers.js';
import { renderThemePicker, bindThemePickerEvents } from './ThemePicker.js';

/**
 * Renders sidebar navigation and user card HTML
 * @param {Object} user 
 * @returns {string}
 */
export function renderSidebar(user) {
  const initials = getInitials(user?.name);
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon"><img src="/favicon.svg" alt="Expense Tracker Logo" /></div>
        <div class="brand-text">Expense<span>Tracker</span></div>
        <button class="sidebar-close-btn" id="sidebar-close-btn" title="Close Navigation Drawer">&times;</button>
      </div>
      <div class="sidebar-nav">
        <div class="sidebar-section-label">Main Menu</div>
        <div class="nav-item active">
          <span class="nav-icon">📊</span> Dashboard
        </div>
        <div class="nav-item" id="nav-add-btn">
          <span class="nav-icon">➕</span> Add Expense
        </div>
        <div class="nav-item" id="nav-budget-btn">
          <span class="nav-icon">🎯</span> Set Budget Goal
        </div>
        <div class="nav-item" id="nav-csv-btn">
          <span class="nav-icon">📥</span> Export CSV
        </div>

        <div class="sidebar-section-label">Color Theme</div>
        <div class="sidebar-theme-wrapper">
          ${renderThemePicker()}
        </div>
      </div>
      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">${initials}</div>
          <div class="user-info">
            <div class="user-name">${escapeHtml(userName)}</div>
            <div class="user-email">${escapeHtml(userEmail)}</div>
          </div>
          <button class="sidebar-logout-btn" id="sidebar-logout-btn" title="Sign Out" aria-label="Sign Out">
            <span>🚪</span>
          </button>
        </div>
      </div>
    </aside>
  `;
}

/**
 * Binds event listeners for sidebar actions and mobile responsiveness
 * @param {Object} callbacks
 * @param {Function} callbacks.onAddExpense
 * @param {Function} callbacks.onSetBudget
 * @param {Function} callbacks.onExportCsv
 * @param {Function} callbacks.onLogout
 */
export function bindSidebarEvents({ onAddExpense, onSetBudget, onExportCsv, onLogout } = {}) {
  bindThemePickerEvents();

  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => closeMobileSidebar());
  }

  const closeBtn = document.getElementById('sidebar-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeMobileSidebar());
  }

  const addBtn = document.getElementById('nav-add-btn');
  if (addBtn && onAddExpense) {
    addBtn.addEventListener('click', () => {
      closeMobileSidebar();
      onAddExpense();
    });
  }

  const budgetBtn = document.getElementById('nav-budget-btn');
  if (budgetBtn && onSetBudget) {
    budgetBtn.addEventListener('click', () => {
      closeMobileSidebar();
      onSetBudget();
    });
  }

  const csvBtn = document.getElementById('nav-csv-btn');
  if (csvBtn && onExportCsv) {
    csvBtn.addEventListener('click', () => {
      closeMobileSidebar();
      onExportCsv();
    });
  }

  const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
  if (sidebarLogoutBtn && onLogout) {
    sidebarLogoutBtn.addEventListener('click', () => {
      closeMobileSidebar();
      onLogout();
    });
  }
}

/**
 * Closes the mobile sidebar and backdrop overlay
 */
export function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

/**
 * Toggles the mobile sidebar and backdrop overlay
 */
export function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar && overlay) {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  }
}

