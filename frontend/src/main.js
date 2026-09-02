import './style.css';
import {
  registerUser, loginUser, logoutUser, isLoggedIn, getUser, setUser, updateUserProfile,
  getExpenses, createExpense, updateExpense, deleteExpense,
} from './api.js';

const app = document.getElementById('app');

// ─── Theme Management ───────────────────────────────────────
function getSavedTheme() {
  return localStorage.getItem('app-theme') || 'dark';
}

function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('app-theme', themeName);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeVal === themeName);
  });
}

// Initialize theme immediately
setTheme(getSavedTheme());

function renderThemePicker() {
  const current = getSavedTheme();
  const themes = [
    { id: 'dark', name: 'Dark Indigo', icon: '🌙' },
    { id: 'emerald', name: 'Emerald Luxury', icon: '🌿' },
    { id: 'sapphire', name: 'Sapphire Blue', icon: '💎' },
    { id: 'light', name: 'Clean Light', icon: '☀️' }
  ];

  return `
    <div class="theme-picker" title="Change Theme">
      ${themes.map(t => `
        <button type="button" class="theme-btn ${current === t.id ? 'active' : ''}" 
                data-theme-val="${t.id}" title="${t.name}">
          ${t.icon}
        </button>
      `).join('')}
    </div>
  `;
}

function bindThemePickerEvents() {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setTheme(btn.dataset.themeVal);
    });
  });
}

// ─── Toast Notifications ────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '🔔'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Global Keyboard Shortcut: Press Escape to close overlay modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
    closeMobileSidebar();
  }
});

// ─── Router ─────────────────────────────────────────────────
function navigate(page = 'dashboard') {
  if (page === 'login') {
    renderLogin();
  } else if (page === 'register') {
    renderRegister();
  } else {
    if (!isLoggedIn()) {
      renderLogin();
    } else {
      renderDashboard();
    }
  }
}

// ─── Login Page ─────────────────────────────────────────────
function renderLogin() {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-hero">
        <div class="hero-content">
          <div class="hero-brand">
            <img src="/favicon.svg" alt="ExpenseTracker Logo" style="width: 28px; height: 28px; vertical-align: middle; margin-right: 8px;" /> ExpenseTracker Pro
          </div>
          <h1>Smart Financial <span>Intelligence</span></h1>
          <p>Take full control of your personal expenses with real-time analytics, automated budgeting, and spending insights.</p>
          <div class="hero-features">
            <div class="hero-feature">
              <div class="feature-icon">⚡</div>
              <div>Instant Expense Logging & Category Categorization</div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">🎯</div>
              <div>Automated Monthly Budget Goals & Exceeded Alerts</div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">📊</div>
              <div>Interactive SVG Analytics & Spending Breakdowns</div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">📥</div>
              <div>One-Click CSV Data Export & Date Filters</div>
            </div>
          </div>
        </div>
      </div>
      <div class="auth-form-panel">
        <div style="position: absolute; top: 24px; right: 24px;">
          ${renderThemePicker()}
        </div>
        <div class="auth-form-container">
          <div class="form-header">
            <h2>Sign In</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>
          <div id="auth-error" class="auth-error" style="display:none"></div>
          <form id="login-form">
            <div class="form-group">
              <label for="login-email">Email Address</label>
              <input type="email" id="login-email" placeholder="name@company.com" required />
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-btn">
              Sign In to Dashboard
            </button>
          </form>
          <p class="auth-footer">
            Don't have an account? <a href="#" id="go-register">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  `;
  bindThemePickerEvents();
  document.getElementById('go-register').addEventListener('click', (e) => { e.preventDefault(); navigate('register'); });
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('login-btn');
    btn.innerHTML = `<span class="spinner"></span> Signing in...`;
    btn.disabled = true;
    try {
      await loginUser(email, password);
      showToast('Welcome back!', 'success');
      navigate('dashboard');
    } catch (err) {
      errEl.innerHTML = `⚠️ ${err.message}`;
      errEl.style.display = 'flex';
      btn.innerHTML = 'Sign In to Dashboard';
      btn.disabled = false;
    }
  });
}

