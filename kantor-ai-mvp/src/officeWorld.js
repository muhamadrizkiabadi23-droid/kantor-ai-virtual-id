import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/**
 * officeWorld.js — KANTOR AI ID.
 * SATU LANTAI luas, tata letak rapi 3x3, fasilitas lengkap & estetik:
 * masjid, kedai kopi, studio, ruang rapat, gym, lounge, pantry, workspace 48 meja.
 * Material PBR ringan + instanced mesh + merged geometry untuk performa.
 */

export const FLOOR_Y = { 1: 0 };
export const BUILDING = { minX: -28, maxX: 28, minZ: -20, maxZ: 20, wallHeight: 3.4 };
export const WALL = "#f5f0e8";
export const WALL_TOP = "#e8e0d0";

/**
 * 3x3 zone grid — rapi, simetris, koridor 7m di antara kolom.
 */
export const ZONES = {
  1: {
    masjid: { label: "Masjid & Musala", cx: -21, cz: -13, w: 14, d: 12 },
    meeting: { label: "Ruang Rapat", cx: 0, cz: -13, w: 14, d: 12 },
    kopi: { label: "Kedai Kopi", cx: 21, cz: -13, w: 14, d: 12 },
    studio: { label: "Studio Konten", cx: -21, cz: 0, w: 14, d: 14 },
    workspace: { label: "Workspace 48 Meja", cx: 0, cz: 0, w: 14, d: 14 },
    client: { label: "Ruang Klien & Review", cx: 21, cz: 0, w: 14, d: 14 },
    gym: { label: "Gym Mini", cx: -21, cz: 13, w: 14, d: 12 },
    lounge: { label: "Lounge & Taman", cx: 0, cz: 13, w: 14, d: 12 },
    pantry: { label: "Pantry & Dapur", cx: 21, cz: 13, w: 14, d: 12 }
  }
};

export const AGENT_HOMES = {
  naga: { area: "meeting", x: 0, z: -13 },
  arif: { area: "client", x: 21, z: 1.4 },
  raka: { area: "workspace", x: -2.6, z: -3.6 },
  kirana: { area: "meeting", x: 3, z: -13 },
  nadia: { area: "studio", x: -21, z: -4 },
  dimas: { area: "studio", x: -18, z: -4 },
  bima: { area: "workspace", x: -4.4, z: -3.6 },
  dewi: { area: "studio", x: -24, z: -4 },
  gilang: { area: "client", x: 21, z: 5 },
  yoga: { area: "client", x: 18, z: 5 },
  bayu: { area: "client", x: 24, z: 5 },
  sari: { area: "client", x: 21, z: 4 }
};

/**
 * 48 workstation: 4 blok x 12 meja (4 kolom x 3 baris) di workspace.
 */
export const DESK_LAYOUT = (() => {
  const desks = [];
  const blocks = [
    { cx: -3.5, cz: -3.5 },
    { cx: 3.5, cz: -3.5 },
    { cx: -3.5, cz: 3.5 },
    { cx: 3.5, cz: 3.5 }
  ];
  for (const b of blocks) {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        desks.push({
          x: b.cx - 2.7 + col * 1.8,
          z: b.cz - 2 + row * 2,
          kind: "desk"
        });
      }
    }
  }
  return desks;
})();

export const PALETTE = {
  ink: 0x3a3530,
  wood: 0xc8b8a0,
  oak: 0xd8c8b0,
  lightWood: 0xe8dcc8,
  cream: 0xf5f0e8,
  red: 0xc84840,
  white: 0xfaf8f4,
  green: 0x88c878,
  blue: 0x68a8e8,
  gold: 0xe8c860,
  glass: 0xa8d8e8,
  water: 0x88c8f8,
  leaf: 0x88d878,
  concrete: 0xe8e0d8,
  darkWood: 0x987858,
  slate: 0xa8a098,
  sofa: 0xd8b898,
  sofaLight: 0xe8d0b8,
  rug: 0xd8b888,
  poolTile: 0x98d8f8,
  grass: 0xa8e888,
  carpet: 0xe0d8d0,
  rubber: 0xb8b0a8,
  curtain: 0xf0e8e0,
  skin: 0xf0d8c0,
  hair: 0x685038
};

/* ------------------------------------------------------------------ */
/* Helper geometri & tekstur                                           */
/* ------------------------------------------------------------------ */

const geoCache = new Map();

function safeRadius(w, h, d, r) {
  const smallest = Math.min(w, h, d);
  return Math.max(0.005, Math.min(r, smallest / 2 - 0.002));
}

export function rbox(w, h, d, color, radius = 0.04, segments = 2) {
  const r = safeRadius(w, h, d, radius);
  const key = `r:${w.toFixed(3)},${h.toFixed(3)},${d.toFixed(3)},${r.toFixed(3)},${color}`;
  let geo = geoCache.get(key);
  if (!geo) {
    geo = new RoundedBoxGeometry(w, h, d, segments, r);
    paint(geo, color);
    geoCache.set(key, geo);
  }
  return geo;
}

export function box(w, h, d, color) {
  const key = `b:${w.toFixed(3)},${h.toFixed(3)},${d.toFixed(3)},${color}`;
  let geo = geoCache.get(key);
  if (!geo) {
    geo = new THREE.BoxGeometry(w, h, d);
    paint(geo, color);
    geoCache.set(key, geo);
  }
  return geo;
}

export function cyl(rt, rb, h, seg, color) {
  const key = `c:${rt.toFixed(3)},${rb.toFixed(3)},${h.toFixed(3)},${seg},${color}`;
  let geo = geoCache.get(key);
  if (!geo) {
    geo = new THREE.CylinderGeometry(rt, rb, h, seg);
    paint(geo, color);
    geoCache.set(key, geo);
  }
  return geo;
}

export function sph(r, ws, hs, color) {
  const key = `s:${r.toFixed(3)},${ws},${hs},${color}`;
  let geo = geoCache.get(key);
  if (!geo) {
    geo = new THREE.SphereGeometry(r, ws, hs);
    paint(geo, color);
    geoCache.set(key, geo);
  }
  return geo;
}

function paint(geometry, hex) {
  const color = new THREE.Color(hex);
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function mergeParts(parts) {
  const valid = parts.filter((g) => g && g.attributes && g.attributes.position && g.attributes.position.count > 0);
  if (!valid.length) return null;
  return mergeGeometries(valid, false);
}

function makeCanvas(size, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function woodTexture() {
  return makeCanvas(256, (ctx, s) => {
    const rows = 8;
    const plank = s / rows;
    for (let row = 0; row < rows; row += 1) {
      const shade = 168 + Math.floor(Math.random() * 46);
      ctx.fillStyle = `rgb(${shade}, ${Math.floor(shade * 0.7)}, ${Math.floor(shade * 0.46)})`;
      ctx.fillRect(0, row * plank, s, plank);
      ctx.strokeStyle = "rgba(88,58,38,.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(-2, row * plank, s + 4, plank);
      for (let i = 0; i < 3; i += 1) {
        const y = row * plank + 4 + Math.random() * (plank - 8);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(s * 0.3, y + 3, s * 0.6, y - 3, s, y + 2);
        ctx.stroke();
      }
      const joint = Math.random() * s;
      ctx.fillStyle = "rgba(88,58,38,.4)";
      ctx.fillRect(joint, row * plank, 2, plank);
    }
  });
}

function carpetTexture(base = "#8d9aa8") {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 5200; i += 1) {
      const shade = 120 + Math.floor(Math.random() * 80);
      ctx.fillStyle = `rgba(${shade}, ${shade + 6}, ${shade + 14}, .5)`;
      ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    }
    ctx.strokeStyle = "rgba(70,82,96,.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= s; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(s, i); ctx.stroke();
    }
  });
}

function tileTexture(base = "#cfe8ec") {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);
    const step = s / 8;
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        const shade = 188 + Math.floor(Math.random() * 30);
        ctx.fillStyle = `rgb(${shade - 30}, ${shade}, ${shade + 6})`;
        ctx.fillRect(x * step + 1, y * step + 1, step - 2, step - 2);
      }
    }
  });
}

function grassTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = "#6fa86f";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 6000; i += 1) {
      const g = 120 + Math.floor(Math.random() * 70);
      ctx.fillStyle = `rgba(${Math.floor(g * 0.55)}, ${g}, ${Math.floor(g * 0.5)}, .55)`;
      ctx.fillRect(Math.random() * s, Math.random() * s, 2, 3);
    }
  });
}

function rugTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = "#c96f5c";
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "rgba(255,240,220,.5)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, 20 + i * 22, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,240,220,.35)";
    for (let i = 0; i < 40; i += 1) {
      const a = (i / 40) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(s / 2 + Math.cos(a) * 90, s / 2 + Math.sin(a) * 90, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function prayRugTexture() {
  return makeCanvas(128, (ctx, s) => {
    ctx.fillStyle = "#3f6b5e";
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "rgba(240,230,200,.75)";
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, s - 12, s - 12);
    ctx.beginPath();
    ctx.moveTo(s / 2, 18);
    ctx.lineTo(s - 18, s / 2);
    ctx.lineTo(s / 2, s - 18);
    ctx.lineTo(18, s / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "rgba(240,230,200,.35)";
    ctx.fillRect(s / 2 - 8, s / 2 - 8, 16, 16);
  });
}

function menuBoardTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = "#2f353d";
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "#e1aa5d";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, s - 16, s - 16);
    ctx.fillStyle = "#f5ebd8";
    ctx.font = "bold 26px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("KEDAI KOPI", s / 2, 44);
    ctx.font = "16px Georgia, serif";
    ctx.fillStyle = "#d9cdb8";
    const items = ["Kopi Susu", "Es Kopi Aren", "Kopi Tubruk", "Cappuccino", "Matcha Latte", "Roti Bakar"];
    items.forEach((t, i) => ctx.fillText(t, s / 2, 86 + i * 26));
  });
}

/* ------------------------------------------------------------------ */
/* NavGrid — A* untuk pergerakan NPC                                   */
/* ------------------------------------------------------------------ */

export class NavGrid {
  constructor(minX, maxX, minZ, maxZ, cell = 0.5) {
    this.minX = minX;
    this.minZ = minZ;
    this.cell = cell;
    this.cols = Math.max(1, Math.ceil((maxX - minX) / cell));
    this.rows = Math.max(1, Math.ceil((maxZ - minZ) / cell));
    this.blocked = new Uint8Array(this.cols * this.rows);
  }
  index(cx, cz) { return cz * this.cols + cx; }
  toCell(x, z) {
    return {
      cx: Math.max(0, Math.min(this.cols - 1, Math.floor((x - this.minX) / this.cell))),
      cz: Math.max(0, Math.min(this.rows - 1, Math.floor((z - this.minZ) / this.cell)))
    };
  }
  toWorld(cx, cz) {
    return { x: this.minX + (cx + 0.5) * this.cell, z: this.minZ + (cz + 0.5) * this.cell };
  }
  blockRect(x, z, w, d) {
    const a = this.toCell(x - w / 2, z - d / 2);
    const b = this.toCell(x + w / 2, z + d / 2);
    for (let cz = a.cz; cz <= b.cz; cz += 1) {
      for (let cx = a.cx; cx <= b.cx; cx += 1) this.blocked[this.index(cx, cz)] = 1;
    }
  }
  blockCircle(x, z, r) {
    const a = this.toCell(x - r, z - r);
    const b = this.toCell(x + r, z + r);
    for (let cz = a.cz; cz <= b.cz; cz += 1) {
      for (let cx = a.cx; cx <= b.cx; cx += 1) {
        const p = this.toWorld(cx, cz);
        if (Math.hypot(p.x - x, p.z - z) <= r) this.blocked[this.index(cx, cz)] = 1;
      }
    }
  }
  isBlocked(x, z) {
    const c = this.toCell(x, z);
    return !!this.blocked[this.index(c.cx, c.cz)];
  }
  heuristic(a, b) {
    const dx = Math.abs(a.cx - b.cx);
    const dz = Math.abs(a.cz - b.cz);
    return Math.max(dx, dz) + 0.4142 * Math.min(dx, dz);
  }
  lineOfSight(a, b) {
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / (this.cell * 0.45)));
    for (let i = 1; i < steps; i += 1) {
      const t = i / steps;
      if (this.isBlocked(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)) return false;
    }
    return true;
  }
  smooth(points) {
    if (points.length < 3) return points;
    const result = [points[0]];
    let anchor = 0;
    while (anchor < points.length - 1) {
      let next = points.length - 1;
      while (next > anchor + 1 && !this.lineOfSight(points[anchor], points[next])) next -= 1;
      result.push(points[next]);
      anchor = next;
    }
    return result;
  }
  nearestOpen(cx, cz) {
    for (let radius = 1; radius < 14; radius += 1) {
      for (let dz = -radius; dz <= radius; dz += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== radius) continue;
          const nx = cx + dx;
          const nz = cz + dz;
          if (nx < 0 || nz < 0 || nx >= this.cols || nz >= this.rows) continue;
          if (!this.blocked[this.index(nx, nz)]) return { cx: nx, cz: nz };
        }
      }
    }
    return null;
  }
  findPath(start, end) {
    const s = this.toCell(start.x, start.z);
    const e = this.toCell(end.x, end.z);
    if (this.blocked[this.index(e.cx, e.cz)]) {
      const open = this.nearestOpen(e.cx, e.cz);
      if (!open) return null;
      return this.findPath(start, this.toWorld(open.cx, open.cz));
    }
    const startIdx = this.index(s.cx, s.cz);
    const endIdx = this.index(e.cx, e.cz);
    const open = [startIdx];
    const g = new Map([[startIdx, 0]]);
    const f = new Map([[startIdx, this.heuristic(s, e)]]);
    const came = new Map();
    const closed = new Set();
    let guard = 0;
    while (open.length && guard < 6000) {
      guard += 1;
      let best = 0;
      for (let i = 1; i < open.length; i += 1) {
        if ((f.get(open[i]) ?? Infinity) < (f.get(open[best]) ?? Infinity)) best = i;
      }
      const current = open.splice(best, 1)[0];
      if (current === endIdx) {
        const cells = [];
        let node = current;
        while (node !== undefined) {
          cells.push({ cx: node % this.cols, cz: Math.floor(node / this.cols) });
          node = came.get(node);
        }
        cells.reverse();
        return this.smooth(cells.map((c) => this.toWorld(c.cx, c.cz)));
      }
      closed.add(current);
      const cx = current % this.cols;
      const cz = Math.floor(current / this.cols);
      for (let dz = -1; dz <= 1; dz += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dz) continue;
          const nx = cx + dx;
          const nz = cz + dz;
          if (nx < 0 || nz < 0 || nx >= this.cols || nz >= this.rows) continue;
          const nIdx = this.index(nx, nz);
          if (this.blocked[nIdx] || closed.has(nIdx)) continue;
          if (dx && dz && (this.blocked[this.index(cx + dx, cz)] || this.blocked[this.index(cx, cz + dz)])) continue;
          const cost = g.get(current) + (dx && dz ? 1.4142 : 1);
          if (cost < (g.get(nIdx) ?? Infinity)) {
            g.set(nIdx, cost);
            f.set(nIdx, cost + this.heuristic({ cx: nx, cz: nz }, e));
            came.set(nIdx, current);
            if (!open.includes(nIdx)) open.push(nIdx);
          }
        }
      }
    }
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* InstancePool — gambar banyak objek dengan 1 draw call               */
/* ------------------------------------------------------------------ */

export class InstancePool {
  constructor(material, geometry) {
    this.material = material;
    this.geometry = geometry;
    this.items = [];
  }
  add(x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rz = 0, rx = 0) {
    this.items.push({ x, y, z, ry, sx, sy, sz, rz, rx });
  }
  build(parent, opts = {}) {
    const { castShadow = true, receiveShadow = true } = opts;
    if (!this.items.length) return null;
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, this.items.length);
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    this.items.forEach((t, i) => {
      euler.set(t.rx, t.ry, t.rz);
      quat.setFromEuler(euler);
      pos.set(t.x, t.y, t.z);
      scale.set(t.sx, t.sy, t.sz);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    parent.add(mesh);
    return mesh;
  }
}

/* ------------------------------------------------------------------ */
/* Material                                                            */
/* ------------------------------------------------------------------ */

function buildMaterials() {
  const wood = woodTexture();
  const woodMat = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55, metalness: 0.04, color: 0xd8c8b0 });
  const carpet = carpetTexture();
  const carpetMat = new THREE.MeshStandardMaterial({ map: carpet, roughness: 0.95, metalness: 0, color: 0xe8e0d8 });
  const tile = tileTexture();
  const tileMat = new THREE.MeshStandardMaterial({ map: tile, roughness: 0.32, metalness: 0.02, color: 0xf0e8e0 });
  const grass = grassTexture();
  const grassMat = new THREE.MeshStandardMaterial({ map: grass, roughness: 0.95, metalness: 0, color: 0xa8e888 });
  const rug = rugTexture();
  const rugMat = new THREE.MeshStandardMaterial({ map: rug, roughness: 0.92, metalness: 0, color: 0xd8b888 });
  const prayRug = prayRugTexture();
  const prayRugMat = new THREE.MeshStandardMaterial({ map: prayRug, roughness: 0.9, metalness: 0, color: 0xc8b8a0 });
  const menu = menuBoardTexture();
  const menuMat = new THREE.MeshStandardMaterial({ map: menu, roughness: 0.85, metalness: 0, color: 0xd8c8b0 });
  const vertexMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.05 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xa8d8e8, transparent: true, opacity: 0.26, roughness: 0.08, metalness: 0.1, side: THREE.DoubleSide
  });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xa8a098, roughness: 0.35, metalness: 0.75 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x888078, roughness: 0.45, metalness: 0.6 });
  const fabricMat = new THREE.MeshStandardMaterial({ color: 0xd8b898, roughness: 0.95, metalness: 0 });
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x2a3a4a, emissive: 0x4a8ac8, emissiveIntensity: 0.6, roughness: 0.25, metalness: 0.1
  });
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0xf5f0e8, emissive: 0xfff2cf, emissiveIntensity: 0.9, roughness: 0.4, metalness: 0
  });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x88d878, roughness: 0.85, metalness: 0 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x88c8f8, transparent: true, opacity: 0.72, roughness: 0.12, metalness: 0.05
  });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9, metalness: 0 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d8, roughness: 0.85, metalness: 0 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0xb8b0a8, roughness: 0.95, metalness: 0 });
  return {
    woodMat, carpetMat, tileMat, grassMat, rugMat, prayRugMat, menuMat, vertexMat, glassMat, metalMat,
    darkMetal, fabricMat, screenMat, ledMat, leafMat, waterMat, wallMat, concreteMat, rubberMat
  };
}

