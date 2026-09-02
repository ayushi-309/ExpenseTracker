/**
 * BudgetWidget Component
 */
import { formatCurrency } from '../utils/helpers.js';

/**
 * Renders the Monthly Spending Target & Progress Widget
 * @param {HTMLElement} container 
 * @param {Array} allExpenses 
 * @param {Object} user 
 * @param {Object} callbacks
 * @param {Function} callbacks.onEditBudget
 */
export function renderBudgetWidget(container, allExpenses = [], user = null, { onEditBudget } = {}) {
  if (!container) return;

  const limit = user?.monthlyBudget || 50000;

  // Calculate total spent in current calendar month
  const now = new Date();
  const currentMonthTotal = allExpenses.reduce((sum, exp) => {
    const d = new Date(exp.date);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      return sum + Number(exp.amount || 0);
    }
    return sum;
  }, 0);

  const pct = limit > 0 ? Math.min(100, Math.round((currentMonthTotal / limit) * 100)) : 0;

  let statusClass = 'safe';
  let statusText = 'On Track';
  if (currentMonthTotal > limit) {
    statusClass = 'exceeded';
    statusText = 'Budget Exceeded!';
  } else if (pct >= 80) {
    statusClass = 'warning';
    statusText = 'Near Limit';
  }

  container.innerHTML = `
    <div class="budget-header">
      <div class="budget-title">
        <span>🎯 Monthly Spending Target</span>
        <span class="budget-badge ${statusClass}">${statusText} (${pct}%)</span>
      </div>
      <button class="btn btn-secondary btn-sm" id="edit-budget-btn">⚙️ Adjust Budget</button>
    </div>
    <div class="budget-values">
      <span class="budget-spent">${formatCurrency(currentMonthTotal)} <span style="font-size:0.85rem; font-weight:500; color:var(--text-muted);">spent this month</span></span>
      <span class="budget-limit">Goal: ${formatCurrency(limit, 0)}</span>
    </div>
    <div class="budget-progress-track">
      <div class="budget-progress-fill ${statusClass}" style="width: ${pct}%"></div>
    </div>
  `;

  if (onEditBudget) {
    const btn = container.querySelector('#edit-budget-btn');
    if (btn) {
      btn.addEventListener('click', onEditBudget);
    }
  }
}
