import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/**
 * officeWorld.js — KANTOR AI ID.
 * Modern Western office: open plan, glass partitions per division, biophilic design.
 * Lightweight: instanced meshes + merged geometry + shared materials.
 *
 * Layout 3x3 (±30 x ±22 m): musala, meeting, coffee bar / studio, open workspace,
 * client lounge / gym, lounge & garden, pantry. Koridor 3-5 m di antara zona.
 */

export const FLOOR_Y = { 1: 0 };
export const BUILDING = { minX: -30, maxX: 30, minZ: -22, maxZ: 22, wallHeight: 3.6 };
export const WALL = "#f8f6f2";
export const WALL_TOP = "#e8e4dc";

export const ZONES = {
  1: {
    masjid: { label: "Musala", cx: -21, cz: -14, w: 16, d: 8 },
    meeting: { label: "Meeting Room", cx: 0, cz: -14, w: 16, d: 8 },
    kopi: { label: "Coffee Bar", cx: 21, cz: -14, w: 16, d: 8 },
    studio: { label: "Content Studio", cx: -21, cz: 0, w: 16, d: 14 },
    workspace: { label: "Open Workspace", cx: 0, cz: 0, w: 16, d: 14 },
    client: { label: "Client Lounge", cx: 21, cz: 0, w: 16, d: 14 },
    gym: { label: "Fitness Center", cx: -21, cz: 14, w: 16, d: 8 },
    lounge: { label: "Lounge & Garden", cx: 0, cz: 14, w: 16, d: 8 },
    pantry: { label: "Pantry & Kitchen", cx: 21, cz: 14, w: 16, d: 8 }
  }
};

export const AGENT_HOMES = {
  naga: { area: "meeting", x: 0, z: -14 },
  arif: { area: "client", x: 21, z: 0 },
  raka: { area: "workspace", x: -2, z: -2 },
  kirana: { area: "meeting", x: -3, z: -14 },
  nadia: { area: "studio", x: -21, z: -2 },
  dimas: { area: "studio", x: -18, z: -2 },
  bima: { area: "workspace", x: -4, z: -2 },
  dewi: { area: "studio", x: -24, z: -2 },
  gilang: { area: "client", x: 21, z: 4 },
  yoga: { area: "client", x: 18, z: 4 },
  bayu: { area: "client", x: 24, z: 4 },
  sari: { area: "client", x: 21, z: 2 }
};

/** 48 workstation — 4 cluster bench desk (4 kolom x 3 baris). */
export const DESK_LAYOUT = (() => {
  const desks = [];
  const blocks = [
    { cx: -4, cz: -3.5 },
    { cx: 4, cz: -3.5 },
    { cx: -4, cz: 3.5 },
    { cx: 4, cz: 3.5 }
  ];
  for (const b of blocks) {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        desks.push({
          x: b.cx - 3.0 + col * 2.0,
          z: b.cz - 2.2 + row * 2.2,
          kind: "desk"
        });
      }
    }
  }
  return desks;
})();

export const PALETTE = {
  ink: 0x2d2d2d,
  wood: 0xe8ddd0,
  oak: 0xf0e6d8,
  lightWood: 0xf5efe6,
  cream: 0xfaf8f4,
  red: 0xe05a4e,
  white: 0xffffff,
  green: 0x7ec87e,
  blue: 0x5a9fd4,
  gold: 0xf0c860,
  glass: 0xc8e8f0,
  water: 0x88c8f0,
  leaf: 0x6ec86e,
  concrete: 0xf0ece4,
  darkWood: 0x8a7a68,
  slate: 0x9a9a9a,
  sofa: 0xd4c8b8,
  sofaLight: 0xe4d8c8,
  rug: 0xd8c8a8,
  poolTile: 0x98d8f0,
  grass: 0x98d878,
  carpet: 0xf0ece4,
  rubber: 0xc8c0b8,
  curtain: 0xf8f4ec,
  skin: 0xf0d8c0,
  hair: 0x4a3828
};

/* ------------------------------------------------------------------ */
/* Helper geometri                                                     */
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

/* ------------------------------------------------------------------ */
/* Tekstur prosedural                                                  */
/* ------------------------------------------------------------------ */

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
      const shade = 222 + Math.floor(Math.random() * 26);
      ctx.fillStyle = `rgb(${shade}, ${Math.floor(shade * 0.88)}, ${Math.floor(shade * 0.72)})`;
      ctx.fillRect(0, row * plank, s, plank);
      ctx.strokeStyle = "rgba(150,120,90,.3)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-2, row * plank, s + 4, plank);
      for (let i = 0; i < 3; i += 1) {
        const y = row * plank + 4 + Math.random() * (plank - 8);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(s * 0.3, y + 2, s * 0.6, y - 2, s, y + 1);
        ctx.stroke();
      }
    }
  });
}

function carpetTexture(base = "#e8e4dc") {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 4200; i += 1) {
      const shade = 200 + Math.floor(Math.random() * 40);
      ctx.fillStyle = `rgba(${shade}, ${shade - 4}, ${shade - 12}, .5)`;
      ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    }
  });
}

