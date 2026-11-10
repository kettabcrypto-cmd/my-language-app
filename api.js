// طبقة الاتصال: Supabase الحقيقي عبر REST، أو وضع تجريبي بالذاكرة عند عدم الإعداد.
import { CONFIG } from "./config.js";
import { entriesHash, pickWinners, rewardForRank, maskUid } from "./draw.js";

export class ApiError extends Error {
  constructor(code, msg) { super(msg || code); this.code = code; }
}

export const ERRORS = {
  closed:            "التسجيل مغلق حالياً. عد عند تجديد المؤقت.",
  invalid_token:     "رابط المشاركة غير صالح. ابدأ من الصفحة الرئيسية بزر «شارك».",
  used:              "استُخدم هذا الرابط من قبل. ابدأ مهمة جديدة من الصفحة الرئيسية.",
  expired:           "انتهت صلاحية هذا الرابط. ابدأ مهمة جديدة من الصفحة الرئيسية.",
  too_fast:          "لم تُكمل المهمة بعد. أكمل تخطي الروابط ثم حاول مجدداً.",
  invalid_uid:       "Binance ID غير صحيح: أرقام فقط، من 6 إلى 12 رقماً.",
  duplicate:         "هذا الـ ID مسجّل في هذه الجولة بالفعل.",
  ip_limit:          "وصلت إلى الحد الأقصى للمشاركات من هذا الاتصال في هذه الجولة.",
  rate_limited:      "محاولات كثيرة. حاول بعد قليل.",
  forbidden:         "غير مصرّح لك بهذا الإجراء. سجّل الدخول من جديد.",
  login_failed:      "بيانات الدخول غير صحيحة.",
  network:           "تعذّر الاتصال بالخادم. تحقق من الإنترنت.",
  round_open:        "الجولة ما زالت مفتوحة. انتظر إغلاقها أولاً.",
  already_published: "قائمة هذه الجولة منشورة بالفعل.",
  no_entries:        "لا توجد مشاركات في هذه الجولة.",
  not_published:     "انشر القائمة والبصمة قبل السحب.",
  already_drawn:     "تم السحب في هذه الجولة بالفعل.",
  bad_seed:          "البذرة قصيرة. اكتب 8 أحرف على الأقل (مثل hash بلوك بيتكوين).",
  hash_mismatch:     "القائمة تغيّرت بعد نشر البصمة. السحب مرفوض.",
  unknown:           "حدث خطأ غير متوقع. حاول مرة أخرى."
};
export const errorText = e => ERRORS[e?.code] || ERRORS.unknown;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ====================== Supabase الحقيقي ====================== */
const ADMIN_KEY = "dz2.admin.jwt";
let memJwt = null;
const jwtStore = {
  get() { try { return sessionStorage.getItem(ADMIN_KEY) || memJwt; } catch { return memJwt; } },
  set(v) { memJwt = v; try { v ? sessionStorage.setItem(ADMIN_KEY, v) : sessionStorage.removeItem(ADMIN_KEY); } catch {} }
};

async function rpc(name, args = {}, { admin = false } = {}) {
  const jwt = admin ? jwtStore.get() : null;
  let res;
  try {
    res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: CONFIG.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${jwt || CONFIG.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(args)
    });
  } catch { throw new ApiError("network"); }

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = data?.message || "";
    if (msg in ERRORS) throw new ApiError(msg);
    if (res.status === 401 || res.status === 403 || data?.code === "42501") throw new ApiError("forbidden");
    throw new ApiError("unknown", msg);
  }
  return data;
}

const real = {
  getStatus:     () => rpc("get_status"),
  startSession:  () => rpc("start_session"),
  checkSession:  t => UUID.test(t || "") ? rpc("check_session", { p_token: t }) : { valid: false, reason: "invalid_token" },
  submitEntry:   (t, uid) => {
    if (!UUID.test(t || "")) throw new ApiError("invalid_token");
    return rpc("submit_entry", { p_token: t, p_uid: uid });
  },
  publicWinners: (n = 5) => rpc("public_winners", { p_rounds: n }),
  publicEntries: r => rpc("public_entries", { p_round: r }),

  async login(email, password) {
    let res;
    try {
      res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: CONFIG.SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password })
      });
    } catch { throw new ApiError("network"); }
    const d = await res.json().catch(() => ({}));
    if (!res.ok || !d.access_token) throw new ApiError("login_failed");
    jwtStore.set(d.access_token);
    return true;
  },
  logout()     { jwtStore.set(null); },
  isLoggedIn() { return !!jwtStore.get(); },
  adminOverview: ()          => rpc("admin_overview", {}, { admin: true }),
  adminPublish:  r           => rpc("admin_publish", { p_round: r }, { admin: true }),
  adminDraw:     (r, seed)   => rpc("admin_draw", { p_round: r, p_seed: seed }, { admin: true }),
  adminWinners:  r           => rpc("admin_winners", { p_round: r }, { admin: true }),
  adminMarkPaid: (r, ranks)  => rpc("admin_mark_paid", { p_round: r, p_ranks: ranks ?? null }, { admin: true })
};

