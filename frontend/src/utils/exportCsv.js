/**
 * CSV Export Utility
 */
import { showToast } from './toast.js';

/**
 * Exports a list of expenses to a CSV file and triggers a browser download
 * @param {Array} expenses 
 * @param {Object} user 
 */
export function exportExpensesToCSV(expenses, user) {
  if (!expenses || expenses.length === 0) {
    showToast('No expenses available to export!', 'error');
    return;
  }

  const userName = (user?.name || 'User').replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `ExpenseTracker_${userName}_${dateStr}.csv`;

  // Build CSV with proper escaping
  const headers = ['Title', 'Amount (INR)', 'Category', 'Date', 'Description'];
  const rows = expenses.map(exp => {
    const title = (exp.title || '').replace(/"/g, '""');
    const desc = (exp.description || '').replace(/"/g, '""');
    const cat = exp.category || 'Other';
    const amount = Number(exp.amount || 0).toFixed(2);
    const date = new Date(exp.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `"${title}",${amount},"${cat}","${date}","${desc}"`;
  });

  // Add summary row
  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  rows.push('');
  rows.push(`"TOTAL",${totalAmount.toFixed(2)},"","","${expenses.length} transactions"`);

  // BOM + content for proper Excel/Sheets opening
  const BOM = '\uFEFF';
  const csvString = BOM + headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  // Trigger synchronous download so browser recognizes user action and preserves .csv extension
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.setAttribute('download', fileName);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Keep object URL alive for 30s so Chrome download manager can finish without discarding filename
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 30000);

  showToast(`Exported ${expenses.length} expenses to ${fileName}`, 'success');
}
