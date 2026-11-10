import { CONFIG } from "./config.js";
import { api, errorText } from "./api.js";
import { poolTotal, totalWinners } from "./draw.js";
import { $, $$, fmt, usd, hms, esc, fmtDate, toast, icon, createSheet, demoBanner } from "./ui.js";

demoBanner();
const sheet = createSheet();
const S = { status: null, deadline: 0, shown: 0, busy: false };

$("#tgLink").href = CONFIG.TELEGRAM_CHANNEL;

/* ---------------- المحتوى ---------------- */
const rangeLabel = p => (p.from === p.to ? `${p.from}` : `${p.from} - ${p.to}`);

function prizeTable(prizes) {
  const rows = prizes.map(p => `
    <div class="tr"><span class="rk">${rangeLabel(p)}</span><span class="money">${usd(p.each)}</span><span class="tot">${usd(p.each * (p.to - p.from + 1))}</span></div>`).join("");
  return `<div class="tbl"><div class="tr th"><span>الترتيب</span><span>مكافأة كل فائز</span><span>إجمالي المستوى</span></div>${rows}</div>`;
}

const SHEETS = {
  prizes: {
    title: '<span class="tag g">الجوائز</span> اليومية',
    html: async () => {
      const st = S.status || await api.getStatus();
      return `<p>يتم اختيار <b>${totalWinners(st.prizes)} فائز</b> كل يوم بمبلغ جوائز ثابت، وتُرسل الجوائز عبر Binance ID بعد السحب مباشرة.</p>${prizeTable(st.prizes)}`;
    }
  },
  winners: {
    title: 'آخر <span class="tag v">الفائزين</span>',
    html: async () => {
      const rounds = (await api.publicWinners(3)).filter(r => r.drawn_at);
      if (!rounds.length) return '<p class="hint center">لم يُجرَ أي سحب بعد. ستظهر الأسماء هنا مباشرة بعد أول سحب.</p>';
      const r = rounds[0];
      const rows = r.winners.slice(0, 10).map(w => `
        <div class="tr w"><span class="rk">${w.rank}</span><span class="mono">${esc(w.masked_uid)}</span><span class="money">${usd(w.reward)}</span></div>`).join("");
      return `<p>جولة <b>${fmtDate(r.starts_at)}</b> · ${fmt(r.entries_count)} مشارك</p>
        <div class="tbl"><div class="tr th w"><span>الترتيب</span><span>المعرّف</span><span>الجائزة</span></div>${rows}</div>
        <a class="btn sm" href="winners.html">كل النتائج والتحقق بنفسك</a>`;
    }
  },
  how: {
    title: 'كيف <span class="tag g">يعمل</span> السحب',
    html: () => `<ol>
      <li>اضغط على زر <b>«شارك»</b>.</li>
      <li>بعد ذلك تخطَّ الروابط حتى النهاية.</li>
      <li>بعد الانتهاء من التخطي ستصل إلى صفحة التحقق، ضع فيها <b>Binance ID</b> الخاص بك.</li>
      <li>سيتم اختيار الفائزين مباشرة بعد انتهاء المؤقت الزمني.</li>
    </ol>
    <div class="box">يُمنع تكرار وضع الـ ID في الجولة نفسها.</div>`
  },
  fair: {
    title: '<span class="tag g">الشفافية</span> والتحقق',
    html: () => `
      <p>يتم اختيار <b>100 ID</b> من قائمة المشاركين على بث مباشر على يوتيوب كل يوم، ويتم إرسال المال إليهم في بث مباشر.</p>
      <p>تتم كل الخطوات على بث مباشر يومي للمصداقية.</p>
      <p>قبل كل سحب ننشر بصمة القائمة، وبعده تستطيع إعادة الحساب بنفسك من صفحة الفائزين.</p>
      <div class="box"><b>Dz2link</b></div>
      <a class="btn sm" href="winners.html">صفحة الفائزين والتحقق</a>`
  },
  ads: {
    title: '<span class="tag g">التمويل</span> والإعلانات',
    html: () => `<p>عليك فقط تخطي الروابط ووضع الـ ID في صفحة التحقق، وفقط دون أي أشياء أخرى.</p>`
  },
  terms: {
    title: '<span class="tag v">الشروط</span> والأحكام',
    html: () => `<p>منصة <b>Dz2link</b> مجانية بالكامل، لا يُطلب منك أي دفع أو شراء، فقط تربح مقابل مهام يومية.</p>`
  }
};

