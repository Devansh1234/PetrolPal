// Petrol Pal Go & Pro — procedural 3D model (units: millimetres).
// Shared by the website and the render scripts so every image matches the approved concept.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/* ---------- helpers ---------- */
const MM = 1;
function rrShape(w, h, r) {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
function rrPath(w, h, r, cx = 0, cy = 0) {
  const p = new THREE.Path(); const x = cx - w / 2, y = cy - h / 2;
  p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y); return p;
}
function extrudeRR(w, h, d, r, bevel, holes = []) {
  const shape = rrShape(w - 2 * bevel, h - 2 * bevel, Math.max(0.5, r - bevel));
  holes.forEach((hp) => shape.holes.push(hp));
  const g = new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.01, d - 2 * bevel), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 28 });
  g.translate(0, 0, -(d - 2 * bevel) / 2); g.computeVertexNormals(); return g;
}
export function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d'); draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const plastic = (color, rough = 0.42) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.35 });
const anodised = (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, metalness: 0.75, clearcoat: 0.2 });

/* ---------- the gold electrode paddle (IDE 40 x 20) ---------- */
const PX = 20; // px per mm
const PADDLE_W = 22, PADDLE_L = 56, PADDLE_T = 1.6;
function drawPaddle(ctx, w, h, layer) {
  const mm = (v) => v * PX; const Y = (v) => h - mm(v); // y measured from the tip
  const soldermask = layer === 'color' ? '#15191b' : layer === 'metal' ? '#000' : '#7a7a7a';
  const gold = layer === 'color' ? '#d6b25e' : layer === 'metal' ? '#fff' : '#555';
  const silk = layer === 'color' ? '#e9ecea' : layer === 'metal' ? '#000' : '#bbb';
  ctx.fillStyle = soldermask; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = gold;
  // bus bars along the 40 mm length
  ctx.fillRect(mm(1), Y(43), mm(1), mm(40));
  ctx.fillRect(mm(20), Y(43), mm(1), mm(40));
  // fingers: 2 mm pitch per comb, 1 mm offset between combs, 0.5 mm wide
  for (let k = 0; k < 20; k++) {
    ctx.fillRect(mm(2), Y(3.5 + 2 * k + 0.25), mm(17.5), mm(0.5));
    ctx.fillRect(mm(2.5), Y(4.5 + 2 * k + 0.25), mm(17.5), mm(0.5));
  }
  // NTC 0603 near the tip, with pads
  ctx.fillRect(mm(9.4), Y(2.4), mm(0.8), mm(0.9)); ctx.fillRect(mm(11.8), Y(2.4), mm(0.8), mm(0.9));
  if (layer === 'color') { ctx.fillStyle = '#3b2a1c'; ctx.fillRect(mm(10.1), Y(2.35), mm(1.8), mm(0.8)); ctx.fillStyle = '#c9c9c9'; ctx.fillRect(mm(9.9), Y(2.35), mm(0.3), mm(0.8)); ctx.fillRect(mm(11.8), Y(2.35), mm(0.3), mm(0.8)); }
  ctx.fillStyle = gold;
  // traces up the neck to the connector
  ctx.fillRect(mm(1.25), Y(PADDLE_L - 2), mm(0.5), mm(PADDLE_L - 45));
  ctx.fillRect(mm(20.25), Y(PADDLE_L - 2), mm(0.5), mm(PADDLE_L - 45));
  // NTC leads drop to the back layer through vias, then come up the neck
  const via = (x, y) => { ctx.beginPath(); ctx.arc(mm(x), Y(y), mm(0.35), 0, Math.PI * 2); ctx.fill(); };
  via(9.0, 1.9); via(13.0, 1.9); ctx.fillRect(mm(9.0), Y(2.0), mm(0.6), mm(0.25)); ctx.fillRect(mm(12.5), Y(2.0), mm(0.6), mm(0.25));
  via(15.6, 44.2); via(16.8, 44.2);
  ctx.fillRect(mm(15.45), Y(PADDLE_L - 2), mm(0.3), mm(PADDLE_L - 46.2));
  ctx.fillRect(mm(16.65), Y(PADDLE_L - 2), mm(0.3), mm(PADDLE_L - 46.2));
  // silkscreen
  if (layer !== 'metal') {
    ctx.save(); ctx.fillStyle = silk; ctx.font = `600 ${mm(1.2)}px "IBM Plex Mono", monospace`;
    ctx.translate(mm(2.6), Y(47.6)); ctx.fillText('IDE 40×20 REV A', 0, 0);
    ctx.font = `600 ${mm(1.2)}px "IBM Plex Mono", monospace`; ctx.fillText('TH1', mm(11.8), mm(46.6));
    ctx.restore();
  }
}
export function paddleMaterials() {
  const make = (layer) => canvasTex(PADDLE_W * PX, PADDLE_L * PX, (c, w, h) => drawPaddle(c, w, h, layer), layer === 'color');
  const map = make('color'), metal = make('metal'), rough = make('rough');
  const face = new THREE.MeshStandardMaterial({ map, metalnessMap: metal, metalness: 1, roughnessMap: rough, roughness: 1 });
  const back = new THREE.MeshStandardMaterial({ color: 0x15191b, roughness: 0.55 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xb9ab7a, roughness: 0.7 }); // FR-4 edge
  return [edge, edge, edge, edge, face, back];
}