/* ------------------------------------------------------------------ */
/* Helper mebel & dekor                                                 */
/* ------------------------------------------------------------------ */

function mesh(geo, mat, x = 0, y = 0, z = 0, ry = 0, parent = null, shadow = false) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.castShadow = shadow;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

/** Meja kerja + kursi + monitor (1 workstation). */
function buildDeskCluster(M, parent, x, z, ry, world) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);

  mesh(rbox(1.8, 0.07, 1.0, 0xd9c3a0, 0.02), M.vertexMat, 0, 0.74, 0, 0, g);
  for (const dx of [-0.8, 0.8]) {
    for (const dz of [-0.4, 0.4]) {
      mesh(box(0.07, 0.72, 0.07, 0x644832), M.vertexMat, dx, 0.36, dz, 0, g, false);
    }
  }
  mesh(box(0.6, 0.36, 0.03, 0x2b323a), M.vertexMat, 0, 1.06, -0.28, 0, g, false);
  mesh(box(0.52, 0.28, 0.012, 0x3d6a8a), M.screenMat, 0, 1.06, -0.26, 0, g, false);
  mesh(box(0.1, 0.18, 0.05, 0x3c454e), M.vertexMat, 0, 0.85, -0.28, 0, g, false);
  mesh(box(0.46, 0.02, 0.16, 0xe8e2d4), M.vertexMat, 0, 0.79, 0.08, 0, g, false);
  mesh(box(0.09, 0.02, 0.13, 0xe8e2d4), M.vertexMat, 0.38, 0.79, 0.08, 0, g, false);
  mesh(sph(0.055, 6, 5, 0x558568), M.vertexMat, -0.62, 0.86, -0.28, 0, g, false);

  const chair = new THREE.Group();
  chair.position.set(0, 0, 0.92);
  chair.rotation.y = Math.PI;
  g.add(chair);
  mesh(rbox(0.55, 0.07, 0.52, 0x3f4a55, 0.02), M.vertexMat, 0, 0.46, 0, 0, chair, false);
  mesh(rbox(0.55, 0.55, 0.07, 0x3f4a55, 0.02), M.vertexMat, 0, 0.75, -0.24, 0, chair, false);
  for (const dx of [-0.22, 0.22]) {
    for (const dz of [-0.2, 0.2]) {
      mesh(cyl(0.03, 0.03, 0.44, 6, 0x3c454e), M.vertexMat, dx, 0.22, dz, 0, chair, false);
    }
  }
  world.nav.blockRect(x, z, 1.9, 1.5);
}

/** Pohon / tanaman hias — dimasukkan ke InstancePool global (1 draw call per bagian). */
function buildPlant(M, parent, x, z, scale = 1) {
  if (!parent.userData.plantPools) {
    parent.userData.plantPools = {
      trunk: new InstancePool(M.vertexMat, cyl(0.14, 0.18, 0.32, 8, 0x8a5a3b)),
      leaf1: new InstancePool(M.vertexMat, sph(0.34, 8, 6, 0x4e8d57)),
      leaf2: new InstancePool(M.vertexMat, sph(0.26, 8, 6, 0x5c9d63)),
      leaf3: new InstancePool(M.vertexMat, sph(0.2, 8, 6, 0x3f7a4c))
    };
  }
  const p = parent.userData.plantPools;
  p.trunk.add(x, 0.16 * scale, z, 0, scale, scale, scale);
  p.leaf1.add(x, 0.5 * scale, z, 0, scale, scale, scale);
  p.leaf2.add(x + 0.16 * scale, 0.72 * scale, z + 0.06 * scale, 0, scale, scale, scale);
  p.leaf3.add(x - 0.15 * scale, 0.78 * scale, z - 0.08 * scale, 0, scale, scale, scale);
}

function flushPlantPools(parent) {
  const p = parent.userData.plantPools;
  if (!p) return;
  for (const pool of Object.values(p)) pool.build(parent, { castShadow: false, receiveShadow: false });
  parent.userData.plantPools = null;
}

/** Lampu gantung — dimasukkan ke InstancePool global. */
function buildHangingLamp(M, parent, world, x, z, y = 2.6, warm = 0xffe6b8) {
  if (!parent.userData.lampPools) {
    parent.userData.lampPools = {
      rod: new InstancePool(M.vertexMat, cyl(0.02, 0.02, 0.5, 4, 0x3c454e)),
      shade: new InstancePool(M.vertexMat, cyl(0.28, 0.16, 0.22, 12, 0x3c454e)),
      bulb: new InstancePool(M.ledMat, sph(0.1, 8, 6, warm))
    };
  }
  const p = parent.userData.lampPools;
  p.rod.add(x, y + 0.25, z);
  p.shade.add(x, y, z);
  p.bulb.add(x, y - 0.1, z);
  world.lampMaterials.push(M.ledMat);
}

function flushLampPools(parent) {
  const p = parent.userData.lampPools;
  if (!p) return;
  p.rod.build(parent, { castShadow: false, receiveShadow: false });
  p.shade.build(parent, { castShadow: false, receiveShadow: false });
  p.bulb.build(parent, { castShadow: false, receiveShadow: false });
  parent.userData.lampPools = null;
}

/** Sofa + meja coffee. */
function buildSofaSet(M, parent, x, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);
  mesh(rbox(2.4, 0.5, 1.0, 0x965c62, 0.06), M.vertexMat, 0, 0.3, -0.2, 0, g);
  mesh(rbox(2.4, 0.7, 0.24, 0x965c62, 0.06), M.vertexMat, 0, 0.72, -0.62, 0, g);
  mesh(rbox(0.24, 0.5, 1.0, 0x8a4f56, 0.05), M.vertexMat, -1.2, 0.5, -0.2, 0, g);
  mesh(rbox(0.24, 0.5, 1.0, 0x8a4f56, 0.05), M.vertexMat, 1.2, 0.5, -0.2, 0, g);
  mesh(rbox(0.7, 0.22, 0.5, 0xb37c6b, 0.04), M.vertexMat, -0.5, 0.62, -0.2, 0, g, false);
  mesh(rbox(0.7, 0.22, 0.5, 0xb37c6b, 0.04), M.vertexMat, 0.5, 0.62, -0.2, 0, g, false);
  return g;
}

/** Meja makan / rapat + kursi. */
function buildTableSet(M, parent, x, z, ry, w = 1.8, d = 1.0, seats = 4, world) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);
  mesh(rbox(w, 0.07, d, 0xd9c3a0, 0.02), M.vertexMat, 0, 0.74, 0, 0, g);
  for (const dx of [-w / 2 + 0.12, w / 2 - 0.12]) {
    for (const dz of [-d / 2 + 0.12, d / 2 - 0.12]) {
      mesh(box(0.07, 0.72, 0.07, 0x644832), M.vertexMat, dx, 0.36, dz, 0, g, false);
    }
  }
  const positions = [];
  for (let i = 0; i < seats; i += 1) {
    const t = seats === 1 ? 0.5 : i / (seats - 1);
    const px = (t - 0.5) * (w - 0.5);
    const side = i % 2 === 0 ? 1 : -1;
    positions.push({ x: px, z: side * (d / 2 + 0.42), ry: side > 0 ? Math.PI : 0 });
  }
  for (const s of positions) {
    const c = new THREE.Group();
    c.position.set(s.x, 0, s.z);
    c.rotation.y = s.ry;
    g.add(c);
    mesh(rbox(0.46, 0.06, 0.44, 0x3f4a55, 0.02), M.vertexMat, 0, 0.45, 0, 0, c, false);
    mesh(rbox(0.46, 0.48, 0.06, 0x3f4a55, 0.02), M.vertexMat, 0, 0.7, -0.2, 0, c, false);
  }
  if (world) world.nav.blockRect(x, z, w + 0.6, d + 1.4);
  return g;
}

