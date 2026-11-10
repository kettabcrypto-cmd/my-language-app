// خوارزمية السحب العلنية — نفس المنطق المنفّذ في SQL (admin_draw).
// تُستخدم في صفحة الفائزين للتحقق، وفي tools/verify-draw.mjs وفي الاختبارات.
const enc = new TextEncoder();

export async function sha256Hex(text) {
  const buf = await globalThis.crypto.subtle.digest("SHA-256", enc.encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export const maskUid = u => (u.length > 5 ? u.slice(0, 3) + "****" + u.slice(-2) : u);

/** بصمة القائمة: SHA-256 للقائمة المخفية جزئياً، كل عنصر في سطر. */
export const entriesHash = list => sha256Hex(list.join("\n"));

/**
 * k = int(SHA256(seed + ":" + i).hex[0:12]) mod len(remaining)
 * الفائز i هو remaining[k] ثم يُحذف من المتبقين (بلا تكرار).
 */
export async function pickWinners(list, seed, count) {
  const s = String(seed).trim();
  const remaining = list.map((_, i) => i);
  const n = Math.min(count, remaining.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const h = await sha256Hex(`${s}:${i}`);
    const k = parseInt(h.slice(0, 12), 16) % remaining.length;
    const [index] = remaining.splice(k, 1);
    out.push({ rank: i + 1, index, masked: list[index] });
  }
  return out;
}

export function rewardForRank(prizes, rank) {
  const t = prizes.find(p => rank >= p.from && rank <= p.to);
  return t ? Number(t.each) : 0;
}

export const totalWinners = prizes => prizes.reduce((m, p) => Math.max(m, p.to), 0);
export const poolTotal = prizes => prizes.reduce((t, p) => t + p.each * (p.to - p.from + 1), 0);
