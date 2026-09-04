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
        <button class="sidebar-close-btn" id="sidebar-close-btn" title="Close Navigation Drawer" aria-label="Close Drawer">&times;</button>
      </div>

      <div class="sidebar-nav">
        <div class="sidebar-section-label">Main Menu</div>
        <div class="nav-item active" id="nav-dash-btn">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Dashboard</span>
        </div>
        <div class="nav-item" id="nav-add-btn">
          <span class="nav-icon">➕</span>
          <span class="nav-label">Add Expense</span>
        </div>
        <div class="nav-item" id="nav-budget-btn">
          <span class="nav-icon">🎯</span>
          <span class="nav-label">Set Budget Goal</span>
        </div>
        <div class="nav-item" id="nav-csv-btn">
          <span class="nav-icon">📥</span>
          <span class="nav-label">Export CSV</span>
        </div>

        <div class="sidebar-section-label sidebar-theme-section-label">Color Themes</div>
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
        </div>
        <button class="sidebar-logout-btn" id="sidebar-logout-btn" title="Sign Out">
          <span>🚪 Logout</span>
        </button>
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
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    bindThemePickerEvents(sidebar);
  }

  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => closeMobileSidebar());
  }

  const closeBtn = document.getElementById('sidebar-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeMobileSidebar());
  }

  const dashBtn = document.getElementById('nav-dash-btn');
  if (dashBtn) {
    dashBtn.addEventListener('click', () => {
      closeMobileSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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

  // Handle ESC key to close mobile sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileSidebar();
    }
  });
}

/**
 * Closes the mobile sidebar and backdrop overlay
 */
export function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.classList.remove('sidebar-open');
}

/**
 * Toggles the mobile sidebar and backdrop overlay
 */
export function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar && overlay) {
    const willOpen = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', willOpen);
    overlay.classList.toggle('open', willOpen);
    document.body.classList.toggle('sidebar-open', willOpen);
  }
}

