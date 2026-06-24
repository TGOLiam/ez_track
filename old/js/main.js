/* ============================================================
   EzTrack – App Bootstrap
   Initialises the SQLite database, pre-renders the plan picker,
   then runs the splash sequence and hands off to login.
   ============================================================ */

window.addEventListener('load', async () => {
  await DB.init();
  renderPlans();

  const profiles = DB.getProfiles();
  renderProfileCards(profiles);

  setTimeout(() => {
    const splash = document.getElementById('page-splash');
    splash.style.opacity = '0';
    splash.style.transition = 'opacity .55s ease';

    setTimeout(() => {
      splash.classList.remove('active');
      goTo('page-login');
    }, CONFIG.SPLASH_FADE_MS);
  }, CONFIG.SPLASH_DURATION_MS);
});
