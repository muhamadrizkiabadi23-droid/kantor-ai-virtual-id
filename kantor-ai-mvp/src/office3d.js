import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createWorld, FLOOR_Y, ZONES, BUILDING } from "./officeWorld.js";
import { createAgentSystem } from "./officeAgents.js";
import { createSupportPanel } from "./officeSupport.js";

/**
 * office3d.js — scene orchestration and the backend boundary.
 *
 * The renderer is a pure consumer of task state. In production the snapshot
 * below should come from the backend API (Google Sheets / Apps Script / AI
 * orchestrator). For this local preview, app.js plays the role of that
 * backend and publishes `office-state` events. The browser never reads a
 * database or credential store directly.
 */

const mount = document.getElementById("office-3d");
const sceneWrap = document.querySelector(".office-scene-wrap");
const renderError = document.getElementById("office-render-error");
const bubbleLayer = document.getElementById("office-bubbles");
const liveStatus = document.getElementById("office-live-status");
const statusText = document.getElementById("office-status-text");
const floorButtons = [...document.querySelectorAll("[data-office-floor]:not([data-office-area])")];
const roomButtons = [...document.querySelectorAll("[data-office-area]")];
const agentCard = document.getElementById("office-agent-card");

const STATUS_LABELS = {
  idle: "Siap",
  working: "Bekerja",
  thinking: "Berpikir",
  walking: "Berpindah",
  meeting: "Rapat",
  collaborating: "Kolaborasi",
  resting: "Rehat (dekorasi)"
};

let renderer;
let scene;
let camera;
let orbit;
let hemi;
let sun;
let nightLights = [];
let world;
let agentSystem;
let support;
let activeFloor = 1;
let perspectiveMode = true;
let nightMode = false;
let sleepMode = false;
let tourMode = false;
let tourAngle = 0;
let quality = "auto";
// Override lewat URL: ?quality=low|auto|high (berguna untuk HP lambat / audit).
try {
  const q = new URLSearchParams(location.search).get("quality");
  if (q && ["low", "auto", "high"].includes(q)) quality = q;
} catch (e) { /* abaikan */ }
let fpsLowTime = 0;
let selectedArea = "strategy";
let selectedAgentId = null;
let pointerStart = null;
let lastFrame = performance.now();
let fps = 0;
let fpsAccum = 0;
let fpsFrames = 0;
let frameCount = 0;
let shadowDirty = true;
let lastTaskSummary = null;
let lastSnapshot = null;
let roomPatches = [];
let lastRenderInfo = null;
let perfProbe = null;

function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

function findArea(object) {
  let current = object;
  while (current) {
    if (current.userData.officeArea) return current.userData.officeArea;
    current = current.parent;
  }
  return null;
}

function setupCamera() {
  const width = mount.clientWidth || 900;
  const height = mount.clientHeight || Math.round(width * 0.57);
  const aspect = width / height;
  // Frustum menutup seluruh gedung (±28 X, ±20 Z) plus margin.
  const halfW = (BUILDING.maxX - BUILDING.minX) / 2 + 2;
  const halfD = (BUILDING.maxZ - BUILDING.minZ) / 2 + 2;
  const halfHeight = Math.max(halfD, halfW / aspect);
  const target = orbit ? orbit.target.clone() : new THREE.Vector3(0, FLOOR_Y[activeFloor] + 1.4, 0);
  const position = camera ? camera.position.clone() : new THREE.Vector3(21, FLOOR_Y[activeFloor] + 30, 25);
  if (orbit) orbit.dispose();
  camera = perspectiveMode
    ? new THREE.PerspectiveCamera(42, aspect, 0.1, 300)
    : new THREE.OrthographicCamera(-halfHeight * aspect, halfHeight * aspect, halfHeight, -halfHeight, 0.1, 300);
  camera.position.copy(position);
  camera.lookAt(target);
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.copy(target);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.08;
  orbit.screenSpacePanning = true;
  orbit.minDistance = 9;
  orbit.maxDistance = 70;
  orbit.minZoom = 0.4;
  orbit.maxZoom = 3;
  orbit.minPolarAngle = 0.18;
  orbit.maxPolarAngle = 1.46;
  orbit.update();
}

