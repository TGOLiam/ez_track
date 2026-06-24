/* ============================================================
   EzTrack – Home Tab
   Heartbeat card · Stats grid · Insight banner ·
   Transaction list · Tier-gated extras
   ============================================================ */

function renderHomeTab() {
  renderTopbar();
  renderHeartbeat();
  renderStats();
  renderInsight();
  renderTxList();
  renderHomeTierExtras();
}

/* ── Topbar tier pill ── */
function renderTopbar() {
  const m   = CONFIG.TIER_META[STATE.tier];
  const el  = document.getElementById('topbar-tier-pill');
  if (!el) return;
  el.innerHTML = `
    <div class="tier-pill" style="margin-top:2px;">
      <div class="tier-dot" style="background:${m.color}"></div>
      ${m.label}
    </div>`;
}

/* ── Heartbeat card ── */
function renderHeartbeat() {
  const msgs = {
    simula: {
      label: 'Weekly Heartbeat',
      time:  'Monday, June 17 · 8:00 AM',
      text:  'Kumita ka ng <strong>₱6,020</strong> ngayong linggo. Ang pinakamalaking gastos mo ay Supplies (₱1,200). Keep it up — 5 days logging streak ka na! 🔥',
    },
    sigla: {
      label: 'Daily Heartbeat',
      time:  'Today, June 18 · 7:00 AM',
      text:  "Supplies spending is <strong>18% higher</strong> than your 4-week average. You've had 3 strong sales days this week. Recommended: restock noodles before Friday.",
    },
    unlad: {
      label: '⚠️ Proactive Alert',
      time:  'Today, June 18 · 10:32 AM',
      text:  'Mid-month check: At current spending pace, you may fall <strong>₱3,200 short</strong> of your ₱50,000 profit goal by June 30. Cut non-essential spending this week to stay on track.',
    },
  };
  const m  = msgs[STATE.tier];
  const el = document.getElementById('home-heartbeat');
  if (!el) return;
  el.innerHTML = `
    <div class="heartbeat-card">
      <div class="hb-glow"></div>
      <div class="hb-glow2"></div>
      <div class="hb-toprow">
        <div class="hb-pulse">
          <div class="pulse-dot"></div>
          <span class="hb-label">${m.label}</span>
        </div>
        <span class="hb-time">${m.time}</span>
      </div>
      <div class="hb-message">${m.text}</div>
      <div class="hb-action-row">
        <button class="hb-btn solid" onclick="switchTab('reports')">View Report</button>
        <button class="hb-btn"       onclick="switchTab('ai')">Ask AI</button>
      </div>
    </div>`;
}

/* ── Stats grid (2×2) ── */
function renderStats() {
  const byTier = {
    simula: [
      { l:'Cash Today',  v:'₱2,340',  chg:'Net after expenses',     cls:'up' },
      { l:'This Week',   v:'₱4,820',  chg:'+₱320 vs last week',     cls:'up' },
      { l:'Money In',    v:'₱6,020',  chg:'Week to date',            cls:'up' },
      { l:'Money Out',   v:'₱1,200',  chg:'Week to date',            cls:'dn' },
    ],
    sigla: [
      { l:'Cash Today',  v:'₱2,340',  chg:'Net after expenses',     cls:'up' },
      { l:'This Month',  v:'₱18,450', chg:'+12% vs last month',     cls:'up' },
      { l:'Best Day',    v:'Friday',  chg:'Avg ₱1,240/day',         cls:'up' },
      { l:'Worst Day',   v:'Tuesday', chg:'Avg ₱580/day',           cls:'dn' },
    ],
    unlad: [
      { l:'Cash Position', v:'₱38,450', chg:'+₱2,340 today',       cls:'up' },
      { l:'Profit Goal',   v:'76%',     chg:'₱38K of ₱50K target', cls:'up' },
      { l:'Receivables',   v:'₱4,200',  chg:'2 unpaid invoices',    cls:'dn' },
      { l:'Tax Set-Aside', v:'₱1,150',  chg:'Est. Q2 BIR',         cls:''   },
    ],
  };
  const el = document.getElementById('home-stats');
  if (!el) return;
  el.innerHTML = byTier[STATE.tier].map(s =>
    `<div class="stat-card">
       <div class="stat-lbl">${s.l}</div>
       <div class="stat-val ${s.cls}">${s.v}</div>
       <div class="stat-chg">${s.chg}</div>
     </div>`
  ).join('');
}

/* ── Weekly insight banner ── */
function renderInsight() {
  const el = document.getElementById('home-insight');
  if (!el) return;

  const infoIcon = `<svg class="ib-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>`;

  if (STATE.tier === CONFIG.TIERS.SIMULA) {
    el.innerHTML = `
      <div class="insight-banner">
        <div class="ib-row">${infoIcon}<span class="ib-title">Weekly Insight</span></div>
        <div class="ib-text">Ang pinakamalaking gastos mo ngayong linggo ay
          <strong>Supplies — ₱1,200</strong>. Mas mababa ito vs last week (₱1,650). Maganda ang trend!</div>
      </div>`;
  } else if (STATE.tier === CONFIG.TIERS.SIGLA) {
    el.innerHTML = `
      <div class="insight-banner">
        <div class="ib-row">${infoIcon}<span class="ib-title">2 Tips This Week</span></div>
        <div class="ib-text">
          1. Supplies (22% of expenses) — consider bulk ordering to reduce per-unit cost.<br/>
          2. Friday is your best sales day — ensure you're fully stocked by Thursday night.
        </div>
      </div>`;
  } else {
    el.innerHTML = ''; // Unlad tier: insight surfaced via proactive heartbeat only
  }
}

