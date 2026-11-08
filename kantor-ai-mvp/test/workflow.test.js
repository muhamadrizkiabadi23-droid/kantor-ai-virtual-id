const test = require("node:test");
const assert = require("node:assert/strict");
const { createTask, transitionTask, summarize, REVISION_LIMIT } = require("../src/workflow.js");

const validInput = {
  business: "Kedai Pagi",
  category: "Kuliner",
  location: "Pekanbaru",
  pic: "PIC contoh",
  product: "Kopi susu Rp18.000",
  audience: "Pekerja sekitar",
  goal: "Kenalkan menu baru, Jumat",
  brandDirection: "Santai",
  approver: "Pemilik contoh",
  deliverable: "caption"
};
const fixedDate = new Date("2026-11-07T07:00:00.000Z");

test("creates a local draft with an audit event and no external side effects", () => {
  const task = createTask(validInput, fixedDate, "task-1");
  assert.equal(task.status, "review");
  assert.match(task.draft, /DRAF CAPTION/);
  assert.equal(task.audit[0].event, "created");
  assert.equal(task.id, "task-1");
});

test("requires every MVP intake group", () => {
  for (const field of ["business", "category", "location", "pic", "product", "audience", "goal", "brandDirection", "approver"]) {
    assert.throws(() => createTask({ ...validInput, [field]: " " }, fixedDate), new RegExp(field));
  }
});

test("requires a supported draft type", () => {
  assert.throws(() => createTask({ ...validInput, deliverable: "ads" }, fixedDate), /tidak dikenali/);
});

test("requires an operator note for revision and caps the proposed revision rounds", () => {
  let task = createTask(validInput, fixedDate, "task-2");
  assert.throws(() => transitionTask(task, "revise", { note: " " }, fixedDate), /wajib diisi/);
  task = transitionTask(task, "revise", { note: "Tambahkan CTA" }, fixedDate);
  task = transitionTask(task, "revise", { note: "Perjelas manfaat" }, fixedDate);
  assert.equal(task.revisionCount, REVISION_LIMIT);
  assert.throws(() => transitionTask(task, "revise", { note: "Ubah lagi" }, fixedDate), /Batas/);
});

test("only permits valid approval and finalization transitions", () => {
  let task = createTask(validInput, fixedDate, "task-3");
  assert.throws(() => transitionTask(task, "finalize", {}, fixedDate), /tidak sesuai/);
  task = transitionTask(task, "approve", {}, fixedDate);
  assert.equal(task.status, "approved");
  task = transitionTask(task, "finalize", {}, fixedDate);
  assert.equal(task.status, "final");
  assert.equal(task.audit.at(-1).event, "marked_final");
  assert.throws(() => transitionTask(task, "cancel", {}, fixedDate), /tidak sesuai/);
});

test("summarizes task states without counting cancelled tasks as awaiting review", () => {
  const tasks = [
    createTask(validInput, fixedDate, "a"),
    transitionTask(createTask(validInput, fixedDate, "b"), "approve", {}, fixedDate),
    transitionTask(createTask(validInput, fixedDate, "c"), "revise", { note: "Periksa ulang" }, fixedDate),
    transitionTask(createTask(validInput, fixedDate, "d"), "cancel", {}, fixedDate)
  ];
  assert.deepEqual(summarize(tasks), { total: 4, review: 1, approved: 1, revision: 1 });
});
