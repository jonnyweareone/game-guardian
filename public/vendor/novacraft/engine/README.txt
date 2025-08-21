NovaCraft Engine Bundles

- Place your voxel engine bundle(s) here and reference them from the world HTML.
- Recommended: Noa engine build (self-hosted) as /vendor/novacraft/engine/noa.js
- Do not load third-party CDNs to satisfy CSP; keep everything same-origin.

Steps:
1) Get a browser-ready Noa build (single JS bundle) and save it as noa.js in this folder.
2) Ensure public/vendor/novacraft/pyramid/index.html includes:
   <script src="/vendor/novacraft/engine/noa.js"></script>
   <script src="./world-pyramid.js"></script>
3) Reload the game page.
