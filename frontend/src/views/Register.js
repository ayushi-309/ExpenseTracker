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

  bindThemePickerEvents(container);

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
    const name = container.querySelector('#reg-name').value;
    const email = container.querySelector('#reg-email').value;
    const password = container.querySelector('#reg-password').value;
    const errEl = container.querySelector('#auth-error');
    const btn = container.querySelector('#register-btn');

    btn.innerHTML = `<span class="spinner"></span> Creating account...`;
    btn.disabled = true;
    errEl.style.display = 'none';

    try {
      await registerUser(name, email, password);
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
