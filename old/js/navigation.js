/* ============================================================
   EzTrack – Navigation
   Page routing (goTo) and bottom-tab switching (switchTab).
   The switchTab dispatcher is the single source of truth for
   tab-to-render-function mapping. This is intentional coupling
   — React migration would replace this with a router.
   ============================================================ */

/**
 * Switch the visible "page" (full-screen view such as login,
 * plan picker, setup, or the main app shell).
 * @param {string} pageId  – id of the target .page element
 */
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById(pageId);
  if (pg) pg.classList.add('active');
}

/**
 * Switch the active tab inside the main app shell.
 * Also fires the appropriate render function for the new tab.
 * @param {string} tab  – 'home' | 'reports' | 'inventory' | 'ai' | 'profile'
 */
function switchTab(tab) {
  STATE.currentTab = tab;

  // Hide all tab content panels
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hide'));
  const el = document.getElementById('tab-' + tab);
  if (el) el.classList.remove('hide');

  // Update bottom nav highlight
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  const nb = document.getElementById('bnav-' + tab);
  if (nb) nb.classList.add('active');

  // Reset scroll position
  const scroller = document.getElementById('tab-scroll');
  if (scroller) scroller.scrollTop = 0;

  // Render the newly selected tab
  const renders = {
    home:      renderHomeTab,
    reports:   renderReportsTab,
    inventory: renderInventoryExtras,
    ai:        renderAITab,
    profile:   renderProfileTab,
  };
  if (renders[tab]) renders[tab]();
}