function resize() {
  if (!renderer || !mount.clientWidth) return;
  const width = mount.clientWidth;
  const height = mount.clientHeight || Math.round(width * 0.57);
  renderer.setSize(width, height, false);
  agentSystem?.invalidateBubbleRect();
  const aspect = width / height;
  if (camera.isPerspectiveCamera) {
    camera.aspect = aspect;
  } else {
    // Samakan dengan setupCamera(): frustum menutup seluruh gedung + margin.
    const halfW = (BUILDING.maxX - BUILDING.minX) / 2 + 2;
    const halfD = (BUILDING.maxZ - BUILDING.minZ) / 2 + 2;
    const halfHeight = Math.max(halfD, halfW / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
  }
  camera.updateProjectionMatrix();
}

function setFloor(floor) {
  activeFloor = floor;
  world.activeFloor = floor;
  if (world.floorGroups[1]) world.floorGroups[1].visible = floor === 1;
  if (world.floorGroups[2]) world.floorGroups[2].visible = floor === 2;
  floorButtons.forEach((button) => {
    const selected = Number(button.dataset.officeFloor) === floor;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  roomButtons.forEach((button) => {
    button.hidden = Number(button.dataset.officeFloor) !== floor;
  });
  const offset = camera.position.clone().sub(orbit.target);
  offset.y = Math.abs(offset.y);
  orbit.target.set(0, FLOOR_Y[floor] + 1.4, 0);
  camera.position.copy(orbit.target).add(offset);
  orbit.update();
  const valid = roomButtons.find((button) => button.dataset.officeArea === selectedArea && Number(button.dataset.officeFloor) === floor);
  if (!valid) selectedArea = floor === 1 ? "strategy" : "dorm";
  focusArea(selectedArea, true);
  updateStatus(lastSnapshot);
}

function focusArea(area, keepOffset = true) {
  const target = world.roomTargets.get(area);
  if (!target) return;
  const offset = camera.position.clone().sub(orbit.target);
  orbit.target.copy(target);
  if (keepOffset) camera.position.copy(target).add(offset);
  else camera.position.copy(target).add(offset);
  orbit.update();
  selectedArea = area;
  roomButtons.forEach((button) => {
    const selected = button.dataset.officeArea === area && Number(button.dataset.officeFloor) === activeFloor;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.dispatchEvent(new CustomEvent("office-room-focused", { detail: area }));
}

function setDayNight() {
  nightMode = !nightMode;
  world.setDayNight(nightMode);
  scene.background.setHex(nightMode ? 0x18283d : 0xbfe9eb);
  hemi.intensity = nightMode ? 0.5 : 1.5;
  sun.intensity = nightMode ? 0.55 : 2.2;
  sun.color.setHex(nightMode ? 0x9bb7ff : 0xfff0cc);
  nightLights.forEach((light) => { light.visible = nightMode; });
  document.getElementById("office-day-toggle").textContent = nightMode ? "Mode siang" : "Mode malam";
  document.dispatchEvent(new CustomEvent("office-mode-changed", { detail: { night: nightMode, floor: activeFloor } }));
}

function toggleSleep() {
  sleepMode = !sleepMode;
  document.dispatchEvent(new CustomEvent("office-sleep-request", { detail: { sleep: sleepMode } }));
  // Satu lantai: mode tidur = malam hari (lampu redup) alih-alih pindah lantai.
  world.setDayNight(sleepMode);
  const btn = document.getElementById("office-sleep-toggle");
  if (btn) btn.textContent = sleepMode ? "☀ Bangunkan tim" : "💤 Tidur";
}

let topView = false;
function toggleTopView() {
  topView = !topView;
  const button = document.getElementById("office-top-toggle");
  if (topView) {
    orbit.minPolarAngle = 0;
    const target = orbit.target.clone();
    camera.position.set(target.x, 46, target.z + 0.01);
    camera.lookAt(target);
    orbit.update();
    if (button) button.setAttribute("aria-pressed", "true");
  } else {
    if (button) button.setAttribute("aria-pressed", "false");
    resetCamera();
  }
}

let bubblesVisible = true;
function toggleBubbles() {
  bubblesVisible = !bubblesVisible;
  if (bubbleLayer) bubbleLayer.style.display = bubblesVisible ? "" : "none";
  const button = document.getElementById("office-bubble-toggle");
  if (button) button.setAttribute("aria-pressed", String(bubblesVisible));
}

function resetCamera() {
  setupCamera();
  document.getElementById("office-view-toggle").textContent = perspectiveMode ? "Isometrik" : "Perspektif";
  orbit.target.set(0, FLOOR_Y[activeFloor] + 1.4, 0);
  camera.position.set(21, FLOOR_Y[activeFloor] + 20, 25);
  orbit.update();
}

function switchView() {
  perspectiveMode = !perspectiveMode;
  setupCamera();
  document.getElementById("office-view-toggle").textContent = perspectiveMode ? "Isometrik" : "Perspektif";
}

const QUALITY_LABELS = { auto: "✨ Auto", low: "✨ Hemat", high: "✨ Maks" };

function applyQuality() {
  const isMobile = window.matchMedia("(max-width: 820px)").matches;
  let dprCap = 2;
  let shadows = true;
  if (quality === "low") {
    dprCap = 1;
    shadows = false;
  } else if (quality === "high") {
    dprCap = 2;
    shadows = true;
  } else {
    dprCap = isMobile ? 1.25 : 2;
    shadows = !isMobile;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.shadowMap.enabled = shadows;
  if (sun) sun.castShadow = shadows;
  resize();
  const button = document.getElementById("office-quality-toggle");
  if (button) {
    button.textContent = QUALITY_LABELS[quality];
    button.title = `Kualitas render: ${quality.toUpperCase()} (ketuk untuk ubah)`;
  }
}

function toggleQuality() {
  quality = quality === "auto" ? "low" : quality === "low" ? "high" : "auto";
  applyQuality();
}

function toggleTour() {
  tourMode = !tourMode;
  const button = document.getElementById("office-tour-toggle");
  if (button) button.classList.toggle("selected", tourMode);
  if (tourMode) {
    orbit.enabled = false;
    tourAngle = 0;
  } else {
    orbit.enabled = true;
    orbit.update();
  }
}

function toggleFullscreen() {
  const isFullscreen = document.body.classList.toggle("office-fullscreen");
  const button = document.getElementById("office-fullscreen-toggle");
  if (button) {
    button.classList.toggle("selected", isFullscreen);
    button.textContent = isFullscreen ? "⛶ Keluar" : "⛶ Full";
  }
  // Biarkan canvas menyesuaikan layout baru
  window.setTimeout(() => {
    resize();
    applyQuality();
  }, 120);
  if (isFullscreen) {
    // Fokus ke kanvas biar kontrol keyboard jalan
    renderer.domElement.focus();
  }
}

function selectAgent(agentId) {
  selectedAgentId = agentId;
  agentSystem.select(agentId);
  if (agentCard) agentCard.hidden = false;
  refreshAgentCard(agentSystem.agents.get(agentId));
  const chat = document.getElementById("office-card-chat");
  if (chat) chat.innerHTML = "";
  const agent = agentSystem.agents.get(agentId);
  if (agent) {
    document.dispatchEvent(new CustomEvent("office-agent-selected", { detail: { agentId, name: agent.def.name } }));
  }
}

function refreshAgentCard(agent) {
  if (!agent || agentCard.hidden) return;
  const avatar = document.getElementById("office-card-avatar");
  const name = document.getElementById("office-card-name");
  const role = document.getElementById("office-card-role");
  const status = document.getElementById("office-card-status");
  const task = document.getElementById("office-card-task");
  if (avatar) avatar.textContent = agent.def.initials || String(agent.def.name || "?").slice(0, 2).toUpperCase();
  if (name) name.textContent = agent.def.name || "Agen";
  if (role) role.textContent = agent.def.role || "";
  if (status) status.textContent = statusLabel(agent.def.status);
  if (task) task.textContent = agent.def.taskTitle ? `Tugas: ${agent.def.taskTitle}` : "Tidak ada tugas aktif";
}

function updateStatus(snapshot) {
  if (!snapshot) snapshot = lastSnapshot;
  if (!snapshot) return;
  lastSnapshot = snapshot;
  lastTaskSummary = snapshot.taskSummary || null;
  const waiting = snapshot.taskSummary ? (snapshot.taskSummary.review || 0) + (snapshot.taskSummary.revision || 0) : 0;
  if (snapshot.notice) liveStatus.textContent = snapshot.notice;
  else if (snapshot.activeTaskId) liveStatus.textContent = `Tugas aktif · ${snapshot.activeStage || "proses"}`;
  else if (waiting > 0) liveStatus.textContent = `${waiting} draf menunggu review operator`;
  else liveStatus.textContent = "Menunggu tugas baru";

  const busy = (snapshot.agents || []).filter((agent) => ["working", "thinking", "meeting", "collaborating"].includes(agent.status)).length;
  if (statusText) statusText.textContent = busy > 0 ? `${busy} agen bekerja` : "Tim siap";
  if (selectedAgentId) refreshAgentCard(agentSystem.agents.get(selectedAgentId));
}

function selectAtPointer(event) {
  if (event.target !== renderer.domElement) return;
  if (!pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6) return;
  const bounds = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const agent = agentSystem.pick(raycaster);
  if (agent) {
    selectAgent(agent.id);
    return;
  }
  const hits = raycaster.intersectObjects(roomPatches, false);
  const area = hits.map((hit) => findArea(hit.object))
    .find((value) => value && roomButtons.some((button) => button.dataset.officeArea === value && Number(button.dataset.officeFloor) === activeFloor));
  if (area) focusArea(area);
}

function onKeyDown(event) {
  if (event.key === "PageUp") {
    event.preventDefault();
    setFloor(2);
  } else if (event.key === "PageDown") {
    event.preventDefault();
    setFloor(1);
  } else if (event.key.toLowerCase() === "r") {
    resetCamera();
  } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    const step = 1.4;
    const plan = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
    right.y = 0;
    right.normalize();
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const move = right.multiplyScalar(plan[0]).add(forward.multiplyScalar(plan[1]));
    orbit.target.add(move);
    camera.position.add(move);
    orbit.update();
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (perfProbe) perfProbe.start = performance.now();
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  frameCount += 1;

  fpsAccum += dt;
  fpsFrames += 1;
  if (fpsAccum >= 0.5) {
    fps = fpsFrames / fpsAccum;
    fpsAccum = 0;
    fpsFrames = 0;
  }

  world.update(dt);
  agentSystem.update(dt, camera);

  if (tourMode) {
    tourAngle += dt * 0.14;
    const radius = 33;
    const baseY = FLOOR_Y[activeFloor] + 1.4;
    camera.position.set(Math.cos(tourAngle) * radius, baseY + 15, Math.sin(tourAngle) * radius);
    camera.lookAt(0, baseY, 0);
  } else {
    orbit.update();
  }

  // auto quality: turunkan pixel ratio kalau FPS rendah
  if (quality === "auto" && fps > 0) {
    if (fps < 28) {
      fpsLowTime += dt;
      if (fpsLowTime > 2.5 && renderer.getPixelRatio() > 1) {
        renderer.setPixelRatio(1);
        fpsLowTime = 0;
      }
    } else {
      fpsLowTime = 0;
    }
  }

  let anyMoving = false;
  for (const agent of agentSystem.agents.values()) {
    if (agent.internalState === "moving") {
      anyMoving = true;
      break;
    }
  }
  if (anyMoving) shadowDirty = true;
  // Shadow map hanya di-refresh tiap 3 frame saat ada gerakan (hemat GPU).
  if (shadowDirty && frameCount % 3 === 0) {
    renderer.shadowMap.needsUpdate = true;
    shadowDirty = false;
  }

  renderer.render(scene, camera);
  lastRenderInfo = { ...renderer.info.render, programs: renderer.info.programs.length };
  if (perfProbe) perfProbe.renderMs = performance.now() - perfProbe.start;

  if (selectedAgentId && frameCount % 20 === 0) refreshAgentCard(agentSystem.agents.get(selectedAgentId));
}

function wireControls() {
  floorButtons.forEach((button) => button.addEventListener("click", () => setFloor(Number(button.dataset.officeFloor))));
  const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("click", fn); };
  on("office-view-toggle", switchView);
  on("office-day-toggle", setDayNight);
  on("office-sleep-toggle", toggleSleep);
  on("office-top-toggle", toggleTopView);
  on("office-bubble-toggle", toggleBubbles);
  on("office-tour-toggle", toggleTour);
  on("office-quality-toggle", toggleQuality);
  on("office-fullscreen-toggle", toggleFullscreen);
  on("office-reset", resetCamera);
  on("office-card-close", () => {
    agentCard.hidden = true;
    selectedAgentId = null;
    agentSystem.select(null);
  });

  // --- Perintah ke agen terpilih (NPC) ---
  const cardChat = document.getElementById("office-card-chat");
  const cardForm = document.getElementById("office-card-form");
  const cardInput = document.getElementById("office-card-input");

  function appendCardMessage(role, text) {
    if (!cardChat) return;
    const row = document.createElement("div");
    row.className = `hud-chat-row ${role}`;
    const who = document.createElement("span");
    who.className = "hud-chat-who";
    who.textContent = role === "user" ? "Anda" : "Agen";
    const body = document.createElement("span");
    body.className = "hud-chat-body";
    body.textContent = text;
    row.append(who, body);
    cardChat.appendChild(row);
    cardChat.scrollTop = cardChat.scrollHeight;
  }

  function sendAgentCommand(text) {
    if (!selectedAgentId || !text.trim()) return;
    appendCardMessage("user", text.trim());
    cardInput.value = "";
    const runner = window.kantorAI && typeof window.kantorAI.runAgentCommand === "function"
      ? window.kantorAI.runAgentCommand
      : null;
    if (!runner) {
      appendCardMessage("agent", "Mesin perintah belum siap. Coba lagi sesaat.");
      return;
    }
    appendCardMessage("agent", "…");
    window.setTimeout(() => {
      let result = { ok: false, reply: "Agen tidak merespons." };
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        if (cardChat && cardChat.lastElementChild) cardChat.lastElementChild.remove();
        appendCardMessage("agent", value.reply || "Selesai.");
        refreshAgentCard(agentSystem.agents.get(selectedAgentId));
      };
      try {
        const maybe = runner(selectedAgentId, text);
        if (maybe && typeof maybe.then === "function") {
          maybe.then(finish).catch((error) => finish({ ok: false, reply: `Gagal: ${error.message}` }));
        } else {
          finish(maybe || result);
        }
      } catch (error) {
        finish({ ok: false, reply: `Gagal menjalankan perintah: ${error.message}` });
      }
    }, 420);
  }

  if (cardForm) {
    cardForm.addEventListener("submit", (event) => {
      event.preventDefault();
      sendAgentCommand(cardInput.value);
    });
  }
  document.querySelectorAll("[data-agent-cmd]").forEach((button) => {
    button.addEventListener("click", () => sendAgentCommand(button.dataset.agentCmd));
  });

  mount.addEventListener("pointerdown", (event) => {
    if (event.target === renderer.domElement) pointerStart = { x: event.clientX, y: event.clientY };
  });
  mount.addEventListener("pointerup", selectAtPointer);
  mount.addEventListener("pointerleave", () => { pointerStart = null; });
  renderer.domElement.addEventListener("keydown", onKeyDown);
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute("aria-label", "Kanvas kantor 3D. Seret untuk memutar, klik kanan atau dua jari untuk menggeser, scroll untuk zoom, PageUp dan PageDown untuk ganti lantai, R untuk reset.");

  document.addEventListener("office-state", (event) => {
    agentSystem.sync(event.detail);
    updateStatus(event.detail);
  });
  document.addEventListener("office-area-selected", (event) => {
    const detail = event.detail;
    const area = typeof detail === "string" ? detail : detail.area;
    const floor = typeof detail === "string" ? null : detail.floor;
    if (floor) setFloor(floor);
    if (world.roomTargets.has(area)) focusArea(area);
  });
  document.addEventListener("office-agent-arrived", (event) => {
    document.dispatchEvent(new CustomEvent("office-agent-arrived-forward", { detail: event.detail }));
  });

  document.addEventListener("office-mode-changed", (event) => {
    if (event.detail && typeof event.detail.night === "boolean" && event.detail.night !== nightMode) {
      setDayNight();
    }
  });
  document.addEventListener("office-night-shift", (event) => {
    if (event.detail && event.detail.active !== nightMode) {
      setDayNight();
    }
  });

  new ResizeObserver(resize).observe(mount);
  window.addEventListener("resize", resize);
}

function initialize() {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  // Deteksi software renderer (SwiftShader/llvmpipe/Microsoft Basic) → paksa hemat.
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const rname = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "";
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(rname))) {
      quality = "low";
    }
  } catch (e) { /* abaikan */ }
  mount.prepend(renderer.domElement);
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    support?.markContextLost();
    support?.appendChat("hermes", "Konteks WebGL hilang. Muat ulang halaman; laporan otomatis tersedia di tab Laporkan bug.");
  });

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfe9eb);

  hemi = new THREE.HemisphereLight(0xfff7e6, 0x647b70, 1.5);
  scene.add(hemi);
  sun = new THREE.DirectionalLight(0xfff0cc, 2.2);
  sun.position.set(-14, 26, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -24;
  sun.shadow.camera.right = 24;
  sun.shadow.camera.top = 24;
  sun.shadow.camera.bottom = -24;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.bias = -0.0006;
  scene.add(sun);

  for (const [x, z] of [[0, -3], [12.75, -3], [-12.75, -3], [0, 5.5]]) {
    const light = new THREE.PointLight(0xffc46a, 0, 14, 2);
    light.position.set(x, 2.5, z);
    light.visible = false;
    scene.add(light);
    nightLights.push(light);
  }

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.MeshStandardMaterial({ color: 0x9dc696, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  scene.add(ground);

  world = createWorld(scene);
  world.activeFloor = 1;
  if (world.floorGroups[2]) world.floorGroups[2].visible = false;
  roomPatches = [];
  for (const group of [world.floorGroups[1], world.floorGroups[2]]) {
    if (!group) continue;
    group.traverse((obj) => {
      if (obj.userData && obj.userData.officeArea) roomPatches.push(obj);
    });
  }
  agentSystem = createAgentSystem(scene, world, bubbleLayer);

  support = createSupportPanel(() => {
    const gl = renderer ? renderer.getContext() : null;
    return {
      webgl: gl ? { vendor: gl.getParameter(gl.VENDOR), renderer: gl.getParameter(gl.RENDERER) } : null,
      fps,
      agents: agentSystem.agents.size,
      floor: activeFloor,
      night: nightMode,
      taskSummary: lastTaskSummary
    };
  });

  setupCamera();
  resize();
  applyQuality();
  wireControls();
  // Default: kamera atas (top-down) supaya NPC mudah diklik seperti game RTS.
  if (!topView) toggleTopView();
  mount.hidden = false;
  sceneWrap.classList.add("is-3d");
  requestAnimationFrame(animate);
  document.dispatchEvent(new Event("office-scene-ready"));
}

window.kantorDebug = {
  agentSystem: () => agentSystem,
  camera: () => camera,
  world: () => world,
  rendererInfo: () => lastRenderInfo,
  fps: () => fps,
  probe: (on) => { if (on !== undefined) perfProbe = on ? { start: 0, renderMs: 0 } : null; return perfProbe; },
  frame: () => frameCount,
  sceneStats: () => {
    let meshes = 0;
    let instanced = 0;
    let visible = 0;
    if (!scene) return null;
    scene.traverse((o) => {
      if (o.isInstancedMesh) { instanced += 1; meshes += 1; }
      else if (o.isMesh) meshes += 1;
      if (o.visible) visible += 1;
    });
    return { meshes, instanced, visible };
  },
  select: selectAgent,
  project: (id) => {
    const agent = agentSystem && agentSystem.agents.get(id);
    if (!agent) return null;
    const v = agent.rig.root.position.clone();
    v.y += 1.0;
    v.project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height };
  }
};

try {
  initialize();
} catch (error) {
  sceneWrap.classList.remove("is-3d");
  mount.hidden = true;
  if (renderError) {
    renderError.hidden = false;
    renderError.textContent = `3D tidak dapat dimuat di browser ini: ${error.message}. Tampilan isometrik 2D tetap tersedia.`;
  }
  support = createSupportPanel(() => ({ webgl: null, fps: 0, agents: 0, floor: 1, night: false, taskSummary: null }));
  support.appendChat("hermes", `Gagal memuat 3D: ${error.message}. Buka tab Laporkan bug untuk mengirim diagnostik.`);
  document.dispatchEvent(new CustomEvent("office-render-failed", { detail: { message: error.message } }));
}
