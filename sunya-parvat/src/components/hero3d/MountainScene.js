/*
  The home-page mountain fly-through (three.js, WebGL 2 compatible).

  One continuous 14.5 s drone shot: low over a misted valley at dawn, rising
  through a cloud bank, cresting toward the sunlit massif, then settling into a
  still composition behind the hero text.

  Cost control: lighting is baked into vertex colours (no lights, no shadow maps),
  one draw call per terrain layer, two cloud planes, capped device-pixel-ratio,
  and the caller runs the loop only while the hero is visible.
*/
import * as THREE from 'three';
import { makeHeight, makeRange, buildTerrain, cloudPixels, valleyX, PEAK, SUN, smoothstep as smooth } from './terrain';

export const DURATION = 14.5;

// Speed along the path: a held opening breath, movement from 1.6 s, cruise,
// then a long ease-out into the final frame. Integrated into a lookup table.
function makeProgress() {
  const N = 600;
  const table = new Float32Array(N + 1);
  const speed = t => 0.1 + 0.9 * smooth(1.4, 3.0, t) * (1 - smooth(8.4, 14.4, t)) + 0.04 * (1 - smooth(11, 14.5, t));
  let acc = 0;
  for (let i = 1; i <= N; i++) { acc += speed((i / N) * DURATION); table[i] = acc; }
  for (let i = 0; i <= N; i++) table[i] /= acc;
  return t => {
    const f = Math.min(1, Math.max(0, t / DURATION)) * N;
    const i = Math.floor(f);
    return i >= N ? 1 : table[i] + (table[i + 1] - table[i]) * (f - i);
  };
}

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      zenith: { value: new THREE.Color('#182130') },
      upper: { value: new THREE.Color('#3b4557') },
      horizon: { value: new THREE.Color('#8a8789') },
      warm: { value: new THREE.Color('#c98d62') },
      sunDir: { value: new THREE.Vector3(...SUN) },
      lift: { value: 0 },
    },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w;
      }`,
    fragmentShader: `
      uniform vec3 zenith; uniform vec3 upper; uniform vec3 horizon; uniform vec3 warm;
      uniform vec3 sunDir; uniform float lift;
      varying vec3 vDir;
      void main() {
        float y = clamp(vDir.y, 0.0, 1.0);
        vec3 c = mix(horizon, upper, smoothstep(0.0, 0.16, y));
        c = mix(c, zenith, smoothstep(0.14, 0.7, y));
        float toward = max(dot(normalize(vec3(vDir.x, 0.0, vDir.z)), normalize(vec3(sunDir.x, 0.0, sunDir.z))), 0.0);
        c = mix(c, warm, pow(toward, 3.0) * (1.0 - smoothstep(0.0, 0.3, y)) * 0.6);
        c = mix(c, horizon * 0.9, lift);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

// Valley mist: a soft, slowly drifting height fog computed per pixel on the terrain,
// so it has no edges where it meets the slopes (unlike cloud sheets).
const mistUniforms = {
  uTime: { value: 0 },
  uMist: { value: 0.9 },
  uMistColor: { value: new THREE.Color('#a19d99') },
};

function terrainMesh(data) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
  g.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
  g.setIndex(new THREE.BufferAttribute(data.indices, 1));
  g.computeBoundingSphere();
  const m = new THREE.MeshBasicMaterial({ vertexColors: true, fog: true });
  m.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, mistUniforms);
    shader.vertexShader = 'varying vec3 vMistPos;\n' + shader.vertexShader.replace(
      '#include <fog_vertex>',
      '#include <fog_vertex>\n  vMistPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = `varying vec3 vMistPos;
uniform float uTime;
uniform float uMist;
uniform vec3 uMistColor;
float spHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float spNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(spHash(i), spHash(i + vec2(1.0, 0.0)), f.x), mix(spHash(i + vec2(0.0, 1.0)), spHash(i + vec2(1.0, 1.0)), f.x), f.y);
}
` + shader.fragmentShader.replace('#include <fog_fragment>', `
        // fine rock detail per pixel: slope-following streaks on rock, grain on snow,
        // fading with distance so far ranges stay calm
        float lum = dot(gl_FragColor.rgb, vec3(0.333));
        float rock = 1.0 - smoothstep(0.32, 0.62, lum);
        vec2 q = vec2(vMistPos.x + vMistPos.y * 0.35, vMistPos.z - vMistPos.y * 0.25);
        float streak = spNoise(q * vec2(0.055, 0.012)) * 0.6 + spNoise(q * 0.035) * 0.4;
        float grain = spNoise(vMistPos.xz * 0.11) * 0.5 + spNoise(vMistPos.xz * 0.023) * 0.5;
        float near = 1.0 - smoothstep(1800.0, 9000.0, vFogDepth);
        float detail = mix(grain - 0.5, streak - 0.5, rock) * (0.12 + 0.3 * rock) * near;
        gl_FragColor.rgb *= 1.0 + detail;
        float drift = sin(vMistPos.x * 0.0021 + uTime * 0.06) * sin(vMistPos.z * 0.0017 - uTime * 0.045) * 0.5 + 0.5;
        float mist = smoothstep(460.0, 70.0, vMistPos.y + drift * 110.0) * uMist;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uMistColor, mist);
        #include <fog_fragment>`);
  };
  return new THREE.Mesh(g, m);
}

