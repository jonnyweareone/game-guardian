Drop Antura Unity WebGL build here:
- index.html
- Build/ folder with all Unity assets
- TemplateData/ folder

After copying, append the bridge snippet to the end of index.html:

<script>
  window.NovaGame = window.NovaGame || { init:()=>{}, levelComplete:()=>{} };
  window.AnturaNovaBridge = {
    onLevelComplete(level, score, accuracy, worldComplete) {
      try {
        window.NovaGame.levelComplete({
          game: 'Antura',
          level: Number(level),
          score: Number(score),
          accuracy: Number(accuracy),
          extra: { worldComplete: !!worldComplete }
        });
      } catch {}
    }
  };
</script>

The game will be hosted at /vendor/antura-webgl/index.html