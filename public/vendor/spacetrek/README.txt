Drop SpaceTrek WebVR build here:
- Clone/fork https://github.com/spaceappschallenge/SpaceTrek
- Copy build/dist files to this folder:
  - index.html
  - All game assets, scripts, and A-Frame dependencies

Inside the SpaceTrek quiz completion code, add this postMessage:
window.parent.postMessage({
  type: 'spacetrek-quiz-complete',
  level: currentLevel,
  score: quizScore,
  accuracy: Math.round((correctAnswers / totalQuestions) * 100)
}, '*');

The game will be hosted at /vendor/spacetrek/index.html