/* ====================== الوضع التجريبي ====================== */
const mem = {};
const ls = {
  get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (k in mem ? mem[k] : def); } catch { return k in mem ? mem[k] : def; } },
  set(k, v)   { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const demo = () => CONFIG.DEMO_SETTINGS;

function demoCycle(nowMs = Date.now()) {
  const d = demo(), open = d.openHours * 3600, cycle = (d.openHours + d.gapHours) * 3600;
  const el = (nowMs - Date.parse(d.cycleAnchor)) / 1000;
  const round = Math.floor(el / cycle), within = el - round * cycle;
  return { round, is_open: within < open, seconds_left: Math.ceil(within < open ? open - within : cycle - within), open_seconds: open, cycle_seconds: cycle };
}

function parseDemoToken(t) {
  const m = /^demo\.(\d+)\.[a-z0-9]+$/.exec(t || "");
  return m ? Number(m[1]) : null;
}

let demoRoundCache = null;
async function demoRound() {
  if (demoRoundCache) return demoRoundCache;
  const d = demo(), c = demoCycle(), rid = c.round - 1;
  let x = 12345;
  const list = Array.from({ length: 137 }, () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return maskUid(String(100000000 + (x % 899999999)));
  });
  const seed = "demo-seed-00000000";
  const picks = await pickWinners(list, seed, 100);
  demoRoundCache = {
    list,
    round: {
      round_id: rid,
      starts_at: new Date(Date.parse(d.cycleAnchor) + rid * (d.openHours + d.gapHours) * 3600000).toISOString(),
      published_at: new Date().toISOString(), drawn_at: new Date().toISOString(),
      entries_count: list.length, entries_hash: await entriesHash(list), seed,
      total_prizes: picks.reduce((t, p) => t + rewardForRank(d.prizes, p.rank), 0),
      demo: true,
      winners: picks.map(p => ({ rank: p.rank, masked_uid: p.masked, reward: rewardForRank(d.prizes, p.rank), paid: true }))
    }
  };
  return demoRoundCache;
}

const mock = {
  async getStatus() {
    const c = demoCycle(), e = ls.get("dz2.demo.entries", {});
    return { ...c, server_time: new Date().toISOString(), entries_count: (e[c.round] || []).length, prizes: demo().prizes };
  },
  async startSession() {
    if (!demoCycle().is_open) throw new ApiError("closed");
    return { token: `demo.${Date.now()}.${Math.random().toString(36).slice(2, 8)}` };
  },
  async checkSession(t) {
    const ts = parseDemoToken(t);
    if (!ts) return { valid: false, reason: "invalid_token" };
    if (ls.get("dz2.demo.used", {})[t]) return { valid: false, reason: "used" };
    if (Date.now() - ts > 6 * 3600 * 1000) return { valid: false, reason: "expired" };
    if (!demoCycle().is_open) return { valid: false, reason: "closed" };
    return { valid: true, wait_seconds: Math.max(0, Math.ceil(demo().minSeconds - (Date.now() - ts) / 1000)) };
  },
  async submitEntry(t, uid) {
    const chk = await this.checkSession(t);
    if (!chk.valid) throw new ApiError(chk.reason);
    if (chk.wait_seconds > 0) throw new ApiError("too_fast");
    const v = String(uid || "").trim();
    if (!/^[0-9]{6,12}$/.test(v)) throw new ApiError("invalid_uid");
    const c = demoCycle(), e = ls.get("dz2.demo.entries", {});
    const arr = e[c.round] || (e[c.round] = []);
    if (arr.includes(v)) throw new ApiError("duplicate");
    arr.push(v); ls.set("dz2.demo.entries", e);
    const used = ls.get("dz2.demo.used", {}); used[t] = 1; ls.set("dz2.demo.used", used);
    return { entry_no: arr.length, masked: maskUid(v), round: c.round };
  },
  async publicWinners() { return [(await demoRound()).round]; },
  async publicEntries(r) { const d = await demoRound(); return r === d.round.round_id ? d.list : []; },
  async login() { throw new ApiError("forbidden"); },
  logout() {}, isLoggedIn() { return false; }
};

export const api = new Proxy({}, {
  get: (_, k) => (CONFIG.DEMO ? mock : real)[k]
});
