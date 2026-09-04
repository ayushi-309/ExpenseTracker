/**
 * Login View
 */
import { loginUser } from '../api.js';
import { showToast } from '../utils/toast.js';
import { renderAuthHero } from '../components/AuthHero.js';
import { renderThemePicker, bindThemePickerEvents } from '../components/ThemePicker.js';

/**
 * Renders the Login page
 * @param {HTMLElement} container 
 * @param {Object} options
 * @param {Function} options.onNavigate
 */
export function renderLogin(container, { onNavigate } = {}) {
  const heroHtml = renderAuthHero({
    titleHtml: 'Smart Financial <span>Intelligence</span>',
    subtitle: 'Take full control of your personal expenses with real-time analytics, automated budgeting, and spending insights.',
    features: [
      { icon: '⚡', text: 'Instant Expense Logging & Category Categorization' },
      { icon: '🎯', text: 'Automated Monthly Budget Goals & Exceeded Alerts' },
      { icon: '📊', text: 'Interactive SVG Analytics & Spending Breakdowns' },
      { icon: '📥', text: 'One-Click CSV Data Export & Date Filters' },
    ]
  });

  container.innerHTML = `
    <div class="auth-page">
      ${heroHtml}
      <div class="auth-form-panel">
        <div class="auth-theme-wrapper">
          ${renderThemePicker()}
        </div>
        <div class="auth-form-container">
          <div class="auth-brand-header">
            <div class="auth-brand-icon">
              <img src="/favicon.svg" alt="ExpenseTracker Logo" />
            </div>
            <div class="auth-brand-name">Expense<span>Tracker</span></div>
          </div>
          <div class="form-header">
            <h2>Sign In</h2>
            <p>Welcome back! Sign in with your email or phone number.</p>
          </div>

          <!-- Auth Mode Switcher -->
          <div class="auth-tabs" role="tablist" aria-label="Login method">
            <button type="button" class="auth-tab active" id="tab-email" data-mode="email" role="tab" aria-selected="true">
              <span class="auth-tab-icon">✉️</span> Email Address
            </button>
            <button type="button" class="auth-tab" id="tab-phone" data-mode="phone" role="tab" aria-selected="false">
              <span class="auth-tab-icon">📱</span> Phone Number
            </button>
          </div>

          <div id="auth-error" class="auth-error" style="display:none"></div>

          <form id="login-form" novalidate>
            <div class="form-group" id="identifier-group">
              <label for="login-identifier" id="identifier-label">Email Address</label>
              <div class="input-with-icon">
                <input 
                  type="email" 
                  id="login-identifier" 
                  placeholder="name@company.com" 
                  autocomplete="username" 
                  required 
                />
                <span class="input-icon-prefix" id="identifier-icon">✉️</span>
              </div>
              <span class="input-hint" id="identifier-hint">Enter your registered email address</span>
            </div>

            <div class="form-group">
              <label for="login-password">Password</label>
              <div class="input-with-icon">
                <input 
                  type="password" 
                  id="login-password" 
                  placeholder="••••••••" 
                  autocomplete="current-password" 
                  required 
                />
                <span class="input-icon-prefix">🔒</span>
                <button type="button" class="password-toggle-btn" id="toggle-password" aria-label="Toggle password visibility" title="Show/Hide Password">
                  👁️
                </button>
              </div>
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

  bindThemePickerEvents(container);

  // Tab mode state and elements
  let currentMode = 'email';
  const tabEmail = container.querySelector('#tab-email');
  const tabPhone = container.querySelector('#tab-phone');
  const identifierLabel = container.querySelector('#identifier-label');
  const identifierInput = container.querySelector('#login-identifier');
  const identifierIcon = container.querySelector('#identifier-icon');
  const identifierHint = container.querySelector('#identifier-hint');

  function setMode(mode) {
    currentMode = mode;
    if (mode === 'email') {
      tabEmail.classList.add('active');
      tabEmail.setAttribute('aria-selected', 'true');
      tabPhone.classList.remove('active');
      tabPhone.setAttribute('aria-selected', 'false');

      identifierLabel.textContent = 'Email Address';
      identifierInput.type = 'email';
      identifierInput.placeholder = 'name@company.com';
      identifierInput.setAttribute('autocomplete', 'email');
      identifierIcon.textContent = '✉️';
      identifierHint.textContent = 'Enter your registered email address';
    } else {
      tabPhone.classList.add('active');
      tabPhone.setAttribute('aria-selected', 'true');
      tabEmail.classList.remove('active');
      tabEmail.setAttribute('aria-selected', 'false');

      identifierLabel.textContent = 'Phone Number';
      identifierInput.type = 'tel';
      identifierInput.placeholder = 'e.g. 9876543210 or +1234567890';
      identifierInput.setAttribute('autocomplete', 'tel');
      identifierIcon.textContent = '📱';
      identifierHint.textContent = 'Enter your registered mobile or phone number';
    }
  }

  tabEmail.addEventListener('click', () => {
    setMode('email');
    identifierInput.focus();
  });

  tabPhone.addEventListener('click', () => {
    setMode('phone');
    identifierInput.focus();
  });

  // Smart auto-detection if the user types/pastes email or phone number
  identifierInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (currentMode === 'phone' && val.includes('@')) {
      setMode('email');
    } else if (currentMode === 'email' && val.length >= 4 && /^[\d+\s()-]+$/.test(val)) {
      setMode('phone');
    }
  });

  // Password visibility toggle
  const togglePasswordBtn = container.querySelector('#toggle-password');
  const passwordInput = container.querySelector('#login-password');
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  const goRegister = container.querySelector('#go-register');
  if (goRegister && onNavigate) {
    goRegister.addEventListener('click', (e) => {
      e.preventDefault();
      onNavigate('register');
    });
  }

  const form = container.querySelector('#login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawIdentifier = identifierInput.value.trim();
    const password = passwordInput.value;
    const errEl = container.querySelector('#auth-error');
    const btn = container.querySelector('#login-btn');

    errEl.style.display = 'none';

    if (!rawIdentifier) {
      errEl.innerHTML = `⚠️ Please enter your ${currentMode === 'email' ? 'email address' : 'phone number'}`;
      errEl.style.display = 'flex';
      identifierInput.focus();
      return;
    }

    if (!password) {
      errEl.innerHTML = `⚠️ Please enter your password`;
      errEl.style.display = 'flex';
      passwordInput.focus();
      return;
    }

    // Determine whether user entered an email or phone number
    let email = null;
    let phone = null;

    if (rawIdentifier.includes('@')) {
      email = rawIdentifier.toLowerCase();
    } else if (/^[\d+\s()-]+$/.test(rawIdentifier)) {
      phone = rawIdentifier.replace(/[\s()-]/g, '');
    } else if (currentMode === 'email') {
      email = rawIdentifier.toLowerCase();
    } else {
      phone = rawIdentifier;
    }

    btn.innerHTML = `<span class="spinner"></span> Signing in...`;
    btn.disabled = true;

    try {
      await loginUser(email, phone, password);
      showToast('Welcome back!', 'success');
      if (onNavigate) onNavigate('dashboard');
    } catch (err) {
      errEl.innerHTML = `⚠️ ${err.message}`;
      errEl.style.display = 'flex';
      btn.innerHTML = 'Sign In to Dashboard';
      btn.disabled = false;
    }
  });
}
