/**
 * Noa Engine Bootstrap - Minimal implementation for NovaCraft Pyramid
 * This provides basic engine functionality to satisfy the world script requirements.
 * For full 3D voxel rendering, replace with the actual Noa engine bundle.
 */

// Basic Noa Engine Mock
window.noa = {
  // Engine status
  ready: true,
  
  // Basic entities system
  entities: {
    getPosition: () => [0, 10, 0], // Default player position above ground
    setPosition: (id, pos) => {
      console.log(`[Noa] Player teleported to ${pos}`);
    },
    onTick: [],
    addComponent: () => {},
    removeComponent: () => {}
  },
  
  // World management
  world: {
    setBlockID: (x, y, z, id) => {
      // Mock block placement - in real engine this would update voxel world
      console.log(`[Noa] Block ${id} placed at ${x},${y},${z}`);
    },
    getBlockID: (x, y, z) => {
      // Mock block retrieval - return air by default
      return 0;
    }
  },
  
  // Input system
  inputs: {
    pointerLock: {
      request: () => {
        console.log('[Noa] Pointer lock requested');
        // In a real game, this would request pointer lock
      }
    }
  },
  
  // Camera system  
  camera: {
    heading: 0,
    pitch: 0
  },
  
  // Tick system for game loop
  on: (event, callback) => {
    if (event === 'tick') {
      // Store tick callbacks for the game loop
      if (!window.noa._tickCallbacks) window.noa._tickCallbacks = [];
      window.noa._tickCallbacks.push(callback);
    }
  },
  
  // Render system stub
  rendering: {
    addMesh: () => {},
    removeMesh: () => {}
  }
};

// Basic game loop to drive tick events
let lastTime = 0;
function gameLoop(currentTime) {
  const dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  
  // Call registered tick callbacks
  if (window.noa._tickCallbacks) {
    window.noa._tickCallbacks.forEach(callback => {
      try {
        callback(dt);
      } catch (e) {
        console.error('[Noa] Tick callback error:', e);
      }
    });
  }
  
  requestAnimationFrame(gameLoop);
}

// Initialize the mock engine
console.log('[Noa] Bootstrap engine initialized - ready for NovaCraft');
requestAnimationFrame(gameLoop);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.noa;
}