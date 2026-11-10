import { api, errorText } from "./api.js";
import { entriesHash, pickWinners } from "./draw.js";
import { $, $$, fmt, usd, esc, fmtDate, icon, demoBanner, toast, copyText } from "./ui.js";

demoBanner();
const tabs = $("#tabs"), view = $("#roundView");
let rounds = [];

function renderTabs(active) {
  tabs.innerHTML = rounds.map(r =>
    `<button role="tab" class="tab" aria-selected="${r.round_id === active}" data-r="${r.round_id}">${fmtDate(r.starts_at)}</button>`).join("");
}

function renderRound(r) {
  const drawn = !!r.drawn_at;
  const rows = r.winners.map(w => `
    <div class="tr w4"><span class="rk">${w.rank}</span><span class="mono">${esc(w.masked_uid)}</span><span class="money">${usd(w.reward)}</span><span class="tot">${w.paid ? "تم الدفع" : "قيد الدفع"}</span></div>`).join("");
  view.innerHTML = `
    ${r.demo ? '<p class="box">هذه بيانات تجريبية لتجربة صفحة التحقق.</p>' : ""}
    <div class="stats">
      <div class="stat"><b>${fmt(r.entries_count)}</b><span>مشارك</span></div>
      <div class="stat"><b>${drawn ? r.winners.length : "—"}</b><span>فائز</span></div>
      <div class="stat"><b>${drawn ? usd(r.total_prizes) : "—"}</b><span>إجمالي الجوائز</span></div>
    </div>

    <h2 class="sec-title"><span class="tag og">بصمة القائمة</span> SHA-256</h2>
    <p class="hint">نُشرت قبل معرفة بذرة السحب، فأي تعديل على القائمة بعدها يغيّرها.</p>
    <div class="hashbox"><code>${esc(r.entries_hash)}</code><button class="btn sm ghost" data-copy="${esc(r.entries_hash)}">نسخ</button></div>

    ${drawn ? `
      <h2 class="sec-title"><span class="tag ov">البذرة</span> المعلنة</h2>
      <div class="hashbox"><code>${esc(r.seed)}</code><button class="btn sm ghost" data-copy="${esc(r.seed)}">نسخ</button></div>
      <h2 class="sec-title"><span class="tag g">الفائزون</span></h2>
      <div class="tbl"><div class="tr th w4"><span>الترتيب</span><span>المعرّف</span><span>الجائزة</span><span>الحالة</span></div>${rows}</div>
    ` : `<p class="box">تم نشر القائمة وبصمتها. السحب سيتم قريباً على البث المباشر.</p>`}

    <button class="btn" id="verifyBtn">تحقق بنفسك الآن</button>
    <div id="checks" class="checks" aria-live="polite"></div>`;
}

async function verify(r) {
  const out = $("#checks"), btn = $("#verifyBtn");
  btn.disabled = true; btn.textContent = "جارٍ الحساب في متصفحك…";
  out.innerHTML = "";
  const line = (ok, text) => out.insertAdjacentHTML("beforeend", `<div class="check ${ok ? "ok" : "bad"}"><span class="ci">${icon(ok ? "check" : "alert")}</span><span>${text}</span></div>`);
  try {
    const list = await api.publicEntries(r.round_id);
    line(list.length === r.entries_count, `عدد المشاركين في القائمة ${fmt(list.length)} ${list.length === r.entries_count ? "يطابق" : "لا يطابق"} المعلن (${fmt(r.entries_count)}).`);
    const h = await entriesHash(list);
    line(h === r.entries_hash, h === r.entries_hash ? "بصمة القائمة تطابق البصمة المنشورة." : "بصمة القائمة لا تطابق المنشورة!");
    if (r.drawn_at) {
      const w = await pickWinners(list, r.seed, r.winners.length);
      const same = w.length === r.winners.length && w.every((x, i) => x.masked === r.winners[i].masked_uid);
      line(same, same ? `أعاد متصفحك سحب ${w.length} فائز من البذرة وحصل على النتيجة نفسها بالترتيب نفسه.` : "نتيجة السحب المعاد حسابها لا تطابق المنشورة!");
    }
  } catch (e) { line(false, esc(errorText(e))); }
  btn.disabled = false; btn.textContent = "أعد التحقق";
}

function select(id) {
  const r = rounds.find(x => x.round_id === id);
  renderTabs(id); renderRound(r);
  $("#verifyBtn").addEventListener("click", () => verify(r));
}

tabs.addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (b) select(Number(b.dataset.r)); });
view.addEventListener("click", e => { const b = e.target.closest("[data-copy]"); if (b) copyText(b.dataset.copy); });

(async () => {
  try {
    rounds = await api.publicWinners(10);
    if (!rounds.length) {
      view.innerHTML = '<p class="box">لا توجد نتائج منشورة بعد. ستظهر هنا قائمة كل جولة وبصمتها قبل السحب، ثم الفائزون بعده.</p>';
      return;
    }
    select(rounds[0].round_id);
  } catch (e) { view.innerHTML = `<p class="box">${esc(errorText(e))}</p>`; }
})();
