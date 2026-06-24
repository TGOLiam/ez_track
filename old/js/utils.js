/* ============================================================
   EzTrack – Utilities
   Show/hide helpers, toast notifications, small shared helpers.
   Loaded early since other modules (auth, modals, etc.) call
   show() / hide() / showToast() directly.
   ============================================================ */

function show(id) { document.getElementById(id)?.classList.remove('hide'); }
function hide(id) { document.getElementById(id)?.classList.add('hide'); }

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), CONFIG.TOAST_DURATION_MS);
}

function setElementText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}
