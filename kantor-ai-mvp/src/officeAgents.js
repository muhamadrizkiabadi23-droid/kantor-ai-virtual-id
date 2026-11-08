import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { PALETTE, DESK_LAYOUT } from "./officeWorld.js";

/**
 * officeAgents.js — NPC rigs and their animation.
 *
 * Agents never decide what to do. They receive a state snapshot from the
 * backend boundary (see office3d.js) and only animate what that snapshot
 * says. There is no "fake work" loop here: an idle agent idles, a working
 * agent works, and a decorative rest is labelled as decoration.
 */

const GEO = {};
function initGeometries() {
  if (GEO.leg) return;
  GEO.leg = new THREE.CylinderGeometry(0.075, 0.09, 0.5, 8);
  GEO.leg.translate(0, -0.25, 0);
  GEO.arm = new THREE.CylinderGeometry(0.06, 0.075, 0.45, 8);
  GEO.arm.translate(0, -0.225, 0);
  GEO.torso = new THREE.CylinderGeometry(0.22, 0.3, 0.62, 10);
  GEO.torso.translate(0, 0.31, 0);
  GEO.head = new THREE.SphereGeometry(0.24, 10, 8);
  GEO.hair = new THREE.SphereGeometry(0.255, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.58);
  GEO.hair.translate(0, 0.035, 0);
  GEO.hand = new THREE.SphereGeometry(0.075, 8, 6);
  GEO.shoe = new THREE.BoxGeometry(0.14, 0.09, 0.24);
  GEO.shoe.translate(0, -0.045, 0.05);
  GEO.ring = new THREE.RingGeometry(0.34, 0.44, 24);
}

