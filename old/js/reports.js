/* ============================================================
   EzTrack – Reports Tab
   Bar chart · Summary totals · Streak · Tier extras
   ============================================================ */

function renderReportsTab() {
  renderBarChart();
  renderPrintBtn();

  /* Compute totals from live transactions */
  const totalInc = STATE.transactions.filter(t => t.type === CONFIG.TX.INCOME).reduce((s, t) => s + t.amt, 0);
  const totalExp = STATE.transactions.filter(t => t.type === CONFIG.TX.EXPENSE).reduce((s, t) => s + t.amt, 0);

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('rpt-income',   CONFIG.CURRENCY_SYMBOL + totalInc.toLocaleString());
  setTxt('rpt-expenses', CONFIG.CURRENCY_SYMBOL + totalExp.toLocaleString());
  setTxt('rpt-net', (totalInc - totalExp >= 0 ? '+' : '') + CONFIG.CURRENCY_SYMBOL + (totalInc - totalExp).toLocaleString());

  /* Streak dots */
  const days = document.getElementById('streak-days');
  if (days) days.innerHTML = [1,1,1,1,1,0,0].map(d => `<div class="sd${d ? '' : ' off'}"></div>`).join('');

  renderReportsTierExtras();
}

function renderBarChart() {
  const el = document.getElementById('main-barchart');
  if (!el) return;
  const maxV = Math.max(...WEEKDATA.map(d => Math.max(d.income, d.expense)));
  el.innerHTML = WEEKDATA.map(d => {
    const ih = Math.round((d.income / maxV) * CONFIG.BAR_CHART_HEIGHT_PX);
    const eh = Math.round((d.expense / maxV) * CONFIG.BAR_CHART_HEIGHT_PX);
    return `
      <div class="bc-col">
        <div class="bc-bars">
          <div class="bc-bar inc" style="height:${ih}px"></div>
          <div class="bc-bar exp" style="height:${eh}px"></div>
        </div>
        <div class="bc-label">${d.day}</div>
      </div>`;
  }).join('');
}

/* ──────────────────────────────
   Print / PDF Report
────────────────────────────── */
function renderPrintBtn() {
  const repEl = document.getElementById('tab-reports');
  if (!repEl) return;
  const existing = document.getElementById('print-btn-wrap');
  if (existing) existing.remove();
  const wrap = document.createElement('div');
  wrap.id = 'print-btn-wrap';
  wrap.style.cssText = 'margin:0 16px 16px;';
  wrap.innerHTML = `
    <button class="log-fab" onclick="generateReport()" style="box-shadow:none;background:var(--white);color:var(--blue-600);border:1.5px solid var(--blue-200);">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      Generate Report
    </button>`;
  repEl.appendChild(wrap);
}

