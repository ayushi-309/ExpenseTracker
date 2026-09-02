/**
 * BudgetModal Component
 */
import { updateUserProfile } from '../api.js';
import { showToast } from '../utils/toast.js';

/**
 * Opens modal dialog to adjust monthly budget goal
 * @param {Object} user 
 * @param {Object} callbacks
 * @param {Function} callbacks.onBudgetUpdated
 */
export function openBudgetModal(user, { onBudgetUpdated } = {}) {
  const currentLimit = user?.monthlyBudget || 50000;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>🎯 Adjust Monthly Budget Limit</h2>
        <button class="modal-close" id="budget-close-btn">&times;</button>
      </div>
      <form id="budget-form">
        <div class="modal-body">
          <div class="form-group">
            <label for="budget-amount-input">Monthly Spending Target (₹)</label>
            <input type="number" id="budget-amount-input" value="${currentLimit}" min="1000" step="500" required />
            <span style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">Setting a target helps you track spending thresholds and warnings.</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="budget-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-primary" id="budget-save-btn">Save Budget Target</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector('#budget-close-btn').addEventListener('click', close);
  overlay.querySelector('#budget-cancel-btn').addEventListener('click', close);

  overlay.querySelector('#budget-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newLimit = parseFloat(overlay.querySelector('#budget-amount-input').value);
    const btn = overlay.querySelector('#budget-save-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Saving...`;

    try {
      const updatedUser = await updateUserProfile({ monthlyBudget: newLimit });
      showToast('Monthly budget updated!', 'success');
      close();
      if (onBudgetUpdated) {
        onBudgetUpdated(updatedUser);
      }
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Save Budget Target';
    }
  });
}
