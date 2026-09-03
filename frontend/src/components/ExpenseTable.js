/**
 * ExpenseTable Component
 */
import { escapeHtml, formatCurrency, formatDate } from '../utils/helpers.js';

/**
 * Renders the transactions table or empty state
 * @param {HTMLElement} container 
 * @param {Array} filteredExpenses 
 * @param {number} totalExpensesCount 
 * @param {Object} callbacks
 * @param {Function} callbacks.onAddExpense
 * @param {Function} callbacks.onEditExpense
 * @param {Function} callbacks.onDeleteExpense
 */
export function renderExpenseTable(
  container,
  filteredExpenses = [],
  totalExpensesCount = 0,
  { onAddExpense, onEditExpense, onDeleteExpense } = {}
) {
  if (!container) return;

  if (filteredExpenses.length === 0) {
    const isGlobalEmpty = totalExpensesCount === 0;
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-illustration">💳</div>
        <h3>No expenses found</h3>
        <p>${isGlobalEmpty ? "You haven't recorded any expenses yet. Click below to add your first expense." : "No expenses match your search or filter criteria."}</p>
        ${isGlobalEmpty ? `<button class="btn btn-primary" id="empty-add-btn">+ Add Expense Now</button>` : ''}
      </div>
    `;

    if (isGlobalEmpty && onAddExpense) {
      container.querySelector('#empty-add-btn')?.addEventListener('click', onAddExpense);
    }
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="expense-table">
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredExpenses.map(exp => `
            <tr class="expense-row" data-id="${exp._id}">
              <td class="col-transaction">
                <span class="expense-title">${escapeHtml(exp.title)}</span>
                ${exp.description ? `<span class="expense-desc">${escapeHtml(exp.description)}</span>` : ''}
              </td>
              <td class="col-amount">
                <span class="expense-amount">-${formatCurrency(exp.amount)}</span>
              </td>
              <td class="col-category">
                <span class="category-pill" data-cat="${escapeHtml(exp.category || 'Other')}">
                  ${escapeHtml(exp.category || 'Other')}
                </span>
              </td>
              <td class="col-date">
                <span class="expense-date">${formatDate(exp.date)}</span>
              </td>
              <td class="col-actions">
                <span class="mobile-date-label">📅 ${formatDate(exp.date)}</span>
                <div class="row-actions">
                  <button class="action-btn edit-btn" data-id="${exp._id}" title="Edit Expense" aria-label="Edit Expense">✏️</button>
                  <button class="action-btn delete delete-btn" data-id="${exp._id}" title="Delete Expense" aria-label="Delete Expense">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  if (onEditExpense) {
    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const exp = filteredExpenses.find(e => e._id === btn.dataset.id);
        if (exp) onEditExpense(exp);
      });
    });
  }

  if (onDeleteExpense) {
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        onDeleteExpense(btn.dataset.id);
      });
    });
  }
}
