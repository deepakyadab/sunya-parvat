/*
  Procedural Himalayan terrain for the home-page fly-through.

  Plain math (no three.js): a seeded gradient-noise field shaped into ridged,
  domain-warped ranges; a winding valley the camera follows; one broad sunlit
  massif at the far end; and lighting baked into vertex colours once (low sunrise
  sun, cast shadows marched across the heightfield, blue sky fill, hollow
  occlusion, snow on high gentle slopes). At runtime the GPU only draws coloured
  triangles, which keeps the scene light enough for phones.
*/

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeNoise(seed = 7) {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const gx = new Float32Array(256);
  const gy = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const a = rand() * Math.PI * 2; gx[i] = Math.cos(a); gy[i] = Math.sin(a); }
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  return function noise(x, y) {
    const xi = Math.floor(x); const yi = Math.floor(y);
    const xf = x - xi; const yf = y - yi;
    const X = xi & 255; const Y = yi & 255;
    const g = (ix, iy, dx, dy) => { const h = perm[(ix & 255) + perm[iy & 255]]; return gx[h] * dx + gy[h] * dy; };
    const u = fade(xf); const v = fade(yf);
    const a = g(X, Y, xf, yf) * (1 - u) + g(X + 1, Y, xf - 1, yf) * u;
    const b = g(X, Y + 1, xf, yf - 1) * (1 - u) + g(X + 1, Y + 1, xf - 1, yf - 1) * u;
    return a * (1 - v) + b * v; // about [-0.7, 0.7]
  };
}

export const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ---------- world shape ---------- */

// The valley the camera follows winds gently into the range.
export const valleyX = z => 280 * Math.sin(z / 1100) + 110 * Math.sin(z / 430 + 1.3);
// The focal massif at the far end of the valley.
export const PEAK = { x: 260, z: -4400, h: 2100, r: 1800 };

function ridgedFn(n, baseFreq) {
  return (x, z, oct) => {
    let f = baseFreq; let a = 1; let sum = 0; let norm = 0; let w = 1;
    for (let o = 0; o < oct; o++) {
      let r = 1 - Math.abs(n(x * f, z * f) * 1.4);
      r = r * r;
      sum += r * a * w;
      norm += a;
      w = Math.min(1, r * 1.5);     // crests carry detail, valleys stay soft
      f *= 2.02; a *= 0.48;
    }
    return sum / norm;
  };
}

export function makeHeight(seed = 11) {
  const n1 = makeNoise(seed);
  const n2 = makeNoise(seed + 101);
  const nw = makeNoise(seed + 202);
  const ridged = ridgedFn(n1, 1 / 2600);
  const detail = (x, z) => {
    let f = 1 / 260; let a = 1; let s = 0;
    for (let o = 0; o < 3; o++) { s += n2(x * f, z * f) * a; f *= 2.1; a *= 0.5; }
    return s;
  };
  return function height(x, z, oct = 6) {
    // domain warp bends the ridges so they read as eroded, not as a grid of noise
    const wx = x + nw(x / 1800, z / 1800) * 520;
    const wz = z + nw(x / 1800 + 5.2, z / 1800 + 1.7) * 520;
    const d = Math.abs(x - valleyX(z));
    const wall = smoothstep(160, 1350, d);                 // 0 on the valley floor, 1 high on the sides
    const rise = smoothstep(3200, -3000, z);               // ranges grow toward the far end
    let h = 30 + ridged(wx, wz, oct) * (560 + 1100 * rise) * (0.12 + 0.88 * wall);
    h += detail(x, z) * (10 + 34 * wall);
    // the massif: a broad pyramid whose faces keep the ridged texture
    const dx = x - PEAK.x; const dz = z - PEAK.z;
    const pd = Math.sqrt(dx * dx + dz * dz) / PEAK.r;
    if (pd < 1) {
      const cone = 1 - pd;
      const face = 0.72 + 0.28 * ridged(wx * 2.3, wz * 2.3, 4);
      h += PEAK.h * Math.pow(cone, 1.2) * face;
    }
    return h;
  };
}