/** Rak buku / display. */
function buildShelf(M, parent, x, z, ry, w = 1.8, world) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);
  mesh(box(w, 0.05, 0.36, 0x98633e), M.vertexMat, 0, 0.15, 0, 0, g, false);
  mesh(box(w, 0.05, 0.36, 0x98633e), M.vertexMat, 0, 0.75, 0, 0, g, false);
  mesh(box(w, 0.05, 0.36, 0x98633e), M.vertexMat, 0, 1.35, 0, 0, g, false);
  mesh(box(w, 1.5, 0.05, 0x644832), M.vertexMat, 0, 0.75, -0.17, 0, g, false);
  const colors = [0xb72d38, 0x558568, 0x78a9c5, 0xe1aa5d, 0x965c62, 0x4a5560, 0xd5a66f, 0x6fa86f];
  for (let i = 0; i < 12; i += 1) {
    const lvl = i % 3;
    const bx = -w / 2 + 0.2 + ((i * 0.13) % (w - 0.4));
    mesh(box(0.14, 0.34, 0.24, colors[i % colors.length]), M.vertexMat, bx, 0.38 + lvl * 0.6, 0, 0, g, false);
  }
  if (world) world.nav.blockRect(x, z, w, 0.6);
  return g;
}

/** Patch lantai tak kasat mata per zona — dipakai raycast klik ruang. */
function buildZonePatches(world, parent) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, transparent: true, opacity: 0.001, roughness: 1, metalness: 0, depthWrite: false
  });
  for (const floorKey of Object.keys(ZONES)) {
    for (const [area, zone] of Object.entries(ZONES[floorKey])) {
      const patch = new THREE.Mesh(new THREE.PlaneGeometry(zone.w - 0.4, zone.d - 0.4), mat);
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(zone.cx, 0.06, zone.cz);
      patch.userData.officeArea = area;
      patch.userData.officeFloor = Number(floorKey);
      patch.userData.zoneLabel = zone.label;
      patch.receiveShadow = false;
      patch.castShadow = false;
      parent.add(patch);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Shell bangunan — lantai, dinding, jendela, koridor                  */
/* ------------------------------------------------------------------ */

function buildShell(world, parent, M) {
  const W = BUILDING;
  const innerW = W.maxX - W.minX;
  const innerD = W.maxZ - W.minZ;

  const floor = mesh(new THREE.BoxGeometry(innerW + 2, 0.2, innerD + 2), M.concreteMat, 0, -0.1, 0, 0, parent, false);
  floor.receiveShadow = true;

  const woodFloor = mesh(new THREE.BoxGeometry(innerW, 0.04, innerD), M.woodMat, 0, 0.02, 0, 0, parent, false);
  woodFloor.receiveShadow = true;

  const wallMat = M.wallMat;
  const mkWall = (w, h, d, x, y, z) => mesh(box(w, h, d, 0xf2ead9), wallMat, x, y, z, 0, parent, true);

  mkWall(innerW + 0.6, W.wallHeight, 0.3, 0, W.wallHeight / 2, W.minZ - 0.15);
  mkWall(innerW + 0.6, W.wallHeight, 0.3, 0, W.wallHeight / 2, W.maxZ + 0.15);
  mkWall(0.3, W.wallHeight, innerD + 0.6, W.minX - 0.15, W.wallHeight / 2, 0);
  mkWall(0.3, W.wallHeight, innerD + 0.6, W.maxX + 0.15, W.wallHeight / 2, 0);

  mkWall(innerW + 0.8, 0.18, 0.42, 0, W.wallHeight + 0.09, W.minZ - 0.15);
  mkWall(innerW + 0.8, 0.18, 0.42, 0, W.wallHeight + 0.09, W.maxZ + 0.15);
  mkWall(0.42, 0.18, innerD + 0.8, W.minX - 0.15, W.wallHeight + 0.09, 0);
  mkWall(0.42, 0.18, innerD + 0.8, W.maxX + 0.15, W.wallHeight + 0.09, 0);

  // Jendela instanced di dinding luar
  const winGeo = new THREE.BoxGeometry(0.1, 1.4, 2.2);
  paint(winGeo, 0xbfe6ea);
  const winMat = new THREE.MeshStandardMaterial({
    vertexColors: true, transparent: true, opacity: 0.32, roughness: 0.1, metalness: 0.1
  });
  const wins = new InstancePool(winMat, winGeo);
  const winY = 2.0;
  for (let x = W.minX + 3; x <= W.maxX - 3; x += 4) {
    wins.add(x, winY, W.minZ + 0.02, 0, 1, 1, 1);
    wins.add(x, winY, W.maxZ - 0.02, 0, 1, 1, 1);
  }
  for (let z = W.minZ + 3; z <= W.maxZ - 3; z += 4) {
    wins.add(W.minX + 0.02, winY, z, Math.PI / 2, 1, 1, 1);
    wins.add(W.maxX - 0.02, winY, z, Math.PI / 2, 1, 1, 1);
  }
  wins.build(parent, { castShadow: false, receiveShadow: false });
  world.windowMaterials.push(winMat);

  const frameGeo = new THREE.BoxGeometry(0.08, 1.5, 0.08);
  paint(frameGeo, 0x644832);
  const frames = new InstancePool(M.vertexMat, frameGeo);
  for (let x = W.minX + 3; x <= W.maxX - 3; x += 4) {
    for (const z of [W.minZ + 0.02, W.maxZ - 0.02]) {
      frames.add(x - 1.1, winY, z, 0, 1, 1, 1);
      frames.add(x + 1.1, winY, z, 0, 1, 1, 1);
    }
  }
  frames.build(parent, { castShadow: false, receiveShadow: false });

  // Lampion merah-putih di koridor
  const lanternGeo = new THREE.SphereGeometry(0.16, 8, 6);
  paint(lanternGeo, 0xb72d38);
  const lanterns = new InstancePool(M.ledMat, lanternGeo);
  for (let x = -14; x <= 14; x += 7) {
    lanterns.add(x, 2.9, -7.2, 0, 1, 1, 1);
    lanterns.add(x, 2.9, 7.2, 0, 1, 1, 1);
  }
  lanterns.build(parent, { castShadow: false, receiveShadow: false });

  // Karpet koridor
  mesh(new THREE.BoxGeometry(6.4, 0.03, 40), M.carpetMat, -10.5, 0.045, 0, 0, parent, false);
  mesh(new THREE.BoxGeometry(6.4, 0.03, 40), M.carpetMat, 10.5, 0.045, 0, 0, parent, false);
}

/* ------------------------------------------------------------------ */
/* Zona: Workspace 48 meja                                             */
/* ------------------------------------------------------------------ */

function buildWorkspace(world, parent, M) {
  const z = ZONES[1].workspace;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.05, z.d), M.carpetMat, z.cx, 0.05, z.cz, 0, g, false);

  // Semua 48 workstation digambar dengan InstancedMesh (~12 draw call, bukan 720).
  const deskTop = new InstancePool(M.vertexMat, rbox(1.8, 0.07, 1.0, 0xd9c3a0, 0.02));
  const deskLeg = new InstancePool(M.vertexMat, box(0.07, 0.72, 0.07, 0x644832));
  const monitor = new InstancePool(M.vertexMat, box(0.6, 0.36, 0.03, 0x2b323a));
  const screen = new InstancePool(M.screenMat, box(0.52, 0.28, 0.012, 0x3d6a8a));
  const stand = new InstancePool(M.vertexMat, box(0.1, 0.18, 0.05, 0x3c454e));
  const keyboard = new InstancePool(M.vertexMat, box(0.46, 0.02, 0.16, 0xe8e2d4));
  const mouse = new InstancePool(M.vertexMat, box(0.09, 0.02, 0.13, 0xe8e2d4));
  const potPlant = new InstancePool(M.vertexMat, sph(0.055, 6, 5, 0x558568));
  const chairSeat = new InstancePool(M.vertexMat, rbox(0.55, 0.07, 0.52, 0x3f4a55, 0.02));
  const chairBack = new InstancePool(M.vertexMat, rbox(0.55, 0.55, 0.07, 0x3f4a55, 0.02));
  const chairLeg = new InstancePool(M.vertexMat, cyl(0.03, 0.03, 0.44, 6, 0x3c454e));

  for (const d of DESK_LAYOUT) {
    const { x, z } = d;
    deskTop.add(x, 0.74, z);
    for (const dx of [-0.8, 0.8]) {
      for (const dz of [-0.4, 0.4]) deskLeg.add(x + dx, 0.36, z + dz);
    }
    monitor.add(x, 1.06, z - 0.28);
    screen.add(x, 1.06, z - 0.26);
    stand.add(x, 0.85, z - 0.28);
    keyboard.add(x, 0.79, z + 0.08);
    mouse.add(x + 0.38, 0.79, z + 0.08);
    potPlant.add(x - 0.62, 0.86, z - 0.28);
    chairSeat.add(x, 0.46, z + 0.92, Math.PI);
    chairBack.add(x, 0.75, z + 1.16, Math.PI);
    for (const dx of [-0.22, 0.22]) {
      for (const dz of [-0.2, 0.2]) chairLeg.add(x + dx, 0.22, z + 0.92 + dz, Math.PI);
    }
    world.nav.blockRect(x, z, 1.9, 1.5);
  }
  deskTop.build(g, { castShadow: true, receiveShadow: true });
  deskLeg.build(g, { castShadow: false, receiveShadow: false });
  monitor.build(g, { castShadow: false, receiveShadow: false });
  screen.build(g, { castShadow: false, receiveShadow: false });
  stand.build(g, { castShadow: false, receiveShadow: false });
  keyboard.build(g, { castShadow: false, receiveShadow: false });
  mouse.build(g, { castShadow: false, receiveShadow: false });
  potPlant.build(g, { castShadow: false, receiveShadow: false });
  chairSeat.build(g, { castShadow: false, receiveShadow: false });
  chairBack.build(g, { castShadow: false, receiveShadow: false });
  chairLeg.build(g, { castShadow: false, receiveShadow: false });

  // Pemisah rendah antar blok
  for (const pz of [-3.5, 3.5]) {
    mesh(box(12.6, 1.1, 0.12, 0xe8dcc8), M.wallMat, 0, 0.55, pz, 0, g, false);
  }
  mesh(box(0.12, 1.1, 11.6, 0xe8dcc8), M.wallMat, 0, 0.55, 0, 0, g, false);

  buildPlant(M, g, -6.2, -5.8, 1.2);
  buildPlant(M, g, 6.2, -5.8, 1.2);
  buildPlant(M, g, -6.2, 5.8, 1.2);
  buildPlant(M, g, 6.2, 5.8, 1.2);

  for (const lx of [-3.5, 3.5]) {
    for (const lz of [-3.5, 3.5]) {
      buildHangingLamp(M, g, world, lx, lz, 2.7);
    }
  }

  world.decorativeSpots.push(
    { area: "workspace", x: -6.2, z: -5.8, floor: 1, activity: "santai" },
    { area: "workspace", x: 6.2, z: 5.8, floor: 1, activity: "diskusi" }
  );
}

