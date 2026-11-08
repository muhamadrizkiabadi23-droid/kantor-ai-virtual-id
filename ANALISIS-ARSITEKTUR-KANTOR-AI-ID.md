# KANTOR AI ID v1.0 — Analisis Arsitektur & Titik Kritis

> **Catatan:** Ini **bukan solusi/perbaikan**. Hanya analisis struktur, alur kerja, dan titik rawan error/crash.  
> Dibuat dari baca kode sumber lengkap: `server.js`, `app.js`, `office3d.js`, `officeWorld.js`, `officeAgents.js`, `officeSupport.js`, `workflow.js`, `login.js`, `index.html`, `styles.css`.

---

## 1. ARSITEKTUR KESELURUHAN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            KANTOR AI ID (Full Virtual)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  FRONTEND (Browser)                              │  BACKEND (Node.js)       │
│  ──────────────────────────────────────────────  │  ─────────────────────   │
│  • index.html — Single Page App shell            │  • server.js — HTTP only │
│  • login.html + login.js — Auth UI               │  • users.json — file DB  │
│  • styles.css — ~1200 baris (Glassmorphism)      │  • /api/auth/* endpoints │
│  • app.js — State & UI logic (1498 baris)        │  • /api/agent — AI proxy │
│  • workflow.js — Task state machine (UMD)        │  • /vendor/ — Three.js   │
│  • office3d.js — Three.js scene (ESM)            │  • vid/ — static video   │
│  • officeWorld.js — Geometry & materials         │                          │
│  • officeAgents.js — NPC rigs, pathfinding       │                          │
│  • officeSupport.js — Hermes monitor panel       │                          │
│  • CustomEvent bus — komunikasi antar modul      │                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Stack Teknologi
| Lapisan | Teknologi | Catatan |
|---------|-----------|---------|
| **Runtime** | Node.js 18+ (native `http`, `fs`, `crypto`, `net`, `child_process`) | Tanpa framework |
| **Frontend** | ES Modules (`type="module"`), Importmap untuk Three.js | `./vendor/three/` lokal |
| **3D** | Three.js r152+ (RoundedBoxGeometry, OrbitControls, RoomEnvironment, PMREM) | InstancedMesh, merged geometries |
| **State** | `localStorage` (tasks, owners, social, user) | **Tidak ada DB server** |
| **Auth** | Cookie `token` (HttpOnly, SHA-256 + salt) | `users.json` di disk |
| **AI** | Hermes CLI (`spawn` di server) → `/api/agent` | Fallback lokal jika gagal |
| **Monitoring** | `officeSupport.js` → panel "Hermes Teknisi" (FAB) | Error capture, CSP, FPS |

---

## 2. ALUR KERJA PENGGUNA (USER FLOW)

```
┌─────────┐     ┌─────────┐     ┌─────────────┐     ┌──────────────┐
│  Login  │────▶│ /app    │────▶│ 3D Office   │────▶│ Task Board   │
│(login.js)      │(index.html)    │(office3d.js)     │(app.js)      │
└─────────┘     └─────────┘     └─────────────┘     └──────────────┘
      │                                    │                   │
      │         ┌──────────────┐           │                   │
      └────────▶│  CEO Panel   │◀──────────┘                   │
                │  (6 shortcut)│                               │
                └──────────────┘                               │
                       │                                       │
              ┌────────┴────────┐                               │
              ▼                 ▼                               ▼
        ┌──────────┐      ┌──────────┐                   ┌──────────┐
        │New Task  │      │Broadcast │                   │  PIC     │
        │Dialog    │      │Message   │                   │Workflow  │
        └──────────┘      └──────────┘                   └──────────┘
```

### Step-by-step
1. **Login/Register** → `login.html` → POST `/api/auth/login|register` → cookie `token` → redirect `/app`
2. **Dashboard (`/app`)** → `index.html` load → `app.js` + `office3d.js` (ESM) init → Three.js scene ready
3. **CustomEvent bus** — `office-state` (dari `app.js` `emitOfficeState()`) → `office3d.js` sync NPC
4. **Buat Tugas** → CEO Panel → "Tugas Baru" → dialog → `workflow.createTask()` → `ownerFor()` pilih PIC → queue animasi
5. **Animasi Kantor** → `directTask()`/`directRevision()`/`directApproval()` → `meetingStep`/`workStep`/`collaborateStep` → NPC bergerak via `setAgent()` → `emitOfficeState()` → 3D sync
6. **Perintah NPC** → Klik NPC → Card chat → `runAgentCommand()` → `fetch('/api/agent')` → server spawn `hermes -z` → balikan reply

---

## 3. MODUL-MODUL UTAMA (DETAIL)

### 3.1 `server.js` (493 baris) — Backend HTTP
- **Static file serving** — Map hardcoded `FILES` (22 entri) + `/vendor/` fallback
- **Auth** — `register`, `login`, `logout`, `me`, `admin/users` — SHA-256+salt, cookie HttpOnly
- **AI Proxy** — `/api/agent` → `findHermes()` (cari CLI di 7 path) → `spawn(hermes, ['-z', prompt])` 100s timeout + 1 retry
- **Health** — `/health` + self-test on listen
- **Port resolution** — `resolvePort()` coba 25 port; cloud = 0.0.0.0, local = 127.0.0.1
- **Video** — `/vid/:file` serve dari `./vid/`

### 3.2 `app.js` (1498 baris) — State & UI Orchestrator
| Area | Fungsi Kunci |
|------|--------------|
| **Task Workflow** | `workflow.createTask`, `transitionTask`, `summarize` (UMD global `KantorWorkflow`) |
| **PIC System** | `ownerFor()` — keyword match + load balancing (1 tugas = 1 PIC permanen) |
| **Task Queue** | `taskQueue` + `pumpQueue()` → serialisasi animasi: create → revision → approve → cancel |
| **NPC State** | `officeAgents` Map → `setAgent(id, patch)` → status: `idle/working/meeting/collaborating/walking/resting` |
| **Direct Task Flow** | `directTask()` → briefing → intake → strategy → collaborate → studio → review → presentation → approval toast |
| **Ambience** | `startAmbience()` interval 26s: Arif patroli QC + random idle NPC "resting" (dekoratif) |
| **Office State Emit** | `emitOfficeState()` → `CustomEvent('office-state')` → dikonsumsi `office3d.js` |
| **CEO Panel** | 6 shortcut: Telegram, New Task, Approve All, Report, Broadcast, Night Shift |
| **Command Bar** | `runCommand()` parsing teks: laporan, setujui, revisi, broadcast, shift, tugas baru, sosmed, bantuan |
| **Per-Agen Chat** | `runAgentCommand(agentId, text)` → local reply + `fetch('/api/agent')` → Hermes CLI |
| **Social Accounts** | Manual add + AI simulate register → `localStorage` `kantor-ai-mvp.social.v1` |
| **Backup/Import** | Export/Import JSON (max 500 task, validasi schema) |

### 3.3 `office3d.js` (786 baris, ESM) — Three.js Scene Orchestration
| Komponen | Detail |
|----------|--------|
| **Renderer** | WebGLRenderer: antialias, SRGB, ACESFilmicToneMapping, PCFSoftShadowMap, autoUpdate=false |
| **Camera** | Default **Orthographic top-down** (y≈46); toggle `perspectiveMode` (P key) → PerspectiveCamera 42° |
| **Controls** | OrbitControls: damping 0.08, min/max distance/zoom, polar angle clamp |
| **Camera Transitions** | `startCameraTransition()` + `easeInOutCubic` 1.2s untuk `flyToArea()` (dock) & `toggleTopView()` (T key) |
| **Lighting** | HemisphereLight (0.6), DirectionalLight (1.8) + 2 fill lights, 4 night PointLight |
| **Shadow** | 1024² map, bias -0.0006, update tiap 3 frame saat ada gerakan |
| **Quality** | Auto/Hemat/Maks + URL `?quality=low|auto|high`; auto turun DPR ke 1 jika FPS < 28 selama 2.5s |
| **Software Renderer Detect** | `WEBGL_debug_renderer_info` → SwiftShader/llvmpipe → paksa `quality=low` |
| **Event Listeners** | `office-state` (sync NPC), `office-area-selected` (flyTo), `office-mode-changed`, `office-night-shift` |
| **Agent Card** | Click NPC (raycast) → HUD bottom-right: avatar, name, role, status, task, quick actions (laporan/kerja/istirahat/rapat) + free-text input → `runAgentCommand()` |
| **Room Dock** | 9 tombol → `flyToArea(areaName)` + smooth camera transition |
| **Keyboard** | 1-9 ruangan, T top-view, P perspektif, F fullscreen, D day/night, B task board, C chat, Esc tutup, R reset, Arrow pan |
| **Debug API** | `window.kantorDebug` — sceneStats, fps, frame, camera, world, select, project |

> ⚠️ **Ketidaksesuaian DOM (Critical)**: `office3d.js` mereferensikan **6 elemen HTML yang TIDAK ADA di `index.html`** — fitur diam-diam mati karena `on()` helper guard `if (el)`:
> - `office-bubble-toggle` — toggle visibilitas bubble NPC
> - `office-card-chat` — riwayat chat agen (HTML pakai `office-card-history`)
> - `office-card-form` — form kirim perintah ke agen
> - `office-card-task` — tampilkan tugas aktif agen
> - `office-render-error` — pesan error render 3D
> - `office-sleep-toggle` — toggle mode tidur/tidur tim
> 
> **Agent Card Chat TOTALLY BROKEN**: HTML punya `office-card-history` + `office-card-message`, tapi kode pakai `office-card-chat` (2x reference). `office-card-send` ada di HTML tapi **tidak di-wire** (form missing, tidak ada click handler). Fitur chat NPC **100% tidak berfungsi**.

### 3.4 `officeWorld.js` (1417 baris) — Geometry, Materials, Zones
| Bagian | Isi |
|--------|-----|
| **Konstanta** | `FLOOR_Y`, `BUILDING` (±28×20m), `WALL`/`WALL_TOP`, `ZONES` (9 area 3×3), `AGENT_HOMES` (12 core), `DESK_LAYOUT` (48 meja 4 blok) |
| **PALETTE** | 33 warna hex (dark theme: ink 0x1a1c20, wood 0x2a2520, red 0xb72d38, dll) |
| **Helper Geo** | `rbox`, `box`, `cyl`, `sph` + cache `geoCache`; `paint()` vertex color; `mergeParts()` via `mergeGeometries` |
| **Tekstur Prosedural** | `woodTexture`, `carpetTexture`, `tileTexture`, `grassTexture`, `rugTexture`, `prayRugTexture`, `menuBoardTexture` → canvas 2D |
| **Materials** | 19 `MeshStandardMaterial` (wood, carpet, tile, glass, metal, screen, water, leaf, wall, concrete, rubber, dll) |
| **Furniture Builders** | `buildDeskCluster`, `buildPlant`, `buildHangingLamp`, `buildSofaSet`, `buildTableSet`, `buildShelf` |
| **Zone Builders** | `buildWorkspace` (48 meja instanced), `buildMasjid`, `buildMeeting`, `buildKopi`, `buildStudio`, `buildClient`, `buildGym`, `buildLounge`, `buildPantry`, `buildExterior` |
| **InstancedMesh** | Meja, kursi, tanaman, lampu, tanaman gantung → pool per zona, `flushPlantPools`/`flushLampPools` |
| **NavGrid** | A* 0.5m cell untuk pathfinding NPC |
| **Day/Night** | `applyDayNight()` → ganti warna material (emissive, window, lamp), background, light intensity |
| **createWorld()** | Return `{ zones, floorGroups, roomTargets Map, nav, agentHomes, meetingSeats, decorativeSpots[], lampMaterials[], emissiveMaterials[], windowMaterials[], waterMaterials[], flagCloths[], night, elapsed, materials }` |

### 3.5 `officeAgents.js` (630 baris) — NPC System
| Fitur | Implementasi |
|-------|--------------|
| **Rig** | `createRig(def)` → merged geometries: body+head, leg+shoe, arm+hand (6 mesh per NPC), `MeshStandardMaterial` vertex color |
| **Pathfinding** | A* via `world.nav.findPath({x,z}, target)` — grid 0.5m |
| **State Machine** | `internalState`: `idle`/`moving`/`working`/`meeting`/`collaborating`/`resting` |
| **Sync** | `sync(snapshot)` dari `office-state` → update `def`, `status`, `desired` position, pathfind |
| **Desired Position** | `desiredFor(agent)` → by status: `meeting` (seat), `collaborating` (partner home), `resting` (decorativeSpot), `walking` (target), default (home) |
| **Activities** | 13 aktivitas dekoratif: `sholat`, `makan`, `ngopi`, `olahraga`, `renang`, `baca`, `meditasi`, `tidur`, `nonton`, `game`, `diskusi`, `santai`, `jemput` → `assignActivity()` saat idle, dihentikan saat task aktif |
| **Bubbles** | DOM overlay `office-bubbles` → `updateBubbleContent()` + frustum culling (max 8 visible, priority) |
| **Selection** | Ring highlight + `window.kantorDebug.select()` / `project()` |
| **Picking** | Raycast ke rig (sphere) + room patches (area click) |

### 3.5 `officeSupport.js` (400 baris) — "Hermes Teknisi" Monitor
| Fitur | Detail |
|-------|--------|
| **Error Capture** | `window.addEventListener('error')`, `unhandledrejection`, `console.error` override → array `errors[]` |
| **CSP Violations** | `securitypolicyviolation` → `failedResources[]` |
| **Resource Scan** | Periodic scan `<script>`, `<link>`, `<img>`, `<video>` → cek `src`/`href` vs `SCRIPT_ALLOWLIST` + HTTP HEAD 200 |
| **WebGL Context Lost** | Listener → `contextLost++` |
| **FAB + Panel** | Bottom-left shield button → 3 tab: Status, Laporkan Bug, Live Chat |
| **Live Chat** | Kirim ke `window.hermes.send(prompt)` (kalau di widget Hermes) atau copy ke clipboard |
| **Bug Report** | Package JSON: errors, failedResources, contextLost, diagnostics (`getDiagnostics()`), UA, URL, timestamp → copy/kirim |
| **Skill/Plugin List** | `window.HERMES_SKILLS` + `HERMES_PLUGINS` (static arrays) |

### 3.6 `workflow.js` (110 baris, UMD) — Task State Machine
| Fungsi | Aturan |
|--------|--------|
| `createTask(input)` | Validasi 9 field wajib + `deliverable` (caption/ideas) → generate draft + `status=review` + audit trail |
| `transitionTask(task, action)` | `approve` (review→approved), `revise` (review/revision→revision, max 2x), `finalize` (approved→final), `cancel` (→cancelled) |
| `summarize(tasks)` | Count: total, review, approved, revision |

### 3.7 `login.js` (167 baris) — Auth UI
- Toggle login/register mode
- `fetch('/api/auth/register|login')` → cookie + `localStorage.setItem('kantor.user')` → redirect `/app`
- Card tilt animation (GPU-only, `pointer: fine`)

### 3.8 `styles.css` (1588 baris) — Glassmorphism Dark Theme
- CSS Variables: warna, spacing, radius, shadow, transition
- Layout: `topbar`, `stage` (full-screen 3D), `office-hud-*` (TL/TR/BL/BR/Dock/Command), `task-board`, `ceo-panel`, `kbd-hint`
- Glass cards: `backdrop-filter: blur(12px)`, `rgba(10,12,16,0.7)`, border `rgba(255,255,255,0.08)`
- Game mode: `.game-mode` sembunyikan sidebar/topbar/dashboard
- Mobile: `@media (max-width: 768px)` — dock wrap, command bar full-width, kbd-hint hidden
- Animations: `@keyframes` untuk fade, slide, shake, pulse, spin

---

## 4. INTEGRASI AI (HERMES CLI)

```
Browser (app.js)          Server (server.js)          Hermes CLI
─────────────────         ─────────────────           ────────────
runAgentCommand()    ──▶  POST /api/agent          spawn(hermes -z)
  (agentId, text)          {agent, prompt}              │
                              │                       stdin: instruction
                              │                       stdout: reply
                              ◀──  JSON {ok, reply} ◀──  │
                                     │
                              return {ok, reply}
```

- **Server-side**: `findHermes()` cari binary di 7 lokasi (LOCALAPPDATA, USERPROFILE, .hermes, .local, /usr/local/bin, /usr/bin, PATH)
- **Instruction template**: `Kamu ${agentName}, karyawan di KANTOR AI ID. Perintah bos: "${prompt}". Balas singkat maksimal 2 kalimat dalam Bahasa Indonesia, sebagai ${agentName}.`
- **Timeout**: 100 detik + 1 retry otomatis (1.5s delay) jika reply kosong/gagal
- **Fallback**: Jika Hermes tidak ditemukan / error → reply lokal dari `app.js` (localReply)
- **Scratch dir**: `${HOME}/.hermes/cache/scratch` (Windows: `%LOCALAPPDATA%\.hermes\cache\scratch`)

---

## 5. STATE MANAGEMENT & DATA FLOW

### 5.1 Client-side State (Memory + localStorage)
| Key | Tipe | Isi |
|-----|------|-----|
| `kantor-ai-mvp.tasks.v1` | `localStorage` | Array task (persist via `persist()`) |
| `kantor.owners.v1` | `localStorage` | Map `taskId → agentId` (PIC permanen) |
| `kantor-ai-mvp.social.v1` | `localStorage` | Array akun sosmed (consumer, platform, username, status) |
| `kantor.user` | `localStorage` | `{ name }` — cek cepat sudah login |
| `officeAgents` | `Map` (memori) | `agentId → {status, message, taskId, partnerId, decorative, ...}` |
| `taskOwners` | `Map` | `taskId → agentId` (PIC) |
| `ownerLoad` | `Map` | `agentId → count` (load balancing) |
| `taskQueue` | `Array` | Antrian animasi: `{kind, task, note?}` |

### 5.2 Server-side State (File)
| File | Isi |
|------|-----|
| `users.json` | `{ users: [{id, name, salt, hash, createdAt}], sessions: [{token, userId, createdAt}] }` |
| `vid/*.mp4` | Video statis (tidak diproses) |

### 5.3 Event Bus (CustomEvent) — **Backbone komunikasi**
| Event | Dari | Ke | Payload |
|-------|------|----|---------|
| `office-state` | `app.js` `emitOfficeState()` | `office3d.js`, `app.js` (self) | Full snapshot: agents, meetings, activeTaskId, notice, taskSummary |
| `office-area-selected` | `app.js` (dock click, keyboard) | `office3d.js` | `{area, floor}` → `flyToArea()` |
| `office-room-focused` | `office3d.js` `focusArea()` | `app.js` `updateSideCard()` | `area` string |
| `office-agent-selected` | `office3d.js` `selectAgent()` | `app.js` | `{agentId, name}` → `updateSideCard(agent.area)` |
| `office-sleep-request` | `office3d.js` `toggleSleep()` | `app.js` | `{sleep: boolean}` → stop/start ambience |
| `office-mode-changed` | `office3d.js` `setDayNight()` | `office3d.js` (self), `app.js` | `{night, floor}` |
| `office-night-shift` | `app.js` CEO panel | `office3d.js` | `{active: boolean}` |
| `office-agent-arrived` | `officeAgents.js` | `office3d.js` → forward | `{agentId}` |
| `office-scene-ready` | `office3d.js` `initialize()` | `app.js` | — → `emitOfficeState()` + `startAmbience()` |
| `office-render-failed` | `office3d.js` catch | — | `{message}` |

---

## 6. TITIK-TITIK KRUSIS (RAWAN ERROR / CRASH)

> **Klasifikasi**: 🔴 **Critical** (bisa crash total / data loss) · 🟠 **High** (fitur utama gagal) · 🟡 **Medium** (degradasi UX) · 🟢 **Low** (kosmetik)

| # | Area | Titik Kritis | Gejala / Risiko | Klasifikasi |
|---|---|---|---|---|
| **1** | **Hermes CLI Path** | `findHermes()` hardcode 7 path Windows/Unix | CLI tidak ditemukan → AI reply fallback lokal (user tidak sadar AI mati) | 🔴 |
| **2** | **Spawn Timeout** | `runHermesOnce()` 100s timeout + kill | Proses zombie jika `child.kill()` gagal; memory leak | 🔴 |
| **3** | **File Lock** | `users.json` read/write sync (`fs.readFileSync`/`writeFileSync`) | Concurrent request → corrupt JSON / `EACCES` / data loss | 🔴 |
| **4** | **localStorage Quota** | `persist()` / `saveSocial()` / `persistOwners()` | Quota exceeded (5MB) → `QuotaExceededError` → data tidak tersimpan, tidak ada fallback | 🔴 |
| **5** | **ES Module Load** | `office3d.js` import Three.js via importmap | Network fail / CSP block → scene tidak init, canvas kosong, **tidak ada error UI** | 🔴 |
| **6** | **Three.js Vendor** | `/vendor/three/` serve manual di server | File hilang / path salah → 404 → Three.js undefined → crash `initialize()` | 🔴 |
| **7** | **WebGL Context Lost** | `renderer.domElement` listener | GPU reset / tab background → context lost → scene hancang, listener cuma set flag, **tidak auto-recover** | 🔴 |
| **8** | **DOM Element Missing** | 6 elemen HTML hilang di `index.html` tapi direferensikan `office3d.js` | `office-bubble-toggle`, `office-card-chat`, `office-card-form`, `office-card-task`, `office-render-error`, `office-sleep-toggle` → fitur mati diam-diam | 🔴 |
| **9** | **Agent Card Chat Broken** | HTML pakai `office-card-history`, kode pakai `office-card-chat`; `office-card-send` tidak di-wire | Fitur chat NPC 100% tidak berfungsi, tidak ada error | 🔴 |
| **10** | **CustomEvent Race** | `emitOfficeState()` dipanggil sebelum `office3d.js` ready | `office-state` terkirim tapi `agentSystem` belum ada → `sync()` no-op, NPC freeze | 🟠 |
| **11** | **Animation Queue** | `pumpQueue()` serial tapi `await` di dalam `while` | Satu animasi hang (misal `waitForArrival` timeout) → queue macet, task berikutnya tidak jalan | 🟠 |
| **12** | **Pathfinding Fail** | `world.nav.findPath()` return `[]` / null | NPC `internalState="moving"` tapi `path=[]` → stuck diam, `idleTime` tidak reset | 🟠 |
| **13** | **A* NavGrid Bounds** | `NavGrid` konstruktor pakai `BUILDING` min/max | NPC keluar batas (target di luar grid) → `findPath` error / infinite loop | 🟠 |
| **14** | **Cookie Auth** | `readToken()` parse manual cookie header | Multiple cookie / malformed → `null` → 401 phantom logout | 🟠 |
| **15** | **Port Conflict** | `resolvePort()` coba 25 port, tapi `isPortAvailable` pakai `net.createServer` | Ephemeral port race condition → `EADDRINUSE` di cloud | 🟠 |
| **16** | **Video Serve** | `/vid/:file` `fs.readFileSync` blocking | File besar (1MB+) → block event loop, request lain timeout | 🟠 |
| **17** | **localStorage Corrupt** | `JSON.parse` tanpa validasi schema ketat | Data lama / manual edit → `loadTasks()` throw → `tasks=[]` (data hilang silent) | 🟠 |
| **18** | **Owner Persist** | `persistOwners()` dipanggil di `ownerFor()` & `releaseOwner()` | Race condition: dua tugas dibuat bersamaan → `taskOwners` Map vs localStorage out-of-sync | 🟠 |
| **19** | **Ambience Timer** | `setInterval` 26s tidak di-clear saat unload | Memory leak tab ditinggal lama; `stopAmbience()` hanya dipanggil saat sleep/task | 🟡 |
| **20** | **Bubble Frustum Cull** | `pruneBubbles()` pakai `frustum` dari camera sebelumnya | Camera move cepat → frustum stale → bubble salah hide/show | 🟡 |
| **21** | **InstancedMesh Pool** | `flushPlantPools()` / `flushLampPools()` traverse setiap frame init | Pool tidak di-dispose saat zone unload → memory leak GPU | 🟡 |
| **22** | **CSS Font Load** | Google Fonts (Playfair Display, Inter) preconnect | Offline / firewall → font fallback ke system, layout shift | 🟡 |
| **23** | **Importmap Three.js** | `./vendor/three/three.module.js` relative | Deploy subpath (misal `/kantor/`) → path salah, Three.js 404 | 🟡 |
| **24** | **Hermes Skills List** | `window.HERMES_SKILLS` hardcoded array | Skill baru tidak otomatis terdaftar di panel monitor | 🟢 |
| **25** | **Keyboard Hint** | `kbd-hint` auto-remove 15s | User tidak sempat baca; tidak ada cara tampilkan lagi | 🟢 |
| **26** | **Mobile Viewport** | `@media (max-width: 768px)` | Dock 9 tombol wrap 2 baris → overlap command bar di HP kecil | 🟢 |
| **27** | **Backup Validation** | Import cek `backup.tasks.length > 500` | Hardcoded limit; tidak configurable, tidak ada pagination | 🟢 |

---

## 7. DEPENDENSI EKSTERNAL & VERSI

| Depedensi | Versi / Sumber | Catatan |
|-----------|----------------|---------|
| **Three.js** | r152+ (vendor lokal) | `three.module.js`, `three.core.js`, `OrbitControls`, `RoomEnvironment`, `BufferGeometryUtils`, `RoundedBoxGeometry` |
| **Node.js** | 18+ (native modules only) | `http`, `fs`, `path`, `net`, `crypto`, `child_process` |
| **Hermes CLI** | External binary | Harus terinstall di server; path hardcoded di `findHermes()` |
| **Google Fonts** | Playfair Display + Inter | Preconnect; fallback system font |
| **Font Awesome / Emoji** | Native Unicode emoji | Tidak pakai icon font eksternal |

---

## 8. KONFIGURASI DEPLOY

| Environment | Variabel | Default |
|-------------|----------|---------|
| `PORT` | Port HTTP | `4173` |
| `HOST` | Bind address | `127.0.0.1` (local), `0.0.0.0` (cloud) |
| `INVITE_CODE` | Kode registrasi | `UMKM2026` |
| `RAILWAY_ENVIRONMENT` | Deteksi cloud | Auto |
| `CODESPACES` | Deteksi Codespaces | Auto |
| `LOCALAPPDATA` | Windows Hermes path | `%LOCALAPPDATA%` |

---

## 9. RINGKASAN UNTUK MAINTENANCE

**Arsitektur monolitik single-process Node.js + client-side ES Modules + localStorage state.**  
Tidak ada message queue, tidak ada database server, tidak ada worker terpisah. Semua state di memori browser + file JSON di disk.

**Titik gagal tunggal (Single Points of Failure):**
1. **Hermes CLI binary** — kalau hilang/rusak, AI mati diam-diam
2. **users.json** — corrupt = semua user lockout
3. **localStorage** — quota/hapus cache = hilang semua task & PIC mapping
4. **Three.js vendor files** — 1 file hilang = 3D total blank
5. **CustomEvent bus** — race condition init = NPC freeze tanpa error
6. **DOM Element Missing (6 elemen)** — `office-bubble-toggle`, `office-card-chat`, `office-card-form`, `office-card-task`, `office-render-error`, `office-sleep-toggle` → 6 fitur mati diam-diam
7. **Agent Card Chat 100% Broken** — `office-card-chat` vs `office-card-history` mismatch, `office-card-send` tidak di-wire → chat NPC total non-fungsional

---

*Dokumen ini hanya analisis. **Tidak berisi solusi/perbaikan.** Siap lanjut ke desain maintenance & error logging mandiri jika rangkuman sudah sesuai.*