/* ---------- screens ---------- */
export function oledTexture() {
  return canvasTex(720, 420, (c, w, h) => {
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#7f8a8c'; c.font = '500 30px "IBM Plex Mono", monospace'; c.fillText('ETHANOL', 40, 66);
    c.textAlign = 'right'; c.fillText('27.4 °C', w - 40, 66); c.textAlign = 'left';
    c.fillStyle = '#f2f5f4'; c.font = '600 170px "Archivo", "Arial Narrow", sans-serif'; c.fillText('19.8', 36, 240);
    c.font = '600 70px "Archivo", sans-serif'; c.fillText('%', 410, 238);
    // gauge 0..40 %
    const x0 = 40, x1 = w - 40, y = 315; const px = (v) => x0 + (x1 - x0) * v / 40;
    c.fillStyle = '#2a3133'; c.fillRect(x0, y, x1 - x0, 10);
    c.fillStyle = 'rgba(45,212,191,.35)'; c.fillRect(px(17), y - 6, px(23) - px(17), 22);
    c.fillStyle = '#2dd4bf'; c.beginPath(); c.arc(px(19.8), y + 5, 13, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7f8a8c'; c.font = '500 24px "IBM Plex Mono", monospace'; c.fillText('0', x0, 375); c.textAlign = 'center'; c.fillText('E20', px(20), 375); c.textAlign = 'right'; c.fillText('40', x1, 375);
  });
}
function wordmarkTexture(color) {
  return canvasTex(512, 128, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '700 62px "Archivo", "Arial Narrow", sans-serif'; c.fillText('petrol pal', w / 2, h / 2 + 2);
  });
}
function fillLineTexture() {
  return canvasTex(256, 512, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.85)'; c.fillStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(20, 150); c.lineTo(236, 150); c.stroke();
    c.font = '600 28px "IBM Plex Mono", monospace'; c.fillText('FILL', 24, 136);
    for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(20, 210 + i * 50); c.lineTo(60, 210 + i * 50); c.stroke(); }
  });
}

/* ---------- colourways ---------- */
const BLACK = { id: 'black', name: 'Black', body: 0x1c1f22, accent: 0x14b8a6, mark: '#cfd6d4', swatch: '#1c1f22' };
const WHITE = { id: 'white', name: 'White', body: 0xeceeeb, accent: 0x0f766e, mark: '#59625f', swatch: '#eceeeb' };
export const COLOURS = { pro: [BLACK, WHITE], go: [WHITE, BLACK] };

/* ---------- AAA cell (10.5 × 44.5 mm) ---------- */
export function aaaCell() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(5.25, 5.25, 42.5, 48), new THREE.MeshStandardMaterial({ color: 0x1d2a2a, metalness: 0.5, roughness: 0.35 }));
  const band = new THREE.Mesh(new THREE.CylinderGeometry(5.27, 5.27, 9, 48), new THREE.MeshStandardMaterial({ color: 0x14b8a6, metalness: 0.5, roughness: 0.35 }));
  band.position.y = 16.5;
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 1.4, 32), new THREE.MeshStandardMaterial({ color: 0xc9cdd0, metalness: 0.9, roughness: 0.2 }));
  tip.position.y = 21.9;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.6, 40), new THREE.MeshStandardMaterial({ color: 0xc9cdd0, metalness: 0.9, roughness: 0.2 }));
  base.position.y = -21.5;
  g.add(body, band, tip, base);
  return g;
}

