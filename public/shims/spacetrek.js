(function() {
  const onReady = (fn) => (document.readyState === 'complete' ? fn() : window.addEventListener('load', fn));

  function wire() {
    // Listen for quiz completion messages from SpaceTrek VR
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'spacetrek-quiz-complete') {
        try {
          window.NovaGame.levelComplete({
            game: 'SpaceTrek',
            level: e.data.level || 1,
            score: e.data.score || 100,
            accuracy: e.data.accuracy || 100,
            extra: {
              vr_mode: e.data.vr_mode || false,
              quiz_topic: e.data.topic || 'space-exploration'
            }
          });
        } catch (error) {
          console.error('Failed to emit SpaceTrek quiz completion:', error);
        }
      }
    });

    // Try to detect A-Frame VR mode changes for bonus XP
    const aframeScene = document.querySelector('a-scene');
    if (aframeScene) {
      aframeScene.addEventListener('enter-vr', () => {
        try {
          window.NovaGame.levelComplete({
            game: 'SpaceTrek',
            level: 0,
            score: 10,
            accuracy: 100,
            extra: { event_type: 'vr_entered', bonus: true }
          });
        } catch (error) {
          console.error('Failed to emit VR entry event:', error);
        }
      });
    }
  }

  onReady(wire);
})();