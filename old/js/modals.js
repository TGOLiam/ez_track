/* ============================================================
   EzTrack – Modals
   Generic open/close/overlay-click, "Log Transaction" modal,
   and the Language modal. (The "Add Inventory Item" modal's
   submit handler lives in inventory.js, since it's inventory
   data being mutated.)
   ============================================================ */

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');

  if (id === 'modal-log') {
    document.getElementById('log-date').value = new Date().toISOString().split('T')[0];
    const hasCategories = STATE.tier === CONFIG.TIERS.SIGLA || STATE.tier === CONFIG.TIERS.UNLAD;
    if (hasCategories) {
      show('log-cat-grp'); show('log-note-grp');
    } else {
      hide('log-cat-grp'); hide('log-note-grp');
    }
  }
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

function overlayClose(e, id) {
  if (e.target.id === id) closeModal(id);
}

/* ──────────────────────────────
   Log Transaction modal
────────────────────────────── */
function setTransactionType(type) {
  STATE.transactionType = type;
  document.getElementById('ttype-inc').classList.toggle('active', type === CONFIG.TX.INCOME);
  document.getElementById('ttype-exp').classList.toggle('active', type === CONFIG.TX.EXPENSE);
}

function createTransaction(amount, description, category) {
  const timestamp = new Date().toLocaleTimeString(CONFIG.LOCALE, { hour: '2-digit', minute: '2-digit' });
  const dateStamp = new Date().toISOString().split('T')[0];

  const transaction = {
    profile_id: STATE.profileId,
    type: STATE.transactionType,
    desc: description, amt: amount,
    date: dateStamp, cat: category || '', time: timestamp,
  };

  const id = DB.addTransaction(transaction);
  STATE.transactions.unshift({ id, profile_id: STATE.profileId, ...transaction });
  return id;
}

function clearLogForm() {
  document.getElementById('log-amt').value = '';
  document.getElementById('log-desc').value = '';
}

function submitLog() {
  const amount = parseFloat(document.getElementById('log-amt').value);
  const description = document.getElementById('log-desc').value.trim();
  if (!amount || amount <= 0) { showToast('Please enter a valid amount'); return; }
  if (!description) { showToast('Please add a description'); return; }

  const category = document.getElementById('log-cat')?.value || '';

  createTransaction(amount, description, category);
  closeModal('modal-log');
  clearLogForm();
  renderHomeTab();
  showToast('Transaction saved ✓');
}

/* ──────────────────────────────
   Language modal
────────────────────────────── */
function setAppLang(l) {
  const checkSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--blue-600)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`;

  document.getElementById('lang-check-taglish').innerHTML = l === CONFIG.DEFAULT_LANG ? checkSVG : '';
  document.getElementById('lang-check-english').innerHTML = l === 'english' ? checkSVG : '';

  closeModal('modal-lang');
  showToast('Language updated');
}