/** Cat vertex color pada geometri agar bisa digabung (merge) tanpa kehilangan warna. */
function paintGeo(geo, hex) {
  const color = new THREE.Color(hex);
  const count = geo.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

function mergeGeo(parts) {
  const valid = parts.filter((g) => g && g.attributes && g.attributes.position && g.attributes.position.count > 0);
  if (!valid.length) return null;
  return mergeGeometries(valid, false);
}

/** Kaki + sepatu digabung menjadi 1 mesh (warna gelap tetap). */
function buildLegGeo() {
  return mergeGeo([
    paintGeo(GEO.leg.clone(), 0x3a3f47),
    paintGeo(GEO.shoe.clone().translate(0, -0.545, 0.05), 0x3a3f47)
  ]);
}

/** Lengan + tangan digabung; warna lengan mengikuti warna kaus NPC. */
function buildArmGeo(hex) {
  return mergeGeo([
    paintGeo(GEO.arm.clone(), hex),
    paintGeo(GEO.hand.clone().translate(0, -0.45, 0), PALETTE.skin)
  ]);
}

/** Kepala + rambut digabung. */
function buildHeadGeo() {
  return mergeGeo([
    paintGeo(GEO.head.clone(), PALETTE.skin),
    paintGeo(GEO.hair.clone(), PALETTE.hair)
  ]);
}

const POSES = {
  idle: { bodyY: 0, armL: { x: 0.08, z: 0.08 }, armR: { x: 0.08, z: -0.08 }, legL: 0, legR: 0, headX: 0, headZ: 0 },
  working: { bodyY: -0.02, armL: { x: -0.95, z: 0.16 }, armR: { x: -0.95, z: -0.16 }, legL: 0, legR: 0, headX: 0.22, headZ: 0 },
  thinking: { bodyY: 0, armL: { x: 0.45, z: 0.12 }, armR: { x: -1.55, z: -0.55 }, legL: 0, legR: 0, headX: -0.12, headZ: 0.22 },
  moving: { bodyY: 0.02, armL: { x: 0, z: 0.05 }, armR: { x: 0, z: -0.05 }, legL: 0, legR: 0, headX: 0, headZ: 0 },
  meeting: { bodyY: 0, armL: { x: 0.15, z: 0.12 }, armR: { x: -1.25, z: -0.2 }, legL: 0, legR: 0, headX: 0.05, headZ: 0 },
  collaborating: { bodyY: 0, armL: { x: -0.7, z: 0.2 }, armR: { x: -0.7, z: -0.2 }, legL: 0, legR: 0, headX: 0.08, headZ: 0 },
  resting: { bodyY: -0.34, armL: { x: 0.35, z: 0.1 }, armR: { x: 0.35, z: -0.1 }, legL: -1.15, legR: -1.15, headX: 0.12, headZ: 0 },
  // --- aktivitas harian karyawan ---
  sholat: { bodyY: -0.22, armL: { x: -0.5, z: 0.25 }, armR: { x: -0.5, z: -0.25 }, legL: -1.4, legR: -1.4, headX: 0.3, headZ: 0 },
  makan: { bodyY: -0.2, armL: { x: -0.9, z: 0.2 }, armR: { x: -1.5, z: -0.15 }, legL: -1.1, legR: -1.1, headX: 0.18, headZ: 0 },
  ngopi: { bodyY: -0.2, armL: { x: 0.3, z: 0.1 }, armR: { x: -1.3, z: -0.3 }, legL: -1.1, legR: -1.1, headX: 0.05, headZ: 0 },
  olahraga: { bodyY: 0.04, armL: { x: -0.8, z: 0.3 }, armR: { x: -0.8, z: -0.3 }, legL: 0.25, legR: -0.25, headX: -0.05, headZ: 0 },
  renang: { bodyY: -0.42, armL: { x: -1.5, z: 0.4 }, armR: { x: -1.5, z: -0.4 }, legL: 0.15, legR: -0.15, headX: -0.2, headZ: 0 },
  baca: { bodyY: -0.22, armL: { x: -0.6, z: 0.15 }, armR: { x: -0.6, z: -0.15 }, legL: -1.3, legR: -1.3, headX: 0.35, headZ: 0 },
  meditasi: { bodyY: -0.3, armL: { x: 0.4, z: 0.35 }, armR: { x: 0.4, z: -0.35 }, legL: -1.2, legR: -1.2, headX: 0, headZ: 0 },
  tidur: { bodyY: -0.45, armL: { x: 0.2, z: 0.1 }, armR: { x: 0.2, z: -0.1 }, legL: -0.1, legR: -0.1, headX: 0.25, headZ: 0 },
  nonton: { bodyY: -0.24, armL: { x: 0.25, z: 0.12 }, armR: { x: 0.25, z: -0.12 }, legL: -1.0, legR: -1.0, headX: -0.08, headZ: 0 },
  game: { bodyY: -0.2, armL: { x: -1.1, z: 0.3 }, armR: { x: -1.1, z: -0.3 }, legL: -1.0, legR: -1.0, headX: 0.12, headZ: 0 },
  diskusi: { bodyY: -0.05, armL: { x: -0.6, z: 0.35 }, armR: { x: -0.9, z: -0.35 }, legL: -0.6, legR: -0.6, headX: 0.05, headZ: 0 },
  santai: { bodyY: -0.26, armL: { x: 0.3, z: 0.15 }, armR: { x: 0.3, z: -0.15 }, legL: -1.2, legR: -1.2, headX: 0.1, headZ: 0 },
  jemput: { bodyY: 0, armL: { x: 0.5, z: 0.2 }, armR: { x: 0.5, z: -0.2 }, legL: 0, legR: 0, headX: 0, headZ: 0 }
};

const BUBBLE_PRIORITY = { thinking: 0, collaborating: 1, working: 2, meeting: 3, walking: 4, idle: 5, resting: 6 };
const _bubblePos = new THREE.Vector3();
let _bubbleRect = null;

function lerp(a, b, t) { return a + (b - a) * t; }

function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

function createRig(def) {
  initGeometries();
  const root = new THREE.Group();
  root.userData.agentId = def.id;
  const body = new THREE.Group();
  root.add(body);

  const mat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.65 });
  const vertexMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 });

  // Rig digabung per anggota tubuh: 6 mesh per NPC (bukan 11) untuk menghemat draw call.
  const legGeo = buildLegGeo();
  const armGeo = buildArmGeo(def.color);
  const headGeo = buildHeadGeo();

  const legL = new THREE.Group();
  legL.position.set(-0.13, 0.52, 0);
  const legR = new THREE.Group();
  legR.position.set(0.13, 0.52, 0);
  for (const group of [legL, legR]) {
    const leg = new THREE.Mesh(legGeo, vertexMat);
    group.add(leg);
    body.add(group);
  }

  const torso = new THREE.Mesh(GEO.torso, mat);
  torso.position.y = 0.52;
  body.add(torso);

  const armL = new THREE.Group();
  armL.position.set(-0.3, 1.08, 0);
  const armR = new THREE.Group();
  armR.position.set(0.3, 1.08, 0);
  for (const group of [armL, armR]) {
    group.add(new THREE.Mesh(armGeo, vertexMat));
    body.add(group);
  }

  const head = new THREE.Group();
  head.position.y = 1.32;
  head.add(new THREE.Mesh(headGeo, vertexMat));
  body.add(head);

  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.34, 18),
    new THREE.MeshBasicMaterial({ color: 0x14232c, transparent: true, opacity: 0.22, depthWrite: false })
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.02;
  root.add(blob);

  root.traverse((obj) => {
    if (obj.isMesh && obj !== blob) {
      // NPC memakai blob shadow sendiri; shadow map dimatikan agar ringan.
      obj.castShadow = false;
      obj.receiveShadow = false;
      obj.userData.agentId = def.id;
    }
  });

  return { root, body, legL, legR, armL, armR, head, torso, mat, blob };
}

