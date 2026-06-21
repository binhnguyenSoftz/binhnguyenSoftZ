/* ==========================================================================
   Hero — 3D payment-switch network visualisation (Three.js)
   Renders a core hub surrounded by endpoint nodes with packets travelling
   along the edges, evoking a transaction-switch topology.
   ========================================================================== */
(function () {
  'use strict';

  const wrap = document.getElementById('canvas-wrap');
  if (!wrap || typeof THREE === 'undefined') {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    wrap.clientWidth / wrap.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 26);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  wrap.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const CYAN = 0x3fd9c7;
  const AMBER = 0xe8a23f;
  const MAGENTA = 0xc97bd1;

  // Nodes arranged like a switch topology: 1 core hub + ring of endpoint nodes
  const nodeCount = 14;
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.26, 16, 16);

  // core hub
  const hubMat = new THREE.MeshBasicMaterial({ color: CYAN });
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), hubMat);
  hub.position.set(0, 0, 0);
  group.add(hub);
  nodes.push({ mesh: hub, pos: hub.position.clone(), isHub: true });

  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;
    const r = 9 + Math.random() * 2.5;
    const x = r * Math.cos(theta) * Math.sin(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(phi);
    const mat = new THREE.MeshBasicMaterial({
      color: i % 5 === 0 ? AMBER : i % 7 === 0 ? MAGENTA : CYAN,
    });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
    nodes.push({ mesh, pos: mesh.position.clone(), isHub: false });
  }

  // connections: hub to each node + a few cross-links
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x1c2733,
    transparent: true,
    opacity: 0.5,
  });
  const edges = [];
  for (let i = 1; i < nodes.length; i++) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      nodes[0].pos,
      nodes[i].pos,
    ]);
    const line = new THREE.Line(geo, lineMat);
    group.add(line);
    edges.push([0, i]);
  }
  for (let i = 0; i < 8; i++) {
    const a = 1 + Math.floor(Math.random() * nodeCount);
    const b = 1 + Math.floor(Math.random() * nodeCount);
    if (a !== b) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        nodes[a].pos,
        nodes[b].pos,
      ]);
      const line = new THREE.Line(geo, lineMat);
      group.add(line);
      edges.push([a, b]);
    }
  }

  // traveling packets along edges
  const packetGeo = new THREE.SphereGeometry(0.13, 8, 8);
  const packets = [];
  function spawnPacket() {
    const e = edges[Math.floor(Math.random() * edges.length)];
    const color = Math.random() < 0.15 ? AMBER : CYAN;
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(packetGeo, mat);
    group.add(mesh);
    packets.push({
      mesh,
      from: nodes[e[0]].pos,
      to: nodes[e[1]].pos,
      t: 0,
      speed: 0.006 + Math.random() * 0.01,
    });
  }
  for (let i = 0; i < 10; i++) spawnPacket();

  // ambient point light glow via additive sprite (simple)
  const glowGeo = new THREE.SphereGeometry(1.3, 24, 24);
  const glowMat = new THREE.MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.08,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  hub.add(glow);

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.0014;
    group.rotation.x = mouseY * 0.25;
    group.rotation.y += mouseX * 0.0006;

    packets.forEach((p) => {
      p.t += p.speed;
      if (p.t >= 1) {
        p.t = 0;
        const e = edges[Math.floor(Math.random() * edges.length)];
        p.from = nodes[e[0]].pos;
        p.to = nodes[e[1]].pos;
      }
      p.mesh.position.lerpVectors(p.from, p.to, p.t);
    });

    hub.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.06);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = wrap.clientWidth / wrap.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  });
})();
