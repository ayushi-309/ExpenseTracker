import './style.css';
import { isLoggedIn } from './api.js';
import { initTheme } from './utils/theme.js';
import { closeMobileSidebar } from './components/Sidebar.js';
import { renderLogin } from './views/Login.js';
import { renderRegister } from './views/Register.js';
import { renderDashboard } from './views/Dashboard.js';

const app = document.getElementById('app');

// Initialize active theme
initTheme();

// Global Keyboard Shortcut: Escape to dismiss open modals & mobile drawer
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
    closeMobileSidebar();
  }
});

/**
 * Single-Page Router
 * @param {'login'|'register'|'dashboard'} page 
 */
export function navigate(page = 'dashboard') {
  if (page === 'login') {
    renderLogin(app, { onNavigate: navigate });
  } else if (page === 'register') {
    renderRegister(app, { onNavigate: navigate });
  } else {
    if (!isLoggedIn()) {
      renderLogin(app, { onNavigate: navigate });
    } else {
      renderDashboard(app, { onNavigate: navigate });
    }
  }
}

// Initial navigation
navigate();