function generateReport() {
  const biz  = STATE.business || { name: 'My Business' };
  const user = STATE.user || { name: 'User' };
  const now  = new Date();
  const dateStr = now.toLocaleDateString(CONFIG.LOCALE, { year: 'numeric', month: 'long', day: 'numeric' });

  const totalInc = STATE.transactions.filter(t => t.type === CONFIG.TX.INCOME).reduce((s, t) => s + t.amt, 0);
  const totalExp = STATE.transactions.filter(t => t.type === CONFIG.TX.EXPENSE).reduce((s, t) => s + t.amt, 0);
  const net      = totalInc - totalExp;
  const maxV     = Math.max(...WEEKDATA.map(d => Math.max(d.income, d.expense)));

  const dayRows = WEEKDATA.map(d => `
    <tr>
      <td>${d.day}</td>
      <td style="text-align:right;">₱${d.income.toLocaleString()}</td>
      <td style="text-align:right;">₱${d.expense.toLocaleString()}</td>
      <td style="text-align:right;font-weight:${d.income - d.expense >= 0 ? '600' : '600'};color:${d.income - d.expense >= 0 ? 'var(--blue-600)' : 'var(--red-600)'}">${d.income - d.expense >= 0 ? '+' : ''}₱${(d.income - d.expense).toLocaleString()}</td>
    </tr>`).join('');

  const weekInc = WEEKDATA.reduce((s, d) => s + d.income, 0);
  const weekExp = WEEKDATA.reduce((s, d) => s + d.expense, 0);

  const txRows = STATE.transactions.slice(0, 10).map(tx => `
    <div class="pc-tx-item">
      <span class="pc-tx-name">${tx.desc}</span>
      <span class="pc-tx-amt ${tx.type}">${tx.type === CONFIG.TX.INCOME ? '+' : '-'}₱${tx.amt.toLocaleString()}</span>
    </div>`).join('');

  const content = document.getElementById('print-content');
  content.innerHTML = `
    <div class="print-header">
      <h1>${biz.name}</h1>
      <div class="pc-sub">Financial Report · ${dateStr} · Prepared for ${user.name}</div>
    </div>

    <div class="pc-summary">
      <div class="pc-stat">
        <div class="pc-stat-lbl">Total Income</div>
        <div class="pc-stat-val blue">₱${totalInc.toLocaleString()}</div>
      </div>
      <div class="pc-stat">
        <div class="pc-stat-lbl">Total Expenses</div>
        <div class="pc-stat-val red">₱${totalExp.toLocaleString()}</div>
      </div>
      <div class="pc-stat">
        <div class="pc-stat-lbl">Net Earnings</div>
        <div class="pc-stat-val net">${net >= 0 ? '+' : ''}₱${net.toLocaleString()}</div>
      </div>
    </div>

    <h2>Daily Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th style="text-align:right;">Income</th>
          <th style="text-align:right;">Expenses</th>
          <th style="text-align:right;">Net</th>
        </tr>
      </thead>
      <tbody>
        ${dayRows}
        <tr class="tr-grand">
          <td><strong>Weekly Total</strong></td>
          <td style="text-align:right;">₱${weekInc.toLocaleString()}</td>
          <td style="text-align:right;">₱${weekExp.toLocaleString()}</td>
          <td style="text-align:right;">${weekInc - weekExp >= 0 ? '+' : ''}₱${(weekInc - weekExp).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <h2>Recent Transactions</h2>
    ${txRows}

    <div class="print-footer">
      EzTrack · Your Financial Companion since Day 1 · Generated ${dateStr}
    </div>`;

  document.getElementById('print-report').classList.add('open');
}

function doPrintReport() {
  window.print();
}

function closePrintReport() {
  document.getElementById('print-report').classList.remove('open');
}

