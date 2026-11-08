const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");
const crypto = require("node:crypto");

const ROOT = __dirname;
const DEFAULT_PORT = 4173;
const PORT = Number(process.env.PORT || DEFAULT_PORT);
// Railway & Codespaces butuh bind 0.0.0.0
const isCloud = Boolean(process.env.CODESPACES || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_SERVICE_NAME);
const HOST = isCloud ? "0.0.0.0" : (process.env.HOST || "127.0.0.1");
console.log(`[env] PORT=${process.env.PORT || "(default)"} HOST=${HOST} RAILWAY_ENV=${process.env.RAILWAY_ENVIRONMENT || "-"} CODESPACES=${process.env.CODESPACES || "-"}`);

/* ------------------------------------------------------------------ */
/* Penyimpanan akun (JSON — cukup untuk prototype)                     */
/* ------------------------------------------------------------------ */

const USERS_FILE = path.join(ROOT, "users.json");
const INVITE_CODE = process.env.INVITE_CODE || "UMKM2026";

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return { users: [], sessions: [] };
  }
}

function saveUsers(data) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("[users] gagal menyimpan:", error.message);
  }
}

function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

function register({ name, password, inviteCode }) {
  const cleanName = String(name || "").trim().slice(0, 40);
  if (cleanName.length < 3) return { ok: false, error: "Nama minimal 3 huruf." };
  if (String(password || "").length < 6) return { ok: false, error: "Sandi minimal 6 karakter." };
  if (String(inviteCode || "").trim() !== INVITE_CODE) {
    return { ok: false, error: "Kode undangan salah." };
  }
  const data = loadUsers();
  if (data.users.some((user) => user.name.toLowerCase() === cleanName.toLowerCase())) {
    return { ok: false, error: "Nama sudah dipakai, coba nama lain." };
  }
  const salt = crypto.randomBytes(16).toString("hex");
  data.users.push({
    id: crypto.randomUUID(),
    name: cleanName,
    salt,
    hash: hashPassword(String(password), salt),
    createdAt: new Date().toISOString()
  });
  saveUsers(data);
  return { ok: true, name: cleanName };
}

function login({ name, password }) {
  const data = loadUsers();
  const user = data.users.find((item) => item.name.toLowerCase() === String(name || "").toLowerCase());
  if (!user) return { ok: false, error: "Nama atau sandi salah." };
  if (user.hash !== hashPassword(String(password || ""), user.salt)) {
    return { ok: false, error: "Nama atau sandi salah." };
  }
  const token = createToken();
  data.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  saveUsers(data);
  return { ok: true, token, name: user.name };
}

function userForToken(token) {
  if (!token) return null;
  const data = loadUsers();
  const session = data.sessions.find((item) => item.token === token);
  if (!session) return null;
  return data.users.find((user) => user.id === session.userId) || null;
}

