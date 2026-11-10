#!/usr/bin/env node
// تحقق مستقل من نتيجة أي سحب بدون الاعتماد على موقعنا.
//
// الاستخدام:
//   node tools/verify-draw.mjs entries.json "SEED" [عدد_الفائزين=100] [البصمة_المنشورة]
//
// entries.json = مصفوفة JSON بالمعرّفات المخفية جزئياً بترتيب التسجيل، كما تعرضها صفحة الفائزين.
import { readFileSync } from "node:fs";
import { entriesHash, pickWinners } from "../site/assets/js/draw.js";

const [file, seed, count = "100", published] = process.argv.slice(2);
if (!file || !seed) {
  console.error('الاستخدام: node tools/verify-draw.mjs entries.json "SEED" [count] [published_hash]');
  process.exit(1);
}
const list = JSON.parse(readFileSync(file, "utf8"));
const hash = await entriesHash(list);
console.log(`عدد المشاركين : ${list.length}`);
console.log(`بصمة القائمة  : ${hash}`);
if (published) console.log(`مطابقة المنشورة: ${hash === published ? "✅ نعم" : "❌ لا"}`);
console.log("\nالفائزون:");
for (const w of await pickWinners(list, seed, Number(count))) console.log(`${String(w.rank).padStart(3)}  ${w.masked}`);
