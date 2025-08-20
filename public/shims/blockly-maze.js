(function () {
  // Helper to safely get globals across Blockly Games variants
  const onReady = (fn) => (document.readyState === 'complete' ? fn() : window.addEventListener('load', fn));

  function wire() {
    // Find common solve hook: many builds call a function like checkAnswer(true) or displayVictory()
    const g = window;
    const BG = g.BlocklyGames || g.Blockly || g;

    // Monkey‑patch the success handler once
    const tryPatch = (obj, method) => {
      if (!obj || !obj[method] || obj[method]._nova_patched) return false;
      const orig = obj[method].bind(obj);
      obj[method] = function (...args) {
        try {
          // Gather useful telemetry
          const ws = (BG.workspace || g.workspace);
          const usedBlocks = ws ? ws.getAllBlocks(false).length : (g.usedBlocks ?? null);
          const optimalBlocks = (g.MAZE_OPTIMAL_BLOCKS || g.optimalBlocks || 0);
          const level = (g.level || BG.LEVEL || 1);

          window.NovaGame.levelComplete({
            game: 'BlocklyGames',
            level,
            score: Math.max(0, 100 - Math.max(0, (usedBlocks - optimalBlocks)) * 5),
            accuracy: optimalBlocks ? Math.round((optimalBlocks / Math.max(usedBlocks, 1)) * 100) : 100,
            extra: { usedBlocks, optimalBlocks }
          });
        } catch (e) { /* no-op */ }
        return orig(...args);
      };
      obj[method]._nova_patched = true;
      return true;
    };

    // Common candidates across Maze builds
    const patched = [
      tryPatch(g, 'displayVictory'),
      tryPatch(g, 'onVictory'),
      tryPatch(g, 'success'),
      tryPatch(g, 'checkAnswer')
    ].some(Boolean);

    // Fallback: watch for a DOM banner like "Congratulations!"
    if (!patched) {
      const mo = new MutationObserver(() => {
        const banner = document.querySelector('.dialog, .win, .modal, .msgVictory');
        if (banner && banner.textContent && /congrat/i.test(banner.textContent)) {
          const usedBlocks = (BG.workspace?.getAllBlocks(false).length ?? null);
          const optimalBlocks = (g.MAZE_OPTIMAL_BLOCKS || 0);
          const level = (g.level || BG.LEVEL || 1);
          window.NovaGame.levelComplete({
            game: 'BlocklyGames',
            level,
            score: Math.max(0, 100 - Math.max(0, (usedBlocks - optimalBlocks)) * 5),
            accuracy: optimalBlocks ? Math.round((optimalBlocks / Math.max(usedBlocks, 1)) * 100) : 100,
            extra: { usedBlocks, optimalBlocks }
          });
          mo.disconnect();
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    }
  }
  onReady(wire);
})();