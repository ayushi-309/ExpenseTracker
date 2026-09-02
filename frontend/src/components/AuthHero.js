/**
 * AuthHero Component
 * Reusable hero branding panel for Login and Register pages
 */

/**
 * @param {Object} options
 * @param {string} options.titleHtml
 * @param {string} options.subtitle
 * @param {Array<{icon: string, text: string}>} options.features
 * @returns {string}
 */
export function renderAuthHero({ titleHtml, subtitle, features = [] }) {
  return `
    <div class="auth-hero">
      <div class="hero-content">
        <div class="hero-brand">
          <img src="/favicon.svg" alt="ExpenseTracker Logo" style="width: 28px; height: 28px; vertical-align: middle; margin-right: 8px;" /> ExpenseTracker Pro
        </div>
        <h1>${titleHtml}</h1>
        <p>${subtitle}</p>
        <div class="hero-features">
          ${features.map(f => `
            <div class="hero-feature">
              <div class="feature-icon">${f.icon}</div>
              <div>${f.text}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