/* ------------------------------------------------------------------ */
/* Zona: Masjid                                                        */
/* ------------------------------------------------------------------ */

function buildMasjid(world, parent, M) {
  const z = ZONES[1].masjid;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.06, z.d), M.woodMat, z.cx, 0.06, z.cz, 0, g, false);
  for (let i = 0; i < 6; i += 1) {
    mesh(new THREE.BoxGeometry(1.1, 0.04, 1.6), M.prayRugMat, z.cx - 4 + (i % 3) * 2.2, 0.09, z.cz - 2 + Math.floor(i / 3) * 4, 0, g, false);
  }

  // Mihrab
  const mihrabX = z.cx;
  mesh(box(1.8, 2.6, 0.24, 0xe1aa5d), M.vertexMat, mihrabX, 1.3, z.cz - z.d / 2 + 0.12, 0, g);
  mesh(box(1.3, 2.1, 0.2, 0x558568), M.vertexMat, mihrabX, 1.05, z.cz - z.d / 2 + 0.22, 0, g, false);
  mesh(sph(0.24, 8, 6, 0xe1aa5d), M.vertexMat, mihrabX, 2.2, z.cz - z.d / 2 + 0.3, 0, g, false);

  // Minbar
  mesh(box(0.7, 0.5, 0.7, 0x98633e), M.vertexMat, mihrabX + 1.6, 0.25, z.cz - z.d / 2 + 1.2, 0, g);
  mesh(box(0.7, 0.9, 0.1, 0x98633e), M.vertexMat, mihrabX + 1.6, 0.95, z.cz - z.d / 2 + 1.2, 0, g, false);
  mesh(sph(0.12, 8, 6, 0xe1aa5d), M.vertexMat, mihrabX + 1.6, 1.5, z.cz - z.d / 2 + 1.2, 0, g, false);

  // Kubah
  mesh(sph(2.4, 16, 10, 0x558568), M.vertexMat, z.cx, 3.4, z.cz, 0, g, false);
  mesh(cyl(0.12, 0.12, 0.7, 8, 0xe1aa5d), M.vertexMat, z.cx, 5.2, z.cz, 0, g, false);
  mesh(sph(0.16, 8, 6, 0xe1aa5d), M.vertexMat, z.cx, 5.6, z.cz, 0, g, false);

  // Kaligrafi
  mesh(box(2.6, 0.9, 0.06, 0x2f353d), M.vertexMat, z.cx, 2.2, z.cz + z.d / 2 - 0.12, 0, g, false);
  mesh(box(2.2, 0.06, 0.08, 0xe1aa5d), M.vertexMat, z.cx, 2.2, z.cz + z.d / 2 - 0.1, 0, g, false);

  buildHangingLamp(M, g, world, z.cx, z.cz, 3.0, 0xfff0cc);
  buildHangingLamp(M, g, world, z.cx, z.cz - 3, 2.8);
  buildHangingLamp(M, g, world, z.cx, z.cz + 3, 2.8);

  // Tempat wudu
  mesh(cyl(0.7, 0.6, 0.5, 12, 0x78a9c5), M.vertexMat, z.cx + 4.5, 0.25, z.cz + 4, 0, g);
  mesh(sph(0.5, 10, 6, 0x9fd8da), M.waterMat, z.cx + 4.5, 0.52, z.cz + 4, 0, g, false);
  world.waterMaterials.push(M.waterMat);

  buildPlant(M, g, z.cx - 5.8, z.cz + 4.8, 1.1);
  buildPlant(M, g, z.cx + 5.8, z.cz + 4.8, 1.1);

  world.decorativeSpots.push(
    { area: "masjid", x: z.cx - 2.2, z: z.cz - 2, floor: 1, activity: "sholat" },
    { area: "masjid", x: z.cx + 0.2, z: z.cz - 2, floor: 1, activity: "sholat" },
    { area: "masjid", x: z.cx - 2.2, z: z.cz + 2, floor: 1, activity: "sholat" },
    { area: "masjid", x: z.cx + 0.2, z: z.cz + 2, floor: 1, activity: "sholat" }
  );
  world.nav.blockRect(z.cx, z.cz - z.d / 2 + 1.2, 2.2, 2.4);
  world.nav.blockRect(z.cx + 1.6, z.cz - z.d / 2 + 1.2, 0.9, 0.9);
  world.nav.blockRect(z.cx + 4.5, z.cz + 4, 1.4, 1.4);
}

/* ------------------------------------------------------------------ */
/* Zona: Ruang Rapat                                                   */
/* ------------------------------------------------------------------ */

function buildMeeting(world, parent, M) {
  const z = ZONES[1].meeting;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.05, z.d), M.rugMat, z.cx, 0.05, z.cz, 0, g, false);

  const table = mesh(cyl(2.6, 2.6, 0.08, 20, 0xd9c3a0), M.vertexMat, z.cx, 0.78, z.cz, 0, g);
  mesh(cyl(0.16, 0.2, 0.76, 10, 0x644832), M.vertexMat, z.cx, 0.38, z.cz, 0, g, false);

  const seats = [];
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2;
    const sx = z.cx + Math.cos(a) * 3.6;
    const sz = z.cz + Math.sin(a) * 3.0;
    const c = new THREE.Group();
    c.position.set(sx, 0, sz);
    c.rotation.y = -a - Math.PI / 2;
    g.add(c);
    mesh(rbox(0.5, 0.06, 0.48, 0x3f4a55, 0.02), M.vertexMat, 0, 0.45, 0, 0, c, false);
    mesh(rbox(0.5, 0.5, 0.06, 0x3f4a55, 0.02), M.vertexMat, 0, 0.72, -0.22, 0, c, false);
    seats.push({ x: sx, z: sz });
  }
  world.meetingSeats = seats;
  world.nav.blockRect(z.cx, z.cz, 5.4, 6.2);

  mesh(box(3.2, 1.9, 0.06, 0x1a2530), M.screenMat, z.cx, 1.7, z.cz - z.d / 2 + 0.2, 0, g, false);
  mesh(box(2.4, 1.4, 0.06, 0xfff9ec), M.vertexMat, z.cx + 4.5, 1.6, z.cz - z.d / 2 + 0.2, 0, g, false);
  mesh(box(2.2, 0.06, 0.08, 0x4a5560), M.vertexMat, z.cx + 4.5, 1.6, z.cz - z.d / 2 + 0.24, 0, g, false);

  buildHangingLamp(M, g, world, z.cx, z.cz, 2.9);
  buildPlant(M, g, z.cx - 5.6, z.cz + 4.8, 1.2);
  buildPlant(M, g, z.cx + 5.6, z.cz + 4.8, 1.2);

  world.decorativeSpots.push(
    { area: "meeting", x: z.cx - 3.6, z: z.cz, floor: 1, activity: "diskusi" },
    { area: "meeting", x: z.cx + 3.6, z: z.cz, floor: 1, activity: "diskusi" }
  );
}

/* ------------------------------------------------------------------ */
/* Zona: Kedai Kopi                                                    */
/* ------------------------------------------------------------------ */