function tileTexture(base = "#f4f2ee") {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);
    const step = s / 8;
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        const shade = 236 + Math.floor(Math.random() * 12);
        ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 6})`;
        ctx.fillRect(x * step + 1, y * step + 1, step - 2, step - 2);
      }
    }
  });
}

function grassTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = "#7fb86a";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 6000; i += 1) {
      const g = 110 + Math.floor(Math.random() * 70);
      ctx.fillStyle = `rgba(${Math.floor(g * 0.55)}, ${g}, ${Math.floor(g * 0.5)}, .55)`;
      ctx.fillRect(Math.random() * s, Math.random() * s, 2, 3);
    }
  });
}

function rugTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = "#d8c8a8";
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "rgba(255,250,240,.5)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, 24 + i * 26, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function prayRugTexture() {
  return makeCanvas(128, (ctx, s) => {
    ctx.fillStyle = "#3a4a4a";
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "rgba(240,235,210,.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, s - 12, s - 12);
    ctx.beginPath();
    ctx.moveTo(s / 2, 14);
    ctx.lineTo(s - 14, s / 2);
    ctx.lineTo(s / 2, s - 14);
    ctx.lineTo(14, s / 2);
    ctx.closePath();
    ctx.stroke();
  });
}

function menuBoardTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = "#1e2126";
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "#c8a860";
    ctx.lineWidth = 5;
    ctx.strokeRect(8, 8, s - 16, s - 16);
    ctx.fillStyle = "#f5efe0";
    ctx.font = "bold 24px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("COFFEE BAR", s / 2, 42);
    ctx.font = "15px Georgia, serif";
    ctx.fillStyle = "#d8d0c0";
    const items = ["Espresso", "Cappuccino", "Matcha Latte", "Cold Brew", "Roti Bakar", "Kopi Susu"];
    items.forEach((t, i) => ctx.fillText(t, s / 2, 82 + i * 26));
  });
}

function wallArtTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = "#f0ece4";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "#5a9fd4";
    ctx.beginPath();
    ctx.arc(s * 0.35, s * 0.4, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e05a4e";
    ctx.fillRect(s * 0.55, s * 0.25, 60, 60);
    ctx.fillStyle = "#7ec87e";
    ctx.beginPath();
    ctx.moveTo(s * 0.2, s * 0.8);
    ctx.lineTo(s * 0.4, s * 0.55);
    ctx.lineTo(s * 0.6, s * 0.8);
    ctx.closePath();
    ctx.fill();
  });
}

/* ------------------------------------------------------------------ */
/* NavGrid — A* pathfinding NPC                                        */
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
/* InstancePool — 1 draw call untuk banyak objek                       */
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
  const woodMat = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5, metalness: 0.03, color: 0xf0e6d8 });
  const carpet = carpetTexture();
  const carpetMat = new THREE.MeshStandardMaterial({ map: carpet, roughness: 0.95, metalness: 0, color: 0xf0ece4 });
  const tile = tileTexture();
  const tileMat = new THREE.MeshStandardMaterial({ map: tile, roughness: 0.3, metalness: 0.02, color: 0xf8f6f2 });
  const grass = grassTexture();
  const grassMat = new THREE.MeshStandardMaterial({ map: grass, roughness: 0.95, metalness: 0, color: 0x98d878 });
  const rug = rugTexture();
  const rugMat = new THREE.MeshStandardMaterial({ map: rug, roughness: 0.92, metalness: 0, color: 0xd8c8a8 });
  const prayRug = prayRugTexture();
  const prayRugMat = new THREE.MeshStandardMaterial({ map: prayRug, roughness: 0.9, metalness: 0, color: 0x4a5a5a });
  const menu = menuBoardTexture();
  const menuMat = new THREE.MeshStandardMaterial({ map: menu, roughness: 0.85, metalness: 0, color: 0xf0ece4 });
  const art = wallArtTexture();
  const artMat = new THREE.MeshStandardMaterial({ map: art, roughness: 0.9, metalness: 0, color: 0xf0ece4 });
  const vertexMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.05 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xd8ecf4, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.4, metalness: 0.8 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xb8b8b8, roughness: 0.3, metalness: 0.75 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.45, metalness: 0.6 });
  const fabricMat = new THREE.MeshStandardMaterial({ color: 0xd4c8b8, roughness: 0.95, metalness: 0 });
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x1a2530, emissive: 0x4a8ac8, emissiveIntensity: 0.5, roughness: 0.25, metalness: 0.1
  });
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0xf8f6f2, emissive: 0xfff2cf, emissiveIntensity: 0.85, roughness: 0.4, metalness: 0
  });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x6ec86e, roughness: 0.85, metalness: 0 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x88c8f0, transparent: true, opacity: 0.7, roughness: 0.12, metalness: 0.05
  });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8f6f2, roughness: 0.9, metalness: 0 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.85, metalness: 0 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0xc8c0b8, roughness: 0.95, metalness: 0 });
  const sageMat = new THREE.MeshStandardMaterial({ color: 0xa8c8a8, roughness: 0.8, metalness: 0 });
  const terracottaMat = new THREE.MeshStandardMaterial({ color: 0xd88a6a, roughness: 0.8, metalness: 0 });
  const navyMat = new THREE.MeshStandardMaterial({ color: 0x3a5a7a, roughness: 0.8, metalness: 0 });
  return {
    woodMat, carpetMat, tileMat, grassMat, rugMat, prayRugMat, menuMat, artMat, vertexMat, glassMat, frameMat,
    metalMat, darkMetal, fabricMat, screenMat, ledMat, leafMat, waterMat, wallMat, concreteMat, rubberMat,
    sageMat, terracottaMat, navyMat
  };
}

/* ------------------------------------------------------------------ */
/* Helper mesh & mebel modern                                          */
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

/** Meja bench modern + kursi ergonomis + monitor. */
function buildDeskCluster(M, parent, x, z, ry, world) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);

  mesh(rbox(1.9, 0.06, 1.0, 0xf5efe6, 0.02), M.vertexMat, 0, 0.74, 0, 0, g);
  mesh(box(1.9, 0.02, 0.06, 0xe8ddd0), M.vertexMat, 0, 0.72, 0.47, 0, g, false);
  for (const dx of [-0.85, 0.85]) {
    mesh(box(0.06, 0.72, 0.06, 0x2d2d2d), M.vertexMat, dx, 0.36, -0.35, 0, g, false);
    mesh(box(0.06, 0.72, 0.06, 0x2d2d2d), M.vertexMat, dx, 0.36, 0.35, 0, g, false);
  }
  mesh(box(0.58, 0.34, 0.025, 0x1a2530), M.vertexMat, 0, 1.04, -0.26, 0, g, false);
  mesh(box(0.5, 0.26, 0.01, 0x3d6a8a), M.screenMat, 0, 1.04, -0.245, 0, g, false);
  mesh(box(0.08, 0.16, 0.04, 0x2d2d2d), M.vertexMat, 0, 0.84, -0.26, 0, g, false);
  mesh(box(0.44, 0.018, 0.15, 0xf0ece4), M.vertexMat, 0, 0.78, 0.1, 0, g, false);
  mesh(box(0.08, 0.018, 0.12, 0xf0ece4), M.vertexMat, 0.36, 0.78, 0.1, 0, g, false);
  mesh(sph(0.05, 6, 5, 0x6ec86e), M.vertexMat, -0.6, 0.84, -0.26, 0, g, false);

  const chair = new THREE.Group();
  chair.position.set(0, 0, 0.9);
  chair.rotation.y = Math.PI;
  g.add(chair);
  mesh(rbox(0.52, 0.06, 0.5, 0x3a3a3a, 0.02), M.vertexMat, 0, 0.45, 0, 0, chair, false);
  mesh(rbox(0.5, 0.5, 0.05, 0x3a3a3a, 0.02), M.vertexMat, 0, 0.72, -0.22, 0, chair, false);
  mesh(cyl(0.025, 0.025, 0.42, 6, 0x2d2d2d), M.vertexMat, 0, 0.22, 0, 0, chair, false);
  for (const a of [0.6, 2.4, 4.2]) {
    mesh(box(0.04, 0.02, 0.3, 0x2d2d2d), M.vertexMat, Math.cos(a) * 0.18, 0.02, Math.sin(a) * 0.18, 0, chair, false);
  }
  world.nav.blockRect(x, z, 2.0, 1.6);
}

/** Tanaman hias — instanced per parent. */
function buildPlant(M, parent, x, z, scale = 1) {
  if (!parent.userData.plantPools) {
    parent.userData.plantPools = {
      trunk: new InstancePool(M.vertexMat, cyl(0.12, 0.16, 0.3, 8, 0x8a6a4a)),
      leaf1: new InstancePool(M.vertexMat, sph(0.32, 8, 6, 0x4e9d57)),
      leaf2: new InstancePool(M.vertexMat, sph(0.24, 8, 6, 0x5cae63)),
      leaf3: new InstancePool(M.vertexMat, sph(0.18, 8, 6, 0x3f8a4c)),
      pot: new InstancePool(M.vertexMat, cyl(0.2, 0.16, 0.24, 10, 0xd8d0c4))
    };
  }
  const p = parent.userData.plantPools;
  p.pot.add(x, 0.12 * scale, z, 0, scale, scale, scale);
  p.trunk.add(x, 0.3 * scale, z, 0, scale, scale, scale);
  p.leaf1.add(x, 0.55 * scale, z, 0, scale, scale, scale);
  p.leaf2.add(x + 0.14 * scale, 0.75 * scale, z + 0.05 * scale, 0, scale, scale, scale);
  p.leaf3.add(x - 0.13 * scale, 0.8 * scale, z - 0.07 * scale, 0, scale, scale, scale);
}

function flushPlantPools(parent) {
  const p = parent.userData.plantPools;
  if (!p) return;
  for (const pool of Object.values(p)) pool.build(parent, { castShadow: false, receiveShadow: false });
  parent.userData.plantPools = null;
}

/** Lampu linear LED modern — instanced. */
function buildLinearLight(M, parent, world, x, z, y = 3.0, len = 2.4) {
  if (!parent.userData.linearPools) {
    parent.userData.linearPools = {
      housing: new InstancePool(M.vertexMat, box(0.08, 0.06, len, 0x2d2d2d)),
      strip: new InstancePool(M.ledMat, box(0.05, 0.02, len - 0.1, 0xfff2cf))
    };
  }
  const p = parent.userData.linearPools;
  p.housing.add(x, y, z);
  p.strip.add(x, y - 0.03, z);
  world.lampMaterials.push(M.ledMat);
}

function flushLinearPools(parent) {
  const p = parent.userData.linearPools;
  if (!p) return;
  p.housing.build(parent, { castShadow: false, receiveShadow: false });
  p.strip.build(parent, { castShadow: false, receiveShadow: false });
  parent.userData.linearPools = null;
}

/** Sofa modular modern + coffee table. */
function buildSofaSet(M, parent, x, z, ry = 0, color = 0xd4c8b8) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);
  mesh(rbox(2.2, 0.45, 0.9, color, 0.06), M.vertexMat, 0, 0.28, -0.15, 0, g);
  mesh(rbox(2.2, 0.6, 0.22, color, 0.06), M.vertexMat, 0, 0.62, -0.5, 0, g);
  mesh(rbox(0.22, 0.45, 0.9, color, 0.05), M.vertexMat, -1.0, 0.45, -0.15, 0, g);
  mesh(rbox(0.22, 0.45, 0.9, color, 0.05), M.vertexMat, 1.0, 0.45, -0.15, 0, g);
  mesh(rbox(0.6, 0.18, 0.4, 0xe4d8c8, 0.04), M.vertexMat, -0.4, 0.55, -0.15, 0, g, false);
  mesh(rbox(0.6, 0.18, 0.4, 0xe4d8c8, 0.04), M.vertexMat, 0.4, 0.55, -0.15, 0, g, false);
  return g;
}

/** Meja rapat modern + kursi. */
function buildTableSet(M, parent, x, z, ry, w = 1.8, d = 1.0, seats = 4, world) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);
  mesh(rbox(w, 0.06, d, 0xf5efe6, 0.02), M.vertexMat, 0, 0.74, 0, 0, g);
  for (const dx of [-w / 2 + 0.1, w / 2 - 0.1]) {
    mesh(box(0.05, 0.72, 0.05, 0x2d2d2d), M.vertexMat, dx, 0.36, -d / 2 + 0.1, 0, g, false);
    mesh(box(0.05, 0.72, 0.05, 0x2d2d2d), M.vertexMat, dx, 0.36, d / 2 - 0.1, 0, g, false);
  }
  const positions = [];
  for (let i = 0; i < seats; i += 1) {
    const t = seats === 1 ? 0.5 : i / (seats - 1);
    const px = (t - 0.5) * (w - 0.5);
    const side = i % 2 === 0 ? 1 : -1;
    positions.push({ x: px, z: side * (d / 2 + 0.4), ry: side > 0 ? Math.PI : 0 });
  }
  for (const s of positions) {
    const c = new THREE.Group();
    c.position.set(s.x, 0, s.z);
    c.rotation.y = s.ry;
    g.add(c);
    mesh(rbox(0.44, 0.05, 0.42, 0x3a3a3a, 0.02), M.vertexMat, 0, 0.44, 0, 0, c, false);
    mesh(rbox(0.44, 0.46, 0.05, 0x3a3a3a, 0.02), M.vertexMat, 0, 0.68, -0.19, 0, c, false);
  }
  if (world) world.nav.blockRect(x, z, w + 0.5, d + 1.3);
  return g;
}

/** Rak buku modern. */
function buildShelf(M, parent, x, z, ry, w = 1.8, world) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);
  mesh(box(w, 0.04, 0.34, 0xf5efe6), M.vertexMat, 0, 0.12, 0, 0, g, false);
  mesh(box(w, 0.04, 0.34, 0xf5efe6), M.vertexMat, 0, 0.72, 0, 0, g, false);
  mesh(box(w, 0.04, 0.34, 0xf5efe6), M.vertexMat, 0, 1.32, 0, 0, g, false);
  mesh(box(w, 1.44, 0.04, 0xe8ddd0), M.vertexMat, 0, 0.72, -0.16, 0, g, false);
  const colors = [0xe05a4e, 0x5a9fd4, 0xf0c860, 0x7ec87e, 0xd88a6a, 0x3a5a7a, 0xa8c8a8, 0x8a7a68];
  for (let i = 0; i < 12; i += 1) {
    const lvl = i % 3;
    const bx = -w / 2 + 0.2 + ((i * 0.13) % (w - 0.4));
    mesh(box(0.13, 0.32, 0.22, colors[i % colors.length]), M.vertexMat, bx, 0.34 + lvl * 0.6, 0, 0, g, false);
  }
  if (world) world.nav.blockRect(x, z, w, 0.6);
  return g;
}

/** Reception desk modern. */
function buildReceptionDesk(M, parent, x, z, ry) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);
  mesh(rbox(3.2, 1.1, 0.8, 0xf5efe6, 0.04), M.vertexMat, 0, 0.55, 0, 0, g);
  mesh(rbox(3.4, 0.06, 1.0, 0xe8ddd0, 0.03), M.vertexMat, 0, 1.13, 0, 0, g);
  mesh(box(0.4, 0.3, 0.02, 0x1a2530), M.screenMat, -0.8, 1.35, 0, 0, g, false);
  mesh(box(0.34, 0.22, 0.01, 0x3d6a8a), M.screenMat, -0.8, 1.35, 0.01, 0, g, false);
  mesh(sph(0.08, 8, 6, 0x6ec86e), M.vertexMat, 1.0, 1.25, 0, 0, g, false);
  return g;
}

/** Phone booth modern. */
function buildPhoneBooth(M, parent, x, z, ry) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);
  mesh(box(1.0, 2.4, 0.08, 0x3a3a3a), M.vertexMat, 0, 1.2, -0.45, 0, g);
  mesh(box(0.08, 2.4, 0.9, 0x3a3a3a), M.vertexMat, -0.5, 1.2, 0, 0, g);
  mesh(box(0.08, 2.4, 0.9, 0x3a3a3a), M.vertexMat, 0.5, 1.2, 0, 0, g);
  mesh(box(1.0, 0.08, 0.9, 0x3a3a3a), M.vertexMat, 0, 2.4, 0, 0, g);
  mesh(box(0.9, 0.06, 0.8, 0xf5efe6), M.vertexMat, 0, 0.9, 0, 0, g, false);
  mesh(box(0.5, 0.5, 0.06, 0x3a3a3a), M.vertexMat, 0, 1.5, -0.4, 0, g, false);
  return g;
}

/* ------------------------------------------------------------------ */
/* Glass partition system — dinding kaca dengan frame metal tipis      */
/* ------------------------------------------------------------------ */

function initGlassPools(world, M) {
  world.glassPools = {
    panel: new InstancePool(M.glassMat, new THREE.BoxGeometry(1.44, 3.0, 0.04)),
    post: new InstancePool(M.frameMat, new THREE.BoxGeometry(0.07, 3.05, 0.07)),
    railTop: new InstancePool(M.frameMat, new THREE.BoxGeometry(1.5, 0.07, 0.07)),
    railBottom: new InstancePool(M.frameMat, new THREE.BoxGeometry(1.5, 0.07, 0.07)),
    door: new InstancePool(M.glassMat, new THREE.BoxGeometry(1.3, 2.2, 0.03)),
    doorHandle: new InstancePool(M.frameMat, new THREE.BoxGeometry(0.04, 0.3, 0.04))
  };
}

/**
 * Tambah dinding kaca. x,z = tengah dinding, len = panjang, ry = rotasi.
 * opts.door = true → ada bukaan pintu 1.4m di tengah.
 */
function glassWall(world, x, z, len, h, ry, opts = {}) {
  const door = opts.door || false;
  const p = world.glassPools;
  const panelW = 1.5;
  const doorW = 1.4;
  const cos = Math.cos(ry);
  const sin = Math.sin(ry);
  const wx = (offset) => x + cos * offset;
  const wz = (offset) => z - sin * offset;

  const addSegment = (start, segLen) => {
    const count = Math.max(1, Math.round(segLen / panelW));
    for (let i = 0; i < count; i += 1) {
      const offset = start + panelW / 2 + i * panelW;
      p.panel.add(wx(offset), h / 2, wz(offset), ry);
      p.post.add(wx(offset - panelW / 2), h / 2, wz(offset - panelW / 2), ry);
      p.railTop.add(wx(offset), h - 0.035, wz(offset), ry);
      p.railBottom.add(wx(offset), 0.035, wz(offset), ry);
    }
  };

  if (door) {
    const sideLen = (len - doorW) / 2;
    addSegment(-len / 2, sideLen);
    addSegment(doorW / 2, sideLen);
    p.post.add(wx(-doorW / 2), h / 2, wz(-doorW / 2), ry);
    p.post.add(wx(doorW / 2), h / 2, wz(doorW / 2), ry);
    p.door.add(wx(0), 1.1, wz(0), ry);
    p.doorHandle.add(wx(0.5), 1.0, wz(0.5), ry);
  } else {
    addSegment(-len / 2, len);
    p.post.add(wx(len / 2), h / 2, wz(len / 2), ry);
  }
}

/** Dinding kaca di sekeliling zona (sisi yang menghadap koridor). */
function buildZoneGlassWalls(world, zone, sides, doorSide, h = 3.0) {
  const { cx, cz, w, d } = zone;
  for (const side of sides) {
    let x, z, len, ry;
    if (side === "n") { x = cx; z = cz - d / 2; len = w; ry = 0; }
    else if (side === "s") { x = cx; z = cz + d / 2; len = w; ry = 0; }
    else if (side === "e") { x = cx + w / 2; z = cz; len = d; ry = Math.PI / 2; }
    else { x = cx - w / 2; z = cz; len = d; ry = Math.PI / 2; }
    glassWall(world, x, z, len, h, ry, { door: side === doorSide });
  }
}

function flushGlassPools(world, parent) {
  const p = world.glassPools;
  if (!p) return;
  for (const pool of Object.values(p)) pool.build(parent, { castShadow: false, receiveShadow: false });
  world.glassPools = null;
}

/* ------------------------------------------------------------------ */
/* Patch lantai tak kasat mata per zona                                */
/* ------------------------------------------------------------------ */

function buildZonePatches(world, parent) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, transparent: true, opacity: 0.001, roughness: 1, metalness: 0, depthWrite: false
  });
  for (const floorKey of Object.keys(ZONES)) {
    for (const [area, zone] of Object.entries(ZONES[floorKey])) {
      const patch = new THREE.Mesh(new THREE.PlaneGeometry(zone.w - 0.3, zone.d - 0.3), mat);
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(zone.cx, 0.055, zone.cz);
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
/* Shell — lantai, dinding, facade kaca, entrance                      */
/* ------------------------------------------------------------------ */

function buildShell(world, parent, M) {
  const W = BUILDING;
  const innerW = W.maxX - W.minX;
  const innerD = W.maxZ - W.minZ;

  const floor = mesh(new THREE.BoxGeometry(innerW + 2, 0.2, innerD + 2), M.concreteMat, 0, -0.1, 0, 0, parent, false);
  floor.receiveShadow = true;
  const woodFloor = mesh(new THREE.BoxGeometry(innerW, 0.04, innerD), M.woodMat, 0, 0.02, 0, 0, parent, false);
  woodFloor.receiveShadow = true;

  // Dinding putih — Utara, Timur, Barat (selatan = facade kaca)
  const mkWall = (w, h, d, x, y, z) => mesh(box(w, h, d, 0xf8f6f2), M.wallMat, x, y, z, 0, parent, true);
  mkWall(innerW + 0.6, W.wallHeight, 0.3, 0, W.wallHeight / 2, W.minZ - 0.15);
  mkWall(0.3, W.wallHeight, innerD + 0.6, W.minX - 0.15, W.wallHeight / 2, 0);
  mkWall(0.3, W.wallHeight, innerD + 0.6, W.maxX + 0.15, W.wallHeight / 2, 0);

  // Facade kaca selatan (entrance)
  const facadeZ = W.maxZ + 0.15;
  const facadePanelW = 3.0;
  const facadeCount = Math.floor(innerW / facadePanelW);
  for (let i = 0; i < facadeCount; i += 1) {
    const fx = -innerW / 2 + facadePanelW / 2 + i * facadePanelW;
    if (Math.abs(fx) < 3.5) continue;
    mesh(box(facadePanelW - 0.1, 3.2, 0.06, 0xd8ecf4), M.glassMat, fx, 1.6, facadeZ, 0, parent, false);
    mesh(box(0.08, 3.3, 0.08, 0x2d2d2d), M.frameMat, fx - facadePanelW / 2, 1.65, facadeZ, 0, parent, false);
  }
  mesh(box(0.08, 3.3, 0.08, 0x2d2d2d), M.frameMat, -3.5, 1.65, facadeZ, 0, parent, false);
  mesh(box(0.08, 3.3, 0.08, 0x2d2d2d), M.frameMat, 3.5, 1.65, facadeZ, 0, parent, false);
  mesh(box(innerW + 0.6, 0.12, 0.12, 0x2d2d2d), M.frameMat, 0, 3.3, facadeZ, 0, parent, false);
  mesh(box(7.0, 0.1, 0.1, 0x2d2d2d), M.frameMat, 0, 3.25, facadeZ, 0, parent, false);

  // Kanopi entrance
  mesh(box(9.0, 0.15, 2.5, 0xf5efe6), M.wallMat, 0, 3.5, W.maxZ + 1.2, 0, parent, false);
  for (const dx of [-4.0, 4.0]) {
    mesh(cyl(0.06, 0.06, 3.5, 8, 0x2d2d2d), M.frameMat, dx, 1.75, W.maxZ + 2.2, 0, parent, false);
  }

  // Baseboard
  mesh(box(innerW + 0.6, 0.12, 0.34, 0xe8e4dc), M.wallMat, 0, 0.06, W.minZ - 0.15, 0, parent, false);
  mesh(box(0.34, 0.12, innerD + 0.6, 0xe8e4dc), M.wallMat, W.minX - 0.15, 0.06, 0, 0, parent, false);
  mesh(box(0.34, 0.12, innerD + 0.6, 0xe8e4dc), M.wallMat, W.maxX + 0.15, 0.06, 0, 0, parent, false);

  // Koridor — carpet runner
  mesh(new THREE.BoxGeometry(5.0, 0.03, innerD - 8), M.carpetMat, -10.5, 0.045, 0, 0, parent, false);
  mesh(new THREE.BoxGeometry(5.0, 0.03, innerD - 8), M.carpetMat, 10.5, 0.045, 0, 0, parent, false);
  mesh(new THREE.BoxGeometry(innerW - 8, 0.03, 3.0), M.carpetMat, 0, 0.045, -8.5, 0, parent, false);
  mesh(new THREE.BoxGeometry(innerW - 8, 0.03, 3.0), M.carpetMat, 0, 0.045, 8.5, 0, parent, false);

  // Reception dekat entrance
  buildReceptionDesk(M, parent, 0, 19.5, Math.PI);
  buildPlant(M, parent, -5.5, 19.5, 1.2);
  buildPlant(M, parent, 5.5, 19.5, 1.2);
  mesh(box(6.0, 2.4, 0.15, 0xf0ece4), M.wallMat, 0, 1.8, 21.0, 0, parent, false);
  mesh(box(5.6, 0.06, 0.06, 0xe05a4e), M.vertexMat, 0, 2.6, 20.9, 0, parent, false);
  mesh(box(5.6, 0.06, 0.06, 0x2d2d2d), M.vertexMat, 0, 1.0, 20.9, 0, parent, false);
}

/* ------------------------------------------------------------------ */
/* Zona: Musala — ruang tenang modern                                  */
/* ------------------------------------------------------------------ */

function buildMasjid(world, parent, M) {
  const z = ZONES[1].masjid;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.04, z.d), M.carpetMat, z.cx, 0.04, z.cz, 0, g, false);

  for (let i = 0; i < 6; i += 1) {
    mesh(new THREE.BoxGeometry(1.0, 0.025, 1.6), M.prayRugMat,
      z.cx - 4.5 + (i % 3) * 2.4, 0.055, z.cz - 1.5 + Math.floor(i / 3) * 3.0, 0, g, false);
  }

  mesh(box(3.2, 2.8, 0.12, 0x3a4a4a), M.vertexMat, z.cx, 1.4, z.cz - z.d / 2 + 0.15, 0, g);
  mesh(box(2.6, 0.08, 0.16, 0xf0c860), M.vertexMat, z.cx, 1.4, z.cz - z.d / 2 + 0.22, 0, g, false);
  mesh(box(1.8, 1.8, 0.06, 0x2a3a3a), M.vertexMat, z.cx, 1.4, z.cz - z.d / 2 + 0.26, 0, g, false);
  mesh(box(1.0, 2.0, 0.25, 0x4a5a5a), M.vertexMat, z.cx, 1.0, z.cz - z.d / 2 + 0.35, 0, g, false);

  mesh(rbox(0.7, 0.45, 0.7, 0xf5efe6, 0.03), M.vertexMat, z.cx + 2.2, 0.225, z.cz - z.d / 2 + 1.2, 0, g);
  mesh(rbox(0.7, 0.9, 0.1, 0xf5efe6, 0.03), M.vertexMat, z.cx + 2.2, 0.9, z.cz - z.d / 2 + 1.2, 0, g, false);
  mesh(sph(0.1, 8, 6, 0xf0c860), M.vertexMat, z.cx + 2.2, 1.45, z.cz - z.d / 2 + 1.2, 0, g, false);

  mesh(cyl(0.55, 0.45, 0.5, 12, 0xe8e4dc), M.vertexMat, z.cx + 5.5, 0.25, z.cz + 2.0, 0, g);
  mesh(sph(0.42, 10, 6, 0x9fd8da), M.waterMat, z.cx + 5.5, 0.5, z.cz + 2.0, 0, g, false);
  world.waterMaterials.push(M.waterMat);

  buildPlant(M, g, z.cx - 6.0, z.cz + 2.5, 1.0);
  buildPlant(M, g, z.cx + 6.0, z.cz - 2.5, 1.0);

  buildLinearLight(M, g, world, z.cx, z.cz, 3.0, 3.0);
  buildLinearLight(M, g, world, z.cx - 3, z.cz, 2.8, 2.0);
  buildLinearLight(M, g, world, z.cx + 3, z.cz, 2.8, 2.0);

  buildZoneGlassWalls(world, z, ["s", "e"], "s");

  world.decorativeSpots.push(
    { area: "masjid", x: z.cx - 2.4, z: z.cz - 1.5, floor: 1, activity: "sholat" },
    { area: "masjid", x: z.cx + 0.0, z: z.cz - 1.5, floor: 1, activity: "sholat" },
    { area: "masjid", x: z.cx - 2.4, z: z.cz + 1.5, floor: 1, activity: "sholat" },
    { area: "masjid", x: z.cx + 0.0, z: z.cz + 1.5, floor: 1, activity: "sholat" }
  );
  world.nav.blockRect(z.cx, z.cz - z.d / 2 + 1.2, 3.0, 1.6);
  world.nav.blockRect(z.cx + 5.5, z.cz + 2.0, 1.1, 1.1);
}

/* ------------------------------------------------------------------ */
/* Zona: Meeting Room — ruang rapat kaca modern                        */
/* ------------------------------------------------------------------ */

function buildMeeting(world, parent, M) {
  const z = ZONES[1].meeting;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.04, z.d), M.rugMat, z.cx, 0.04, z.cz, 0, g, false);

  mesh(cyl(2.4, 2.4, 0.06, 24, 0xf5efe6), M.vertexMat, z.cx, 0.76, z.cz, 0, g);
  mesh(cyl(0.14, 0.18, 0.74, 10, 0x2d2d2d), M.vertexMat, z.cx, 0.38, z.cz, 0, g, false);

  const seats = [];
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2;
    const sx = z.cx + Math.cos(a) * 3.4;
    const sz = z.cz + Math.sin(a) * 2.6;
    const c = new THREE.Group();
    c.position.set(sx, 0, sz);
    c.rotation.y = -a - Math.PI / 2;
    g.add(c);
    mesh(rbox(0.48, 0.05, 0.46, 0x3a3a3a, 0.02), M.vertexMat, 0, 0.44, 0, 0, c, false);
    mesh(rbox(0.48, 0.48, 0.05, 0x3a3a3a, 0.02), M.vertexMat, 0, 0.7, -0.21, 0, c, false);
    seats.push({ x: sx, z: sz });
  }
  world.meetingSeats = seats;
  world.nav.blockRect(z.cx, z.cz, 5.0, 5.6);

  mesh(box(3.0, 1.7, 0.05, 0x1a2530), M.screenMat, z.cx, 1.7, z.cz - z.d / 2 + 0.2, 0, g, false);
  mesh(box(2.2, 1.3, 0.04, 0xf8f6f2), M.vertexMat, z.cx + 4.5, 1.5, z.cz - z.d / 2 + 0.2, 0, g, false);
  mesh(box(2.0, 0.05, 0.06, 0x2d2d2d), M.vertexMat, z.cx + 4.5, 1.5, z.cz - z.d / 2 + 0.24, 0, g, false);

  buildLinearLight(M, g, world, z.cx, z.cz, 3.0, 3.5);
  buildPlant(M, g, z.cx - 6.0, z.cz + 2.5, 1.1);
  buildPlant(M, g, z.cx + 6.0, z.cz + 2.5, 1.1);

  buildZoneGlassWalls(world, z, ["s", "w", "e"], "s");

  world.decorativeSpots.push(
    { area: "meeting", x: z.cx - 3.4, z: z.cz, floor: 1, activity: "diskusi" },
    { area: "meeting", x: z.cx + 3.4, z: z.cz, floor: 1, activity: "diskusi" }
  );
}

/* ------------------------------------------------------------------ */
/* Zona: Coffee Bar — kedai kopi modern                                */
/* ------------------------------------------------------------------ */

function buildKopi(world, parent, M) {
  const z = ZONES[1].kopi;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.04, z.d), M.tileMat, z.cx, 0.04, z.cz, 0, g, false);

  mesh(rbox(6.0, 1.05, 0.9, 0xf5efe6, 0.04), M.vertexMat, z.cx, 0.525, z.cz - z.d / 2 + 1.2, 0, g);
  mesh(rbox(6.4, 0.06, 1.1, 0xe8ddd0, 0.03), M.vertexMat, z.cx, 1.08, z.cz - z.d / 2 + 1.2, 0, g);
  mesh(rbox(0.8, 0.6, 0.5, 0xb8b8b8, 0.04), M.vertexMat, z.cx - 2.0, 1.4, z.cz - z.d / 2 + 1.2, 0, g, false);
  mesh(box(0.25, 0.25, 0.25, 0x2d2d2d), M.vertexMat, z.cx - 2.0, 1.2, z.cz - z.d / 2 + 1.0, 0, g, false);
  mesh(box(1.8, 0.04, 0.5, 0xd8ecf4), M.glassMat, z.cx + 1.5, 1.35, z.cz - z.d / 2 + 1.2, 0, g, false);
  for (let i = 0; i < 4; i += 1) {
    mesh(cyl(0.06, 0.05, 0.1, 8, 0xf0ece4), M.vertexMat, z.cx + 0.9 + i * 0.4, 1.42, z.cz - z.d / 2 + 1.2, 0, g, false);
  }
  mesh(new THREE.PlaneGeometry(3.0, 3.0), M.menuMat, z.cx, 2.2, z.cz - z.d / 2 + 0.1, 0, g, false);

  for (let i = 0; i < 5; i += 1) {
    const sx = z.cx - 2.4 + i * 1.2;
    mesh(cyl(0.2, 0.2, 0.06, 10, 0x3a3a3a), M.vertexMat, sx, 0.72, z.cz - z.d / 2 + 2.4, 0, g, false);
    mesh(cyl(0.03, 0.14, 0.7, 8, 0x2d2d2d), M.vertexMat, sx, 0.36, z.cz - z.d / 2 + 2.4, 0, g, false);
  }

  buildTableSet(M, g, z.cx - 3.0, z.cz + 2.2, 0, 1.4, 1.4, 4, world);
  buildTableSet(M, g, z.cx + 3.0, z.cz + 2.2, 0, 1.4, 1.4, 4, world);
  buildTableSet(M, g, z.cx, z.cz + 3.6, 0, 1.4, 1.4, 4, world);

  buildLinearLight(M, g, world, z.cx - 3.0, z.cz + 2.2, 2.6, 2.0);
  buildLinearLight(M, g, world, z.cx + 3.0, z.cz + 2.2, 2.6, 2.0);
  buildLinearLight(M, g, world, z.cx, z.cz + 3.6, 2.6, 2.0);
  buildLinearLight(M, g, world, z.cx, z.cz - z.d / 2 + 2.0, 2.5, 2.5);

  buildPlant(M, g, z.cx - 6.0, z.cz + 3.0, 1.0);
  buildPlant(M, g, z.cx + 6.0, z.cz + 3.0, 1.0);
  buildPlant(M, g, z.cx + 6.0, z.cz - 3.0, 1.0);

  buildZoneGlassWalls(world, z, ["s", "w"], "s");

  world.decorativeSpots.push(
    { area: "kopi", x: z.cx - 3.0, z: z.cz + 2.2, floor: 1, activity: "ngopi" },
    { area: "kopi", x: z.cx + 3.0, z: z.cz + 2.2, floor: 1, activity: "ngopi" },
    { area: "kopi", x: z.cx, z: z.cz + 3.6, floor: 1, activity: "ngopi" },
    { area: "kopi", x: z.cx - 1.2, z: z.cz - z.d / 2 + 2.4, floor: 1, activity: "ngopi" }
  );
  world.nav.blockRect(z.cx, z.cz - z.d / 2 + 1.2, 6.4, 1.3);
}

/* ------------------------------------------------------------------ */
/* Zona: Content Studio — studio konten modern                         */
/* ------------------------------------------------------------------ */

function buildStudio(world, parent, M) {
  const z = ZONES[1].studio;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.04, z.d), M.carpetMat, z.cx, 0.04, z.cz, 0, g, false);

  mesh(box(5.0, 2.8, 0.08, 0x2f7a4a), M.vertexMat, z.cx, 1.4, z.cz - z.d / 2 + 0.3, 0, g, false);
  mesh(box(5.4, 0.08, 0.3, 0x2d2d2d), M.vertexMat, z.cx, 2.85, z.cz - z.d / 2 + 0.3, 0, g, false);

  for (const dx of [-2.6, 2.6]) {
    mesh(cyl(0.03, 0.03, 1.6, 6, 0x2d2d2d), M.vertexMat, z.cx + dx, 0.8, z.cz - 1.2, 0, g, false);
    mesh(box(0.5, 0.4, 0.4, 0x1a2530), M.vertexMat, z.cx + dx, 1.8, z.cz - 1.2, 0, g, false);
    mesh(box(0.4, 0.4, 0.06, 0xfff2cf), M.ledMat, z.cx + dx, 1.8, z.cz - 0.95, 0, g, false);
    for (let i = 0; i < 3; i += 1) {
      const a = (i / 3) * Math.PI * 2;
      mesh(cyl(0.02, 0.02, 0.8, 5, 0x2d2d2d), M.vertexMat,
        z.cx + dx + Math.cos(a) * 0.22, 0.4, z.cz - 1.2 + Math.sin(a) * 0.22, 0, g, false);
    }
  }

  mesh(cyl(0.4, 0.4, 0.04, 16, 0xfff2cf), M.ledMat, z.cx, 1.9, z.cz + 0.8, 0, g, false);
  mesh(cyl(0.025, 0.025, 1.8, 6, 0x2d2d2d), M.vertexMat, z.cx, 0.95, z.cz + 0.8, 0, g, false);
  mesh(box(0.3, 0.2, 0.25, 0x1a2530), M.vertexMat, z.cx, 1.9, z.cz + 0.6, 0, g, false);

  buildDeskCluster(M, g, z.cx - 4.0, z.cz + 4.0, Math.PI / 2, world);
  buildDeskCluster(M, g, z.cx - 4.0, z.cz + 1.8, Math.PI / 2, world);

  buildShelf(M, g, z.cx + 5.5, z.cz + 5.0, Math.PI / 2, 2.4, world);

  buildLinearLight(M, g, world, z.cx, z.cz, 3.0, 3.0);
  buildPlant(M, g, z.cx + 6.0, z.cz - 5.0, 1.0);

  buildZoneGlassWalls(world, z, ["n", "e", "s"], "e");

  world.decorativeSpots.push(
    { area: "studio", x: z.cx, z: z.cz + 0.8, floor: 1, activity: "baca" },
    { area: "studio", x: z.cx + 5.5, z: z.cz + 5.0, floor: 1, activity: "diskusi" }
  );
  world.nav.blockRect(z.cx, z.cz - z.d / 2 + 0.3, 5.4, 0.3);
  world.nav.blockRect(z.cx, z.cz - 1.2, 5.6, 0.8);
}

/* ------------------------------------------------------------------ */
/* Zona: Open Workspace — 48 meja bench modern                         */
/* ------------------------------------------------------------------ */

function buildWorkspace(world, parent, M) {
  const z = ZONES[1].workspace;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.04, z.d), M.carpetMat, z.cx, 0.04, z.cz, 0, g, false);

  const deskTop = new InstancePool(M.vertexMat, rbox(1.9, 0.06, 1.0, 0xf5efe6, 0.02));
  const deskEdge = new InstancePool(M.vertexMat, box(1.9, 0.02, 0.06, 0xe8ddd0));
  const deskLeg = new InstancePool(M.vertexMat, box(0.06, 0.72, 0.06, 0x2d2d2d));
  const monitor = new InstancePool(M.vertexMat, box(0.58, 0.34, 0.025, 0x1a2530));
  const screen = new InstancePool(M.screenMat, box(0.5, 0.26, 0.01, 0x3d6a8a));
  const stand = new InstancePool(M.vertexMat, box(0.08, 0.16, 0.04, 0x2d2d2d));
  const keyboard = new InstancePool(M.vertexMat, box(0.44, 0.018, 0.15, 0xf0ece4));
  const mouse = new InstancePool(M.vertexMat, box(0.08, 0.018, 0.12, 0xf0ece4));
  const potPlant = new InstancePool(M.vertexMat, sph(0.05, 6, 5, 0x6ec86e));
  const chairSeat = new InstancePool(M.vertexMat, rbox(0.52, 0.06, 0.5, 0x3a3a3a, 0.02));
  const chairBack = new InstancePool(M.vertexMat, rbox(0.5, 0.5, 0.05, 0x3a3a3a, 0.02));
  const chairLeg = new InstancePool(M.vertexMat, cyl(0.025, 0.025, 0.42, 6, 0x2d2d2d));

  for (const d of DESK_LAYOUT) {
    const { x, z: dz } = d;
    deskTop.add(x, 0.74, dz);
    deskEdge.add(x, 0.72, dz + 0.47);
    for (const dx of [-0.85, 0.85]) {
      deskLeg.add(x + dx, 0.36, dz - 0.35);
      deskLeg.add(x + dx, 0.36, dz + 0.35);
    }
    monitor.add(x, 1.04, dz - 0.26);
    screen.add(x, 1.04, dz - 0.245);
    stand.add(x, 0.84, dz - 0.26);
    keyboard.add(x, 0.78, dz + 0.1);
    mouse.add(x + 0.36, 0.78, dz + 0.1);
    potPlant.add(x - 0.6, 0.84, dz - 0.26);
    chairSeat.add(x, 0.45, dz + 0.9, Math.PI);
    chairBack.add(x, 0.72, dz + 1.12, Math.PI);
    chairLeg.add(x, 0.22, dz + 0.9, Math.PI);
    world.nav.blockRect(x, dz, 2.0, 1.6);
  }
  deskTop.build(g, { castShadow: true, receiveShadow: true });
  deskEdge.build(g, { castShadow: false, receiveShadow: false });
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

  for (const pz of [-3.5, 3.5]) {
    mesh(box(14.0, 1.1, 0.1, 0xa8c8a8), M.sageMat, 0, 0.55, pz, 0, g, false);
  }
  mesh(box(0.1, 1.1, 13.0, 0xa8c8a8), M.sageMat, 0, 0.55, 0, 0, g, false);

  buildPhoneBooth(M, g, -7.0, 5.5, 0);
  buildPhoneBooth(M, g, 7.0, 5.5, 0);

  buildPlant(M, g, -6.5, -5.5, 1.2);
  buildPlant(M, g, 6.5, -5.5, 1.2);
  buildPlant(M, g, -6.5, 5.5, 1.2);
  buildPlant(M, g, 6.5, 5.5, 1.2);

  for (const lx of [-4, 4]) {
    for (const lz of [-3.5, 3.5]) {
      buildLinearLight(M, g, world, lx, lz, 3.0, 3.0);
    }
  }

  world.decorativeSpots.push(
    { area: "workspace", x: -6.5, z: -5.5, floor: 1, activity: "santai" },
    { area: "workspace", x: 6.5, z: 5.5, floor: 1, activity: "diskusi" }
  );
}

/* ------------------------------------------------------------------ */
/* Zona: Client Lounge — lounge klien modern                           */
/* ------------------------------------------------------------------ */

function buildClient(world, parent, M) {
  const z = ZONES[1].client;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.04, z.d), M.rugMat, z.cx, 0.04, z.cz, 0, g, false);

  buildTableSet(M, g, z.cx, z.cz, 0, 2.4, 1.3, 6, world);
  buildSofaSet(M, g, z.cx, z.cz + 4.5, Math.PI, 0xd4c8b8);
  buildSofaSet(M, g, z.cx - 5.0, z.cz, Math.PI / 2, 0xa8c8a8);

  buildShelf(M, g, z.cx + 6.0, z.cz, Math.PI / 2, 3.0, world);
  buildShelf(M, g, z.cx - 6.0, z.cz, Math.PI / 2, 3.0, world);

  mesh(box(3.0, 1.7, 0.05, 0x1a2530), M.screenMat, z.cx, 1.7, z.cz - z.d / 2 + 0.2, 0, g, false);
  mesh(box(2.4, 0.5, 0.4, 0xf5efe6), M.vertexMat, z.cx, 0.25, z.cz - z.d / 2 + 0.2, 0, g, false);

  mesh(new THREE.PlaneGeometry(2.4, 1.6), M.artMat, z.cx + 6.8, 1.8, z.cz, -Math.PI / 2, g, false);

  buildLinearLight(M, g, world, z.cx, z.cz, 3.0, 3.0);
  buildPlant(M, g, z.cx - 6.0, z.cz + 5.5, 1.1);
  buildPlant(M, g, z.cx + 6.0, z.cz + 5.5, 1.1);

  buildZoneGlassWalls(world, z, ["n", "w", "s"], "w");

  world.decorativeSpots.push(
    { area: "client", x: z.cx, z: z.cz + 2.4, floor: 1, activity: "diskusi" },
    { area: "client", x: z.cx - 6.0, z: z.cz, floor: 1, activity: "baca" },
    { area: "client", x: z.cx + 6.0, z: z.cz, floor: 1, activity: "baca" }
  );
}

/* ------------------------------------------------------------------ */
/* Zona: Fitness Center — gym modern                                   */
/* ------------------------------------------------------------------ */

function buildGym(world, parent, M) {
  const z = ZONES[1].gym;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.05, z.d), M.rubberMat, z.cx, 0.05, z.cz, 0, g, false);

  for (let i = 0; i < 3; i += 1) {
    const tx = z.cx - 4.5 + i * 2.2;
    mesh(rbox(0.8, 0.1, 1.9, 0x3a3a3a, 0.03), M.vertexMat, tx, 0.25, z.cz - 2.0, 0, g);
    mesh(rbox(0.7, 0.05, 1.7, 0x5a5a5a, 0.02), M.vertexMat, tx, 0.32, z.cz - 2.0, 0, g, false);
    mesh(cyl(0.04, 0.04, 1.1, 8, 0xb8b8b8), M.vertexMat, tx - 0.35, 0.8, z.cz - 2.8, 0.3, g, false);
    mesh(cyl(0.04, 0.04, 1.1, 8, 0xb8b8b8), M.vertexMat, tx + 0.35, 0.8, z.cz - 2.8, 0.3, g, false);
    mesh(box(0.45, 0.35, 0.08, 0x1a2530), M.screenMat, tx, 1.2, z.cz - 2.85, 0.3, g, false);
  }

  mesh(rbox(0.45, 0.1, 1.5, 0x3a3a3a, 0.03), M.vertexMat, z.cx + 3.5, 0.45, z.cz - 1.5, 0, g);
  mesh(cyl(0.035, 0.035, 2.0, 8, 0xb8b8b8), M.vertexMat, z.cx + 3.5, 0.9, z.cz - 1.5, Math.PI / 2, g, false);
  for (const dx of [-0.9, 0.9]) {
    mesh(cyl(0.14, 0.14, 0.05, 12, 0x2d2d2d), M.vertexMat, z.cx + 3.5 + dx, 0.9, z.cz - 1.5, Math.PI / 2, g, false);
  }

  mesh(box(1.8, 0.4, 0.4, 0x3a3a3a), M.vertexMat, z.cx - 3.5, 0.2, z.cz + 2.5, 0, g);
  for (let i = 0; i < 5; i += 1) {
    const dx = z.cx - 4.1 + i * 0.3;
    mesh(cyl(0.04, 0.04, 0.25, 8, 0xb8b8b8), M.vertexMat, dx, 0.5, z.cz + 2.5, 0, g, false);
    mesh(cyl(0.08, 0.08, 0.06, 10, 0x2d2d2d), M.vertexMat, dx, 0.5, z.cz + 2.5 - 0.1, 0, g, false);
    mesh(cyl(0.08, 0.08, 0.06, 10, 0x2d2d2d), M.vertexMat, dx, 0.5, z.cz + 2.5 + 0.1, 0, g, false);
  }

  mesh(box(5.0, 2.2, 0.05, 0xd8ecf4), M.glassMat, z.cx, 1.3, z.cz + z.d / 2 - 0.15, 0, g, false);

  for (let i = 0; i < 3; i += 1) {
    mesh(rbox(0.6, 0.03, 1.7, 0x5a9fd4, 0.02), M.vertexMat, z.cx + 3.5 + i * 0.8, 0.08, z.cz + 1.5, 0, g, false);
  }

  buildPlant(M, g, z.cx - 6.0, z.cz + 3.0, 1.0);

  buildLinearLight(M, g, world, z.cx, z.cz, 3.0, 3.0);

  buildZoneGlassWalls(world, z, ["n", "e"], "n");

  world.decorativeSpots.push(
    { area: "gym", x: z.cx - 4.5, z: z.cz - 1.0, floor: 1, activity: "olahraga" },
    { area: "gym", x: z.cx - 2.3, z: z.cz - 1.0, floor: 1, activity: "olahraga" },
    { area: "gym", x: z.cx + 3.5, z: z.cz - 0.5, floor: 1, activity: "olahraga" },
    { area: "gym", x: z.cx + 3.5, z: z.cz + 1.5, floor: 1, activity: "olahraga" }
  );
  world.nav.blockRect(z.cx - 4.5, z.cz - 2.0, 6.6, 2.2);
  world.nav.blockRect(z.cx + 3.5, z.cz - 1.5, 2.4, 1.8);
  world.nav.blockRect(z.cx - 3.5, z.cz + 2.5, 2.2, 0.7);
}

/* ------------------------------------------------------------------ */
/* Zona: Lounge & Garden — lounge taman modern                          */
/* ------------------------------------------------------------------ */

function buildLounge(world, parent, M) {
  const z = ZONES[1].lounge;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.04, z.d), M.rugMat, z.cx, 0.04, z.cz, 0, g, false);

  buildSofaSet(M, g, z.cx - 2.5, z.cz - 1.5, 0, 0xd4c8b8);
  buildSofaSet(M, g, z.cx + 2.5, z.cz - 1.5, 0, 0xa8c8a8);
  buildSofaSet(M, g, z.cx, z.cz + 2.0, Math.PI, 0xd88a6a);

  mesh(cyl(0.65, 0.65, 0.05, 16, 0xf5efe6), M.vertexMat, z.cx, 0.4, z.cz, 0, g);
  mesh(cyl(0.08, 0.12, 0.38, 10, 0x2d2d2d), M.vertexMat, z.cx, 0.19, z.cz, 0, g, false);

  mesh(box(2.6, 1.4, 0.05, 0x1a2530), M.screenMat, z.cx, 1.6, z.cz - z.d / 2 + 0.2, 0, g, false);
  mesh(box(2.0, 0.45, 0.35, 0xf5efe6), M.vertexMat, z.cx, 0.225, z.cz - z.d / 2 + 0.2, 0, g, false);

  mesh(cyl(1.4, 1.4, 0.4, 20, 0xe8e4dc), M.vertexMat, z.cx + 5.5, 0.2, z.cz + 2.0, 0, g);
  mesh(sph(1.25, 16, 8, 0x4fb3cf), M.waterMat, z.cx + 5.5, 0.36, z.cz + 2.0, 0, g, false);
  world.waterMaterials.push(M.waterMat);

  for (let i = 0; i < 6; i += 1) {
    buildPlant(M, g, z.cx - 6.0 + (i % 3) * 2.2, z.cz + 3.0 + Math.floor(i / 3) * 1.0, 0.9 + (i % 3) * 0.15);
  }
  buildPlant(M, g, z.cx - 6.0, z.cz - 3.0, 1.2);
  buildPlant(M, g, z.cx + 6.0, z.cz - 3.0, 1.2);

  buildLinearLight(M, g, world, z.cx, z.cz, 3.0, 3.0);
  buildLinearLight(M, g, world, z.cx - 2.5, z.cz - 1.5, 2.6, 2.0);
  buildLinearLight(M, g, world, z.cx + 2.5, z.cz - 1.5, 2.6, 2.0);

  world.decorativeSpots.push(
    { area: "lounge", x: z.cx - 2.5, z: z.cz - 1.5, floor: 1, activity: "nonton" },
    { area: "lounge", x: z.cx + 2.5, z: z.cz - 1.5, floor: 1, activity: "nonton" },
    { area: "lounge", x: z.cx, z: z.cz + 2.0, floor: 1, activity: "santai" },
    { area: "lounge", x: z.cx + 5.5, z: z.cz + 2.0, floor: 1, activity: "renang" }
  );
  world.nav.blockRect(z.cx, z.cz, 1.8, 1.8);
  world.nav.blockRect(z.cx + 5.5, z.cz + 2.0, 2.8, 2.8);
}

/* ------------------------------------------------------------------ */
/* Zona: Pantry & Kitchen — dapur modern                               */
/* ------------------------------------------------------------------ */

function buildPantry(world, parent, M) {
  const z = ZONES[1].pantry;
  const g = new THREE.Group();
  parent.add(g);

  mesh(new THREE.BoxGeometry(z.w, 0.04, z.d), M.tileMat, z.cx, 0.04, z.cz, 0, g, false);

  mesh(rbox(6.0, 0.95, 0.9, 0xf5efe6, 0.04), M.vertexMat, z.cx, 0.475, z.cz - z.d / 2 + 1.2, 0, g);
  mesh(rbox(6.4, 0.05, 1.1, 0xe8ddd0, 0.03), M.vertexMat, z.cx, 0.98, z.cz - z.d / 2 + 1.2, 0, g);
  mesh(box(0.7, 0.05, 0.5, 0xb8b8b8), M.vertexMat, z.cx - 2.0, 1.02, z.cz - z.d / 2 + 1.2, 0, g, false);
  mesh(cyl(0.25, 0.2, 0.14, 12, 0xb8b8b8), M.vertexMat, z.cx + 2.0, 1.05, z.cz - z.d / 2 + 1.2, 0, g, false);
  mesh(cyl(0.25, 0.27, 0.32, 12, 0xf8f6f2), M.vertexMat, z.cx + 3.2, 1.18, z.cz - z.d / 2 + 1.2, 0, g, false);
  mesh(cyl(0.23, 0.23, 0.5, 12, 0x9fd8da), M.vertexMat, z.cx + 4.5, 0.25, z.cz - z.d / 2 + 2.0, 0, g, false);

  mesh(rbox(0.85, 1.9, 0.75, 0xb8b8b8, 0.04), M.vertexMat, z.cx - 5.5, 0.95, z.cz - z.d / 2 + 1.4, 0, g);
  mesh(box(0.05, 0.4, 0.05, 0x2d2d2d), M.vertexMat, z.cx - 5.1, 1.1, z.cz - z.d / 2 + 1.0, 0, g, false);

  buildTableSet(M, g, z.cx - 2.5, z.cz + 2.2, 0, 1.8, 1.0, 4, world);
  buildTableSet(M, g, z.cx + 2.5, z.cz + 2.2, 0, 1.8, 1.0, 4, world);
  buildTableSet(M, g, z.cx, z.cz + 3.8, 0, 1.8, 1.0, 4, world);

  buildLinearLight(M, g, world, z.cx - 2.5, z.cz + 2.2, 2.6, 2.0);
  buildLinearLight(M, g, world, z.cx + 2.5, z.cz + 2.2, 2.6, 2.0);
  buildLinearLight(M, g, world, z.cx, z.cz + 3.8, 2.6, 2.0);

  buildPlant(M, g, z.cx + 6.0, z.cz - 3.0, 1.0);

  buildZoneGlassWalls(world, z, ["n", "w"], "n");

  world.decorativeSpots.push(
    { area: "pantry", x: z.cx - 2.5, z: z.cz + 2.2, floor: 1, activity: "makan" },
    { area: "pantry", x: z.cx + 2.5, z: z.cz + 2.2, floor: 1, activity: "makan" },
    { area: "pantry", x: z.cx, z: z.cz + 3.8, floor: 1, activity: "makan" },
    { area: "pantry", x: z.cx + 4.5, z: z.cz - z.d / 2 + 2.0, floor: 1, activity: "ngopi" }
  );
  world.nav.blockRect(z.cx, z.cz - z.d / 2 + 1.2, 6.4, 1.3);
  world.nav.blockRect(z.cx - 5.5, z.cz - z.d / 2 + 1.4, 1.0, 0.9);
}

/* ------------------------------------------------------------------ */
/* Eksterior — taman modern, pohon, lampu, entrance                   */
/* ------------------------------------------------------------------ */

function buildExterior(world, parent, M) {
  const W = BUILDING;
  const g = new THREE.Group();
  parent.add(g);

  const ground = mesh(new THREE.BoxGeometry(110, 0.2, 100), M.grassMat, 0, -0.2, 0, 0, g, false);
  ground.receiveShadow = true;

  mesh(new THREE.BoxGeometry(110, 0.1, 8), M.concreteMat, 0, -0.02, W.maxZ + 12, 0, g, false);
  mesh(new THREE.BoxGeometry(0.12, 0.12, 8), M.ledMat, 0, 0.06, W.maxZ + 12, 0, g, false);
  mesh(new THREE.BoxGeometry(110, 0.14, 2.2), M.tileMat, 0, 0.0, W.maxZ + 7.2, 0, g, false);

  const fenceGeo = new THREE.BoxGeometry(0.1, 0.9, 0.1);
  paint(fenceGeo, 0x2d2d2d);
  const fence = new InstancePool(M.vertexMat, fenceGeo);
  for (let x = W.minX - 8; x <= W.maxX + 8; x += 2) {
    if (Math.abs(x) < 5) continue;
    fence.add(x, 0.45, W.maxZ + 5.2, 0, 1, 1, 1);
  }
  fence.build(g, { castShadow: false, receiveShadow: false });
  mesh(box(0.14, 1.0, 0.14, 0x2d2d2d), M.vertexMat, -5, 0.5, W.maxZ + 5.2, 0, g);
  mesh(box(0.14, 1.0, 0.14, 0x2d2d2d), M.vertexMat, 5, 0.5, W.maxZ + 5.2, 0, g);
  mesh(box(10.0, 0.1, 0.1, 0x2d2d2d), M.vertexMat, 0, 1.0, W.maxZ + 5.2, 0, g, false);

  const treeTrunk = new InstancePool(M.vertexMat, cyl(0.2, 0.28, 2.4, 8, 0x8a6a4a));
  const treeLeaf1 = new InstancePool(M.vertexMat, sph(1.6, 10, 8, 0x4e9d57));
  const treeLeaf2 = new InstancePool(M.vertexMat, sph(1.2, 10, 8, 0x5cae63));
  const treeLeaf3 = new InstancePool(M.vertexMat, sph(0.9, 10, 8, 0x3f8a4c));
  const treeSpots = [
    [-40, -30], [-24, -32], [4, -32], [22, -30], [38, -26],
    [-42, 0], [42, 2], [-40, 28], [12, 32], [32, 30], [-14, 33]
  ];
  for (const [tx, tz] of treeSpots) {
    treeTrunk.add(tx, 1.2, tz);
    treeLeaf1.add(tx, 3.2, tz);
    treeLeaf2.add(tx + 0.7, 4.0, tz + 0.4);
    treeLeaf3.add(tx - 0.8, 3.8, tz - 0.5);
  }
  treeTrunk.build(g, { castShadow: true, receiveShadow: false });
  treeLeaf1.build(g, { castShadow: false, receiveShadow: false });
  treeLeaf2.build(g, { castShadow: false, receiveShadow: false });
  treeLeaf3.build(g, { castShadow: false, receiveShadow: false });

  const lampGeo = new THREE.CylinderGeometry(0.07, 0.1, 3.2, 8);
  paint(lampGeo, 0x2d2d2d);
  const lampHead = new THREE.SphereGeometry(0.2, 8, 6);
  paint(lampHead, 0xfff2cf);
  const pole = new InstancePool(M.vertexMat, lampGeo);
  const head = new InstancePool(M.ledMat, lampHead);
  for (let x = -32; x <= 32; x += 12) {
    pole.add(x, 1.6, W.maxZ + 9.0, 0, 1, 1, 1);
    head.add(x, 3.3, W.maxZ + 9.0, 0, 1, 1, 1);
  }
  pole.build(g, { castShadow: false, receiveShadow: false });
  head.build(g, { castShadow: false, receiveShadow: false });

  for (const bx of [-7, 7]) {
    mesh(cyl(0.05, 0.07, 6.0, 8, 0xb8b8b8), M.vertexMat, bx, 3.0, W.maxZ + 4.6, 0, g);
    const flag = new THREE.Group();
    flag.position.set(bx + 0.65, 5.4, W.maxZ + 4.6);
    g.add(flag);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xe05a4e, roughness: 0.8, side: THREE.DoubleSide });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8f6f2, roughness: 0.8, side: THREE.DoubleSide });
    const red = mesh(new THREE.BoxGeometry(1.3, 0.42, 0.02), redMat, 0.65, 0, 0, 0, flag, false);
    const white = mesh(new THREE.BoxGeometry(1.3, 0.42, 0.02), whiteMat, 0.65, -0.42, 0, 0, flag, false);
    world.flagCloths.push(red, white);
  }

  for (const bx of [-12, 12]) {
    mesh(rbox(1.5, 0.08, 0.45, 0xf5efe6, 0.02), M.vertexMat, bx, 0.42, W.maxZ + 7.0, 0, g, false);
    for (const dx of [-0.55, 0.55]) {
      mesh(box(0.06, 0.42, 0.06, 0x2d2d2d), M.vertexMat, bx + dx, 0.21, W.maxZ + 7.0, 0, g, false);
    }
    buildPlant(M, g, bx + 2.0, W.maxZ + 7.0, 1.0);
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
  initGlassPools(world, M);

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
  floor1.traverse((obj) => {
    if (obj.userData.plantPools) flushPlantPools(obj);
    if (obj.userData.linearPools) flushLinearPools(obj);
  });
  flushGlassPools(world, floor1);

  const exterior = new THREE.Group();
  buildExterior(world, exterior, M);
  exterior.traverse((obj) => {
    if (obj.userData.plantPools) flushPlantPools(obj);
    if (obj.userData.linearPools) flushLinearPools(obj);
  });

  scene.add(floor1, exterior);

  world.setDayNight = (night) => applyDayNight(world, night);
  world.update = (dt) => updateWorld(world, dt);

  for (const [area, zone] of Object.entries(ZONES[1])) {
    world.roomTargets.set(area, new THREE.Vector3(zone.cx, FLOOR_Y[1] + 1.4, zone.cz));
  }

  return world;
}
