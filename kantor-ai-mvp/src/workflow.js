(function (root, factory) {
  const workflow = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = workflow;
  if (root) root.KantorWorkflow = workflow;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const REVISION_LIMIT = 2;
  const STATUSES = Object.freeze(["review", "approved", "revision", "final", "cancelled"]);

  function makeDraft(task) {
    const business = task.business.trim();
    const product = task.product.trim();
    const audience = task.audience.trim();

    if (task.deliverable === "ideas") {
      return [
        `DRAF IDE KONTEN — ${business}`,
        `1. Kenalkan ${product} kepada ${audience} dengan cerita singkat tentang manfaat atau cara menikmatinya.`,
        `2. Tampilkan proses atau suasana di balik ${business}; gunakan detail yang benar-benar dikonfirmasi pemilik.`,
        `3. Ajak audiens bertanya atau memberi pendapat. Periksa kembali semua klaim sebelum digunakan.`,
        "",
        "Ide ini contoh awal, bukan rekomendasi terverifikasi. Operator dan klien perlu meninjau sebelum publikasi."
      ].join("\n");
    }

    return [
      `DRAF CAPTION — ${business}`,
      "",
      `Lagi cari pilihan untuk menemani harimu? Kenalan dengan ${product}.`,
      "",
      `Dibuat untuk ${audience}. Tanya kami untuk info lebih lanjut.`,
      "",
      "Catatan: ganti atau verifikasi semua klaim, harga, dan ajakan sebelum dikirim ke klien atau dipublikasikan."
    ].join("\n");
  }

  function createTask(input, now = new Date(), id = createId()) {
    const fields = ["business", "category", "location", "pic", "product", "audience", "goal", "brandDirection", "approver"];
    const task = {};
    for (const field of fields) {
      const value = typeof input[field] === "string" ? input[field].trim() : "";
      if (!value) throw new Error(`Kolom wajib belum diisi: ${field}`);
      task[field] = value;
    }
    if (!["caption", "ideas"].includes(input.deliverable)) {
      throw new Error("Jenis draf tidak dikenali.");
    }

    task.id = id;
    task.deliverable = input.deliverable;
    task.title = input.deliverable === "ideas" ? "Ide konten" : "Caption promosi";
    task.status = "review";
    task.revisionCount = 0;
    task.revisionNotes = [];
    task.draft = makeDraft(task);
    task.createdAt = now.toISOString();
    task.updatedAt = task.createdAt;
    task.audit = [{ event: "created", at: task.createdAt, actor: "Operator" }];
    return task;
  }

  function transitionTask(task, action, options = {}, now = new Date()) {
    if (!STATUSES.includes(task.status)) throw new Error("Status tugas tidak valid.");
    const updated = structuredClone(task);
    const at = now.toISOString();

    if (action === "approve" && updated.status === "review") {
      updated.status = "approved";
      updated.audit.push({ event: "approved", at, actor: "Operator" });
    } else if (action === "revise" && ["review", "revision"].includes(updated.status)) {
      const note = typeof options.note === "string" ? options.note.trim() : "";
      if (!note) throw new Error("Catatan revisi wajib diisi.");
      if (updated.revisionCount >= REVISION_LIMIT) {
        throw new Error(`Batas ${REVISION_LIMIT} putaran revisi tercapai; sepakati perubahan lingkup secara manual.`);
      }
      updated.revisionCount += 1;
      updated.status = "revision";
      updated.revisionNotes.push(note);
      updated.audit.push({ event: "revision_requested", at, actor: "Operator", note });
    } else if (action === "finalize" && updated.status === "approved") {
      updated.status = "final";
      updated.audit.push({ event: "marked_final", at, actor: "Operator" });
    } else if (action === "cancel" && !["final", "cancelled"].includes(updated.status)) {
      updated.status = "cancelled";
      updated.audit.push({ event: "cancelled", at, actor: "Operator" });
    } else {
      throw new Error("Aksi tidak sesuai dengan status tugas saat ini.");
    }

    updated.updatedAt = at;
    return updated;
  }

  function createId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function summarize(tasks) {
    return {
      total: tasks.length,
      review: tasks.filter((task) => task.status === "review").length,
      approved: tasks.filter((task) => task.status === "approved").length,
      revision: tasks.filter((task) => task.status === "revision").length
    };
  }

  return Object.freeze({ REVISION_LIMIT, STATUSES, createTask, transitionTask, summarize });
});
