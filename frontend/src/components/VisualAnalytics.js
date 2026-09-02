/**
 * VisualAnalytics Component
 */
import { escapeHtml, formatCurrency } from '../utils/helpers.js';

const CHART_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
  '#ec4899',
  '#8b5cf6',
  '#3b82f6',
  '#f43f5e'
];

/**
 * Renders the SVG Doughnut Chart and Category Breakdown Progress Bars
 * @param {HTMLElement} chartBody 
 * @param {HTMLElement} breakdownContainer 
 * @param {Array} filteredExpenses 
 */
export function renderVisualAnalytics(chartBody, breakdownContainer, filteredExpenses = []) {
  if (!chartBody || !breakdownContainer) return;

  if (filteredExpenses.length === 0) {
    chartBody.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:24px 0;">No chart data</div>`;
    breakdownContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:24px 0;">No category data to display</div>`;
    return;
  }

  const totals = {};
  let totalSum = 0;
  filteredExpenses.forEach(e => {
    const cat = e.category || 'Other';
    totals[cat] = (totals[cat] || 0) + Number(e.amount || 0);
    totalSum += Number(e.amount || 0);
  });

  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

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
              stroke="${CHART_COLORS[idx % CHART_COLORS.length]}" 
              stroke-width="24"
              stroke-dasharray="${strokeDashArray}" 
              stroke-dashoffset="${strokeDashoffset}" 
              style="transform: rotate(${rotation}deg); transform-origin: 110px 110px; transition: all 0.8s ease;"
              title="${escapeHtml(cat)}: ${formatCurrency(amount)}" />
    `;
  }).join('');

  chartBody.innerHTML = `
    <div class="chart-svg-wrapper">
      <svg viewBox="0 0 220 220">
        ${chartSegments}
      </svg>
      <div class="chart-center-info">
        <div class="chart-center-amount">${formatCurrency(totalSum, 0)}</div>
        <div class="chart-center-sub">Total Spent</div>
      </div>
    </div>
  `;

  // Render Category Progress Bars
  breakdownContainer.innerHTML = sorted.map(([cat, amount], idx) => {
    const percentage = totalSum > 0 ? ((amount / totalSum) * 100).toFixed(1) : 0;
    const catColor = CHART_COLORS[idx % CHART_COLORS.length];
    return `
      <div class="category-bar-item">
        <div class="cat-bar-label">${escapeHtml(cat)}</div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width: ${percentage}%; background: ${catColor};"></div>
        </div>
        <div class="cat-bar-value">${formatCurrency(amount, 0)} (${percentage}%)</div>
      </div>
    `;
  }).join('');
}
