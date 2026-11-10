import { CONFIG } from "./config.js";
import { api, errorText } from "./api.js";
import { $, esc, icon, demoBanner, toast } from "./ui.js";

demoBanner();
const token = new URLSearchParams(location.search).get("t");
const card = $("#stateCard"), form = $("#uidForm"), uid = $("#uid"), err = $("#uidErr"), btn = $("#submitBtn");
let timer = null, busy = false;

function setState(kind, { title, text, ic = "clock", actions = "" } = {}) {
  card.dataset.state = kind;
  $("#stIcon").innerHTML = icon(ic);
  $("#stTitle").textContent = title;
  $("#stText").innerHTML = text || "";
  $("#stActions").innerHTML = actions;
  form.hidden = kind !== "ready";
}
const homeBtn = '<a class="btn sm" href="./">العودة إلى الصفحة الرئيسية</a>';

function fail(code) {
  setState("error", { ic: "alert", title: "تعذّر إكمال المشاركة", text: esc(errorText({ code })), actions: homeBtn });
}

function startWait(sec) {
  clearInterval(timer);
  let left = sec;
  const paint = () => setState("wait", { ic: "clock", title: "جارٍ التحقق من إكمالك للمهمة", text: `يرجى الانتظار <b>${left}</b> ثانية…` });
  paint();
  timer = setInterval(() => {
    left--;
    if (left <= 0) { clearInterval(timer); ready(); } else paint();
  }, 1000);
}

function ready() {
  setState("ready", { ic: "check", title: "أحسنت، أكملت المهمة", text: "ضع Binance ID الخاص بك لتدخل السحب." });
  uid.focus();
}

async function init() {
  if (!token) return fail("invalid_token");
  setState("wait", { ic: "clock", title: "جارٍ التحقق…" });
  try {
    const r = await api.checkSession(token);
    if (!r.valid) return fail(r.reason);
    r.wait_seconds > 0 ? startWait(r.wait_seconds) : ready();
  } catch (e) { fail(e.code || "unknown"); }
}

uid.addEventListener("input", () => { uid.value = uid.value.replace(/\D/g, ""); err.textContent = ""; uid.removeAttribute("aria-invalid"); });

form.addEventListener("submit", async e => {
  e.preventDefault();
  if (busy) return;
  const v = uid.value.trim();
  if (!/^\d{6,12}$/.test(v)) { err.textContent = errorText({ code: "invalid_uid" }); uid.setAttribute("aria-invalid", "true"); return; }
  busy = true; btn.disabled = true; btn.textContent = "جارٍ التسجيل…";
  try {
    const r = await api.submitEntry(token, v);
    setState("success", {
      ic: "check", title: "تم تسجيلك في السحب",
      text: `رقم مشاركتك <b>#${r.entry_no}</b> ومعرّفك <code>${esc(r.masked)}</code>.<br>عُد بعد تجديد المؤقت للمشاركة في الجولة القادمة.`,
      actions: `<a class="btn sm" href="${esc(CONFIG.TELEGRAM_GROUP)}" target="_blank" rel="noopener noreferrer">انضم إلى قروب تيليغرام</a>
                <a class="btn sm ghost" href="winners.html">صفحة الفائزين</a>`
    });
  } catch (ex) {
    const c = ex.code;
    if (["invalid_uid", "duplicate", "ip_limit"].includes(c)) { err.textContent = errorText(ex); uid.setAttribute("aria-invalid", "true"); }
    else if (c === "too_fast") { toast(errorText(ex), "warn"); init(); }
    else fail(c || "unknown");
  } finally { busy = false; btn.disabled = false; btn.textContent = "سجّل مشاركتي"; }
});

init();