function cloudLayer(size, y, opacity, seed, color, cover) {
  const tex = new THREE.DataTexture(cloudPixels(256, seed, cover), 256, 256, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  const m = new THREE.MeshBasicMaterial({ color, alphaMap: tex, transparent: true, opacity, depthWrite: false, fog: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), m);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.userData = { y, opacity };
  return mesh;
}

export function createMountainScene(host, { quality = 'high' } = {}) {
  const low = quality === 'low';
  const renderer = new THREE.WebGLRenderer({ antialias: !low, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const fogColor = new THREE.Color('#858386');
  const baseDensity = low ? 0.00024 : 0.00022;
  scene.fog = new THREE.FogExp2(fogColor, baseDensity);
  scene.background = fogColor;

  const camera = new THREE.PerspectiveCamera(42, 1, 5, 60000);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(40000, 32, 16), skyMaterial());
  scene.add(sky);

  const height = makeHeight(11);
  const main = buildTerrain({
    height, x0: -5600, x1: 5600, z0: -6600, z1: 4400,
    // 5 octaves: finer detail than the mesh can carry only produces stair-stepped ridges
    nx: low ? 161 : 385, nz: low ? 161 : 385, octaves: 5, shadowSteps: low ? 28 : 52, snowLine: 950,
  });
  scene.add(terrainMesh(main));

  const range = makeRange(23, 1800, 300);
  const far = buildTerrain({
    height: range, x0: -16000, x1: 16000, z0: -13000, z1: -6400,
    nx: low ? 97 : 193, nz: low ? 41 : 61, octaves: 4, shadowSteps: 16, snowLine: 1300, farTint: 0.2,
  });
  scene.add(terrainMesh(far));

  // Valley mist is in the terrain shader; above it, a patchy cloud bank the camera
  // rises through.
  const clouds = [
    cloudLayer(8000, 640, 0.26, 9, '#ddd5cb', -0.2),
    cloudLayer(8000, 690, 0.18, 10, '#e0d8ce', -0.26),
  ];
  clouds.forEach(c => scene.add(c));

  // Camera path: along the valley, then up and over toward the massif.
  const peakTop = height(PEAK.x, PEAK.z);
  const way = [
    [3800, 300], [3350, 330], [2750, 470], [2100, 760], [1450, 1020], [850, 1220], [480, 1320], [300, 1350],
  ].map(([z, y]) => {
    const x = valleyX(z) * 0.9;
    const ground = Math.max(height(x, z), height(x + 90, z), height(x - 90, z));
    return new THREE.Vector3(x, Math.max(y, ground + 150), z);
  });
  const path = new THREE.CatmullRomCurve3(way, false, 'centripetal');
  const progress = makeProgress();

  let portrait = false;
  const resize = () => {
    const w = host.clientWidth || 1; const h = host.clientHeight || 1;
    portrait = h > w;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = portrait ? 60 : 42;
    camera.updateProjectionMatrix();
  };
  resize();

  const pos = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  const look = new THREE.Vector3();
  const target = new THREE.Vector3();
  let scroll = 0;

  function renderAt(t, wall = t) {
    const u = progress(t);
    path.getPointAt(u, pos);
    // aim along the direction of travel at a point 3 km ahead, just above the
    // horizon, the way a drone pilot frames a valley run
    path.getTangentAt(Math.min(1, u + 0.02), ahead);
    ahead.y = 0;
    ahead.normalize().multiplyScalar(3000).add(pos);
    ahead.y = pos.y + 140;
    // after the reveal the camera turns to the massif; it ends framed to the right
    // of the hero text on wide screens, and above it on phones
    if (portrait) target.set(PEAK.x - 80, peakTop * 0.42, PEAK.z);
    else target.set(PEAK.x - 1500, peakTop * 0.5, PEAK.z + 400);
    look.copy(ahead).lerp(target, smooth(5.4, 11.5, t));

    // once settled, a slow camera breath keeps the frame alive
    const settle = smooth(12, 14.5, t);
    pos.x += Math.sin(wall * 0.11) * 16 * settle;
    pos.y += Math.sin(wall * 0.07) * 7 * settle;

    // scrolling away lifts the camera into the haze, which meets the page colour
    pos.y += scroll * 280;
    look.y += scroll * 560;
    scene.fog.density = baseDensity * (1 + scroll * 3.5);
    sky.material.uniforms.lift.value = Math.min(1, scroll * 1.4);

    camera.position.copy(pos);
    camera.lookAt(look);

    mistUniforms.uTime.value = wall;
    clouds.forEach((c, i) => {
      c.position.x = Math.sin(wall * 0.013 + i) * 260 + wall * (6 + i * 3);
      c.position.z = -wall * (5 + i * 2);
      const dist = Math.abs(pos.y - c.userData.y);
      c.material.opacity = c.userData.opacity * smooth(30, 160, dist);
    });

    renderer.render(scene, camera);
  }

  return {
    duration: DURATION,
    renderAt,
    // review aid: camera position and clearance above the ground beneath it
    probe(t) {
      renderAt(t, t);
      return { x: Math.round(pos.x), y: Math.round(pos.y), z: Math.round(pos.z), ground: Math.round(height(pos.x, pos.z)), look: [Math.round(look.x), Math.round(look.y), Math.round(look.z)] };
    },
    setScroll(p) { scroll = Math.min(1, Math.max(0, p)); },
    resize,
    dispose() {
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { if (o.material.alphaMap) o.material.alphaMap.dispose(); o.material.dispose(); }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    },
  };
}
