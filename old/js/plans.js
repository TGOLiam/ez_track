/* ============================================================
   EzTrack – Plan Picker
   Renders plan cards from CONFIG.PLANS (defined in state.js),
   billing-period toggle, and plan selection.
   ============================================================ */

function setBilling(b) {
  STATE.billing = b;
  document.getElementById('bill-monthly').classList.toggle('active', b === 'monthly');
  document.getElementById('bill-annual').classList.toggle('active', b === 'annual');
  renderPlans();
}

function renderPlans() {
  const body = document.getElementById('plans-body');
  if (!body) return;
  const billing = STATE.billing;

  const chk = `<svg class="plan-feature-icon yes" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const x   = `<svg class="plan-feature-icon no" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  body.innerHTML = CONFIG.PLANS.map(p => {
    const price = billing === 'annual' ? p.annual : p.monthly;
    const priceHTML = p.monthly === 0
      ? `<div class="plan-price-free">FREE</div>`
      : `<div class="plan-price-amt">₱${price.toLocaleString()}</div><div class="plan-price-per">/${billing === 'annual' ? 'year' : 'month'}</div>`;
    const btnCls = p.id === CONFIG.TIERS.SIMULA ? 'green' : p.id === CONFIG.TIERS.SIGLA ? 'blue' : 'outline';

    return `<div class="plan-card${p.id === CONFIG.TIERS.SIGLA ? ' popular' : ''}">
      ${p.badge ? `<div class="plan-badge ${p.badgeCls}">${p.badge}</div>` : ''}
      <div class="plan-name ${p.nameCls}">${p.nameLabel}</div>
      <div class="plan-title">${p.tier}</div>
      <div class="plan-tagline">${p.tagline}</div>
      <div class="plan-price">${priceHTML}</div>
      <ul class="plan-features">
        ${p.features.map(f => `<li class="plan-feature">${chk}<span>${f}</span></li>`).join('')}
        ${p.notIncluded.map(f => `<li class="plan-feature" style="opacity:.45">${x}<span>${f}</span></li>`).join('')}
      </ul>
      <button class="plan-select-btn ${btnCls}" onclick="selectPlan('${p.id}')">
        ${p.monthly === 0 ? 'Get Started — Free' : 'Choose ' + p.tier + ' Plan'}
      </button>
    </div>`;
  }).join('');
}

function selectPlan(planId) {
  STATE.tier = planId;
  localStorage.setItem('ez_tier', planId);
  goTo('page-setup');
}
