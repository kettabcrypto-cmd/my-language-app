import { CONFIG } from "./config.js";
import { api, errorText } from "./api.js";
import { $, fmt, usd, esc, hms, toast, copyText, demoBanner } from "./ui.js";

demoBanner();
const loginView = $("#loginView"), dashView = $("#dashView"), list = $("#roundsList");
let overview = null;

function show(loggedIn) { loginView.hidden = loggedIn; dashView.hidden = !loggedIn; }

if (CONFIG.DEMO) {
  loginView.hidden = false;
  loginView.innerHTML = '<h1 class="page-title">لوحة الإدارة</h1><p class="box">لوحة الإدارة تحتاج ربط Supabase. أضف SUPABASE_URL وSUPABASE_ANON_KEY في assets/js/config.js ثم أنشئ مستخدم إدارة كما في README.</p>';
} else {
  if (api.isLoggedIn()) load(); else show(false);
}

$("#loginForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("#loginBtn"); btn.disabled = true;
  try {
    await api.login($("#email").value.trim(), $("#password").value);
    $("#password").value = "";
    await load();
  } catch (ex) { toast(errorText(ex), "error"); }
  btn.disabled = false;
});
$("#logoutBtn")?.addEventListener("click", () => { api.logout(); show(false); });

async function load() {
  try {
    overview = await api.adminOverview();
    show(true); render();
  } catch (e) {
    if (e.code === "forbidden") { api.logout(); show(false); }
    toast(errorText(e), "error");
  }
}

function render() {
  const c = overview.cycle;
  $("#curRound").textContent = "#" + c.round;
  $("#curState").textContent = c.is_open ? "مفتوحة" : "مغلقة";
  $("#curLeft").textContent = hms(c.seconds_left);
  if (!overview.rounds.length) { list.innerHTML = '<p class="box">لا توجد مشاركات بعد.</p>'; return; }
  list.innerHTML = overview.rounds.map(roundCard).join("");
}

function roundCard(r) {
  const c = overview.cycle;
  const live = r.round_id === c.round && c.is_open;
  const chips = [
    live ? '<span class="chip live">جارية</span>' : "",
    r.published ? '<span class="chip">منشورة</span>' : "",
    r.drawn ? '<span class="chip done">تم السحب</span>' : "",
    r.drawn ? `<span class="chip">${r.paid}/${r.winners} مدفوع</span>` : ""
  ].join("");
  let action = "";
  if (!live && !r.published) action = `<button class="btn sm" data-act="publish" data-r="${r.round_id}">نشر القائمة والبصمة</button>`;
  else if (r.published && !r.drawn) action = `
    <label class="lb" for="seed-${r.round_id}">البذرة العامة (مثل hash بلوك بيتكوين تعلنه مسبقاً)</label>
    <input class="field ltr" id="seed-${r.round_id}" placeholder="0000000000000000000…" autocomplete="off">
    <button class="btn sm" data-act="draw" data-r="${r.round_id}">إجراء السحب</button>`;
  else if (r.drawn) action = `<button class="btn sm" data-act="winners" data-r="${r.round_id}">عرض الفائزين</button>`;
  return `<article class="round" id="round-${r.round_id}">
    <header><b>جولة #${r.round_id}</b><span>${fmt(r.entries)} مشارك</span></header>
    <div class="chips">${chips}</div>
    ${r.entries_hash ? `<p class="hint mono-s">${esc(r.entries_hash)}</p>` : ""}
    <div class="actions">${action}</div>
    <div class="wbox" id="wbox-${r.round_id}"></div>
  </article>`;
}

async function showWinners(rid) {
  const box = $(`#wbox-${rid}`);
  box.innerHTML = '<p class="hint">جارٍ التحميل…</p>';
  const w = await api.adminWinners(rid);
  const rows = w.map(x => `
    <label class="tr a5"><input type="checkbox" data-rank="${x.rank}" ${x.paid_at ? "disabled checked" : ""}>
      <span class="rk">${x.rank}</span><span class="mono">${esc(x.uid)}</span><span class="money">${usd(x.reward)}</span>
      <span class="tot">${x.paid_at ? "مدفوع" : "—"}</span></label>`).join("");
  box.innerHTML = `
    <div class="tbl"><div class="tr th a5"><span></span><span>#</span><span>Binance ID</span><span>الجائزة</span><span>الحالة</span></div>${rows}</div>
    <div class="actions row-actions">
      <button class="btn sm" data-act="paid-sel" data-r="${rid}">تحديد المحدد كمدفوع</button>
      <button class="btn sm ghost" data-act="paid-all" data-r="${rid}">الكل كمدفوع</button>
      <button class="btn sm ghost" data-act="copy" data-r="${rid}">نسخ الـ IDs</button>
      <button class="btn sm ghost" data-act="csv" data-r="${rid}">تصدير CSV</button>
    </div>`;
  box._data = w;
}

function csv(rid, w) {
  const lines = ["rank,binance_id,reward,paid", ...w.map(x => `${x.rank},${x.uid},${x.reward},${x.paid_at ? "yes" : "no"}`)];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  a.download = `dz2link-winners-round-${rid}.csv`;
  a.click(); URL.revokeObjectURL(a.href);
}

list.addEventListener("click", async e => {
  const b = e.target.closest("[data-act]");
  if (!b || b.disabled) return;
  const rid = Number(b.dataset.r), act = b.dataset.act;
  b.disabled = true;
  try {
    if (act === "publish") {
      if (!confirm("بعد النشر تتجمد القائمة وتظهر بصمتها للجميع. متابعة؟")) return;
      const r = await api.adminPublish(rid); toast(`نُشرت ${r.entries} مشاركة`, "ok"); await load();
    } else if (act === "draw") {
      const seed = $(`#seed-${rid}`).value.trim();
      if (!confirm("السحب نهائي ولا يمكن التراجع عنه. متابعة؟")) return;
      const r = await api.adminDraw(rid, seed); toast(`تم سحب ${r.winners} فائز`, "ok"); await load(); await showWinners(rid);
    } else if (act === "winners") {
      await showWinners(rid);
    } else {
      const box = $(`#wbox-${rid}`), w = box._data || [];
      if (act === "copy") copyText(w.map(x => x.uid).join("\n"));
      if (act === "csv") csv(rid, w);
      if (act === "paid-all" || act === "paid-sel") {
        const ranks = act === "paid-all" ? null
          : [...box.querySelectorAll("input[data-rank]:checked:not(:disabled)")].map(i => Number(i.dataset.rank));
        if (ranks && !ranks.length) return toast("حدّد فائزاً واحداً على الأقل", "warn");
        const n = await api.adminMarkPaid(rid, ranks); toast(`تم تعليم ${n} كمدفوع`, "ok");
        await load(); await showWinners(rid);
      }
    }
  } catch (ex) {
    toast(errorText(ex), "error");
    if (ex.code === "forbidden") { api.logout(); show(false); }
  } finally { b.disabled = false; }
});