function aaaPair() {
  const g = new THREE.Group(); const a = aaaCell(), b = aaaCell();
  a.position.x = -5.4; b.position.x = 5.4; b.rotation.z = Math.PI; g.add(a, b); return g;
}

/* ---------- device builder ---------- */
function part(mesh, name, detail, explode, side = 'right', anchorY = null) {
  mesh.userData = { name, detail, explode: new THREE.Vector3(...explode), side, home: mesh.position.clone(), anchorY };
  return mesh;
}

export function buildDevice(kind) {
  const pro = kind === 'pro';
  const W = pro ? 38 : 34, H = pro ? 118 : 98, D = pro ? 18 : 15;
  const g = new THREE.Group(); g.userData.parts = []; g.userData.kind = kind;
  const add = (m) => { g.add(m); if (m.userData.name !== undefined) g.userData.parts.push(m); return m; };
  const mats = { body: plastic(0x2a2e33), panel: plastic(0x2a2e33, 0.32), accent: anodised(0x14b8a6) };
  g.userData.mats = mats;

  // housing (back shell)
  const housing = new THREE.Mesh(extrudeRR(W, H, D - 2, 9, 2.6), mats.body);
  housing.position.z = -1;
  add(part(housing, 'Housing', 'Fuel-resistant shell', [0, 0, -70], 'right', pro ? -48 : -40));

  // front panel with cut-outs
  const holes = [];
  const btnY = pro ? -6 : -14;
  if (pro) holes.push(rrPath(28, 19, 3.2, 0, 30));
  else [8.5, 0, -8.5].forEach((dy) => { const hp = new THREE.Path(); hp.absarc(0, 16 + dy, 3.1, 0, Math.PI * 2, true); holes.push(hp); });
  const btnHole = new THREE.Path(); btnHole.absarc(0, btnY, 5.6, 0, Math.PI * 2, true); holes.push(btnHole);
  const front = new THREE.Mesh(extrudeRR(W - 1.2, H - 1.2, 2.2, 8.4, 0.9, holes), mats.panel);
  front.position.z = D / 2 - 0.6;
  add(part(front, 'Front panel', 'Soft-touch, one piece', [0, 0, 110], 'left', pro ? -46 : -38));

  // wordmark on the front panel
  const markMat = new THREE.MeshBasicMaterial({ map: wordmarkTexture('#cfd6d4'), transparent: true, depthWrite: false, toneMapped: false });
  g.userData.markMat = markMat;
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(26, 6.5), markMat);
  mark.position.set(0, pro ? -40 : -34, D / 2 + 0.66);
  front.add(mark); mark.position.sub(front.position);

  // button
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 2.4, 48), mats.accent);
  btn.rotation.x = Math.PI / 2; btn.position.set(0, btnY, D / 2 + 0.4);
  add(part(btn, 'Button', 'Press to test · hold for QR', [0, 0, 150], 'left', btnY));

  if (pro) {
    const oled = new THREE.Mesh(new THREE.PlaneGeometry(26, 15.2), new THREE.MeshBasicMaterial({ map: oledTexture(), toneMapped: false }));
    oled.position.set(0, 30, D / 2 - 0.2);
    add(part(oled, 'OLED display', '1.3″, sunlight readable', [0, 0, 75], 'left', 24));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(27.6, 18.6), new THREE.MeshPhysicalMaterial({ color: 0x1b2326, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.16, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false }));
    glass.position.set(0, 30, D / 2 + 0.45);
    add(part(glass, 'Cover glass', 'Toughened, anti-glare', [0, 0, 185], 'left', 44));
    const cell = aaaPair(); cell.position.set(0, -18, -3.2);
    add(part(cell, 'Two AAA cells', 'Standard, easy to replace', [0, 0, -34], 'right', -18));
  } else {
    // status lights
    // three status lights: good (green), unclear (white), check (red) — green shown lit
    const light = new THREE.Group();
    const lamp = (hex, lit, y) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 1.2, 40), lit
        ? new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 2.4, toneMapped: false })
        : new THREE.MeshStandardMaterial({ color: new THREE.Color(hex).multiplyScalar(0.28), roughness: 0.35 }));
      m.rotation.x = Math.PI / 2; m.position.y = y; light.add(m);
    };
    lamp(0x22c55e, true, 8.5); lamp(0xf1f5f4, false, 0); lamp(0xef4444, false, -8.5);
    light.position.set(0, 16, D / 2 - 0.4);
    add(part(light, 'Three status lights', 'Green good · White unclear · Red check', [0, 0, 75], 'left', 22));
    const cell = aaaPair(); cell.position.set(0, -12, -1.6);
    add(part(cell, 'Two AAA cells', 'Standard, easy to replace', [0, 0, -34], 'right', -12));
  }

  // main board with a few components
  const board = new THREE.Group();
  const pcb = new THREE.Mesh(new RoundedBoxGeometry(W - 8, H - 14, 1.6, 2, 0.6), new THREE.MeshStandardMaterial({ color: 0x0f1a16, roughness: 0.55 }));
  board.add(pcb);
  const chip = (w, h, x, y, c = 0x16181a) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })); m.position.set(x, y, 1.4); board.add(m); };
  chip(9, 9, 0, pro ? 6 : 2); chip(5, 3, -8, pro ? -20 : -12); chip(4, 4, 8, pro ? -22 : -10, 0x2b2f32); chip(3, 2, -6, pro ? 18 : 12, 0xc7a14a); chip(6, 2.2, 7, pro ? 20 : 14, 0x3a3f42);
  board.position.set(0, 2, 2.6);
  add(part(board, 'Main board', pro ? '32-bit processor · Bluetooth LE' : 'Low-power processor', [0, 0, 40], 'right', pro ? 30 : 22));

  // sealed collar
  const collar = new THREE.Mesh(new RoundedBoxGeometry(W - 7, 6, D - 5, 4, 2.4), mats.accent);
  collar.position.y = -H / 2 - 2.4;
  add(part(collar, 'Sealed collar', 'Fuel-rated gasket inside', [0, -16, 0], 'left', null));

  // paddle
  const paddle = new THREE.Mesh(new THREE.BoxGeometry(PADDLE_W, PADDLE_L, PADDLE_T), paddleMaterials());
  paddle.position.y = -H / 2 - 4.5 - PADDLE_L / 2;
  add(part(paddle, 'Gold sensing paddle', 'Interdigitated electrode, 40 × 20 mm', [0, -40, 0], 'right', null));

  g.userData.bottom = -H / 2 - 4.5 - PADDLE_L;
  g.userData.H = H; g.userData.W = W; g.userData.D = D;
  g.userData.ntc = new THREE.Vector3(0, g.userData.bottom + 2, PADDLE_T / 2);
  return g;
}

