import './style.css';
import {
  registerUser, loginUser, logoutUser, isLoggedIn, getUser,
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
          <p>Take full control of your personal expenses with real-time analytics, automated categorization, and intelligent budget insights.</p>
          <div class="hero-features">
            <div class="hero-feature">
              <div class="feature-icon">⚡</div>
              <div>Instant Expense Logging & Category Categorization</div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">🔒</div>
              <div>Bank-grade Security & End-to-End Encryption</div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">📊</div>
              <div>Interactive Analytics & Spending Breakdowns</div>
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
              <div>Clear Visual Budgeting Goals</div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">📱</div>
              <div>Fully Responsive on Desktop & Mobile</div>
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

// ─── Dashboard ──────────────────────────────────────────────
let expenses = [];
let activeCategoryFilter = 'ALL';
let searchQuery = '';

async function renderDashboard() {
  const user = getUser();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
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
          <div class="topbar-left">
            <h1>Dashboard Overview</h1>
            <p>Welcome back, ${escapeHtml(user?.name || 'User')}. Here is your financial summary.</p>
          </div>
          <div class="topbar-actions">
            ${renderThemePicker()}
            <button class="btn btn-primary btn-sm" id="topbar-add-btn">+ Add Expense</button>
            <button class="btn btn-secondary btn-sm" id="logout-btn">Logout</button>
          </div>
        </header>

        <div class="page-content">
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
              <div class="filters-bar">
                <div class="search-input">
                  <input type="text" id="search-box" placeholder="Search expenses..." value="${escapeHtml(searchQuery)}" />
                </div>
                <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:2px;" id="category-filters">
                </div>
              </div>
              <div id="expenses-table-container"></div>
            </div>

            <!-- Side Category Breakdown Card -->
            <div class="content-card">
              <div class="card-header">
                <h3>📊 Category Breakdown</h3>
              </div>
              <div class="category-breakdown" id="category-breakdown">
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  bindThemePickerEvents();
  document.getElementById('logout-btn').addEventListener('click', () => {
    logoutUser();
    navigate('login');
    showToast('Logged out successfully', 'info');
  });
  document.getElementById('topbar-add-btn').addEventListener('click', () => openExpenseModal());
  document.getElementById('nav-add-btn').addEventListener('click', () => openExpenseModal());
  
  const searchInput = document.getElementById('search-box');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderFilteredTable();
  });

  await loadExpenses();
}

async function loadExpenses() {
  try {
    expenses = await getExpenses();
    renderStats();
    renderCategoryFilters();
    renderFilteredTable();
    renderCategoryBreakdown();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderStats() {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const count = expenses.length;
  const avg = count > 0 ? (total / count) : 0;
  const categories = new Set(expenses.map(e => e.category).filter(Boolean));

  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Total Expenses</span>
        <div class="stat-icon purple">💰</div>
      </div>
      <div class="stat-value">₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Total Items</span>
        <div class="stat-icon blue">📦</div>
      </div>
      <div class="stat-value">${count}</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Average Spending</span>
        <div class="stat-icon green">📈</div>
      </div>
      <div class="stat-value">₹${avg.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Categories Used</span>
        <div class="stat-icon amber">🏷️</div>
      </div>
      <div class="stat-value">${categories.size}</div>
    </div>
  `;
}

function renderCategoryFilters() {
  const categories = ['ALL', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other'];
  const container = document.getElementById('category-filters');
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
    });
  });
}

function getFilteredExpenses() {
  return expenses.filter(exp => {
    const matchesCategory = activeCategoryFilter === 'ALL' || exp.category === activeCategoryFilter;
    const matchesSearch = !searchQuery || 
      exp.title?.toLowerCase().includes(searchQuery) || 
      exp.description?.toLowerCase().includes(searchQuery) ||
      exp.category?.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
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
        <p>${expenses.length === 0 ? "You haven't recorded any expenses yet. Click below to add your first expense." : "No expenses match your search/filter criteria."}</p>
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

function renderCategoryBreakdown() {
  const container = document.getElementById('category-breakdown');
  if (expenses.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:32px 0;">No data to analyze</div>`;
    return;
  }

  const totals = {};
  let totalSum = 0;
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    totals[cat] = (totals[cat] || 0) + Number(e.amount || 0);
    totalSum += Number(e.amount || 0);
  });

  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  container.innerHTML = sorted.map(([cat, amount]) => {
    const percentage = totalSum > 0 ? ((amount / totalSum) * 100).toFixed(1) : 0;
    return `
      <div class="category-bar-item">
        <div class="cat-bar-label">${escapeHtml(cat)}</div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="cat-bar-value">₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })} (${percentage}%)</div>
      </div>
    `;
  }).join('');
}

// ─── Expense Modal ──────────────────────────────────────────
function openExpenseModal(existing = null) {
  const isEdit = !!existing;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>${isEdit ? 'Edit Expense Record' : 'Add New Expense'}</h2>
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
