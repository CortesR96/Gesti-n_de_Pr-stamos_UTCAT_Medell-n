/* ============================================================
   Inicialización y sincronización entre pestañas del mismo navegador
   ============================================================ */

function restoreSession() {
  let sid = null;
  try { sid = sessionStorage.getItem(SESSION_KEY); } catch (e) {}
  if (sid) {
    const u = userById(sid);
    if (u && u.active) {
      me = u;
      enterApp(false);
      return;
    }
    sessionStorage.removeItem(SESSION_KEY);
  }
  showLogin();
}

function syncFromStorage() {
  const old = db;
  const nd = load();
  if (!nd) return;
  db = nd;
  if (!me) return;
  const fresh = userById(me.id);
  if (!fresh || !fresh.active) {
    toast('Tu cuenta fue desactivada por la coordinación.', 'no');
    logout();
    return;
  }
  me = fresh;
  const seen = new Set(old.notifs.map(n => n.id));
  db.notifs.filter(n => n.userId === me.id && !seen.has(n.id)).reverse().forEach(n => toast(n.text, n.kind));
  nav();
  renderBell();
  const a = document.activeElement;
  const editing = a && /INPUT|TEXTAREA|SELECT/.test(a.tagName);
  if (!editing && $('#modal').hidden) render();
}

function initApp() {
  setDate();
  window.addEventListener('storage', e => { if (e.key === KEY) syncFromStorage(); });
  window.addEventListener('emails:updated', () => {
    if (!me) return;
    if (!$('#modal').hidden) return;
    if (['emails', 'cfg', 'det', 'shist', 'ssol'].includes(cur)) render();
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.bellwrap')) {
      const p = $('#np');
      if (p) p.hidden = true;
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      const p = $('#np');
      if (p) p.hidden = true;
    }
  });
  const modal = $('#modal');
  if (modal) modal.addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  setInterval(() => { if (me) renderBell(); }, 60000);
  restoreSession();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