// ─── Register Page ──────────────────────────────────────────
function renderRegister() {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-hero">
        <div class="hero-content">
          <div class="hero-brand">
            <img src="/favicon.svg" alt="ExpenseTracker Logo" style="width: 28px; height: 28px; vertical-align: middle; margin-right: 8px;" /> ExpenseTracker Pro
          </div>
          <h1>Start Managing <span>Smarter Today</span></h1>
          <p>Join thousands of users who track, analyze, and optimize their daily spending effortlessly.</p>
          <div class="hero-features">
            <div class="hero-feature">
              <div class="feature-icon">🎯</div>
              <div>Clear Visual Budgeting Goals & Threshold Warnings</div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">📱</div>
              <div>Fully Responsive on Desktop, Tablet & Mobile</div>
            </div>
          </div>
        </div>
      </div>
      <div class="auth-form-panel">
        <div style="position: absolute; top: 24px; right: 24px;">
          ${renderThemePicker()}
        </div>
        <div class="auth-form-container">
          <div class="form-header">
            <h2>Create Account</h2>
            <p>Start tracking your expenses in seconds.</p>
          </div>
          <div id="auth-error" class="auth-error" style="display:none"></div>
          <form id="register-form">
            <div class="form-group">
              <label for="reg-name">Full Name</label>
              <input type="text" id="reg-name" placeholder="John Doe" required />
            </div>
            <div class="form-group">
              <label for="reg-email">Email Address</label>
              <input type="email" id="reg-email" placeholder="name@company.com" required />
            </div>
            <div class="form-group">
              <label for="reg-password">Password</label>
              <input type="password" id="reg-password" placeholder="Minimum 6 characters" minlength="6" required />
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="register-btn">
              Create Account
            </button>
          </form>
          <p class="auth-footer">
            Already have an account? <a href="#" id="go-login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `;
  bindThemePickerEvents();
  document.getElementById('go-login').addEventListener('click', (e) => { e.preventDefault(); navigate('login'); });
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('register-btn');
    btn.innerHTML = `<span class="spinner"></span> Creating account...`;
    btn.disabled = true;
    try {
      await registerUser(name, email, password);
      showToast('Account created successfully!', 'success');
      navigate('dashboard');
    } catch (err) {
      errEl.innerHTML = `⚠️ ${err.message}`;
      errEl.style.display = 'flex';
      btn.innerHTML = 'Create Account';
      btn.disabled = false;
    }
  });
}

// ─── Dashboard State ─────────────────────────────────────────
let expenses = [];
let activeCategoryFilter = 'ALL';
let activeDateFilter = 'ALL';
let activeSortOption = 'DATE_DESC';
let searchQuery = '';

