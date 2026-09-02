/**
 * Utility helper functions for ExpenseTracker
 */

/**
 * Escapes HTML characters to prevent XSS attacks when rendering into innerHTML
 * @param {string|number|null|undefined} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/**
 * Formats a number into Indian Rupee currency string (e.g. ₹1,234.50)
 * @param {number|string} amount 
 * @param {number} fractionDigits 
 * @returns {string}
 */
export function formatCurrency(amount, fractionDigits = 2) {
  const num = Number(amount || 0);
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

/**
 * Formats a date string or timestamp into readable format (e.g. 15 Aug 2025)
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Computes up to 2 uppercase initials for a given user name
 * @param {string} name 
 * @returns {string}
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