function buildKopi(world, parent, M) {
  const z = ZONES[1].kopi;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.05, z.d), M.tileMat, z.cx, 0.05, z.cz, 0, g, false);

  mesh(rbox(7.0, 1.1, 1.0, 0x98633e, 0.04), M.vertexMat, z.cx, 0.55, z.cz - z.d / 2 + 1.2, 0, g);
  mesh(rbox(7.4, 0.08, 1.3, 0xd9c3a0, 0.03), M.vertexMat, z.cx, 1.14, z.cz - z.d / 2 + 1.2, 0, g);
  mesh(rbox(0.9, 0.7, 0.6, 0xb9c2c9, 0.04), M.vertexMat, z.cx - 2.2, 1.5, z.cz - z.d / 2 + 1.2, 0, g, false);
  mesh(box(0.3, 0.3, 0.3, 0x3c454e), M.vertexMat, z.cx - 2.2, 1.3, z.cz - z.d / 2 + 1.0, 0, g, false);
  mesh(box(2.0, 0.04, 0.3, 0x644832), M.vertexMat, z.cx + 1.5, 1.4, z.cz - z.d / 2 + 1.2, 0, g, false);
  for (let i = 0; i < 4; i += 1) {
    mesh(cyl(0.07, 0.06, 0.12, 8, 0xfff9ec), M.vertexMat, z.cx + 0.8 + i * 0.45, 1.48, z.cz - z.d / 2 + 1.2, 0, g, false);
  }

  mesh(new THREE.PlaneGeometry(3.2, 3.2), M.menuMat, z.cx, 2.2, z.cz - z.d / 2 + 0.12, 0, g, false);

  buildTableSet(M, g, z.cx - 3.2, z.cz + 2.4, 0, 1.4, 1.4, 4, world);
  buildTableSet(M, g, z.cx + 3.2, z.cz + 2.4, 0, 1.4, 1.4, 4, world);
  buildTableSet(M, g, z.cx, z.cz + 4.4, 0, 1.4, 1.4, 4, world);

  for (let i = 0; i < 5; i += 1) {
    const sx = z.cx - 2.6 + i * 1.3;
    mesh(cyl(0.22, 0.22, 0.44, 10, 0x965c62), M.vertexMat, sx, 0.22, z.cz - z.d / 2 + 2.4, 0, g, false);
    mesh(cyl(0.03, 0.16, 0.44, 8, 0x644832), M.vertexMat, sx, 0.22, z.cz - z.d / 2 + 2.4, 0, g, false);
  }

  buildHangingLamp(M, g, world, z.cx - 3.2, z.cz + 2.4, 2.5);
  buildHangingLamp(M, g, world, z.cx + 3.2, z.cz + 2.4, 2.5);
  buildHangingLamp(M, g, world, z.cx, z.cz + 4.4, 2.5);
  buildHangingLamp(M, g, world, z.cx, z.cz - z.d / 2 + 2.0, 2.4);

  buildPlant(M, g, z.cx - 6.0, z.cz + 5.0, 1.1);
  buildPlant(M, g, z.cx + 6.0, z.cz + 5.0, 1.1);
  buildPlant(M, g, z.cx + 6.0, z.cz - 5.0, 1.1);

  world.decorativeSpots.push(
    { area: "kopi", x: z.cx - 3.2, z: z.cz + 2.4, floor: 1, activity: "ngopi" },
    { area: "kopi", x: z.cx + 3.2, z: z.cz + 2.4, floor: 1, activity: "ngopi" },
    { area: "kopi", x: z.cx, z: z.cz + 4.4, floor: 1, activity: "ngopi" },
    { area: "kopi", x: z.cx - 1.3, z: z.cz - z.d / 2 + 2.4, floor: 1, activity: "ngopi" }
  );
  world.nav.blockRect(z.cx, z.cz - z.d / 2 + 1.2, 7.4, 1.4);
}

/* ------------------------------------------------------------------ */
/* Zona: Studio Konten                                                 */
/* ------------------------------------------------------------------ */

function buildStudio(world, parent, M) {
  const z = ZONES[1].studio;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.05, z.d), M.carpetMat, z.cx, 0.05, z.cz, 0, g, false);

  mesh(box(5.0, 3.0, 0.1, 0x2f7a4a), M.vertexMat, z.cx, 1.5, z.cz - z.d / 2 + 0.4, 0, g, false);
  mesh(box(5.4, 0.1, 0.4, 0x3c454e), M.vertexMat, z.cx, 3.0, z.cz - z.d / 2 + 0.4, 0, g, false);

  for (const dx of [-2.4, 2.4]) {
    mesh(cyl(0.03, 0.03, 1.1, 6, 0x3c454e), M.vertexMat, z.cx + dx, 0.55, z.cz - 1.0, 0, g, false);
    mesh(box(0.5, 0.34, 0.4, 0x2b323a), M.vertexMat, z.cx + dx, 1.25, z.cz - 1.0, 0, g, false);
    mesh(cyl(0.05, 0.05, 0.3, 8, 0x4a5560), M.vertexMat, z.cx + dx, 1.25, z.cz - 0.7, 0, g, false);
    for (let i = 0; i < 3; i += 1) {
      const a = (i / 3) * Math.PI * 2;
      mesh(cyl(0.02, 0.02, 0.9, 5, 0x3c454e), M.vertexMat, z.cx + dx + Math.cos(a) * 0.24, 0.45, z.cz - 1.0 + Math.sin(a) * 0.24, 0, g, false);
    }
  }

  mesh(cyl(0.5, 0.5, 0.06, 16, 0xfff2cf), M.ledMat, z.cx, 2.0, z.cz + 0.6, 0, g, false);
  mesh(cyl(0.03, 0.03, 2.0, 6, 0x3c454e), M.vertexMat, z.cx, 1.0, z.cz + 0.6, 0, g, false);

  buildDeskCluster(M, g, z.cx - 4.0, z.cz + 3.6, Math.PI / 2, world);
  buildDeskCluster(M, g, z.cx - 4.0, z.cz + 1.4, Math.PI / 2, world);

  buildShelf(M, g, z.cx + 5.2, z.cz + 4.5, Math.PI / 2, 2.2, world);

  buildHangingLamp(M, g, world, z.cx, z.cz, 2.8);
  buildPlant(M, g, z.cx + 5.6, z.cz - 5.4, 1.0);

  world.decorativeSpots.push(
    { area: "studio", x: z.cx, z: z.cz + 0.6, floor: 1, activity: "baca" },
    { area: "studio", x: z.cx + 5.2, z: z.cz + 4.5, floor: 1, activity: "diskusi" }
  );
  world.nav.blockRect(z.cx, z.cz - z.d / 2 + 0.4, 5.4, 0.4);
  world.nav.blockRect(z.cx, z.cz - 1.0, 5.6, 1.0);
}

/* ------------------------------------------------------------------ */
/* Zona: Ruang Klien & Review                                          */
/* ------------------------------------------------------------------ */

function buildClient(world, parent, M) {
  const z = ZONES[1].client;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.05, z.d), M.rugMat, z.cx, 0.05, z.cz, 0, g, false);

  buildTableSet(M, g, z.cx, z.cz, 0, 2.4, 1.3, 6, world);
  mesh(rbox(2.8, 0.5, 0.9, 0x965c62, 0.06), M.vertexMat, z.cx, 0.3, z.cz + 3.6, 0, g);
  mesh(rbox(2.8, 0.7, 0.24, 0x965c62, 0.06), M.vertexMat, z.cx, 0.72, z.cz + 3.95, 0, g);

  buildShelf(M, g, z.cx + 5.6, z.cz, Math.PI / 2, 3.0, world);
  buildShelf(M, g, z.cx - 5.6, z.cz, Math.PI / 2, 3.0, world);

  mesh(box(3.0, 1.8, 0.06, 0x1a2530), M.screenMat, z.cx, 1.8, z.cz - z.d / 2 + 0.2, 0, g, false);

  buildHangingLamp(M, g, world, z.cx, z.cz, 2.8);
  buildPlant(M, g, z.cx - 5.6, z.cz + 5.6, 1.2);
  buildPlant(M, g, z.cx + 5.6, z.cz + 5.6, 1.2);

  world.decorativeSpots.push(
    { area: "client", x: z.cx, z: z.cz + 2.4, floor: 1, activity: "diskusi" },
    { area: "client", x: z.cx - 5.6, z: z.cz, floor: 1, activity: "baca" },
    { area: "client", x: z.cx + 5.6, z: z.cz, floor: 1, activity: "baca" }
  );
}

/* ------------------------------------------------------------------ */
/* Zona: Gym Mini                                                      */
/* ------------------------------------------------------------------ */

