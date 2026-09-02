/**
 * Toast Notification Utility
 */

const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️'
};

/**
 * Display a floating toast alert
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 */
export function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${TOAST_ICONS[type] || '🔔'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