function renderReportsTierExtras() {
  const el = document.getElementById('reports-tier-extras');
  if (!el) return;

  if (STATE.tier === CONFIG.TIERS.SIMULA) {
    el.innerHTML = `
      <div class="sec-label">DAILY SUMMARY</div>
      <div class="card">
        <div style="font-size:13px;color:var(--gray-500);margin-bottom:6px;">Today's Net</div>
        <div style="font-size:26px;font-weight:800;color:var(--blue-600);">+₱340</div>
        <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">Income ₱680 · Expenses ₱340</div>
      </div>
      <div class="locked-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <span class="locked-lbl">Monthly reports — Sigla &amp; above</span>
        <svg class="lock-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <div class="locked-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span class="locked-lbl">Category breakdown — Sigla &amp; above</span>
        <svg class="lock-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>`;

  } else if (STATE.tier === CONFIG.TIERS.SIGLA) {
    const cats = [
      ['Supplies',     '₱3,200', 52],
      ['Labor',        '₱1,800', 29],
      ['Utilities',    '₱820',   13],
      ['Marketing',    '₱420',    7],
      ['Miscellaneous','₱580',    9],
    ];
    el.innerHTML = `
      <div class="sec-label">MONTHLY SUMMARY – JUNE</div>
      <div class="summary-row">
        <div class="sum-card"><div class="sum-lbl">June Income</div><div class="sum-val blue">₱18,450</div></div>
        <div class="sum-card"><div class="sum-lbl">June Expenses</div><div class="sum-val red">₱7,820</div></div>
      </div>
      <div class="card" style="margin:0 16px 12px;">
        <div class="sum-lbl">June Net Earnings</div>
        <div class="sum-val net">₱10,630</div>
      </div>
      <div class="sec-label">EXPENSE CATEGORIES</div>
      <div class="card" style="margin:0 16px 12px;">
        ${cats.map(([n, a, p]) => `
          <div class="cat-bar-row">
            <div class="cat-lbl-row"><span class="cat-name">${n}</span><span class="cat-amt">${a}</span></div>
            <div class="cat-track"><div class="cat-fill" style="width:${p}%"></div></div>
          </div>`).join('')}
      </div>
      <div class="sec-label">SALES TRENDS</div>
      <div class="card" style="margin:0 16px 12px;">
        <div style="display:flex;justify-content:space-between;">
          <div>
            <div style="font-size:11px;color:var(--gray-400);font-weight:700;margin-bottom:4px;">BEST DAY</div>
            <div style="font-size:20px;font-weight:800;color:var(--blue-600);">Friday</div>
            <div style="font-size:12px;color:var(--gray-400);">Avg ₱1,240</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:var(--gray-400);font-weight:700;margin-bottom:4px;">WORST DAY</div>
            <div style="font-size:20px;font-weight:800;color:var(--red-600);">Tuesday</div>
            <div style="font-size:12px;color:var(--gray-400);">Avg ₱580</div>
          </div>
        </div>
      </div>`;

  } else {
    /* Unlad */
    const plRows = [
      ['Gross Revenue',       '₱61,200', 'var(--blue-600)'],
      ['COGS',                '₱28,400', 'var(--red-600)' ],
      ['Operating Expenses',  '₱9,200',  'var(--red-600)' ],
      ['Net Profit',          '₱23,600', 'var(--gray-900)'],
    ];
    el.innerHTML = `
      <div class="sec-label">30-DAY CASH FORECAST</div>
      <div class="card" style="margin:0 16px 12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <div>
            <div style="font-size:12px;color:var(--gray-400);font-weight:700;margin-bottom:4px;">PROJECTED BY JUNE 30</div>
            <div style="font-size:26px;font-weight:800;color:var(--blue-600);">₱46,800</div>
          </div>
          <span class="pill pill-red" style="align-self:flex-start;margin-top:4px;">⚠️ At Risk</span>
        </div>
        <div style="font-size:13px;color:var(--red-600);background:var(--red-50);padding:10px 12px;border-radius:8px;line-height:1.5;">
          At current spending pace, June may fall short of profit goal by ₱3,200.
        </div>
      </div>
      <div class="sec-label">P&amp;L REPORT – JUNE</div>
      <div class="card" style="margin:0 16px 12px;">
        ${plRows.map(([l, v, c]) => `
          <div class="ar-row">
            <div><div class="ar-name">${l}</div></div>
            <span style="font-size:15px;font-weight:800;color:${c};">${v}</span>
          </div>`).join('')}
      </div>
      <div class="sec-label">ACCOUNTS RECEIVABLE</div>
      <div class="card" style="margin:0 16px 12px;">
        <div class="ar-row">
          <div><div class="ar-name">Sari Foods Supply</div><div class="ar-due">30 days outstanding</div></div>
          <div class="ar-amt">₱2,400</div>
        </div>
        <div class="ar-row">
          <div>
            <div class="ar-name">Reyes Canteen</div>
            <div class="ar-due" style="color:var(--red-600);">⚠️ Overdue 15 days</div>
          </div>
          <div class="ar-amt">₱1,800</div>
        </div>
      </div>`;
  }
}