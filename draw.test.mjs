import test from "node:test";
import assert from "node:assert/strict";
import { sha256Hex, entriesHash, pickWinners, maskUid, rewardForRank, poolTotal, totalWinners } from "../site/assets/js/draw.js";

const PRIZES = [
  { from: 1, to: 1, each: 5 }, { from: 2, to: 10, each: 2 }, { from: 11, to: 20, each: 0.5 },
  { from: 21, to: 50, each: 0.2 }, { from: 51, to: 100, each: 0.1 }
];
const mkList = n => Array.from({ length: n }, (_, i) => maskUid(String(100000000 + i * 7919)));

test("sha256 معروف", async () => {
  assert.equal(await sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("القناع", () => {
  assert.equal(maskUid("123456789"), "123****89");
  assert.equal(maskUid("12345"), "12345");
});

test("السحب حتمي ولا يكرر فائزاً", async () => {
  const list = mkList(500);
  const a = await pickWinners(list, "seed-ABCDEFGH", 100);
  const b = await pickWinners(list, "seed-ABCDEFGH", 100);
  assert.deepEqual(a, b);
  assert.equal(new Set(a.map(w => w.index)).size, 100);
  assert.deepEqual(a.map(w => w.rank), Array.from({ length: 100 }, (_, i) => i + 1));
});

test("بذرة مختلفة تعطي نتيجة مختلفة، والمسافات الزائدة لا تؤثر", async () => {
  const list = mkList(300);
  const a = await pickWinners(list, "seed-ONE-12345", 10);
  const b = await pickWinners(list, "seed-TWO-12345", 10);
  const c = await pickWinners(list, "  seed-ONE-12345 ", 10);
  assert.notDeepEqual(a.map(w => w.index), b.map(w => w.index));
  assert.deepEqual(a, c);
});

test("إذا كان المشاركون أقل من 100 يُسحبون كلهم", async () => {
  const w = await pickWinners(mkList(7), "seed-ABCDEFGH", 100);
  assert.equal(w.length, 7);
  assert.equal(new Set(w.map(x => x.index)).size, 7);
});

test("تغيير أي عنصر في القائمة يغيّر البصمة", async () => {
  const list = mkList(50);
  const h1 = await entriesHash(list);
  const changed = [...list]; changed[10] = "999****99";
  assert.notEqual(h1, await entriesHash(changed));
  assert.equal(h1, await entriesHash([...list]));
});

test("توزيع الجوائز", () => {
  assert.equal(totalWinners(PRIZES), 100);
  assert.equal(Number(poolTotal(PRIZES).toFixed(2)), 39);
  assert.equal(rewardForRank(PRIZES, 1), 5);
  assert.equal(rewardForRank(PRIZES, 10), 2);
  assert.equal(rewardForRank(PRIZES, 11), 0.5);
  assert.equal(rewardForRank(PRIZES, 50), 0.2);
  assert.equal(rewardForRank(PRIZES, 51), 0.1);
  assert.equal(rewardForRank(PRIZES, 101), 0);
});
