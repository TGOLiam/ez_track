/* ============================================================
   EzTrack – Inventory Tab
   Dynamic item list, tier-gated extras, "Add Inventory Item" modal
   ============================================================ */

function renderInventoryList() {
  const el = document.getElementById('inv-list');
  if (!el) return;

  const incSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>`;

  el.innerHTML = STATE.inventory.map(item => {
    const qty = item.qty || 0;
    const min = item.min_threshold || 0;
    let cls = 'is-ok', lbl = 'OK';
    if (qty <= 0) { cls = 'is-out'; lbl = 'Out'; }
    else if (min > 0 && qty < min) { cls = 'is-low'; lbl = 'Low'; }
    return `
      <div class="inv-item">
        <div class="inv-ico">${incSVG}</div>
        <div class="inv-info">
          <div class="inv-name">${item.name}</div>
          <div class="inv-qty">${qty} ${item.unit}${min ? ' · Min: ' + min : ''}</div>
        </div>
        <span class="inv-status ${cls}">${lbl}</span>
      </div>`;
  }).join('');
}

function renderInventoryExtras() {
  renderInventoryList();

  const el = document.getElementById('inv-tier-extras');
  if (!el) return;

  if (STATE.tier === CONFIG.TIERS.SIGLA) {
    el.innerHTML = `
      <div class="sec-label">LOW STOCK ALERTS</div>
      <div class="insight-banner">
        <div class="ib-row">
          <svg class="ib-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span class="ib-title">2 Items Need Restocking</span>
        </div>
        <div class="ib-text">Instant Noodles (6 left, min: 10) and Shampoo Sachet (0 left, min: 12). Consider ordering before Friday to avoid stockout during weekend.</div>
      </div>`;

  } else if (STATE.tier === CONFIG.TIERS.UNLAD) {
    el.innerHTML = `
      <div class="sec-label">AI RESTOCK REMINDER</div>
      <div class="insight-banner">
        <div class="ib-row">
          <svg class="ib-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span class="ib-title">Predicted Stockout by Thursday</span>
        </div>
        <div class="ib-text">Based on your restocking pattern, Instant Noodles will run out by Thursday. Your usual supplier is Santino Grocery. Last order: June 10 (₱350).</div>
      </div>
      <div class="sec-label">MONTHLY STOCK MOVEMENT</div>
      <div class="card" style="margin:0 16px 12px;">
        ${[
          ['Softdrinks (1.5L)', 'Start: 60', 'Sold: 48', 'Restock: 36'],
          ['Instant Noodles',   'Start: 24', 'Sold: 18', 'Restock: 0 ⚠️'],
        ].map(([n, s, sl, r]) => `
          <div class="ar-row"><div><div class="ar-name">${n}</div><div class="ar-due">${s} · ${sl} · ${r}</div></div></div>`).join('')}
      </div>`;

  } else {
    el.innerHTML = `
      <div class="locked-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
        <span class="locked-lbl">Low stock alerts — Sigla &amp; above</span>
        <svg class="lock-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <div class="locked-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/></svg>
        <span class="locked-lbl">Minimum stock threshold — Sigla &amp; above</span>
        <svg class="lock-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>`;
  }

  if (STATE.tier === CONFIG.TIERS.SIGLA || STATE.tier === CONFIG.TIERS.UNLAD) {
    show('inv-thresh-grp');
  }
}

function createInventoryItem(name, quantity, unit, threshold) {
  const item = {
    profile_id: STATE.profileId,
    name, qty: quantity, unit,
    min_threshold: threshold,
  };
  const id = DB.addInventoryItem(item);
  STATE.inventory.push({ id, profile_id: STATE.profileId, ...item });
  return id;
}

function clearAddItemForm() {
  document.getElementById('inv-iname').value = '';
  document.getElementById('inv-iqty').value = '';
  document.getElementById('inv-ithresh').value = '';
}

function submitAddItem() {
  const name = document.getElementById('inv-iname').value.trim();
  const quantity = parseInt(document.getElementById('inv-iqty').value) || 0;
  const unit = document.getElementById('inv-iunit').value;
  if (!name) { showToast('Please enter item name'); return; }

  const threshold = parseInt(document.getElementById('inv-ithresh').value) || 0;

  createInventoryItem(name, quantity, unit, threshold);
  renderInventoryList();
  closeModal('modal-additem');
  clearAddItemForm();
  showToast('Item added to inventory');
}
