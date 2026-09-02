/**
 * StatsRow Component
 */
import { formatCurrency } from '../utils/helpers.js';

/**
 * Renders statistical summary cards
 * @param {HTMLElement} container 
 * @param {Array} filteredExpenses 
 */
export function renderStatsRow(container, filteredExpenses = []) {
  if (!container) return;

  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const count = filteredExpenses.length;
  const avg = count > 0 ? total / count : 0;
  const categories = new Set(filteredExpenses.map(e => e.category).filter(Boolean));

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Total Filtered Spending</span>
        <div class="stat-icon purple">💰</div>
      </div>
      <div class="stat-value">${formatCurrency(total)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Transactions Count</span>
        <div class="stat-icon blue">📦</div>
      </div>
      <div class="stat-value">${count}</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Average Transaction</span>
        <div class="stat-icon green">📈</div>
      </div>
      <div class="stat-value">${formatCurrency(avg)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Active Categories</span>
        <div class="stat-icon amber">🏷️</div>
      </div>
      <div class="stat-value">${categories.size}</div>
    </div>
  `;
}
