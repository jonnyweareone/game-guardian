(function () {
  const onReady = (fn) => (document.readyState === 'complete' ? fn() : window.addEventListener('load', fn));
  function wire() {
    // Buttons vary by build; capture multiple selectors
    const btns = [
      '#export', '#download', 'button[title*="Export"]', 'button[title*="Download"]',
      '.export-button', '.download-button'
    ];

    const send = () => {
      try {
        const stitches = window.stitchCount || window.currentStitches || 0;
        const title = window.currentProjectName || document.title || 'Untitled';
        window.NovaGame.projectSubmit({
          game: 'Turtlestitch',
          title,
          meta: { stitches: Number(stitches) }
        });
      } catch (e) { /* no-op */ }
    };

    const attach = (el) => el && el.addEventListener('click', send, { once: false });

    // Try immediately, then observe future UI changes
    btns.forEach(sel => attach(document.querySelector(sel)));

    const mo = new MutationObserver(() => btns.forEach(sel => attach(document.querySelector(sel))));
    mo.observe(document.body, { childList: true, subtree: true });
  }
  onReady(wire);
})();