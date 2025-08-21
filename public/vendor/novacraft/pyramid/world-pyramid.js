// NovaCraft: Pyramid Parkour (stable rebuild)
// Works with: noa, voxel-engine style (window.game), or custom window.NovaCraftEngine
(() => {
  // -------- CONFIG: map to your engine's block IDs --------
  const BLOCKS = {
    AIR: 0,
    STONE: 1,
    SANDSTONE: 2,
    SAND: 3,
    GOLD: 4,
    EMERALD: 5,
    LAVA: 6,
    TORCH: 7
  };

  // -------- Engine Adapter (robust) --------
  const Adapter = (() => {
    const a = { ready:false };

    // noa (https://github.com/fenomas/noa)
    if (window.noa) {
      const noa = window.noa;
      a.onReady = (cb) => { noa.initialized ? cb() : noa.on('ready', cb); };
      a.getPlayerPos = () => {
        const p = noa.ents.getPosition(noa.playerEntity);
        return { x:p[0], y:p[1], z:p[2] };
      };
      a.setBlock = (x,y,z,id) => noa.setBlock(id, x, y, z);
      a.getBlock = (x,y,z) => noa.getBlock(x, y, z);
      a.onTick = (cb) => noa.on('tick', cb);
      a.teleport = (x,y,z) => {
        noa.ents.setPosition(noa.playerEntity, [x+0.5, y+1.25, z+0.5]);
        const body = noa.ents.getPhysics(noa.playerEntity);
        if (body?.body?.velocity) body.body.velocity.set(0,0,0);
      };
      a.pointerLock = { request: () => noa.inputs?.pointerLock?.request() };
      a.hint = (m) => toast(m);
      a.ready = true;
      return a;
    }

    // voxel-engine-like
    if (window.game && typeof window.game.setBlock === 'function') {
      const g = window.game;
      a.onReady = (cb)=> cb();
      a.getPlayerPos = () => {
        const t = g.controls?.target?.();
        const p = (t?.position) || g.cameraPosition?.() || {x:0,y:0,z:0};
        return { x:p.x, y:p.y, z:p.z };
      };
      a.setBlock = (x,y,z,id) => g.setBlock([x,y,z], id);
      a.getBlock = (x,y,z) => (g.getBlock ? g.getBlock([x,y,z]) : null);
      a.onTick = (cb) => g.on('tick', cb);
      a.teleport = (x,y,z) => {
        const t = g.controls?.target?.();
        if (t?.position) t.position.set(x+0.5, y+1.25, z+0.5);
      };
      a.pointerLock = { request:()=>{} };
      a.hint = (m)=>toast(m);
      a.ready = true;
      return a;
    }

    // custom engine
    if (window.NovaCraftEngine) {
      const eng = window.NovaCraftEngine;
      a.onReady = (cb)=> eng.onReady ? eng.onReady(cb) : cb();
      a.getPlayerPos = ()=> eng.player();
      a.setBlock = (x,y,z,id)=> eng.setBlock(x,y,z,id);
      a.getBlock = (x,y,z)=> eng.getBlock?.(x,y,z);
      a.onTick = (cb)=> eng.onTick(cb);
      a.teleport = (x,y,z)=> eng.teleport(x+0.5,y+1.25,z+0.5);
      a.pointerLock = { request:()=> eng.requestPointerLock?.() };
      a.hint = (m)=>toast(m);
      a.ready = true;
      return a;
    }

    return a;
  })();

  function toast(msg, ms=1400){
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

  // ---- Delay until DOM + engine ready ----
  function onDOMReady(cb){ if (document.readyState !== 'loading') cb(); else document.addEventListener('DOMContentLoaded', cb); }

  onDOMReady(() => {
    Adapter.onReady(() => initWorld(Adapter, BLOCKS, toast));
  });

  // ===== World =====
  function initWorld(Adapter, BLOCKS, toast) {
    // Geometry constants
    const ORIGIN = { x: 0, y: 4, z: 0 };
    const BASE = 41;       // odd recommended
    const HEIGHT = 21;

    // Fast hazard lookup + door state
    const lavaSet = new Set();
    const openedDoors = new Set();
    let quizOpen = false;

    // ---- HUD state ----
    const hud = {
      t0:null, falls:0, cpIndex:0, running:false,
      update(){
        const t = document.getElementById('timer');
        const f = document.getElementById('falls');
        const c = document.getElementById('checkpoint');
        if (!t||!f||!c) return;
        const secs = (this.running && this.t0!=null) ? Math.floor((performance.now()-this.t0)/1000) : 0;
        const mm = String(Math.floor(secs/60)).padStart(2,'0');
        const ss = String(secs%60).padStart(2,'0');
        t.textContent = `⏱ ${mm}:${ss}`;
        f.textContent = `💥 ${this.falls} falls`;
        c.textContent = `📍 ${CHECKPOINTS[this.cpIndex].name}`;
      }
    };

    // ---- Pyramid shell ----
    function buildPyramidShell() {
      const cx = ORIGIN.x, cy = ORIGIN.y, cz = ORIGIN.z;
      for (let h=0; h<HEIGHT; h++){
        const size = BASE - 2*h, y = cy + h, half = (size>>1);
        for (let dx=-half; dx<=half; dx++){
          for (let dz=-half; dz<=half; dz++){
            const x = cx + dx, z = cz + dz;
            const edge = (Math.abs(dx)===half || Math.abs(dz)===half);
            Adapter.setBlock(x,y,z, edge ? BLOCKS.SANDSTONE : BLOCKS.AIR);
          }
        }
      }
      // capstone + floor + entrance
      Adapter.setBlock(cx, cy+HEIGHT, cz, BLOCKS.GOLD);
      const floorHalf = Math.floor(BASE/2);
      for (let dx=-floorHalf; dx<=floorHalf; dx++){
        for (let dz=-floorHalf; dz<=floorHalf; dz++){
          Adapter.setBlock(cx+dx, cy-1, cz+dz, BLOCKS.SAND);
        }
      }
      const entZ = cz + Math.floor(BASE/2);
      const entY = cy + 1;
      for (let y=entY; y<entY+3; y++){
        for (let x=cx-1; x<=cx+1; x++){ Adapter.setBlock(x, y, entZ, BLOCKS.AIR); }
      }
      Adapter.setBlock(cx-2, entY, entZ-1, BLOCKS.TORCH);
      Adapter.setBlock(cx+2, entY, entZ-1, BLOCKS.TORCH);
    }

    // ---- Parkour path ----
    const PATH = [];
    (function buildPath(){
      const steps = 60;
      let x = ORIGIN.x - 10, y = ORIGIN.y + 1, z = ORIGIN.z + 10;
      let dir = 1;
      for (let i=0; i<steps; i++){
        PATH.push({x,y,z, type:'PLATFORM'});
        if (i%10===5) PATH.push({x:x+1*dir, y:y-1, z, type:'LAVA'});
        if (i%8===3)  PATH.push({x:x-1*dir, y:y-1, z, type:'GAP'});
        x += dir * 3; z -= 2;
        if (i%6===0) y += 1;
        if (i%5===4) dir *= -1;
      }
    })();

    function k(x,y,z){ return `${x}|${y}|${z}`; }

    function placePath(){
      PATH.forEach(p=>{
        if (p.type==='PLATFORM') Adapter.setBlock(p.x, p.y, p.z, BLOCKS.STONE);
        if (p.type==='LAVA'){ Adapter.setBlock(p.x, p.y, p.z, BLOCKS.LAVA); lavaSet.add(k(p.x,p.y,p.z)); }
        if (p.type==='GAP')  Adapter.setBlock(p.x, p.y, p.z, BLOCKS.AIR);
      });
    }

    // ---- Checkpoints + quizzes ----
    const CHECKPOINTS = [
      { name:'Start', x: ORIGIN.x, y: ORIGIN.y+1, z: ORIGIN.z + (Math.floor(BASE/2)-2) },
      { name:'Antechamber', x: ORIGIN.x-5, y: ORIGIN.y+4, z: ORIGIN.z+2, quiz:{
        q:'The Ancient Egyptians built pyramids as…',
        choices:['Tombs for pharaohs ✅','Granaries','Libraries'], correct:0
      }},
      { name:'Gallery', x: ORIGIN.x+6, y: ORIGIN.y+8, z: ORIGIN.z-4, quiz:{
        q:'A pyramid with a square base has how many faces?',
        choices:['4','5 ✅','6'], correct:1
      }},
      { name:'King's Chamber', x: ORIGIN.x-6, y: ORIGIN.y+12, z: ORIGIN.z-8, quiz:{
        q:'3/4 is equal to how many quarters?',
        choices:['2','3 ✅','4'], correct:1
      }},
      { name:'Apex', x: ORIGIN.x, y: ORIGIN.y+HEIGHT-1, z: ORIGIN.z }
    ];

    function placeCheckpoints(){
      CHECKPOINTS.forEach(cp=>{
        Adapter.setBlock(cp.x, cp.y, cp.z, BLOCKS.EMERALD);
        Adapter.setBlock(cp.x, cp.y-1, cp.z, BLOCKS.STONE);
      });
    }

    // ---- Doors guarding quiz gates ----
    const DOORS = [
      { id:'D1', at:1, pos:{ x: CHECKPOINTS[1].x, y: CHECKPOINTS[1].y, z: CHECKPOINTS[1].z-2 } },
      { id:'D2', at:2, pos:{ x: CHECKPOINTS[2].x, y: CHECKPOINTS[2].y, z: CHECKPOINTS[2].z-2 } },
      { id:'D3', at:3, pos:{ x: CHECKPOINTS[3].x, y: CHECKPOINTS[3].y, z: CHECKPOINTS[3].z-2 } }
    ];
    const DOOR_BY_CP = new Map();

    function buildDoorAround(x,y,z){
      for (let dx=-1; dx<=1; dx++){
        for (let dy=0; dy<3; dy++){ Adapter.setBlock(x+dx, y+dy, z, BLOCKS.STONE); }
      }
    }
    function openDoor(id,x,y,z){
      if (openedDoors.has(id)) return;
      for (let dx=-1; dx<=1; dx++){
        for (let dy=0; dy<3; dy++){ Adapter.setBlock(x+dx, y+dy, z, BLOCKS.AIR); }
      }
      openedDoors.add(id);
    }

    // ---- Quiz UI (locked to avoid spam) ----
    async function askQuiz(cpIndex){
      const quiz = CHECKPOINTS[cpIndex].quiz;
      if (!quiz) return true;
      if (quizOpen) return false;
      quizOpen = true;

      const modal = document.getElementById('quizModal');
      const qEl = document.getElementById('quizQuestion');
      const ctn = document.getElementById('quizChoices');

      return new Promise(res=>{
        qEl.textContent = quiz.q;
        ctn.innerHTML = '';
        quiz.choices.forEach((txt, i)=>{
          const b = document.createElement('button');
          b.type='button'; b.textContent = txt.replace(' ✅','');
          b.onclick = () => {
            const ok = (i===quiz.correct);
            modal.close(); quizOpen=false;
            if (ok) toast('Correct! The door opens.'); else toast('Not quite – try again.');
            res(ok);
          };
          ctn.appendChild(b);
        });
        document.getElementById('quizCancel').onclick = ()=>{ modal.close(); quizOpen=false; res(false); };
        modal.addEventListener('close', ()=>{ quizOpen=false; }, { once:true });
        try { Adapter.pointerLock?.release?.(); } catch {}
        modal.showModal();
      });
    }

    // ---- Flow ----
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
      (window.NovaGame?.levelComplete||(()=>{}))({
        game:'NovaCraft', level:'PyramidParkour',
        score, accuracy, extra:{ seconds:secs, falls:hud.falls }
      });
      window.parent?.postMessage({ type:'novacraft-pyramid-complete', seconds:secs, falls:hud.falls, score, accuracy }, '*');
    }

    function respawn(){
      hud.falls++;
      const cp = CHECKPOINTS[hud.cpIndex];
      Adapter.teleport(cp.x, cp.y, cp.z);
      toast('Respawned at checkpoint.');
    }

    function isHazard(pos){
      if (pos.y < ORIGIN.y - 2) return true;
      const bx = Math.round(pos.x), by = Math.floor(pos.y - 1.1), bz = Math.round(pos.z);
      const id = Adapter.getBlock?.(bx,by,bz);
      if (id != null) return (id === BLOCKS.LAVA);
      return lavaSet.has(`${bx}|${by}|${bz}`);
    }

    function within(a,b,eps){ return Math.abs(a-b)<=eps; }

    // ---- Build & go ----
    buildPyramidShell();
    placePath();
    placeCheckpoints();
    for (const d of DOORS) {
      buildDoorAround(d.pos.x, d.pos.y, d.pos.z);
      DOOR_BY_CP.set(d.at, d);
    }

    let tickingQuiz = false;
    Adapter.onTick(async ()=>{
      hud.update();
      if (!hud.running || tickingQuiz) return;

      const p = Adapter.getPlayerPos();

      // checkpoint check
      const nextIdx = Math.min(hud.cpIndex+1, CHECKPOINTS.length-1);
      const next = CHECKPOINTS[nextIdx];
      if (within(p.x,next.x,1.2) && within(p.y,next.y,1.2) && within(p.z,next.z,1.2)) {
        if (next.quiz && hud.cpIndex+1 === nextIdx) {
          const door = DOOR_BY_CP.get(nextIdx);
          if (door && !openedDoors.has(door.id)) {
            tickingQuiz = true;
            const ok = await askQuiz(nextIdx);
            tickingQuiz = false;
            if (ok) openDoor(door.id, door.pos.x, door.pos.y, door.pos.z);
            else return;
          }
        }
        hud.cpIndex = nextIdx;
        if (hud.cpIndex === CHECKPOINTS.length-1) finishRun();
        else toast(`Checkpoint: ${CHECKPOINTS[hud.cpIndex].name}`);
      }

      // hazards/falls
      if (isHazard(p)) respawn();
    });

    setTimeout(startRun, 300);
  }
})();