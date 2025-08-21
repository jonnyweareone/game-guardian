(function(){
  // If the world uses postMessage, convert to NovaGame events:
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'novacraft-pyramid-complete') {
      const { score, accuracy, seconds, falls } = e.data;
      window.NovaGame.levelComplete({
        game: 'NovaCraft',
        level: 'PyramidParkour',
        score, accuracy,
        extra: { seconds, falls }
      });
    }
  });
})();