async function renderDashboard() {
  const user = getUser();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  app.innerHTML = `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <div class="app-layout">
      <!-- Sidebar Navigation -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon"><img src="/favicon.svg" alt="Expense Tracker Logo" /></div>
          <div class="brand-text">Expense<span>Tracker</span></div>
        </div>
        <div class="sidebar-nav">
          <div class="sidebar-section-label">Main Menu</div>
          <div class="nav-item active">
            <span class="nav-icon">📊</span> Dashboard
          </div>
          <div class="nav-item" id="nav-add-btn">
            <span class="nav-icon">➕</span> Add Expense
          </div>
          <div class="nav-item" id="nav-budget-btn">
            <span class="nav-icon">🎯</span> Set Budget Goal
          </div>
          <div class="nav-item" id="nav-csv-btn">
            <span class="nav-icon">📥</span> Export CSV
          </div>
        </div>
        <div class="sidebar-footer">
          <div class="user-card">
            <div class="user-avatar">${initials}</div>
            <div class="user-info">
              <div class="user-name">${escapeHtml(user?.name || 'User')}</div>
              <div class="user-email">${escapeHtml(user?.email || '')}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <header class="topbar">
          <div style="display:flex; align-items:center; gap:12px;">
            <button class="mobile-menu-toggle" id="mobile-menu-btn" title="Toggle Sidebar">☰</button>
            <div class="topbar-left">
              <h1>Dashboard Overview</h1>
              <p>Welcome back, ${escapeHtml(user?.name || 'User')}. Here is your financial summary.</p>
            </div>
          </div>
          <div class="topbar-actions">
            ${renderThemePicker()}
            <button class="btn btn-csv btn-sm" id="export-csv-btn" title="Download Expenses as CSV">📥 CSV Export</button>
            <button class="btn btn-primary btn-sm" id="topbar-add-btn">+ Add Expense</button>
            <button class="btn btn-secondary btn-sm" id="logout-btn">Logout</button>
          </div>
        </header>

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
                <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
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
              <div style="padding:12px 24px; border-bottom:1px solid var(--border-subtle); display:flex; gap:6px; overflow-x:auto;" id="category-filters"></div>
              
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

  bindThemePickerEvents();
  bindMobileSidebarEvents();

  document.getElementById('logout-btn').addEventListener('click', () => {
    logoutUser();
    navigate('login');
    showToast('Logged out successfully', 'info');
  });
  document.getElementById('topbar-add-btn').addEventListener('click', () => openExpenseModal());
  document.getElementById('nav-add-btn').addEventListener('click', () => { closeMobileSidebar(); openExpenseModal(); });
  document.getElementById('nav-budget-btn').addEventListener('click', () => { closeMobileSidebar(); openBudgetModal(); });
  document.getElementById('nav-csv-btn').addEventListener('click', () => { closeMobileSidebar(); exportExpensesToCSV(); });
  document.getElementById('export-csv-btn').addEventListener('click', () => exportExpensesToCSV());
  
  const searchInput = document.getElementById('search-box');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderFilteredTable();
    renderCategoryBreakdown();
  });

  document.getElementById('date-filter-select').addEventListener('change', (e) => {
    activeDateFilter = e.target.value;
    renderFilteredTable();
    renderCategoryBreakdown();
  });

  document.getElementById('sort-select').addEventListener('change', (e) => {
    activeSortOption = e.target.value;
    renderFilteredTable();
  });

  await loadExpenses();
}

function bindMobileSidebarEvents() {
  const btn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (btn && sidebar && overlay) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
    overlay.addEventListener('click', () => closeMobileSidebar());
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

async function loadExpenses() {
  try {
    expenses = await getExpenses();
    renderBudgetWidget();
    renderStats();
    renderCategoryFilters();
    renderFilteredTable();
    renderCategoryBreakdown();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── Monthly Budget Widget ──────────────────────────────────
function renderBudgetWidget() {
  const container = document.getElementById('budget-widget-card');
  if (!container) return;

  const user = getUser();
  const limit = user?.monthlyBudget || 50000;

  // Calculate total spent in current calendar month
  const now = new Date();
  const currentMonthTotal = expenses.reduce((sum, exp) => {
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
      <span class="budget-spent">₹${currentMonthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} <span style="font-size:0.85rem; font-weight:500; color:var(--text-muted);">spent this month</span></span>
      <span class="budget-limit">Goal: ₹${limit.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
    </div>
    <div class="budget-progress-track">
      <div class="budget-progress-fill ${statusClass}" style="width: ${pct}%"></div>
    </div>
  `;

  document.getElementById('edit-budget-btn')?.addEventListener('click', () => openBudgetModal());
}

function openBudgetModal() {
  const user = getUser();
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
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.getElementById('budget-close-btn').addEventListener('click', close);
  document.getElementById('budget-cancel-btn').addEventListener('click', close);

  document.getElementById('budget-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newLimit = parseFloat(document.getElementById('budget-amount-input').value);
    const btn = document.getElementById('budget-save-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Saving...`;

    try {
      await updateUserProfile({ monthlyBudget: newLimit });
      showToast('Monthly budget updated!', 'success');
      close();
      renderBudgetWidget();
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Save Budget Target';
    }
  });
}