function buildGym(world, parent, M) {
  const z = ZONES[1].gym;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.06, z.d), M.rubberMat, z.cx, 0.06, z.cz, 0, g, false);

  for (let i = 0; i < 3; i += 1) {
    const tx = z.cx - 4.5 + i * 2.2;
    mesh(rbox(0.9, 0.12, 2.0, 0x3c454e, 0.03), M.vertexMat, tx, 0.3, z.cz - 3.0, 0, g);
    mesh(rbox(0.8, 0.06, 1.8, 0x5c6670, 0.02), M.vertexMat, tx, 0.4, z.cz - 3.0, 0, g, false);
    mesh(cyl(0.05, 0.05, 1.2, 8, 0xb9c2c9), M.vertexMat, tx - 0.4, 0.9, z.cz - 3.9, 0.3, g, false);
    mesh(cyl(0.05, 0.05, 1.2, 8, 0xb9c2c9), M.vertexMat, tx + 0.4, 0.9, z.cz - 3.9, 0.3, g, false);
    mesh(box(0.5, 0.4, 0.1, 0x1a2530), M.screenMat, tx, 1.35, z.cz - 3.95, 0.3, g, false);
  }

  mesh(rbox(0.5, 0.12, 1.6, 0x965c62, 0.03), M.vertexMat, z.cx + 3.5, 0.5, z.cz - 2.5, 0, g);
  mesh(cyl(0.04, 0.04, 2.2, 8, 0xb9c2c9), M.vertexMat, z.cx + 3.5, 1.0, z.cz - 2.5, Math.PI / 2, g, false);
  for (const dx of [-1.0, 1.0]) {
    mesh(cyl(0.16, 0.16, 0.06, 12, 0x3c454e), M.vertexMat, z.cx + 3.5 + dx, 1.0, z.cz - 2.5, Math.PI / 2, g, false);
  }

  mesh(box(2.0, 0.5, 0.5, 0x3c454e), M.vertexMat, z.cx - 3.5, 0.25, z.cz + 3.5, 0, g);
  for (let i = 0; i < 5; i += 1) {
    const dx = z.cx - 4.2 + i * 0.35;
    mesh(cyl(0.05, 0.05, 0.3, 8, 0xb9c2c9), M.vertexMat, dx, 0.6, z.cz + 3.5, 0, g, false);
    mesh(cyl(0.09, 0.09, 0.08, 10, 0x2b323a), M.vertexMat, dx, 0.6, z.cz + 3.5 - 0.12, 0, g, false);
    mesh(cyl(0.09, 0.09, 0.08, 10, 0x2b323a), M.vertexMat, dx, 0.6, z.cz + 3.5 + 0.12, 0, g, false);
  }

  mesh(box(5.0, 2.2, 0.06, 0xbfe6ea), M.glassMat, z.cx, 1.3, z.cz + z.d / 2 - 0.15, 0, g, false);

  for (let i = 0; i < 3; i += 1) {
    mesh(rbox(0.7, 0.05, 1.8, 0x78a9c5, 0.02), M.vertexMat, z.cx + 3.5 + i * 0.9, 0.1, z.cz + 1.5, 0, g, false);
  }

  buildPlant(M, g, z.cx - 6.0, z.cz + 5.0, 1.0);

  world.decorativeSpots.push(
    { area: "gym", x: z.cx - 4.5, z: z.cz - 2.0, floor: 1, activity: "olahraga" },
    { area: "gym", x: z.cx - 2.3, z: z.cz - 2.0, floor: 1, activity: "olahraga" },
    { area: "gym", x: z.cx + 3.5, z: z.cz - 1.5, floor: 1, activity: "olahraga" },
    { area: "gym", x: z.cx + 3.5, z: z.cz + 1.5, floor: 1, activity: "olahraga" }
  );
  world.nav.blockRect(z.cx - 4.5, z.cz - 3.0, 6.6, 2.4);
  world.nav.blockRect(z.cx + 3.5, z.cz - 2.5, 2.6, 2.0);
  world.nav.blockRect(z.cx - 3.5, z.cz + 3.5, 2.4, 0.8);
}

/* ------------------------------------------------------------------ */
/* Zona: Lounge & Taman                                                */
/* ------------------------------------------------------------------ */

function buildLounge(world, parent, M) {
  const z = ZONES[1].lounge;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.05, z.d), M.rugMat, z.cx, 0.05, z.cz, 0, g, false);

  buildSofaSet(M, g, z.cx - 2.0, z.cz - 2.4, 0);
  buildSofaSet(M, g, z.cx + 2.0, z.cz - 2.4, 0);
  buildSofaSet(M, g, z.cx, z.cz + 2.6, Math.PI);

  mesh(cyl(0.7, 0.7, 0.06, 16, 0xd9c3a0), M.vertexMat, z.cx, 0.42, z.cz, 0, g);
  mesh(cyl(0.1, 0.14, 0.4, 10, 0x644832), M.vertexMat, z.cx, 0.2, z.cz, 0, g, false);

  mesh(box(2.6, 1.5, 0.08, 0x1a2530), M.screenMat, z.cx, 1.8, z.cz - z.d / 2 + 0.25, 0, g, false);
  mesh(box(0.4, 0.5, 0.2, 0x3c454e), M.vertexMat, z.cx, 0.5, z.cz - z.d / 2 + 0.25, 0, g, false);

  for (let i = 0; i < 6; i += 1) {
    buildPlant(M, g, z.cx - 5.5 + (i % 3) * 2.0, z.cz + 4.6 + Math.floor(i / 3) * 1.2, 0.9 + (i % 3) * 0.15);
  }
  mesh(cyl(1.2, 1.2, 0.36, 16, 0x7fc4d4), M.vertexMat, z.cx + 5.0, 0.18, z.cz + 3.4, 0, g);
  mesh(sph(1.05, 14, 8, 0x4fb3cf), M.waterMat, z.cx + 5.0, 0.34, z.cz + 3.4, 0, g, false);
  world.waterMaterials.push(M.waterMat);

  buildHangingLamp(M, g, world, z.cx, z.cz, 2.8);
  buildHangingLamp(M, g, world, z.cx - 2.0, z.cz - 2.4, 2.6);
  buildHangingLamp(M, g, world, z.cx + 2.0, z.cz - 2.4, 2.6);

  world.decorativeSpots.push(
    { area: "lounge", x: z.cx - 2.0, z: z.cz - 2.4, floor: 1, activity: "nonton" },
    { area: "lounge", x: z.cx + 2.0, z: z.cz - 2.4, floor: 1, activity: "nonton" },
    { area: "lounge", x: z.cx, z: z.cz + 2.6, floor: 1, activity: "santai" },
    { area: "lounge", x: z.cx + 5.0, z: z.cz + 3.4, floor: 1, activity: "renang" }
  );
  world.nav.blockRect(z.cx, z.cz, 2.0, 2.0);
  world.nav.blockRect(z.cx + 5.0, z.cz + 3.4, 2.4, 2.4);
}

/* ------------------------------------------------------------------ */
/* Zona: Pantry & Dapur                                                */
/* ------------------------------------------------------------------ */

function buildPantry(world, parent, M) {
  const z = ZONES[1].pantry;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.05, z.d), M.tileMat, z.cx, 0.05, z.cz, 0, g, false);

  mesh(rbox(6.5, 1.0, 1.0, 0x98633e, 0.04), M.vertexMat, z.cx, 0.5, z.cz - z.d / 2 + 1.2, 0, g);
  mesh(rbox(6.9, 0.08, 1.2, 0xd9c3a0, 0.03), M.vertexMat, z.cx, 1.04, z.cz - z.d / 2 + 1.2, 0, g);
  mesh(box(0.8, 0.06, 0.6, 0x3c454e), M.vertexMat, z.cx - 2.2, 1.1, z.cz - z.d / 2 + 1.2, 0, g, false);
  mesh(cyl(0.28, 0.22, 0.16, 12, 0xb9c2c9), M.vertexMat, z.cx + 2.2, 1.1, z.cz - z.d / 2 + 1.2, 0, g, false);
  mesh(cyl(0.28, 0.24, 0.36, 12, 0xfff9ec), M.vertexMat, z.cx + 3.4, 1.26, z.cz - z.d / 2 + 1.2, 0, g, false);
  mesh(cyl(0.26, 0.26, 0.55, 12, 0x9fd8da), M.vertexMat, z.cx + 4.5, 0.28, z.cz - z.d / 2 + 2.2, 0, g, false);

  mesh(rbox(0.9, 2.0, 0.8, 0xb9c2c9, 0.05), M.vertexMat, z.cx - 5.6, 1.0, z.cz - z.d / 2 + 1.4, 0, g);
  mesh(box(0.06, 0.5, 0.06, 0x644832), M.vertexMat, z.cx - 5.2, 1.2, z.cz - z.d / 2 + 1.0, 0, g, false);

  buildTableSet(M, g, z.cx - 2.5, z.cz + 2.6, 0, 1.8, 1.0, 4, world);
  buildTableSet(M, g, z.cx + 2.5, z.cz + 2.6, 0, 1.8, 1.0, 4, world);
  buildTableSet(M, g, z.cx, z.cz + 4.8, 0, 1.8, 1.0, 4, world);

  buildHangingLamp(M, g, world, z.cx - 2.5, z.cz + 2.6, 2.5);
  buildHangingLamp(M, g, world, z.cx + 2.5, z.cz + 2.6, 2.5);
  buildHangingLamp(M, g, world, z.cx, z.cz + 4.8, 2.5);

  buildPlant(M, g, z.cx + 6.0, z.cz - 5.0, 1.0);

  world.decorativeSpots.push(
    { area: "pantry", x: z.cx - 2.5, z: z.cz + 2.6, floor: 1, activity: "makan" },
    { area: "pantry", x: z.cx + 2.5, z: z.cz + 2.6, floor: 1, activity: "makan" },
    { area: "pantry", x: z.cx, z: z.cz + 4.8, floor: 1, activity: "makan" },
    { area: "pantry", x: z.cx + 4.5, z: z.cz - z.d / 2 + 2.2, floor: 1, activity: "ngopi" }
  );
  world.nav.blockRect(z.cx, z.cz - z.d / 2 + 1.2, 6.9, 1.4);
  world.nav.blockRect(z.cx - 5.6, z.cz - z.d / 2 + 1.4, 1.1, 1.0);
}

