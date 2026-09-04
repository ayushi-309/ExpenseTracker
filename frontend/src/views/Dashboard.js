/**
 * Dashboard View
 */
import { getExpenses, deleteExpense, getUser, logoutUser } from '../api.js';
import { escapeHtml } from '../utils/helpers.js';
import { showToast } from '../utils/toast.js';
import { exportExpensesToCSV } from '../utils/exportCsv.js';
import { renderSidebar, bindSidebarEvents } from '../components/Sidebar.js';
import { renderTopbar, bindTopbarEvents } from '../components/Topbar.js';
import { renderBudgetWidget } from '../components/BudgetWidget.js';
import { openBudgetModal } from '../components/BudgetModal.js';
import { renderStatsRow } from '../components/StatsRow.js';
import { renderCategoryFilters } from '../components/CategoryFilters.js';
import { renderExpenseTable } from '../components/ExpenseTable.js';
import { renderVisualAnalytics } from '../components/VisualAnalytics.js';
import { openExpenseModal } from '../components/ExpenseModal.js';

/**
 * Renders and manages the Dashboard view
 * @param {HTMLElement} container 
 * @param {Object} options
 * @param {Function} options.onNavigate
 */
export function renderDashboard(container, { onNavigate } = {}) {
  const user = getUser();

  // Local State
  let expenses = [];
  let activeCategoryFilter = 'ALL';
  let activeDateFilter = 'ALL';
  let activeSortOption = 'DATE_DESC';
  let searchQuery = '';

  // Render Dashboard Layout Shell
  container.innerHTML = `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <div class="app-layout">
      ${renderSidebar(user)}

      <!-- Main Content Area -->
      <main class="main-content">
        ${renderTopbar(user)}

        <div class="page-content">
          <!-- Monthly Budget Widget Card -->
          <div class="budget-widget-card" id="budget-widget-card"></div>

          <!-- Stat Cards Row -->
          <div class="stats-row" id="stats-row"></div>

          <!-- Main Grid -->
          <div class="dashboard-grid">
            <!-- Expenses List Card -->
            <div class="content-card">
              <div class="card-header">
                <h3>📋 Expense Transactions</h3>
                <span class="badge" id="expense-count-badge">0 items</span>
              </div>
              
              <!-- Filters and Controls Bar -->
              <div class="filters-bar">
                <div class="search-input">
                  <input type="text" id="search-box" placeholder="Search expenses..." value="${escapeHtml(searchQuery)}" />
                </div>
                <div class="filters-selects-row">
                  <select class="select-input" id="date-filter-select" title="Filter by Date Range">
                    <option value="ALL" ${activeDateFilter === 'ALL' ? 'selected' : ''}>All Time</option>
                    <option value="THIS_MONTH" ${activeDateFilter === 'THIS_MONTH' ? 'selected' : ''}>This Month</option>
                    <option value="LAST_30" ${activeDateFilter === 'LAST_30' ? 'selected' : ''}>Last 30 Days</option>
                    <option value="THIS_YEAR" ${activeDateFilter === 'THIS_YEAR' ? 'selected' : ''}>This Year</option>
                  </select>
                  <select class="select-input" id="sort-select" title="Sort Transactions">
                    <option value="DATE_DESC" ${activeSortOption === 'DATE_DESC' ? 'selected' : ''}>Date (Newest)</option>
                    <option value="DATE_ASC" ${activeSortOption === 'DATE_ASC' ? 'selected' : ''}>Date (Oldest)</option>
                    <option value="AMOUNT_DESC" ${activeSortOption === 'AMOUNT_DESC' ? 'selected' : ''}>Amount (High to Low)</option>
                    <option value="AMOUNT_ASC" ${activeSortOption === 'AMOUNT_ASC' ? 'selected' : ''}>Amount (Low to High)</option>
                  </select>
                </div>
              </div>
              <div class="category-filters-container" id="category-filters"></div>
              
              <div id="expenses-table-container"></div>
            </div>

            <!-- Side Visual Analytics Card -->
            <div class="content-card">
              <div class="card-header">
                <h3>📊 Visual Analytics</h3>
              </div>
              <div class="chart-card-body" id="chart-card-body"></div>
              <div class="category-breakdown" id="category-breakdown"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  // Filter and Sort Computing Function
  function getFilteredExpenses() {
    const now = new Date();
    return expenses.filter(exp => {
      // 1. Category Filter
      const matchesCategory = activeCategoryFilter === 'ALL' || exp.category === activeCategoryFilter;

      // 2. Search Query
      const matchesSearch = !searchQuery || 
        exp.title?.toLowerCase().includes(searchQuery) || 
        exp.description?.toLowerCase().includes(searchQuery) ||
        exp.category?.toLowerCase().includes(searchQuery);

      // 3. Date Range Filter
      let matchesDate = true;
      const expDate = new Date(exp.date);
      if (activeDateFilter === 'THIS_MONTH') {
        matchesDate = expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      } else if (activeDateFilter === 'LAST_30') {
        const diffTime = now - expDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        matchesDate = diffDays <= 30 && diffDays >= 0;
      } else if (activeDateFilter === 'THIS_YEAR') {
        matchesDate = expDate.getFullYear() === now.getFullYear();
      }

      return matchesCategory && matchesSearch && matchesDate;
    }).sort((a, b) => {
      if (activeSortOption === 'DATE_DESC') return new Date(b.date) - new Date(a.date);
      if (activeSortOption === 'DATE_ASC') return new Date(a.date) - new Date(b.date);
      if (activeSortOption === 'AMOUNT_DESC') return Number(b.amount) - Number(a.amount);
      if (activeSortOption === 'AMOUNT_ASC') return Number(a.amount) - Number(b.amount);
      return 0;
    });
  }

  // Update UI components when state or filters change
  function updateUI() {
    const filtered = getFilteredExpenses();
    const currentUser = getUser();

    // 1. Update Monthly Budget Card
    const budgetCardEl = container.querySelector('#budget-widget-card');
    renderBudgetWidget(budgetCardEl, expenses, currentUser, {
      onEditBudget: () => openBudgetModal(currentUser, {
        onBudgetUpdated: () => updateUI()
      })
    });

    // 2. Update Stats Row
    const statsRowEl = container.querySelector('#stats-row');
    renderStatsRow(statsRowEl, filtered);

    // 3. Update Category Filter Chips
    const categoryFiltersEl = container.querySelector('#category-filters');
    renderCategoryFilters(categoryFiltersEl, activeCategoryFilter, (selectedCat) => {
      activeCategoryFilter = selectedCat;
      updateUI();
    });

    // 4. Update Expense Table
    const badgeEl = container.querySelector('#expense-count-badge');
    if (badgeEl) badgeEl.textContent = `${filtered.length} items`;

    const tableContainerEl = container.querySelector('#expenses-table-container');
    renderExpenseTable(tableContainerEl, filtered, expenses.length, {
      onAddExpense: () => openExpenseModal(null, { onExpenseSaved: () => loadExpenses() }),
      onEditExpense: (exp) => openExpenseModal(exp, { onExpenseSaved: () => loadExpenses() }),
      onDeleteExpense: (id) => handleDeleteExpense(id)
    });

    // 5. Update Visual Analytics Chart & Breakdown
    const chartBodyEl = container.querySelector('#chart-card-body');
    const breakdownEl = container.querySelector('#category-breakdown');
    renderVisualAnalytics(chartBodyEl, breakdownEl, filtered);
  }

  // Handlers
  async function handleDeleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) return;
    try {
      await deleteExpense(id);
      showToast('Expense deleted', 'info');
      await loadExpenses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function loadExpenses() {
    try {
      expenses = await getExpenses();
      updateUI();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function handleAddExpense() {
    openExpenseModal(null, { onExpenseSaved: () => loadExpenses() });
  }

  function handleSetBudget() {
    openBudgetModal(getUser(), { onBudgetUpdated: () => updateUI() });
  }

  function handleExportCsv() {
    exportExpensesToCSV(getFilteredExpenses(), getUser());
  }

  function handleLogout() {
    logoutUser();
    showToast('Logged out successfully', 'info');
    if (onNavigate) onNavigate('login');
  }

  // Bind Sidebar and Topbar events
  bindSidebarEvents({
    onAddExpense: handleAddExpense,
    onSetBudget: handleSetBudget,
    onExportCsv: handleExportCsv,
    onLogout: handleLogout,
  });

  bindTopbarEvents({
    onLogout: handleLogout,
    onAddExpense: handleAddExpense,
    onExportCsv: handleExportCsv,
  });

  // Filter input listeners
  const searchInput = container.querySelector('#search-box');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      updateUI();
    });
  }

  const dateSelect = container.querySelector('#date-filter-select');
  if (dateSelect) {
    dateSelect.addEventListener('change', (e) => {
      activeDateFilter = e.target.value;
      updateUI();
    });
  }

  const sortSelect = container.querySelector('#sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSortOption = e.target.value;
      updateUI();
    });
  }

  // Initial fetch
  loadExpenses();
}