// ─── Stats Row ───────────────────────────────────────────────
function renderStats() {
  const filtered = getFilteredExpenses();
  const total = filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const count = filtered.length;
  const avg = count > 0 ? (total / count) : 0;
  const categories = new Set(filtered.map(e => e.category).filter(Boolean));

  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Total Filtered Spending</span>
        <div class="stat-icon purple">💰</div>
      </div>
      <div class="stat-value">₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
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
      <div class="stat-value">₹${avg.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
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

// ─── Filters & Sorting Logic ───────────────────────────────
function renderCategoryFilters() {
  const categories = ['ALL', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other'];
  const container = document.getElementById('category-filters');
  if (!container) return;
  container.innerHTML = categories.map(cat => `
    <button class="filter-chip ${activeCategoryFilter === cat ? 'active' : ''}" data-cat="${cat}">
      ${cat}
    </button>
  `).join('');

  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeCategoryFilter = chip.dataset.cat;
      renderCategoryFilters();
      renderFilteredTable();
      renderStats();
      renderCategoryBreakdown();
    });
  });
}

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

function renderFilteredTable() {
  const filtered = getFilteredExpenses();
  const container = document.getElementById('expenses-table-container');
  document.getElementById('expense-count-badge').textContent = `${filtered.length} items`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-illustration">💳</div>
        <h3>No expenses found</h3>
        <p>${expenses.length === 0 ? "You haven't recorded any expenses yet. Click below to add your first expense." : "No expenses match your search or filter criteria."}</p>
        ${expenses.length === 0 ? `<button class="btn btn-primary" id="empty-add-btn">+ Add Expense Now</button>` : ''}
      </div>
    `;
    document.getElementById('empty-add-btn')?.addEventListener('click', () => openExpenseModal());
    return;
  }

  container.innerHTML = `
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
        ${filtered.map(exp => `
          <tr>
            <td>
              <span class="expense-title">${escapeHtml(exp.title)}</span>
              <span class="expense-desc">${escapeHtml(exp.description || '')}</span>
            </td>
            <td>
              <span class="expense-amount">-₹${Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </td>
            <td>
              <span class="category-pill" data-cat="${escapeHtml(exp.category || 'Other')}">
                ${escapeHtml(exp.category || 'Other')}
              </span>
            </td>
            <td>
              <span class="expense-date">${new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </td>
            <td style="text-align:right">
              <div class="row-actions" style="justify-content: flex-end;">
                <button class="action-btn edit-btn" data-id="${exp._id}" title="Edit Expense">✏️</button>
                <button class="action-btn delete delete-btn" data-id="${exp._id}" title="Delete Expense">🗑️</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const exp = expenses.find(e => e._id === btn.dataset.id);
      if (exp) openExpenseModal(exp);
    });
  });
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDelete(btn.dataset.id));
  });
}

// ─── Visual Analytics & Category Breakdown ─────────────────
function renderCategoryBreakdown() {
  const container = document.getElementById('category-breakdown');
  const chartBody = document.getElementById('chart-card-body');
  if (!container || !chartBody) return;

  const filtered = getFilteredExpenses();

  if (filtered.length === 0) {
    chartBody.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:24px 0;">No chart data</div>`;
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:24px 0;">No category data to display</div>`;
    return;
  }

  const totals = {};
  let totalSum = 0;
  filtered.forEach(e => {
    const cat = e.category || 'Other';
    totals[cat] = (totals[cat] || 0) + Number(e.amount || 0);
    totalSum += Number(e.amount || 0);
  });

  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  // Color palette for SVG Doughnut segments
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#3b82f6', '#f43f5e'];
  
  // Render Interactive SVG Doughnut Chart
  let cumulativePercent = 0;
  const strokeDashArray = 2 * Math.PI * 80; // circumference for radius=80 (approx 502.65)

  const chartSegments = sorted.map(([cat, amount], idx) => {
    const pct = totalSum > 0 ? amount / totalSum : 0;
    const strokeDashoffset = strokeDashArray * (1 - pct);
    const rotation = cumulativePercent * 360;
    cumulativePercent += pct;

    return `
      <circle cx="110" cy="110" r="80" 
              fill="transparent" 
              stroke="${colors[idx % colors.length]}" 
              stroke-width="24"
              stroke-dasharray="${strokeDashArray}" 
              stroke-dashoffset="${strokeDashoffset}" 
              style="transform: rotate(${rotation}deg); transform-origin: 110px 110px; transition: all 0.8s ease;"
              title="${cat}: ₹${amount.toLocaleString('en-IN')}" />
    `;
  }).join('');

  chartBody.innerHTML = `
    <div class="chart-svg-wrapper">
      <svg viewBox="0 0 220 220">
        ${chartSegments}
      </svg>
      <div class="chart-center-info">
        <div class="chart-center-amount">₹${totalSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
        <div class="chart-center-sub">Total Spent</div>
      </div>
    </div>
  `;

  // Render Category Progress Bars
  container.innerHTML = sorted.map(([cat, amount], idx) => {
    const percentage = totalSum > 0 ? ((amount / totalSum) * 100).toFixed(1) : 0;
    const catColor = colors[idx % colors.length];
    return `
      <div class="category-bar-item">
        <div class="cat-bar-label">${escapeHtml(cat)}</div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width: ${percentage}%; background: ${catColor};"></div>
        </div>
        <div class="cat-bar-value">₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })} (${percentage}%)</div>
      </div>
    `;
  }).join('');
}

// ─── CSV Export Handler ──────────────────────────────────────
function exportExpensesToCSV() {
  const filtered = getFilteredExpenses();
  if (filtered.length === 0) {
    showToast('No expenses available to export!', 'error');
    return;
  }

  const headers = ['ID', 'Title', 'Amount (INR)', 'Category', 'Date', 'Description'];
  const rows = filtered.map(exp => [
    `"${exp._id || ''}"`,
    `"${(exp.title || '').replace(/"/g, '""')}"`,
    exp.amount || 0,
    `"${exp.category || 'Other'}"`,
    `"${new Date(exp.date).toISOString().split('T')[0]}"`,
    `"${(exp.description || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Expenses_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Expenses exported to CSV successfully!', 'success');
}

// ─── Expense Modal (Add / Edit) ──────────────────────────────
function openExpenseModal(existing = null) {
  const isEdit = !!existing;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
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
                ${['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other']
                  .map(c => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="exp-description">Description / Notes</label>
            <input type="text" id="exp-description" placeholder="Short description or purpose" value="${escapeHtml(existing?.description || '')}" required />
          </div>
          <div class="form-group">
            <label for="exp-date">Date</label>
            <input type="date" id="exp-date" value="${existing ? new Date(existing.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}" required />
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
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.getElementById('modal-close-btn').addEventListener('click', close);
  document.getElementById('modal-cancel').addEventListener('click', close);

  document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('modal-save');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Saving...`;

    const payload = {
      title: document.getElementById('exp-title').value,
      amount: parseFloat(document.getElementById('exp-amount').value),
      category: document.getElementById('exp-category').value,
      description: document.getElementById('exp-description').value,
      date: document.getElementById('exp-date').value,
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
      await loadExpenses();
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = isEdit ? 'Save Changes' : 'Create Expense';
    }
  });
}

// ─── Delete Handler ─────────────────────────────────────────
async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) return;
  try {
    await deleteExpense(id);
    showToast('Expense deleted', 'info');
    await loadExpenses();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── Helpers ────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ─── Init ───────────────────────────────────────────────────
navigate();