/* ------------------------------------------------------------------ */
/* Eksterior — taman, jalan, pohon, lampu, gerbang, bendera           */
/* ------------------------------------------------------------------ */

function buildExterior(world, parent, M) {
  const W = BUILDING;
  const g = new THREE.Group();
  parent.add(g);

  const ground = mesh(new THREE.BoxGeometry(100, 0.2, 90), M.grassMat, 0, -0.2, 0, 0, g, false);
  ground.receiveShadow = true;

  mesh(new THREE.BoxGeometry(100, 0.12, 8), M.concreteMat, 0, -0.02, W.maxZ + 12, 0, g, false);
  mesh(new THREE.BoxGeometry(0.14, 0.14, 8), M.ledMat, 0, 0.06, W.maxZ + 12, 0, g, false);
  mesh(new THREE.BoxGeometry(100, 0.16, 2.4), M.tileMat, 0, 0.0, W.maxZ + 7.4, 0, g, false);

  // Pagar + gerbang
  const fenceGeo = new THREE.BoxGeometry(0.12, 1.4, 0.12);
  paint(fenceGeo, 0x4a5560);
  const fence = new InstancePool(M.vertexMat, fenceGeo);
  for (let x = W.minX - 6; x <= W.maxX + 6; x += 2) {
    if (Math.abs(x) < 4) continue;
    fence.add(x, 0.7, W.maxZ + 5.6, 0, 1, 1, 1);
  }
  fence.build(g, { castShadow: false, receiveShadow: false });
  mesh(box(0.16, 1.5, 0.16, 0x3c454e), M.vertexMat, -4, 0.75, W.maxZ + 5.6, 0, g);
  mesh(box(0.16, 1.5, 0.16, 0x3c454e), M.vertexMat, 4, 0.75, W.maxZ + 5.6, 0, g);
  mesh(box(8.0, 0.12, 0.12, 0x4a5560), M.vertexMat, 0, 1.5, W.maxZ + 5.6, 0, g, false);

  // Pohon (instanced)
  const treeTrunk = new InstancePool(M.vertexMat, cyl(0.22, 0.3, 2.2, 8, 0x8a5a3b));
  const treeLeaf1 = new InstancePool(M.vertexMat, sph(1.5, 10, 8, 0x4e8d57));
  const treeLeaf2 = new InstancePool(M.vertexMat, sph(1.1, 10, 8, 0x5c9d63));
  const treeLeaf3 = new InstancePool(M.vertexMat, sph(0.9, 10, 8, 0x3f7a4c));
  const treeSpots = [
    [-36, -26], [-22, -28], [4, -28], [20, -27], [34, -24],
    [-38, 0], [38, 2], [-36, 24], [10, 28], [28, 26], [-12, 29]
  ];
  for (const [tx, tz] of treeSpots) {
    treeTrunk.add(tx, 1.1, tz);
    treeLeaf1.add(tx, 2.9, tz);
    treeLeaf2.add(tx + 0.6, 3.6, tz + 0.4);
    treeLeaf3.add(tx - 0.7, 3.4, tz - 0.5);
  }
  treeTrunk.build(g, { castShadow: true, receiveShadow: false });
  treeLeaf1.build(g, { castShadow: false, receiveShadow: false });
  treeLeaf2.build(g, { castShadow: false, receiveShadow: false });
  treeLeaf3.build(g, { castShadow: false, receiveShadow: false });

  // Lampu jalan
  const lampGeo = new THREE.CylinderGeometry(0.08, 0.12, 3.4, 8);
  paint(lampGeo, 0x3c454e);
  const lampHead = new THREE.SphereGeometry(0.22, 8, 6);
  paint(lampHead, 0xfff2cf);
  const pole = new InstancePool(M.vertexMat, lampGeo);
  const head = new InstancePool(M.ledMat, lampHead);
  for (let x = -30; x <= 30; x += 12) {
    pole.add(x, 1.7, W.maxZ + 9.5, 0, 1, 1, 1);
    head.add(x, 3.5, W.maxZ + 9.5, 0, 1, 1, 1);
  }
  pole.build(g, { castShadow: false, receiveShadow: false });
  head.build(g, { castShadow: false, receiveShadow: false });

  // Bendera Merah Putih
  for (const bx of [-6, 6]) {
    mesh(cyl(0.06, 0.08, 6.5, 8, 0xb9c2c9), M.vertexMat, bx, 3.25, W.maxZ + 5.0, 0, g);
    const flag = new THREE.Group();
    flag.position.set(bx + 0.7, 5.9, W.maxZ + 5.0);
    g.add(flag);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xb72d38, roughness: 0.8, side: THREE.DoubleSide });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfff9ec, roughness: 0.8, side: THREE.DoubleSide });
    const red = mesh(new THREE.BoxGeometry(1.4, 0.45, 0.02), redMat, 0.7, 0, 0, 0, flag, false);
    const white = mesh(new THREE.BoxGeometry(1.4, 0.45, 0.02), whiteMat, 0.7, -0.45, 0, 0, flag, false);
    world.flagCloths.push(red, white);
  }

  // Bangku & pot di trotoar
  for (const bx of [-10, 10]) {
    mesh(rbox(1.6, 0.1, 0.5, 0x98633e, 0.02), M.vertexMat, bx, 0.45, W.maxZ + 7.2, 0, g, false);
    for (const dx of [-0.6, 0.6]) {
      mesh(box(0.08, 0.45, 0.08, 0x644832), M.vertexMat, bx + dx, 0.22, W.maxZ + 7.2, 0, g, false);
    }
    buildPlant(M, g, bx + 2.0, W.maxZ + 7.2, 1.0);
  }
}

/* ------------------------------------------------------------------ */
/* Siklus siang / malam                                                */
/* ------------------------------------------------------------------ */

function applyDayNight(world, night) {
  world.night = night;
  const lampIntensity = night ? 1.0 : 0.35;
  for (const m of world.lampMaterials) {
    if (m.emissiveIntensity !== undefined) m.emissiveIntensity = lampIntensity;
  }
  for (const m of world.emissiveMaterials) {
    if (m.emissiveIntensity !== undefined) m.emissiveIntensity = night ? 0.9 : 0.3;
  }
  for (const m of world.windowMaterials) {
    if (m.color) m.color.setHex(night ? 0x2b3a4a : 0xbfe6ea);
  }
}

function updateWorld(world, dt) {
  world.elapsed += dt;
  const t = world.elapsed;
  for (let i = 0; i < world.flagCloths.length; i += 1) {
    const cloth = world.flagCloths[i];
    if (!cloth) continue;
    cloth.rotation.y = Math.sin(t * 1.6 + i * 0.5) * 0.22;
    cloth.scale.x = 1 + Math.sin(t * 2.2 + i) * 0.03;
  }
}

/* ------------------------------------------------------------------ */
/* createWorld                                                         */
/* ------------------------------------------------------------------ */

export function createWorld(scene) {
  const M = buildMaterials();
  const world = {
    zones: ZONES,
    floorGroups: { 1: new THREE.Group() },
    roomTargets: new Map(),
    nav: new NavGrid(BUILDING.minX + 0.5, BUILDING.maxX - 0.5, BUILDING.minZ + 0.5, BUILDING.maxZ - 0.5, 0.5),
    agentHomes: AGENT_HOMES,
    meetingSeats: [],
    decorativeSpots: [],
    lampMaterials: [],
    emissiveMaterials: [],
    windowMaterials: [],
    waterMaterials: [],
    flagCloths: [],
    night: false,
    elapsed: 0,
    materials: M
  };

  const floor1 = world.floorGroups[1];
  floor1.userData.floor = 1;

  buildShell(world, floor1, M);
  buildZonePatches(world, floor1);
  buildWorkspace(world, floor1, M);
  buildMasjid(world, floor1, M);
  buildMeeting(world, floor1, M);
  buildKopi(world, floor1, M);
  buildStudio(world, floor1, M);
  buildClient(world, floor1, M);
  buildGym(world, floor1, M);
  buildLounge(world, floor1, M);
  buildPantry(world, floor1, M);
  // Flush pool tanaman/lampu di semua grup zona (masing-masing punya pool sendiri).
  floor1.traverse((obj) => {
    if (obj.userData.plantPools) flushPlantPools(obj);
    if (obj.userData.lampPools) flushLampPools(obj);
  });

  const exterior = new THREE.Group();
  buildExterior(world, exterior, M);
  exterior.traverse((obj) => {
    if (obj.userData.plantPools) flushPlantPools(obj);
    if (obj.userData.lampPools) flushLampPools(obj);
  });

  scene.add(floor1, exterior);

  world.setDayNight = (night) => applyDayNight(world, night);
  world.update = (dt) => updateWorld(world, dt);

  // Isi target kamera per ruangan dari data ZONES (dipakai dock navigasi).
  for (const [area, zone] of Object.entries(ZONES[1])) {
    world.roomTargets.set(area, new THREE.Vector3(zone.cx, FLOOR_Y[1] + 1.4, zone.cz));
  }

  return world;
}