function readToken(request) {
  const header = request.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  const cookie = request.headers.cookie || "";
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/* ------------------------------------------------------------------ */
/* Berkas statis                                                       */
/* ------------------------------------------------------------------ */

const FILES = new Map([
  ["/", ["login.html", "text/html; charset=utf-8"]],
  ["/login", ["login.html", "text/html; charset=utf-8"]],
  ["/login.html", ["login.html", "text/html; charset=utf-8"]],
  ["/app", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/admin", ["admin.html", "text/html; charset=utf-8"]],
  ["/admin.html", ["admin.html", "text/html; charset=utf-8"]],
  ["/favicon.svg", ["favicon.svg", "image/svg+xml"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/login.js", ["login.js", "text/javascript; charset=utf-8"]],
  ["/src/workflow.js", ["src/workflow.js", "text/javascript; charset=utf-8"]],
  ["/src/app.js", ["src/app.js", "text/javascript; charset=utf-8"]],
  ["/src/office3d.js", ["src/office3d.js", "text/javascript; charset=utf-8"]],
  ["/src/officeWorld.js", ["src/officeWorld.js", "text/javascript; charset=utf-8"]],
  ["/src/officeAgents.js", ["src/officeAgents.js", "text/javascript; charset=utf-8"]],
  ["/src/officeSupport.js", ["src/officeSupport.js", "text/javascript; charset=utf-8"]],
  ["/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js", ["node_modules/three/examples/jsm/utils/BufferGeometryUtils.js", "text/javascript; charset=utf-8"]],
  ["/node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js", ["node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js", "text/javascript; charset=utf-8"]],
  ["/node_modules/three/build/three.module.js", ["node_modules/three/build/three.module.js", "text/javascript; charset=utf-8"]],
  ["/node_modules/three/build/three.core.js", ["node_modules/three/build/three.core.js", "text/javascript; charset=utf-8"]],
  ["/node_modules/three/examples/jsm/controls/OrbitControls.js", ["node_modules/three/examples/jsm/controls/OrbitControls.js", "text/javascript; charset=utf-8"]]
]);

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", (error) => resolve(error.code !== "EADDRINUSE"));
    tester.once("listening", () => {
      tester.once("close", () => resolve(true)).close();
    });
    tester.listen(port, "127.0.0.1");
  });
}

async function resolvePort(port) {
  const requestedPort = Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
  let candidate = requestedPort;

  for (let attempts = 0; attempts < 25; attempts += 1) {
    if (await isPortAvailable(candidate)) return candidate;
    candidate += 1;
  }

  throw new Error(`Tidak ada port yang tersedia mulai dari ${requestedPort}.`);
}

/* ------------------------------------------------------------------ */
/* AI backend (Hermes CLI)                                             */
/* ------------------------------------------------------------------ */

const { spawn } = require("node:child_process");

function findHermes() {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const candidates = [
    path.join(process.env.LOCALAPPDATA || "", "hermes", "hermes-agent", ".hermes", "bin", "hermes.exe"),
    path.join(home, ".hermes", "bin", "hermes.exe"),
    path.join(home, ".hermes", "bin", "hermes"),
    path.join(home, ".local", "bin", "hermes"),
    "/usr/local/bin/hermes",
    "/usr/bin/hermes",
    "hermes"
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate === "hermes") return "hermes";
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      /* abaikan */
    }
  }
  return null;
}

function runHermes(agentName, prompt, callback) {
  const attempt = (retried) => {
    runHermesOnce(agentName, prompt, (result) => {
      const failed = !result.ok || /No reply|fallback chain|every provider/i.test(result.reply || "");
      if (failed && !retried) {
        setTimeout(() => attempt(true), 1500);
        return;
      }
      callback(result);
    });
  };
  attempt(false);
}

function runHermesOnce(agentName, prompt, callback) {
  const hermes = findHermes();
  if (!hermes) {
    callback({ ok: false, reply: `${agentName}: backend AI (hermes CLI) belum terpasang di server ini.` });
    return;
  }
  const instruction = `Kamu ${agentName}, karyawan di KANTOR AI ID. Perintah bos: "${prompt}". Balas singkat maksimal 2 kalimat dalam Bahasa Indonesia, sebagai ${agentName}.`;
  const scratch = path.join(
    process.env.HOME || process.env.LOCALAPPDATA || process.env.TEMP || ".",
    ".hermes",
    "cache",
    "scratch"
  );
  let child;
  try {
    child = spawn(hermes, ["-z", instruction], { cwd: scratch, windowsHide: true });
  } catch (error) {
    callback({ ok: false, reply: `${agentName}: gagal menjalankan AI (${error.message}).` });
    return;
  }
  let out = "";
  let err = "";
  let done = false;
  const timer = setTimeout(() => {
    if (done) return;
    done = true;
    try { child.kill(); } catch { /* abaikan */ }
    callback({ ok: false, reply: `${agentName}: AI membutuhkan waktu terlalu lama, coba lagi.` });
  }, 100000);
  child.stdout.on("data", (chunk) => { out += chunk.toString(); });
  child.stderr.on("data", (chunk) => { err += chunk.toString(); });
  child.on("error", () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    callback({ ok: false, reply: `${agentName}: gagal menghubungi AI.` });
  });
  child.on("close", (code) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    const text = out.trim() || err.trim();
    if (!text) {
      callback({ ok: false, reply: `${agentName}: AI tidak merespons (exit ${code}).` });
      return;
    }
    callback({ ok: true, reply: text.slice(0, 500) });
  });
}

