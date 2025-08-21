// NovaCraft Pyramid Parkour – engine-agnostic world + quest logic.
// Assumes a voxel engine exposes: setBlock(x,y,z,id), getPlayerPos(), onTick(cb), teleport(x,y,z), playSound(id?).
// The adapter below tries common globals: window.NovaCraftEngine, window.noa (https://github.com/fenomas/noa), window.game (voxel-engine).
(() => {
  // --------- Block palette (map to your engine IDs) ----------
  const BLOCKS = {
    AIR: 0,
    STONE: 1,        // walls/doors
    SANDSTONE: 2,    // pyramid shell
    SAND: 3,         // floor/quicksand
    GOLD: 4,         // capstone / goal
    EMERALD: 5,      // checkpoints
    LAVA: 6,         // hazard
    TORCH: 7         // markers
  };

  // --------- Engine Adapter ----------
  const Adapter = (() => {
    const e = {};
    // Try noa (popular browser voxel engine)
    if (window.noa) {
      const noa = window.noa;
      e.getPlayerPos = () => {
        const p = noa.ents.getPosition(noa.playerEntity);
        return { x: p[0], y: p[1], z: p[2] };
      };
      e.setBlock = (x,y,z,id) => noa.setBlock(id, x, y, z);
      e.onTick = (cb) => noa.on('tick', cb);
      e.teleport = (x,y,z) => {
        noa.ents.setPosition(noa.playerEntity, [x+0.5, y+1.2, z+0.5]);
      };
      e.hint = (msg) => toast(msg);
      e.ready = true;
      return e;
    }
    // Try voxel-engine style
    if (window.game && typeof window.game.setBlock === 'function') {
      const game = window.game;
      e.getPlayerPos = () => {
        const p = game.controls?.target() ?? game.cameraPosition() ?? {x:0,y:0,z:0};
        const pos = p.position || p;
        return { x: pos.x, y: pos.y, z: pos.z };
      };
      e.setBlock = (x,y,z,id) => game.setBlock([x,y,z], id);
      e.onTick = (cb) => game.on('tick', cb);
      e.teleport = (x,y,z) => {
        const t = game.controls?.target?.();
        if (t?.position) { t.position.set(x+0.5, y+1.2, z+0.5); }
      };
      e.hint = (msg) => toast(msg);
      e.ready = true;
      return e;
    }
    // Try custom NovaCraftEngine
    if (window.NovaCraftEngine) {
      const eng = window.NovaCraftEngine;
      e.getPlayerPos = () => eng.player();
      e.setBlock = (x,y,z,id) => eng.setBlock(x,y,z,id);
      e.onTick = (cb) => eng.onTick(cb);
      e.teleport = (x,y,z) => eng.teleport(x,y,z);
      e.hint = (msg) => toast(msg);
      e.ready = true;
      return e;
    }
    return { ready:false };
  })();

  function toast(msg, ms=1500){
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(()=> { el.hidden = true; }, ms);
  }

  if (!Adapter.ready) {
    console.warn('[Pyramid] No supported voxel engine detected. Load your engine bundle first.');
    toast('Engine not loaded – check console.');
    return;
  }

  // --------- HUD ---------
  const hud = {
    t0: null,
    falls: 0,
    cpIndex: 0,
    running: false,
    update(){
      const t = document.getElementById('timer');
      const f = document.getElementById('falls');
      const c = document.getElementById('checkpoint');
      if (!t||!f||!c) return;
      let secs = 0;
      if (this.running && this.t0 != null) secs = Math.floor((performance.now() - this.t0)/1000);
      const mm = String(Math.floor(secs/60)).padStart(2,'0');
      const ss = String(secs%60).padStart(2,'0');
      t.textContent = `⏱ ${mm}:${ss}`;
      f.textContent = `💥 ${this.falls} falls`;
      c.textContent = `📍 ${CHECKPOINTS[this.cpIndex].name}`;
    }
  };

  // --------- Pyramid geometry ----------
  const ORIGIN = { x: 0, y: 4, z: 0 };  // ground level
  const BASE = 41; // odd number recommended
  const HEIGHT = 21;

  function buildPyramidShell() {
    const cx = ORIGIN.x, cy = ORIGIN.y, cz = ORIGIN.z;
    for (let h=0; h<HEIGHT; h++){
      const size = BASE - 2*h;
      const y = cy + h;
      const half = Math.floor(size/2);
      for (let dx=-half; dx<=half; dx++){
        for (let dz=-half; dz<=half; dz++){
          const x = cx + dx;
          const z = cz + dz;
          const edge = (Math.abs(dx)===half || Math.abs(dz)===half);
          if (edge) Adapter.setBlock(x,y,z,BLOCKS.SANDSTONE);
          else Adapter.setBlock(x,y,z,BLOCKS.AIR);
        }
      }
    }
    // capstone
    Adapter.setBlock(cx, cy+HEIGHT, cz, BLOCKS.GOLD);
    // floor fill
    const floorHalf = Math.floor(BASE/2);
    for (let dx=-floorHalf; dx<=floorHalf; dx++){
      for (let dz=-floorHalf; dz<=floorHalf; dz++){
        Adapter.setBlock(cx+dx, cy-1, cz+dz, BLOCKS.SAND);
      }
    }
    // entrance (south face, z = +)
    const entZ = cz + Math.floor(BASE/2);
    const entY = cy + 1;
    for (let y=entY; y<entY+3; y++){
      for (let x=cx-1; x<=cx+1; x++){
        Adapter.setBlock(x, y, entZ, BLOCKS.AIR);
      }
    }
    // torches
    Adapter.setBlock(cx-2, entY, entZ-1, BLOCKS.TORCH);
    Adapter.setBlock(cx+2, entY, entZ-1, BLOCKS.TORCH);
  }

  // --------- Parkour path & hazards ----------
  // Simple zig-zag platforms going up inside the hollow pyramid.
  const PATH = [];
  (function buildPath(){
    const steps = 60;
    let x = ORIGIN.x - 10, y = ORIGIN.y + 1, z = ORIGIN.z + 10;
    let dir = 1;
    for (let i=0; i<steps; i++){
      PATH.push({x,y,z, type:'PLATFORM'});
      // sparse moving/hazard blocks
      if (i%10===5) PATH.push({x:x+1*dir, y:y-1, z, type:'LAVA'});
      if (i%8===3) PATH.push({x:x-1*dir, y:y-1, z, type:'GAP'});
      // zig-zag
      x += dir * 3;
      z -= 2;
      if (i%6===0) { y += 1; }
      if (i%5===4) dir *= -1;
    }
  })();

  function placePath(){
    PATH.forEach(p=>{
      if (p.type==='PLATFORM') Adapter.setBlock(p.x, p.y, p.z, BLOCKS.STONE);
      if (p.type==='LAVA') Adapter.setBlock(p.x, p.y, p.z, BLOCKS.LAVA);
      if (p.type==='GAP')  Adapter.setBlock(p.x, p.y, p.z, BLOCKS.AIR);
    });
  }

  // --------- Checkpoints & quiz gates ----------
  const CHECKPOINTS = [
    { name:'Start', x: ORIGIN.x, y: ORIGIN.y+1, z: ORIGIN.z+ (Math.floor(BASE/2)-2) },
    { name:'Antechamber', x: ORIGIN.x-5, y: ORIGIN.y+4, z: ORIGIN.z+2, quiz: {
      q: 'The Ancient Egyptians built pyramids as…',
      choices: ['Tombs for pharaohs ✅','Granaries','Libraries'],
      correct: 0
    }},
    { name:'Gallery', x: ORIGIN.x+6, y: ORIGIN.y+8, z: ORIGIN.z-4, quiz: {
      q: 'A pyramid with a square base has how many faces?',
      choices: ['4','5 ✅','6'],
      correct: 1
    }},
    { name:'King's Chamber', x: ORIGIN.x-6, y: ORIGIN.y+12, z: ORIGIN.z-8, quiz: {
      q: '3/4 is equal to how many quarters?',
      choices: ['2','3 ✅','4'],
      correct: 1
    }},
    { name:'Apex', x: ORIGIN.x, y: ORIGIN.y+HEIGHT-1, z: ORIGIN.z }
  ];

  function placeCheckpoints(){
    CHECKPOINTS.forEach(cp=>{
      Adapter.setBlock(cp.x, cp.y, cp.z, BLOCKS.EMERALD);
      Adapter.setBlock(cp.x, cp.y-1, cp.z, BLOCKS.STONE);
    });
  }

  function within(a,b,eps=0.5){ return Math.abs(a-b)<=eps; }

  // Doors guarding quiz gates (simple 3x3 stone) – vanish on correct answer
  function buildDoorAround(x,y,z){
    for (let dx=-1; dx<=1; dx++){
      for (let dy=0; dy<3; dy++){
        Adapter.setBlock(x+dx, y+dy, z, BLOCKS.STONE);
      }
    }
  }

  function openDoor(x,y,z){
    for (let dx=-1; dx<=1; dx++){
      for (let dy=0; dy<3; dy++){
        Adapter.setBlock(x+dx, y+dy, z, BLOCKS.AIR);
      }
    }
  }

  // Position doors just ahead of quiz checkpoints
  const DOORS = [
    { at: 1, pos: { x: CHECKPOINTS[1].x, y: CHECKPOINTS[1].y, z: CHECKPOINTS[1].z-2 } },
    { at: 2, pos: { x: CHECKPOINTS[2].x, y: CHECKPOINTS[2].y, z: CHECKPOINTS[2].z-2 } },
    { at: 3, pos: { x: CHECKPOINTS[3].x, y: CHECKPOINTS[3].y, z: CHECKPOINTS[3].z-2 } }
  ];

  // --------- Quiz UI ----------
  function askQuiz(cpIndex){
    const modal = document.getElementById('quizModal');
    const qEl = document.getElementById('quizQuestion');
    const ctn = document.getElementById('quizChoices');
    const quiz = CHECKPOINTS[cpIndex].quiz;
    if (!quiz) return Promise.resolve(true);

    return new Promise(res=>{
      qEl.textContent = quiz.q;
      ctn.innerHTML = '';
      quiz.choices.forEach((txt, i)=>{
        const b = document.createElement('button');
        b.type='button'; b.textContent = txt.replace(' ✅','');
        b.onclick = () => {
          const correct = (i===quiz.correct);
          if (correct) toast('Correct! The door opens.'); else toast('Not quite – try again.');
          modal.close();
          res(correct);
        };
        ctn.appendChild(b);
      });
      document.getElementById('quizCancel').onclick = ()=>{ modal.close(); res(false); };
      modal.showModal();
    });
  }

  // --------- Game flow ----------
  function startRun(){
    hud.t0 = performance.now();
    hud.falls = 0;
    hud.cpIndex = 0;
    hud.running = true;
    Adapter.teleport(CHECKPOINTS[0].x, CHECKPOINTS[0].y, CHECKPOINTS[0].z);
    toast('Run started! Reach the apex capstone.');
  }

  function finishRun(){
    hud.running = false;
    const secs = Math.floor((performance.now() - hud.t0)/1000);
    const score = Math.max(10, 200 - secs - hud.falls*5);
    const accuracy = Math.max(10, 100 - hud.falls*5);

    toast(`Finished in ${secs}s, score ${score}.`);
    // Emit to Nova Rewards
    window.NovaGame.levelComplete({
      game: 'NovaCraft',
      level: 'PyramidParkour',
      score,
      accuracy,
      extra: { seconds: secs, falls: hud.falls }
    });

    // Also postMessage for outer wrappers (optional)
    window.parent?.postMessage({ type:'novacraft-pyramid-complete', seconds: secs, falls: hud.falls, score, accuracy }, '*');
  }

  function respawn(){
    hud.falls++;
    const cp = CHECKPOINTS[hud.cpIndex];
    Adapter.teleport(cp.x, cp.y, cp.z);
    toast('Respawned at checkpoint.');
  }

  // Detect standing on hazard (lava) or falling below floor
  function isHazard(pos){
    // if below base floor -> respawn
    if (pos.y < ORIGIN.y - 2) return true;
    // sample nearest blocks under feet (approx)
    const bx = Math.round(pos.x), by = Math.floor(pos.y - 1.2), bz = Math.round(pos.z);
    // crude probe (assumes adapter uses same block IDs on get ? we only built hazards ourselves)
    // We can raycast via engine if available – for MVP just compare against built lava coordinates:
    // Scan a small cube underfoot for our placed LAVA blocks
    for (const p of PATH) {
      if (p.type==='LAVA' && Math.abs(p.x-bx)<=0 && Math.abs(p.y-by)<=0 && Math.abs(p.z-bz)<=0) {
        return true;
      }
    }
    return false;
  }

  async function tick(){
    hud.update();
    if (!hud.running) return;
    const p = Adapter.getPlayerPos();
    // Check checkpoint proximity
    const nextIdx = Math.min(hud.cpIndex+1, CHECKPOINTS.length-1);
    const next = CHECKPOINTS[nextIdx];
    if (within(p.x, next.x, 1.2) && within(p.y, next.y, 1.2) && within(p.z, next.z, 1.2)) {
      // If this checkpoint had a quiz and door, verify/open
      if (next.quiz && hud.cpIndex+1 === nextIdx) {
        const door = DOORS.find(d=>d.at===nextIdx);
        if (door) {
          const ok = await askQuiz(nextIdx);
          if (ok) openDoor(door.pos.x, door.pos.y, door.pos.z);
          else return; // ask again on next tick
        }
      }
      hud.cpIndex = nextIdx;
      if (hud.cpIndex === CHECKPOINTS.length-1) {
        finishRun();
      } else {
        toast(`Checkpoint: ${CHECKPOINTS[hud.cpIndex].name}`);
      }
    }
    // Hazards/falls
    if (isHazard(p)) respawn();
  }

  // --------- Build world & start ----------
  buildPyramidShell();
  placePath();
  placeCheckpoints();
  DOORS.forEach(d => buildDoorAround(d.pos.x, d.pos.y, d.pos.z));

  // Teleport to start and wait a moment for engine settle
  setTimeout(startRun, 400);
  Adapter.onTick(tick);
})();