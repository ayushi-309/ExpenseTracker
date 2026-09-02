/**
 * ExpenseModal Component
 * Modal dialog for creating or updating an expense record
 */
import { createExpense, updateExpense } from '../api.js';
import { escapeHtml } from '../utils/helpers.js';
import { showToast } from '../utils/toast.js';

const CATEGORY_OPTIONS = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Education',
  'Other'
];

/**
 * Opens Add or Edit Expense modal
 * @param {Object|null} existing 
 * @param {Object} callbacks
 * @param {Function} callbacks.onExpenseSaved
 */
export function openExpenseModal(existing = null, { onExpenseSaved } = {}) {
  const isEdit = !!existing;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const defaultDate = existing
    ? new Date(existing.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>${isEdit ? '✏️ Edit Expense Record' : '➕ Add New Expense'}</h2>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      <form id="expense-form">
        <div class="modal-body">
          <div class="form-group">
            <label for="exp-title">Title / Merchant</label>
            <input type="text" id="exp-title" placeholder="e.g. Starbucks Coffee, Amazon Order" value="${escapeHtml(existing?.title || '')}" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="exp-amount">Amount (₹)</label>
              <input type="number" id="exp-amount" placeholder="0.00" step="0.01" min="0.01" value="${existing?.amount || ''}" required />
            </div>
            <div class="form-group">
              <label for="exp-category">Category</label>
              <select id="exp-category" required>
                ${CATEGORY_OPTIONS.map(c => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="exp-description">Description / Notes</label>
            <input type="text" id="exp-description" placeholder="Short description or purpose" value="${escapeHtml(existing?.description || '')}" required />
          </div>
          <div class="form-group">
            <label for="exp-date">Date</label>
            <input type="date" id="exp-date" value="${defaultDate}" required />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="modal-save">${isEdit ? 'Save Changes' : 'Create Expense'}</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector('#modal-close-btn').addEventListener('click', close);
  overlay.querySelector('#modal-cancel').addEventListener('click', close);

  overlay.querySelector('#expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = overlay.querySelector('#modal-save');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Saving...`;

    const payload = {
      title: overlay.querySelector('#exp-title').value,
      amount: parseFloat(overlay.querySelector('#exp-amount').value),
      category: overlay.querySelector('#exp-category').value,
      description: overlay.querySelector('#exp-description').value,
      date: overlay.querySelector('#exp-date').value,
    };

    try {
      if (isEdit) {
        await updateExpense(existing._id, payload);
        showToast('Expense updated successfully!', 'success');
      } else {
        await createExpense(payload);
        showToast('Expense created successfully!', 'success');
      }
      close();
      if (onExpenseSaved) {
        await onExpenseSaved();
      }
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = isEdit ? 'Save Changes' : 'Create Expense';
    }
  });
}