export function createAgentSystem(scene, world, bubbleLayer) {
  const agents = new Map();
  const frustum = new THREE.Frustum();
  const projection = new THREE.Matrix4();
  const sphere = new THREE.Sphere();
  const selectedRing = new THREE.Mesh(
    new THREE.RingGeometry(0.36, 0.48, 28),
    new THREE.MeshBasicMaterial({ color: 0xffc45e, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })
  );
  selectedRing.rotation.x = -Math.PI / 2;
  selectedRing.visible = false;
  scene.add(selectedRing);
  let selectedId = null;
  let deskCursor = 0;
  let snapshotCache = null;
  let bubbleTick = 0;

  function createAgent(def) {
    const rig = createRig(def);
    const home = world.agentHomes[def.id]
      || world.agentHomes[def.area]
      || (DESK_LAYOUT[deskCursor % DESK_LAYOUT.length] || { x: 0, z: 0 });
    deskCursor += 1;
    rig.root.position.set(home.x, 0, home.z);
    rig.root.rotation.y = Math.PI;
    scene.add(rig.root);
    const bubble = document.createElement("div");
    bubble.className = "office-bubble";
    bubble.style.transform = "translate3d(-9999px,-9999px,0)";
    bubbleLayer.appendChild(bubble);
    const agent = {
      id: def.id,
      def,
      rig,
      bubble,
      bubbleContent: "",
      internalState: "idle",
      home,
      desired: null,
      desiredRy: Math.PI,
      path: [],
      pathIndex: 0,
      walkPhase: Math.random() * 6,
      phase: Math.random() * 6,
      speed: 2.3,
      partnerId: null,
      seatIndex: 0,
      restSpot: null,
      decorative: false,
      sphere
    };
    agents.set(def.id, agent);
    return agent;
  }

  function partnerHome(agent) {
    const partner = agents.get(agent.partnerId);
    if (partner) return partner.home;
    const def = agent.def;
    return world.agentHomes[def.partnerId] || agent.home;
  }

  function spotFloor(spot) {
    if (world.zones[1][spot.area]) return 1;
    if (world.zones[2][spot.area]) return 2;
    return 1;
  }

  function pickRestSpot(agent) {
    if (agent.restSpot) return agent.restSpot;
    const floor = world.activeFloor || 1;
    const onFloor = world.decorativeSpots.filter((spot) => spotFloor(spot) === floor);
    const spots = onFloor.length ? onFloor : world.decorativeSpots;
    if (!spots.length) return { x: agent.home.x, z: agent.home.z, ry: Math.PI };
    const index = Math.abs(hash(agent.id)) % spots.length;
    agent.restSpot = spots[index];
    return agent.restSpot;
  }

  function hash(value) {
    let h = 0;
    for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
    return h;
  }

  const ACTIVITY_LABELS = {
    sholat: "🕌 Sholat",
    makan: "🍚 Makan",
    ngopi: "☕ Ngopi",
    olahraga: "🏋️ Olahraga",
    renang: "🏊 Renang",
    baca: "📖 Baca",
    meditasi: "🧘 Meditasi",
    tidur: "💤 Tidur",
    nonton: "📺 Nonton",
    game: "🕹️ Main game",
    diskusi: "💬 Diskusi",
    santai: "🌴 Santai",
    jemput: "🌿 Jalan-jalan"
  };

  /**
   * NPC yang menganggur (idle) melakukan aktivitas harian.
   * Begitu ada tugas (status berubah), mereka kembali bekerja.
   */
  function assignActivity(agent) {
    const floor = world.activeFloor || 1;
    const spots = world.decorativeSpots.filter((spot) => spotFloor(spot) === floor && spot.activity);
    const pool = spots.length ? spots : world.decorativeSpots;
    if (!pool.length) return;
    const round = agent.activityRound || 0;
    const index = Math.abs(hash(agent.id) + round * 7) % pool.length;
    const spot = pool[index];
    agent.activity = spot.activity || "santai";
    agent.activityRound = round + 1;
    agent.activitySpot = spot;
    agent.desired = { x: spot.x, z: spot.z };
    agent.desiredRy = spot.ry ?? Math.PI;
    const pos = agent.rig.root.position;
    const path = world.nav.findPath({ x: pos.x, z: pos.z }, agent.desired);
    if (path && path.length) {
      agent.path = path;
      agent.pathIndex = 0;
      agent.internalState = "moving";
      agent.idleTime = 0;
    }
    updateBubbleContent(agent);
    if (snapshotCache) pruneBubbles(snapshotCache);
  }

  function desiredFor(agent) {
    const def = agent.def;
    switch (def.status) {
      case "meeting": {
        const seat = world.meetingSeats[agent.seatIndex % world.meetingSeats.length];
        return seat ? { x: seat.x, z: seat.z, ry: seat.ry } : null;
      }
      case "collaborating": {
        const home = partnerHome(agent);
        const dx = home.x - agent.home.x;
        const dz = home.z - agent.home.z;
        const len = Math.hypot(dx, dz) || 1;
        const x = home.x - (dx / len) * 1.0;
        const z = home.z - (dz / len) * 1.0;
        return { x, z, ry: Math.atan2(home.x - x, home.z - z) };
      }
      case "resting": {
        const spot = pickRestSpot(agent);
        return { x: spot.x, z: spot.z, ry: spot.ry ?? Math.PI };
      }
      case "walking": {
        if (!def.target) return null;
        if (def.target.agentId) {
          const partner = agents.get(def.target.agentId);
          if (partner) return { x: partner.home.x, z: partner.home.z, ry: null };
        }
        if (def.target.area) {
          const zone = world.zones[1][def.target.area] || world.zones[2][def.target.area];
          if (zone) return { x: zone.cx, z: zone.cz, ry: null };
        }
        if (typeof def.target.x === "number" && typeof def.target.z === "number") {
          return { x: def.target.x, z: def.target.z, ry: null };
        }
        return null;
      }
      default: {
        const home = world.agentHomes[def.id] || world.agentHomes[def.area] || agent.home;
        return { x: home.x, z: home.z, ry: Math.PI };
      }
    }
  }

  function sync(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.agents)) return;
    snapshotCache = snapshot;
    const meetingAgents = snapshot.agents.filter((agent) => agent.status === "meeting");
    for (const def of snapshot.agents) {
      let agent = agents.get(def.id);
      if (!agent) agent = createAgent(def);
      agent.def = def;
      agent.partnerId = def.partnerId || null;
      agent.decorative = !!def.decorative;
      agent.seatIndex = meetingAgents.findIndex((item) => item.id === def.id);
      if (agent.seatIndex < 0) agent.seatIndex = 0;
      const desired = desiredFor(agent);
      agent.desired = desired ? { x: desired.x, z: desired.z } : null;
      agent.desiredRy = desired && desired.ry !== null ? desired.ry : agent.desiredRy;
      const pos = agent.rig.root.position;
      const statusChanged = agent.lastStatus !== def.status;
      agent.lastStatus = def.status;
      if (agent.desired) {
        const dist = Math.hypot(agent.desired.x - pos.x, agent.desired.z - pos.z);
        if (dist > 0.2 && (agent.internalState !== "moving" || statusChanged)) {
          const path = world.nav.findPath({ x: pos.x, z: pos.z }, agent.desired);
          if (path && path.length) {
            agent.path = path;
            agent.pathIndex = 0;
            agent.internalState = "moving";
          } else {
            agent.internalState = def.status;
          }
        } else if (dist <= 0.2 && agent.internalState !== "moving") {
          agent.internalState = def.status;
          if (def.status === "walking") {
            window.setTimeout(() => {
              if (agent.def.status === "walking") {
                document.dispatchEvent(new CustomEvent("office-agent-arrived", { detail: { agentId: agent.id, status: "walking" } }));
              }
            }, 0);
          }
        }
      }
      updateBubbleContent(agent);
    }
    pruneBubbles(snapshot);
  }

  function pruneBubbles(snapshot) {
    const visible = snapshot.agents
      .map((def) => ({ def, agent: agents.get(def.id) }))
      .filter((entry) => entry.agent && entry.agent.bubbleContent)
      .sort((a, b) => (BUBBLE_PRIORITY[a.def.status] ?? 9) - (BUBBLE_PRIORITY[b.def.status] ?? 9))
      .slice(0, 8)
      .map((entry) => entry.agent.id);
    for (const agent of agents.values()) {
      agent.bubble.classList.toggle("is-clipped", !visible.includes(agent.id));
    }
  }

  function updateBubbleContent(agent) {
    const def = agent.def;
    let content = "";
    let cls = "office-bubble";
    if (def.status === "thinking") {
      content = `<span class="office-bubble-icon">💭</span><span>${escapeHtml(def.message || "Memproses")}</span><span class="office-bubble-gear">⚙️</span>`;
      cls += " is-thinking";
    } else if (def.status === "working") {
      content = `<span class="office-bubble-icon">💻</span><span>${escapeHtml(def.message || "Bekerja")}</span>`;
      cls += " is-working";
    } else if (def.status === "meeting") {
      content = `<span class="office-bubble-icon">📊</span><span>${escapeHtml(def.message || "Rapat")}</span>`;
      cls += " is-meeting";
    } else if (def.status === "collaborating") {
      content = `<span class="office-bubble-icon">🤝</span><span>${escapeHtml(def.message || "Berdiskusi")}</span>`;
      cls += " is-collab";
    } else if (def.status === "resting") {
      content = `<span class="office-bubble-icon">☕</span><span>${escapeHtml(def.message || "Rehat")}</span><span class="office-bubble-tag">Dekorasi</span>`;
      cls += " is-resting";
    } else if (def.status === "walking") {
      content = `<span class="office-bubble-icon">🚶</span><span>${escapeHtml(def.message || "Berjalan")}</span>`;
      cls += " is-walking";
    } else if ((def.status === "idle" || def.status === "resting") && agent.activity && agent.path.length === 0) {
      const label = ACTIVITY_LABELS[agent.activity] || "☕ Santai";
      content = `<span>${label}</span><span class="office-bubble-tag">Menganggur</span>`;
      cls += " is-resting";
    } else if (def.message) {
      content = `<span>${escapeHtml(def.message)}</span>`;
    }
    if (content !== agent.bubbleContent) {
      agent.bubbleContent = content;
      agent.bubble.innerHTML = content;
      agent.bubble.className = cls;
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
  }

  function updateMovement(agent, dt) {
    if (agent.internalState !== "moving" || !agent.path.length) return;
    const pos = agent.rig.root.position;
    const target = agent.path[agent.pathIndex];
    const dx = target.x - pos.x;
    const dz = target.z - pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.14) {
      agent.pathIndex += 1;
      if (agent.pathIndex >= agent.path.length) {
        agent.path = [];
        agent.internalState = agent.def.status;
        if (agent.desiredRy !== null && agent.desiredRy !== undefined) agent.rig.root.rotation.y = agent.desiredRy;
        document.dispatchEvent(new CustomEvent("office-agent-arrived", { detail: { agentId: agent.id, status: agent.def.status } }));
      }
      return;
    }
    const step = Math.min(dist, agent.speed * dt);
    pos.x += (dx / dist) * step;
    pos.z += (dz / dist) * step;
    agent.rig.root.rotation.y = lerpAngle(agent.rig.root.rotation.y, Math.atan2(dx, dz), 1 - Math.pow(0.0005, dt));
    agent.walkPhase += dt * 9;
  }

  function updatePose(agent, dt) {
    const rig = agent.rig;
    const t = performance.now() / 1000;
    // NPC idle memakai pose aktivitas (sholat, makan, ngopi, dst).
    const state = agent.internalState === "idle" && agent.activity ? agent.activity : agent.internalState;
    const pose = POSES[state] || POSES.idle;
    const k = 1 - Math.pow(0.0001, dt);

    let bob = 0;
    if (state === "working") bob = Math.sin(t * 3 + agent.phase) * 0.012;
    else if (state === "idle") bob = Math.sin(t * 1.6 + agent.phase) * 0.02;
    else if (state === "resting") bob = Math.sin(t * 0.9 + agent.phase) * 0.022;
    else if (state === "moving") bob = Math.abs(Math.sin(agent.walkPhase)) * 0.045;
    rig.body.position.y = lerp(rig.body.position.y, pose.bodyY + bob, k);

    let legL = pose.legL;
    let legR = pose.legR;
    if (state === "moving") {
      legL = Math.sin(agent.walkPhase) * 0.55;
      legR = -Math.sin(agent.walkPhase) * 0.55;
    }
    rig.legL.rotation.x = lerp(rig.legL.rotation.x, legL, k);
    rig.legR.rotation.x = lerp(rig.legR.rotation.x, legR, k);

    let armLx = pose.armL.x;
    let armRx = pose.armR.x;
    if (state === "working") {
      armLx += Math.sin(t * 13 + agent.phase) * 0.09;
      armRx += Math.sin(t * 13 + agent.phase + 1.3) * 0.09;
    } else if (state === "moving") {
      armLx = Math.sin(agent.walkPhase) * 0.4;
      armRx = -Math.sin(agent.walkPhase) * 0.4;
    } else if (state === "collaborating") {
      armLx += Math.sin(t * 4 + agent.phase) * 0.16;
      armRx += Math.sin(t * 4 + agent.phase + 0.8) * 0.16;
    } else if (state === "meeting") {
      armRx += Math.sin(t * 2.2 + agent.phase) * 0.1;
    }
    rig.armL.rotation.x = lerp(rig.armL.rotation.x, armLx, k);
    rig.armL.rotation.z = lerp(rig.armL.rotation.z, pose.armL.z, k);
    rig.armR.rotation.x = lerp(rig.armR.rotation.x, armRx, k);
    rig.armR.rotation.z = lerp(rig.armR.rotation.z, pose.armR.z, k);

    rig.head.rotation.x = lerp(rig.head.rotation.x, pose.headX, k);
    rig.head.rotation.z = lerp(rig.head.rotation.z, pose.headZ + (state === "thinking" ? Math.sin(t * 1.2 + agent.phase) * 0.06 : 0), k);

    if (state === "collaborating" && agent.partnerId) {
      const partner = agents.get(agent.partnerId);
      if (partner) {
        const dx = partner.rig.root.position.x - rig.root.position.x;
        const dz = partner.rig.root.position.z - rig.root.position.z;
        rig.root.rotation.y = lerpAngle(rig.root.rotation.y, Math.atan2(dx, dz), k);
        return;
      }
    }
    if (state !== "moving" && agent.desiredRy !== null && agent.desiredRy !== undefined) {
      rig.root.rotation.y = lerpAngle(rig.root.rotation.y, agent.desiredRy, k * 0.55);
    }
  }

  function updateBubble(agent, camera, visible) {
    const bubble = agent.bubble;
    if (!bubble || !agent.bubbleContent || bubble.classList.contains("is-clipped")) {
      bubble.classList.remove("is-visible");
      return;
    }
    if (!visible) {
      bubble.classList.remove("is-visible");
      return;
    }
    _bubblePos.copy(agent.rig.root.position);
    _bubblePos.y += 2.45;
    _bubblePos.project(camera);
    if (_bubblePos.z > 1 || _bubblePos.z < -1) {
      bubble.classList.remove("is-visible");
      return;
    }
    if (!_bubbleRect) _bubbleRect = bubbleLayer.getBoundingClientRect();
    const x = (_bubblePos.x * 0.5 + 0.5) * _bubbleRect.width;
    const y = (-_bubblePos.y * 0.5 + 0.5) * _bubbleRect.height;
    bubble.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    bubble.classList.add("is-visible");
  }

  function update(dt, camera) {
    camera.updateMatrixWorld();
    projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projection);

    let bubbleDirty = false;
    for (const agent of agents.values()) {
      const pos = agent.rig.root.position;
      sphere.center.set(pos.x, pos.y + 0.9, pos.z);
      sphere.radius = 1.4;
      const visible = frustum.intersectsSphere(sphere);
      updateMovement(agent, dt);

      // Penjadwalan aktivitas untuk NPC yang menganggur (idle / resting).
      // Begitu ada tugas (status berubah), idleTime direset dan mereka bekerja.
      if (agent.def.status === "idle" || agent.def.status === "resting") {
        if (agent.path.length) {
          agent.idleTime = 0;
        } else {
          agent.idleTime = (agent.idleTime || 0) + dt;
          // Acak ambang pemicu per NPC agar pathfinding A* tidak menyerbu bersamaan.
          const threshold = 4 + Math.abs(hash(agent.id)) % 8;
          if (agent.idleTime > threshold) {
            assignActivity(agent);
            agent.idleTime = 0;
            bubbleDirty = true;
          }
        }
      } else {
        agent.idleTime = 0;
      }

      if (visible) updatePose(agent, dt);
      updateBubble(agent, camera, visible);
    }

    bubbleTick += 1;
    if (bubbleDirty || bubbleTick >= 30) {
      bubbleTick = 0;
      if (snapshotCache) pruneBubbles(snapshotCache);
    }

    if (selectedId && agents.has(selectedId)) {
      const agent = agents.get(selectedId);
      selectedRing.visible = true;
      selectedRing.position.set(agent.rig.root.position.x, 0.06, agent.rig.root.position.z);
      selectedRing.material.opacity = 0.65 + Math.sin(performance.now() / 300) * 0.2;
    } else {
      selectedRing.visible = false;
    }
  }

  function pick(raycaster) {
    const meshes = [];
    for (const agent of agents.values()) agent.rig.root.traverse((obj) => { if (obj.isMesh) meshes.push(obj); });
    const hits = raycaster.intersectObjects(meshes, false);
    if (!hits.length) return null;
    const id = hits[0].object.userData.agentId;
    return agents.get(id) || null;
  }

  function select(agentId) {
    selectedId = agentId;
    if (agentId && agents.has(agentId)) {
      const agent = agents.get(agentId);
      selectedRing.position.set(agent.rig.root.position.x, 0.06, agent.rig.root.position.z);
    }
  }

  function resetRestSpots() {
    for (const agent of agents.values()) agent.restSpot = null;
  }

  function invalidateBubbleRect() {
    _bubbleRect = null;
  }

  return { sync, update, pick, select, agents, resetRestSpots, invalidateBubbleRect };
}
