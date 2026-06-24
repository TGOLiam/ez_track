/* ============================================================
   EzTrack – Profile Tab
   Account summary, subscription card, tier-gated support section
   ============================================================ */

function updateBizProfilesDisplay() {
  const limits = CONFIG.PROFILE_LIMITS;
  setElementText('biz-profiles-count', (limits[STATE.tier] || limits.simula).current);
}

function renderProfileTab() {
  const user = STATE.user || {};
  const business = STATE.business || {};

  setElementText('prof-ava', user.avatar || 'U');
  setElementText('prof-name', user.name || 'User');
  setElementText('prof-biz', (CONFIG.BIZ_ICONS[business.type] || '💼') + ' ' + (business.name || 'My Business') + (business.city ? ' · ' + business.city : ''));
  setElementText('prof-tier-badge', CONFIG.TIER_META[STATE.tier].label);

  updateBizProfilesDisplay();

  const subElement = document.getElementById('sub-section');
  if (subElement) {
    const meta = CONFIG.TIER_META[STATE.tier];
    subElement.innerHTML = `
      <div class="settings-item">
        <div class="si-icon amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div><span class="si-label">${meta.label}</span><div class="si-plan-status">Current plan · Active</div></div>
        ${STATE.tier !== CONFIG.TIERS.UNLAD ? `<button class="si-upgrade-btn" onclick="goTo('page-plans');renderPlans();">Upgrade</button>` : ''}
      </div>`;
  }

  const supportElement = document.getElementById('support-section');
  if (supportElement) {
    let html = `<div class="settings-item"><div class="si-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div><span class="si-label">Help Center</span><div class="si-right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>`;

    if (STATE.tier === CONFIG.TIERS.SIGLA) {
      html += `<div class="settings-item"><div class="si-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><span class="si-label">Email Support</span><div class="si-right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>`;
    }
    if (STATE.tier === CONFIG.TIERS.UNLAD) {
      html += `<div class="settings-item"><div class="si-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><span class="si-label">Live Chat Support</span><div class="si-right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>`;
    }
    supportElement.innerHTML = html;
  }
}