/* ------------------------------------------------------------------ */
/* Server                                                              */
/* ------------------------------------------------------------------ */

function sendJson(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  response.end(JSON.stringify(payload));
}

function readBody(request, limit = 20000) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > limit) request.destroy();
    });
    request.on("end", () => resolve(body));
    request.on("error", () => resolve(body));
  });
}

async function handleAuth(request, response, pathname, method) {
  if (pathname === "/api/auth/register" && method === "POST") {
    let payload = {};
    try {
      payload = JSON.parse(await readBody(request) || "{}");
    } catch {
      payload = {};
    }
    const result = register(payload);
    sendJson(response, result.ok ? 200 : 400, result);
    return true;
  }

  if (pathname === "/api/auth/login" && method === "POST") {
    let payload = {};
    try {
      payload = JSON.parse(await readBody(request) || "{}");
    } catch {
      payload = {};
    }
    const result = login(payload);
    if (result.ok) {
      sendJson(response, 200, { ok: true, name: result.name }, {
        "Set-Cookie": `token=${encodeURIComponent(result.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
      });
    } else {
      sendJson(response, 401, result);
    }
    return true;
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    const token = readToken(request);
    const data = loadUsers();
    data.sessions = data.sessions.filter((item) => item.token !== token);
    saveUsers(data);
    sendJson(response, 200, { ok: true }, { "Set-Cookie": "token=; Path=/; Max-Age=0" });
    return true;
  }

  if (pathname === "/api/auth/me" && method === "GET") {
    const user = userForToken(readToken(request));
    if (!user) {
      sendJson(response, 401, { ok: false, error: "Belum masuk." });
      return true;
    }
    sendJson(response, 200, { ok: true, name: user.name, createdAt: user.createdAt });
    return true;
  }

  if (pathname === "/api/admin/users" && method === "GET") {
    const user = userForToken(readToken(request));
    if (!user || user.name !== "bos") {
      sendJson(response, 403, { ok: false, error: "Khusus pemilik." });
      return true;
    }
    const data = loadUsers();
    sendJson(response, 200, {
      ok: true,
      users: data.users.map((item) => ({ name: item.name, createdAt: item.createdAt }))
    });
    return true;
  }

  return false;
}

function createServer(port) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = url.pathname;
    const method = request.method;

    if (pathname === "/health" && method === "GET") {
      sendJson(response, 200, { ok: true, service: "kantor-ai", ts: Date.now() });
      return;
    }

    if (await handleAuth(request, response, pathname, method)) return;

    if (pathname === "/api/agent" && method === "POST") {
      let payload = {};
      try {
        payload = JSON.parse(await readBody(request) || "{}");
      } catch {
        payload = {};
      }
      const user = userForToken(readToken(request));
      if (!user) {
        sendJson(response, 401, { ok: false, reply: "Silakan masuk dulu." });
        return;
      }
      const agentName = String(payload.agent || "Agen").slice(0, 60);
      const prompt = String(payload.prompt || "").slice(0, 4000);
      if (!prompt.trim()) {
        sendJson(response, 400, { ok: false, reply: "Perintah kosong." });
        return;
      }
      runHermes(agentName, prompt, (result) => sendJson(response, 200, result));
      return;
    }

    const entry = FILES.get(pathname);

    if (!entry && pathname.startsWith("/vid/") && method === "GET") {
      const videoPath = path.join(ROOT, "vid", path.basename(pathname));
      if (fs.existsSync(videoPath)) {
        response.writeHead(200, {
          "Content-Type": "video/mp4",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
          "Cache-Control": "no-store"
        });
        response.end(fs.readFileSync(videoPath));
        return;
      }
    }

    // Aset Three.js lokal (dipakai saat deploy statis / GitHub Pages)
    if (!entry && pathname.startsWith("/vendor/") && method === "GET") {
      const rel = pathname.replace(/^\/vendor\//, "");
      const vendorPath = path.join(ROOT, "vendor", rel);
      if (fs.existsSync(vendorPath) && fs.statSync(vendorPath).isFile()) {
        const ext = path.extname(vendorPath).toLowerCase();
        const type = ext === ".js" ? "text/javascript; charset=utf-8"
          : ext === ".css" ? "text/css; charset=utf-8"
          : "application/octet-stream";
        response.writeHead(200, {
          "Content-Type": type,
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
          "Cache-Control": "no-store"
        });
        response.end(fs.readFileSync(vendorPath));
        return;
      }
    }

    if (!entry || method !== "GET") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const [relativePath, contentType] = entry;
    fs.readFile(path.join(ROOT, relativePath), (error, content) => {
      if (error) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Unable to load the prototype.");
        return;
      }

      response.writeHead(200, {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "no-store"
      });
      response.end(content);
    });
  });
}

function attachServerEvents(server) {
  server.on("listening", () => {
    const addr = server.address();
    console.log(`[server] listening on http://${addr.address}:${addr.port} (${addr.family})`);
    // Self-test: pastikan server benar-benar bisa melayani HTTP di dalam container
    const probe = http.get(
      { host: "127.0.0.1", port: addr.port, path: "/health", timeout: 4000 },
      (res) => {
        console.log(`[server] self-test /health -> HTTP ${res.statusCode}`);
        res.resume();
      }
    );
    probe.on("error", (error) => {
      console.error(`[server] self-test GAGAL: ${error.code || ""} ${error.message}`);
    });
    probe.on("timeout", () => {
      probe.destroy();
      console.error("[server] self-test TIMEOUT");
    });
  });
  server.on("error", (error) => {
    console.error(`[server] ERROR ${error.code || ""}: ${error.message}`);
  });
  return server;
}

async function startServer(port = PORT) {
  const isCloud = HOST === "0.0.0.0";
  // Di cloud (Railway/Codespaces) pakai PORT langsung — jangan resolvePort
  const selectedPort = isCloud ? port : await resolvePort(port);
  const server = attachServerEvents(createServer());
  server.listen(selectedPort, HOST);
  const shownHost = HOST === "0.0.0.0" ? "0.0.0.0" : HOST;
  console.log(`Kantor AI Full Virtual: http://${shownHost}:${selectedPort}`);
  if (HOST === "0.0.0.0") {
    console.log("Mode cloud: bind 0.0.0.0 (port forwarding aktif).");
  }
  console.log(`Kode undangan: ${INVITE_CODE}`);
  const hermes = findHermes();
  if (hermes) {
    console.log("AI backend: Hermes Agent CLI aktif (NPC dijawab AI sungguhan).");
  } else {
    console.log("AI backend: hermes CLI tidak ditemukan — NPC memakai jawaban lokal.");
  }
  console.log("Telegram/Google/Sheets: belum terhubung (fase integrasi).");
  return server;
}

module.exports = { DEFAULT_PORT, FILES, resolvePort, startServer, register, login, userForToken };

process.on("uncaughtException", (error) => {
  console.error(`[server] uncaught: ${error && error.message ? error.message : error}`);
});
process.on("unhandledRejection", (reason) => {
  console.error(`[server] unhandledRejection: ${reason}`);
});

if (require.main === module) {
  startServer(PORT).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
