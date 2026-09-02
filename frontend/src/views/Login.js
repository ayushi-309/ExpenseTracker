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

  bindThemePickerEvents(container);

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
    const email = container.querySelector('#login-email').value;
    const password = container.querySelector('#login-password').value;
    const errEl = container.querySelector('#auth-error');
    const btn = container.querySelector('#login-btn');

    btn.innerHTML = `<span class="spinner"></span> Signing in...`;
    btn.disabled = true;
    errEl.style.display = 'none';

    try {
      await loginUser(email, password);
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
