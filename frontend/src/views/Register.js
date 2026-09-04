/**
 * Register View
 */
import { registerUser } from '../api.js';
import { showToast } from '../utils/toast.js';
import { renderAuthHero } from '../components/AuthHero.js';
import { renderThemePicker, bindThemePickerEvents } from '../components/ThemePicker.js';

/**
 * Renders the Register page
 * @param {HTMLElement} container 
 * @param {Object} options
 * @param {Function} options.onNavigate
 */
export function renderRegister(container, { onNavigate } = {}) {
  const heroHtml = renderAuthHero({
    titleHtml: 'Start Managing <span>Smarter Today</span>',
    subtitle: 'Join thousands of users who track, analyze, and optimize their daily spending effortlessly.',
    features: [
      { icon: '🎯', text: 'Clear Visual Budgeting Goals & Threshold Warnings' },
      { icon: '📱', text: 'Fully Responsive on Desktop, Tablet & Mobile' },
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
            <h2>Create Account</h2>
            <p>Start tracking and managing your expenses in seconds.</p>
          </div>
          <div id="auth-error" class="auth-error" style="display:none"></div>
          <form id="register-form" novalidate>
            <div class="form-group">
              <label for="reg-name">Full Name</label>
              <div class="input-with-icon">
                <input type="text" id="reg-name" placeholder="John Doe" autocomplete="name" required />
                <span class="input-icon-prefix">👤</span>
              </div>
            </div>

            <div class="form-group">
              <label for="reg-email">Email Address</label>
              <div class="input-with-icon">
                <input type="email" id="reg-email" placeholder="name@company.com" autocomplete="email" required />
                <span class="input-icon-prefix">✉️</span>
              </div>
            </div>

            <div class="form-group">
              <label for="reg-phone">Phone Number</label>
              <div class="input-with-icon">
                <input type="tel" id="reg-phone" placeholder="e.g. 9876543210 or +1234567890" autocomplete="tel" required />
                <span class="input-icon-prefix">📱</span>
              </div>
            </div>

            <div class="form-group">
              <label for="reg-password">Password</label>
              <div class="input-with-icon">
                <input type="password" id="reg-password" placeholder="Minimum 6 characters" minlength="6" autocomplete="new-password" required />
                <span class="input-icon-prefix">🔒</span>
                <button type="button" class="password-toggle-btn" id="toggle-reg-password" aria-label="Toggle password visibility" title="Show/Hide Password">
                  👁️
                </button>
              </div>
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

  bindThemePickerEvents(container);

  // Password visibility toggle
  const togglePasswordBtn = container.querySelector('#toggle-reg-password');
  const passwordInput = container.querySelector('#reg-password');
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  const goLogin = container.querySelector('#go-login');
  if (goLogin && onNavigate) {
    goLogin.addEventListener('click', (e) => {
      e.preventDefault();
      onNavigate('login');
    });
  }

  const form = container.querySelector('#register-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = container.querySelector('#reg-name').value.trim();
    const email = container.querySelector('#reg-email').value.trim();
    const phone = container.querySelector('#reg-phone').value.trim();
    const password = container.querySelector('#reg-password').value;
    const errEl = container.querySelector('#auth-error');
    const btn = container.querySelector('#register-btn');

    errEl.style.display = 'none';

    if (!name || !email || !phone || !password) {
      errEl.innerHTML = `⚠️ Please fill in all required fields.`;
      errEl.style.display = 'flex';
      return;
    }

    if (password.length < 6) {
      errEl.innerHTML = `⚠️ Password must be at least 6 characters.`;
      errEl.style.display = 'flex';
      return;
    }

    btn.innerHTML = `<span class="spinner"></span> Creating account...`;
    btn.disabled = true;

    try {
      await registerUser(name, email, phone, password);
      showToast('Account created successfully!', 'success');
      if (onNavigate) onNavigate('dashboard');
    } catch (err) {
      errEl.innerHTML = `⚠️ ${err.message}`;
      errEl.style.display = 'flex';
      btn.innerHTML = 'Create Account';
      btn.disabled = false;
    }
  });
}