/* ── Recent transactions list ── */
function renderTxList() {
  const incSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>`;
  const expSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>`;

  // Show fewer rows on the free tier
  const limit   = STATE.tier === CONFIG.TIERS.SIMULA ? 5 : 8;
  const visible = STATE.transactions.slice(0, limit);
  const el      = document.getElementById('home-txlist');
  if (!el) return;

  el.innerHTML = visible.map(tx => `
    <div class="tx-item">
      <div class="tx-ico ${tx.type}">${tx.type === CONFIG.TX.INCOME ? incSVG : expSVG}</div>
      <div class="tx-info">
        <div class="tx-name">${tx.desc}</div>
        <div class="tx-meta">${tx.date} · ${tx.time}${tx.cat ? ' · ' + tx.cat : ''}</div>
      </div>
      <div class="tx-amt ${tx.type}">${tx.type === CONFIG.TX.INCOME ? '+' : '-'}₱${tx.amt.toLocaleString()}</div>
    </div>`
  ).join('');
}

/* ── Tier-gated extras rendered below the tx list ── */
function renderHomeTierExtras() {
  const el = document.getElementById('home-tier-extras');
  if (!el) return;

  let h = `<div style="padding:2px 20px 8px;font-size:12px;color:var(--gray-400);">
    ${STATE.tier === CONFIG.TIERS.SIMULA ? 'Transaction limit: 150/month (67 used)' : 'Unlimited transactions'}
  </div>`;

  /* Unlad: goal tracker + BIR alert + payroll */
  if (STATE.tier === CONFIG.TIERS.UNLAD) {
    h += `
      <div class="sec-label">PROFIT GOAL</div>
      <div class="goal-card">
        <div class="goal-hdr">
          <span class="goal-name">₱50,000 net by June 30</span>
          <span class="goal-pct">76%</span>
        </div>
        <div class="goal-track"><div class="goal-fill" style="width:76%"></div></div>
        <div class="goal-amts"><span>₱0</span><span>₱38,000 reached</span><span>₱50,000</span></div>
      </div>
      <div class="sec-label">BIR / TAX</div>
      <div class="bir-alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9"  x2="12"    y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <div class="bir-title">BIR Quarterly Deadline in 12 days</div>
          <div class="bir-sub">Estimated 3% percentage tax: ₱1,150 based on June revenue so far</div>
        </div>
      </div>
      <div class="sec-label">PAYROLL THIS CUTOFF</div>
      <div class="payroll-item">
        <div class="pay-ava">JD</div>
        <div><div class="pay-name">Juan dela Cruz</div><div class="pay-role">Staff · Daily ₱450</div></div>
        <div class="pay-amt">₱5,850</div>
      </div>
      <div class="payroll-item">
        <div class="pay-ava">RM</div>
        <div><div class="pay-name">Rosa Magsaysay</div><div class="pay-role">Staff · Daily ₱400</div></div>
        <div class="pay-amt">₱5,200</div>
      </div>`;
  }

  /* Sigla: invoices section */
  if (STATE.tier === CONFIG.TIERS.SIGLA) {
    h += `
      <div class="sec-label">INVOICES</div>
      <div class="inv-card">
        <div class="inv-num">INV-0042</div>
        <div class="inv-customer">Reyes Canteen</div>
        <div class="inv-date">Issued June 15, 2025</div>
        <div class="inv-total-row">
          <span class="inv-total-lbl">Total</span>
          <span class="inv-total-amt">₱1,800</span>
        </div>
        <span class="pill pill-amber" style="margin-top:8px;display:inline-flex;">Unpaid</span>
      </div>
      <div class="inv-card">
        <div class="inv-num">INV-0041</div>
        <div class="inv-customer">Sari Foods Supply</div>
        <div class="inv-date">Issued June 12, 2025</div>
        <div class="inv-total-row">
          <span class="inv-total-lbl">Total</span>
          <span class="inv-total-amt">₱2,400</span>
        </div>
        <span class="pill pill-green" style="margin-top:8px;display:inline-flex;">Paid</span>
      </div>`;
  }

  /* Simula: upgrade banner */
  if (STATE.tier === CONFIG.TIERS.SIMULA) {
    h += `
      <div class="divider"></div>
      <div class="upgrade-cta" onclick="goTo('page-plans');renderPlans();">
        <div class="uc-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <div class="uc-text">
          <div class="uc-title">Upgrade to Sigla</div>
          <div class="uc-sub">Categories, monthly reports, invoices, AI chat</div>
        </div>
        <div class="uc-arr">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>`;
  }

  el.innerHTML = h;
}