/* ---------- the sample cap ---------- */
export function buildCap() {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new RoundedBoxGeometry(30, 66, 12, 6, 5.5), new THREE.MeshPhysicalMaterial({ color: 0xf4fbfa, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.28, clearcoat: 1, clearcoatRoughness: 0.03, depthWrite: false }));
  g.add(shell);
  const fuel = new THREE.Mesh(new RoundedBoxGeometry(26.4, 40, 8.6, 6, 4), new THREE.MeshStandardMaterial({ color: 0x9c5a06, roughness: 0.12, metalness: 0, transparent: true, opacity: 0.94 }));
  fuel.position.y = -11.5; g.add(fuel);
  g.userData.fuel = fuel;
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(10, 20), new THREE.MeshBasicMaterial({ map: fillLineTexture(), transparent: true, depthWrite: false }));
  marks.position.set(-8, 6, 6.05); g.add(marks);
  return g;
}

/* ---------- soft floor shadow ---------- */
let shadowTex;
function getShadowTex() {
  if (!shadowTex) shadowTex = canvasTex(256, 256, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,.32)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }, false);
  return shadowTex;
}
export function shadowPlane(sx, sz) { const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ map: getShadowTex(), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; return m; }


export function applyColour(dev, list, id) {
  const c = list.find((x) => x.id === id);
  dev.userData.mats.body.color.setHex(c.body);
  dev.userData.mats.panel.color.setHex(c.body);
  dev.userData.mats.accent.color.setHex(c.accent);
  dev.userData.markMat.map = wordmarkTexture(c.mark); dev.userData.markMat.needsUpdate = true;
}

export function applyExplode(dev, k) {
  const e = k * k * (3 - 2 * k);
  for (const p of dev.userData.parts) p.position.copy(p.userData.home).addScaledVector(p.userData.explode, e);
}

export const PADDLE = { width: PADDLE_W, length: PADDLE_L, thickness: PADDLE_T };