/** Distant ranges: ridged crests with no valley, seen as layered silhouettes in haze. */
export function makeRange(seed = 23, amp = 2200, base = 200) {
  const n = makeNoise(seed);
  const ridged = ridgedFn(n, 1 / 5200);
  return (x, z, oct = 5) => base + ridged(x, z, oct) * amp;
}

/* ---------- geometry + baked lighting ---------- */

export const SUN = (() => {
  // low sunrise sun, from the right and slightly behind the camera
  const v = [0.8, 0.2, 0.52];
  const l = Math.hypot(...v);
  return v.map(c => c / l);
})();

const SNOW = [0.84, 0.88, 0.95];
const ROCK = [0.1, 0.1, 0.1];
const ROCK_WARM = [0.14, 0.12, 0.11];
const FOREST = [0.04, 0.05, 0.04];
const SUN_COL = [1.0, 0.8, 0.64];    // low dawn light: warm on sunlit snow, not orange
const SKY_COL = [0.3, 0.36, 0.47];   // cool blue fill in shade

export function buildTerrain({ height, x0, x1, z0, z1, nx, nz, octaves = 6, shadowSteps = 48, snowLine = 1050, farTint = 0, smoothPasses = 1 }) {
  const count = nx * nz;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const hs = new Float32Array(count);
  const dx = (x1 - x0) / (nx - 1);
  const dz = (z1 - z0) / (nz - 1);

  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const x = x0 + i * dx; const z = z0 + j * dz;
      const h = height(x, z, octaves);
      const k = j * nx + i;
      hs[k] = h;
      pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z;
    }
  }
  // One gentle smoothing pass: crests sharper than the grid otherwise show as
  // stair-steps along ridge lines.
  if (smoothPasses > 0) {
    const tmp = new Float32Array(count);
    for (let pass = 0; pass < smoothPasses; pass++) {
      for (let j = 0; j < nz; j++) {
        for (let i = 0; i < nx; i++) {
          let s = 0; let w = 0;
          for (let dj = -1; dj <= 1; dj++) {
            for (let di = -1; di <= 1; di++) {
              const ii = Math.min(nx - 1, Math.max(0, i + di)); const jj = Math.min(nz - 1, Math.max(0, j + dj));
              const wt = di === 0 && dj === 0 ? 4 : (di === 0 || dj === 0 ? 2 : 1);
              s += hs[jj * nx + ii] * wt; w += wt;
            }
          }
          tmp[j * nx + i] = s / w;
        }
      }
      hs.set(tmp);
    }
    for (let k = 0; k < count; k++) pos[k * 3 + 1] = hs[k];
  }
  const H = (i, j) => hs[Math.min(nz - 1, Math.max(0, j)) * nx + Math.min(nx - 1, Math.max(0, i))];
  const sample = (x, z) => {
    const fi = (x - x0) / dx; const fj = (z - z0) / dz;
    if (fi < 0 || fj < 0 || fi > nx - 1 || fj > nz - 1) return -Infinity;
    const i = Math.floor(fi); const j = Math.floor(fj); const u = fi - i; const v = fj - j;
    return (H(i, j) * (1 - u) + H(i + 1, j) * u) * (1 - v) + (H(i, j + 1) * (1 - u) + H(i + 1, j + 1) * u) * v;
  };
  const stepLen = Math.max(dx, dz) * 1.4;
  let maxH = 0;
  for (let k = 0; k < count; k++) if (hs[k] > maxH) maxH = hs[k];

  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      const h = hs[k];
      let nxv = (H(i - 1, j) - H(i + 1, j)) / (2 * dx);
      let nzv = (H(i, j - 1) - H(i, j + 1)) / (2 * dz);
      let nyv = 1;
      const nl = Math.hypot(nxv, nyv, nzv);
      nxv /= nl; nyv /= nl; nzv /= nl;

      // soft cast shadow: march toward the sun; terrain above the ray blocks it
      let lit = 1;
      const x = pos[k * 3]; const z = pos[k * 3 + 2];
      for (let s = 1; s <= shadowSteps; s++) {
        const t = s * stepLen;
        const ground = sample(x + SUN[0] * t, z + SUN[2] * t);
        if (ground === -Infinity) break;
        const over = ground - (h + SUN[1] * t);
        if (over > 0) { lit = Math.max(0, lit - over / 130); if (lit <= 0) break; }
      }
      // first light catches the heights; low ground stays in blue shade
      const reach = 0.5 + 0.5 * smoothstep(maxH * 0.15, maxH * 0.75, h);
      const diffuse = Math.max(0, nxv * SUN[0] + nyv * SUN[1] + nzv * SUN[2]) * lit * reach;

      const avg = (H(i - 2, j) + H(i + 2, j) + H(i, j - 2) + H(i, j + 2)) / 4;
      const ao = Math.min(1, Math.max(0.4, 0.76 + (h - avg) / 120));

      const forest = 1 - smoothstep(140, 480, h);
      const snowAmt = smoothstep(snowLine - 160, snowLine + 180, h + (nyv - 0.62) * 600) * smoothstep(0.4, 0.62, nyv);
      const warm = smoothstep(0.15, 0.7, diffuse);
      for (let c = 0; c < 3; c++) {
        const rock = ROCK[c] * (1 - warm * 0.5) + ROCK_WARM[c] * warm * 0.5;
        const ground = rock * (1 - forest) + FOREST[c] * forest;
        const base = ground * (1 - snowAmt) + SNOW[c] * snowAmt;
        const ambient = SKY_COL[c] * (0.5 + 0.5 * nyv) * ao;
        const sun = SUN_COL[c] * diffuse * 2.1;
        let v = base * (ambient + sun);
        v = v * (1 - farTint) + SKY_COL[c] * 0.7 * farTint;
        col[k * 3 + c] = v;
      }
    }
  }

  // Soften the baked light/snow field: abrupt changes between neighbouring vertices
  // otherwise show as saw-teeth along ridges.
  const blurred = new Float32Array(col.length);
  {
    const src = col;
    const dst = blurred;
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        for (let c = 0; c < 3; c++) {
          let s = 0; let w = 0;
          for (let dj = -1; dj <= 1; dj++) {
            for (let di = -1; di <= 1; di++) {
              const ii = Math.min(nx - 1, Math.max(0, i + di)); const jj = Math.min(nz - 1, Math.max(0, j + dj));
              const wt = di === 0 && dj === 0 ? 4 : (di === 0 || dj === 0 ? 2 : 1);
              s += src[(jj * nx + ii) * 3 + c] * wt; w += wt;
            }
          }
          dst[(j * nx + i) * 3 + c] = s / w;
        }
      }
    }
    // keep half of the original contrast
    for (let k = 0; k < col.length; k++) col[k] = col[k] * 0.45 + blurred[k] * 0.55;
  }

  const idx = new Uint32Array((nx - 1) * (nz - 1) * 6);
  let p = 0;
  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i; const b = a + 1; const c = a + nx; const d = c + 1;
      idx[p++] = a; idx[p++] = c; idx[p++] = b;
      idx[p++] = b; idx[p++] = c; idx[p++] = d;
    }
  }
  return { positions: pos, colors: col, indices: idx, maxHeight: maxH };
}

/**
 * Soft cloud cover as pixels. three.js alphaMap reads the GREEN channel, so the
 * cover is written into RGB. It fades out toward the edges so a layer has no border.
 */
export function cloudPixels(size = 256, seed = 5, cover = 0) {
  const n = makeNoise(seed);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let f = 4 / size; let a = 1; let s = 0; let norm = 0;
      for (let o = 0; o < 5; o++) {
        s += n(x * f + o * 31.7, y * f * 1.8 + o * 11.3) * a; // stretched into long banks
        norm += a; f *= 2.05; a *= 0.5;
      }
      const ex = x / size - 0.5; const ey = y / size - 0.5;
      const edge = 1 - smoothstep(0.28, 0.5, Math.sqrt(ex * ex + ey * ey));
      const v = Math.round(smoothstep(-0.06 - cover, 0.32 - cover, s / norm) * edge * 255);
      const k = (y * size + x) * 4;
      data[k] = v; data[k + 1] = v; data[k + 2] = v; data[k + 3] = 255;
    }
  }
  return data;
}