function card(id, ic, title, sub, cls = "") {
  return `<button class="item ${cls}" data-open="${id}"><span class="ico">${icon(ic)}</span><span class="tx"><span class="tt">${title}</span><span class="st">${sub}</span></span><span class="chev" aria-hidden="true">‹</span></button>`;
}
$("#leadList").innerHTML = card("prizes", "trophy", "لوحة الجوائز", "اضغط لمعرفة مكافأة كل فائز من الـ 100 فائز يومياً.", "lead");
$("#infoList").innerHTML = [
  card("winners", "users", "آخر الفائزين", "أسماء فائزي آخر سحب ونتائجه."),
  card("how", "help", "كيف يعمل السحب", "من الضغط على «شارك» حتى الجائزة."),
  card("fair", "shield", "الشفافية والتحقق", "كل خطوات السحب على بث مباشر يومي."),
  card("ads", "ads", "التمويل والإعلانات", "ما المطلوب منك فقط."),
  card("terms", "doc", "الشروط والأحكام", "منصة مجانية بالكامل.")
].join("");

document.addEventListener("click", e => {
  const b = e.target.closest("[data-open]");
  if (!b) return;
  const s = SHEETS[b.dataset.open];
  if (s) sheet.open(s.title, s.html);
});

/* ---------------- الحالة والمؤقت ---------------- */
function animateCount(to) {
  const el = $("#count"), from = S.shown, t0 = performance.now(), dur = 1000;
  if (from === to) { el.textContent = fmt(to); return; }
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) { S.shown = to; el.textContent = fmt(to); return; }
  (function tick(t) {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    S.shown = Math.round(from + (to - from) * e);
    el.textContent = fmt(S.shown);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

function renderStatic() {
  const st = S.status;
  $("#poolNum").textContent = fmt(Number(poolTotal(st.prizes).toFixed(2)));
  $("#poolCur").textContent = CONFIG.CURRENCY;
  $("#winnersN").textContent = fmt(totalWinners(st.prizes));
  $("#topPrize").innerHTML = usd(st.prizes[0]?.each ?? 0);
  animateCount(st.entries_count);
}

function tick() {
  const st = S.status, pill = $("#timerPill"), btn = $("#shareBtn");
  if (!st) return;
  const left = Math.max(0, Math.ceil((S.deadline - Date.now()) / 1000));
  const span = st.is_open ? st.open_seconds : st.cycle_seconds - st.open_seconds;
  const pct = Math.min(100, Math.max(0, (1 - left / span) * 100));
  $("#barFill").style.width = pct + "%";
  $("#barLabel").textContent = st.is_open ? "مرّ من وقت التسجيل" : "مرّ من وقت الانتظار";
  $("#barPct").textContent = Math.round(pct) + "%";

  if (st.is_open) {
    pill.dataset.phase = "collect";
    pill.textContent = "التسجيل مفتوح · ينتهي المؤقت خلال " + hms(left);
    if (!S.busy) { btn.textContent = "شارك"; btn.classList.remove("off"); btn.removeAttribute("aria-disabled"); }
  } else {
    pill.dataset.phase = "countdown";
    pill.textContent = "انتهى المؤقت · يتجدد بعد " + hms(left);
    btn.textContent = "التسجيل مغلق حالياً"; btn.classList.add("off"); btn.setAttribute("aria-disabled", "true");
  }
  if (left === 0 && Date.now() - S.lastFetch > 3000) refresh();
}

async function refresh() {
  S.lastFetch = Date.now();
  try {
    const st = await api.getStatus();
    const first = !S.status;
    S.status = st;
    S.deadline = Date.now() + st.seconds_left * 1000;
    renderStatic();
    if (first) $("#barFill").style.transition = "width 1.6s cubic-bezier(.2,.8,.2,1)";
    tick();
  } catch (e) {
    $("#timerPill").textContent = errorText(e);
  }
}

/* ---------------- زر «شارك» ---------------- */
const shareBtn = $("#shareBtn");
function resetShare() { S.busy = false; shareBtn.removeAttribute("aria-busy"); tick(); }

shareBtn.addEventListener("click", async () => {
  if (S.busy) return;
  if (!S.status?.is_open) return toast("التسجيل مغلق حالياً. انتظر تجديد المؤقت.", "warn");
  S.busy = true; shareBtn.setAttribute("aria-busy", "true"); shareBtn.textContent = "جارٍ تجهيز المهمة…";
  try {
    const { token } = await api.startSession();
    const dest = new URL("verify.html", location.href);
    dest.searchParams.set("t", token);
    const url = CONFIG.SHORTENER_TEMPLATE
      ? CONFIG.SHORTENER_TEMPLATE.replace("{url}", encodeURIComponent(dest.href))
      : dest.href;
    location.assign(url);
  } catch (err) {
    toast(errorText(err), "error");
    resetShare();
  }
});
addEventListener("pageshow", e => { if (e.persisted) resetShare(); });   // الرجوع من الصفحة التالية
document.addEventListener("visibilitychange", () => { if (!document.hidden && Date.now() - S.lastFetch > 30000) refresh(); });

refresh();
setInterval(tick, 1000);
setInterval(() => { if (!document.hidden) refresh(); }, 60000);
