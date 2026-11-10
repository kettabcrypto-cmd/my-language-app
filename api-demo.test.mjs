import test from "node:test";
import assert from "node:assert/strict";
import { CONFIG } from "../site/assets/js/config.js";
import { api, ApiError } from "../site/assets/js/api.js";
import { entriesHash, pickWinners } from "../site/assets/js/draw.js";

CONFIG.DEMO_SETTINGS.minSeconds = 0;
// الوضع التجريبي يحسب الجولة من الوقت الحالي: نثبّت المرساة ليكون التسجيل مفتوحاً الآن
CONFIG.DEMO_SETTINGS.cycleAnchor = new Date(Date.now() - 3600 * 1000).toISOString();

test("الحالة", async () => {
  const s = await api.getStatus();
  assert.equal(s.is_open, true);
  assert.equal(s.cycle_seconds, 24 * 3600);
  assert.ok(s.seconds_left > 0 && s.seconds_left <= 14 * 3600);
});

test("مسار المشاركة الكامل + منع التكرار + رمز لمرة واحدة", async () => {
  const { token } = await api.startSession();
  assert.equal((await api.checkSession(token)).valid, true);
  const r = await api.submitEntry(token, "123456789");
  assert.equal(r.masked, "123****89");
  assert.equal((await api.checkSession(token)).reason, "used");
  await assert.rejects(api.submitEntry(token, "123456789"), e => e.code === "used");

  const t2 = (await api.startSession()).token;
  await assert.rejects(api.submitEntry(t2, "123456789"), e => e.code === "duplicate");
  await assert.rejects(api.submitEntry(t2, "12ab"), e => e.code === "invalid_uid");
  await assert.rejects(api.submitEntry("bad-token", "987654321"), e => e instanceof ApiError && e.code === "invalid_token");
});

test("انتظار الحد الأدنى قبل قبول الـ ID", async () => {
  CONFIG.DEMO_SETTINGS.minSeconds = 30;
  const { token } = await api.startSession();
  const c = await api.checkSession(token);
  assert.equal(c.valid, true);
  assert.ok(c.wait_seconds > 0);
  await assert.rejects(api.submitEntry(token, "555555555"), e => e.code === "too_fast");
  CONFIG.DEMO_SETTINGS.minSeconds = 0;
});

test("بيانات الفائزين التجريبية قابلة للتحقق", async () => {
  const [r] = await api.publicWinners();
  const list = await api.publicEntries(r.round_id);
  assert.equal(await entriesHash(list), r.entries_hash);
  const w = await pickWinners(list, r.seed, r.winners.length);
  assert.deepEqual(w.map(x => x.masked), r.winners.map(x => x.masked_uid));
});
