// A self-contained Three.js stage for the scroll-driven exploded view.
// Loaded on demand (dynamic import) so the main page bundle stays light.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildDevice, applyColour, applyExplode, COLOURS } from './model';

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function initStage(canvas, { kind = 'pro', colour = 'black' } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(120, 260, 220);
  const rim = new THREE.DirectionalLight(0xbfe9e4, 3.0);
  rim.position.set(-220, 80, -200);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.25));

  const device = buildDevice(kind);
  applyColour(device, COLOURS[kind], colour);
  // centre the device on the origin (body + paddle)
  device.position.y = -(device.userData.H / 2 + device.userData.bottom) / 2;
  scene.add(device);

  const camera = new THREE.PerspectiveCamera(26, 1, 1, 5000);
  let progress = 0;
  let shown = -1;
  let raf = 0;
  let visible = true;

  function place() {
    // 0 → 0.35: pull apart. Camera orbits from three-quarter front to a side view as it explodes.
    const e = smooth(0.04, 0.4, progress);
    applyExplode(device, e);
    const wide = camera.aspect >= 0.8;
    const az = 0.45 + 0.55 * e + 0.15 * smooth(0.4, 1, progress);
    const el = 0.16 - 0.04 * e;
    const d = wide ? 420 + 150 * e : 430 + 230 * e;
    const target = new THREE.Vector3(0, 0, 55 * e);
    camera.position.set(target.x + Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d, target.z + Math.cos(az) * Math.cos(el) * d);
    camera.lookAt(target);
  }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole device in frame on tall phone screens
    camera.fov = camera.aspect < 0.8 ? 38 : 26;
    camera.updateProjectionMatrix();
    shown = -1;
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    if (!visible || shown === progress) return;
    shown = progress;
    place();
    renderer.render(scene, camera);
  }

  // Redraw text textures (screen, wordmark) once web fonts are ready.
  document.fonts?.ready.then(() => {
    applyColour(device, COLOURS[kind], colour);
    shown = -1;
  });

  resize();
  loop();

  return {
    setProgress(p) {
      progress = Math.round(Math.min(1, Math.max(0, p)) * 1000) / 1000;
    },
    setVisible(v) {
      visible = v;
      if (v) shown = -1;
    },
    resize,
    dispose() {
      cancelAnimationFrame(raf);
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
