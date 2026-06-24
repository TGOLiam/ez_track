/* ============================================================
   EzTrack – Authentication & Onboarding
   Profile picker · Register · Business setup · Logout
   ============================================================ */

/* ── Setup wizard local state ── */
let setupBizType = CONFIG.DEFAULT_BIZ_TYPE;
let appLang      = CONFIG.DEFAULT_LANG;

/* ──────────────────────────────
   Helpers
────────────────────────────── */
function togglePwd(inputId, button) {
  const input = document.getElementById(inputId);
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  button.querySelector('svg').style.opacity = isText ? '1' : '.45';
}

/* ──────────────────────────────
   Profile card picker
────────────────────────────── */
function renderProfileCards(profiles) {
  const grid = document.getElementById('profile-grid');
  if (!grid) return;

  grid.innerHTML = profiles.map(profile => `
    <div class="profile-card" onclick="loginAsProfile(${profile.id})">
      <div class="pc-ava">${profile.avatar}</div>
      <div class="pc-info">
        <div class="pc-name">${profile.name}</div>
        <div class="pc-biz">${CONFIG.BIZ_ICONS[profile.biz_type] || '💼'} ${profile.biz_name}${profile.biz_city ? ' · ' + profile.biz_city : ''}</div>
      </div>
      <div class="pc-tier">
        <div class="pc-tier-dot" style="background:${CONFIG.TIER_META[profile.tier].color}"></div>
        ${CONFIG.TIER_CARD_LABELS[profile.tier] || profile.tier}
      </div>
    </div>`).join('');
}

/* ──────────────────────────────
   Login
────────────────────────────── */
function loginAsProfile(id) {
  DB.loadState(id);
  launchApp();
}

/* ──────────────────────────────
   Register
────────────────────────────── */
function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  let ok = true;

  if (!email.includes('@')) { show('reg-email-err'); ok = false; } else { hide('reg-email-err'); }
  if (pass.length < CONFIG.MIN_PASSWORD_LENGTH) { show('reg-pass-err'); ok = false; } else { hide('reg-pass-err'); }
  if (pass !== pass2)        { show('reg-pass2-err');ok = false; } else { hide('reg-pass2-err'); }
  if (!ok) return;

  const initials =
    (name ? name.charAt(0).toUpperCase() : 'N') +
    (name.split(' ')[1] ? name.split(' ')[1].charAt(0).toUpperCase() : 'U');

  const id = DB.createProfile({
    name: name || 'New User', email, avatar: initials,
    biz_name: 'My Business', biz_type: 'sari', biz_city: '', lang: 'taglish', tier: CONFIG.TIERS.SIMULA,
  });

  STATE.user = { name: name || 'New User', email, avatar: initials };
  STATE.profileId = id;
  STATE.business  = { name: 'My Business', type: 'sari', city: '', lang: 'taglish' };
  STATE.tier = CONFIG.TIERS.SIMULA;
  STATE.transactions = [];
  STATE.inventory = [];
  STATE.customers = [];
  STATE.goals = [];
  STATE.nextTransactionId = 1;

  goTo('page-plans');
  renderPlans();
}

/* ──────────────────────────────
   Logout
────────────────────────────── */
function doLogout() {
  STATE.profileId = null;
  STATE.user = null;
  STATE.business  = null;
  STATE.transactions = [];
  STATE.inventory = [];
  STATE.customers = [];
  STATE.goals = [];
  STATE.nextTransactionId = 1;
  goTo('page-login');
}

/* ──────────────────────────────
   Business setup – Step 1
────────────────────────────── */
function selectBizType(el) {
  document.querySelectorAll('.biz-type-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  setupBizType = el.dataset.type;
}

function setLang(l) {
  appLang = l;
  document.getElementById('lang-en').classList.toggle('selected', l === 'en');
  document.getElementById('lang-tl').classList.toggle('selected', l === 'en-only');
}

function setupNext() {
  const biz  = document.getElementById('setup-biz').value.trim() || 'My Business';
  const city = document.getElementById('setup-city').value.trim() || '';
  STATE.business  = { name: biz, type: setupBizType, city, lang: appLang };
  // Persist biz info to DB
  DB.updateProfile(STATE.profileId, {
    biz_name: biz, biz_type: setupBizType, biz_city: city, lang: appLang,
  });
  document.getElementById('tg-code').textContent =
    'EZT-' + Math.floor(CONFIG.TG_CODE_MIN + Math.random() * CONFIG.TG_CODE_RANGE);
  goTo('page-setup2');
}

/* ──────────────────────────────
   Business setup – Step 2 (Telegram)
────────────────────────────── */
function finishSetup() {
  launchApp();
}

/* ──────────────────────────────
   Launch the main app
────────────────────────────── */
function launchApp() {
  // Ensure fallback defaults
  if (!STATE.business)  STATE.business  = { name:'Anning Sari-Sari Store', type:'sari', city:'Quezon City', lang:'taglish' };
  if (!STATE.user) STATE.user = { name:'Maria Anning', email:'maria@email.com', avatar:'MA' };

  goTo('page-app');
  renderTopbar();
  renderHomeTab();
  renderInventoryExtras();
}
