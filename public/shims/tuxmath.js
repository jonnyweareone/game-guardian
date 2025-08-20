(function () {
  const onReady = (fn) => (document.readyState === 'complete' ? fn() : window.addEventListener('load', fn));

  function wire() {
    // Many JS ports expose a global event bus or call levelEnd/levelComplete.
    const g = window;

    // Patch common handlers if present
    const patch = (obj, name) => {
      if (!obj || !obj[name] || obj[name]._nova_patched) return false;
      const orig = obj[name].bind(obj);
      obj[name] = function (...args) {
        try {
          // Try to derive metrics from known globals/state
          const st = g.tuxState || g.gameState || {};
          const level = st.level || g.level || 1;
          const hits = st.hits ?? (g.hits ?? 0);
          const misses = st.misses ?? (g.misses ?? 0);
          const total = hits + misses;
          const accuracy = total ? Math.round((hits / total) * 100) : 0;

          window.NovaGame.levelComplete({
            game: 'TuxMath',
            level,
            score: Number(hits) * 10,
            accuracy
          });
        } catch (e) { /* no-op */ }
        return orig(...args);
      };
      obj[name]._nova_patched = true;
      return true;
    };

    const ok = patch(g, 'levelComplete') || patch(g, 'onLevelEnd') || patch(g, 'showLevelComplete');

    // Fallback: observe HUD text like "Level X Complete"
    if (!ok) {
      const mo = new MutationObserver(() => {
        const hud = document.querySelector('#hud,#overlay,.level-complete,.modal');
        if (hud && /level\s+\d+\s+complete/i.test(hud.textContent || '')) {
          // Best‑effort metrics
          const hits = Number((document.querySelector('.stat-hits')||{}).textContent) || 0;
          const misses = Number((document.querySelector('.stat-misses')||{}).textContent) || 0;
          const level = Number((document.querySelector('.stat-level')||{}).textContent) || 1;
          const total = hits + misses;
          const accuracy = total ? Math.round((hits / total) * 100) : 0;

          window.NovaGame.levelComplete({ game: 'TuxMath', level, score: hits * 10, accuracy });
          mo.disconnect();
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }
  onReady(wire);
})();