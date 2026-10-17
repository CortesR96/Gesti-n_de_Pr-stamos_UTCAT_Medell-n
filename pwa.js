/* ============================================================
   PWA: registro del Service Worker + botón "Instalar app"
   ============================================================ */

// Registro del Service Worker (ruta relativa: funciona en GitHub Pages
// bajo https://usuario.github.io/nombre-repo/)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err =>
      console.warn('No se pudo registrar el Service Worker:', err)
    );
  });
}

// Botón de instalación (Chrome / Edge / Android)
let deferredPrompt = null;
const btnInstall = document.getElementById('btnInstall');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (btnInstall) btnInstall.hidden = false;
});

if (btnInstall) {
  btnInstall.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btnInstall.hidden = true;
  });
}

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  if (btnInstall) btnInstall.hidden = true;
});
