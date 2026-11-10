import { CONFIG } from "./config.js";
import { errorText } from "./api.js";

export const $  = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const fmt = n => Number(n).toLocaleString("en-US");
export const num = n => Number(Number(n).toFixed(2));
export const usd = n => `<bdi dir="ltr">${CONFIG.CURRENCY}${num(n)}</bdi>`;
export const pad = n => String(n).padStart(2, "0");
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const hms = sec => {
  sec = Math.max(0, Math.floor(sec));
  return `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec % 3600 / 60))}:${pad(sec % 60)}`;
};
export const fmtDate = iso => new Date(iso).toLocaleDateString("ar-u-nu-latn", { day: "numeric", month: "long", year: "numeric" });

const IC = {
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  help:   '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  ads:    '<path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1zM16 9a4 4 0 0 1 0 6"/>',
  doc:    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8"/>',
  users:  '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  check:  '<path d="M20 6 9 17l-5-5"/>',
  alert:  '<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  clock:  '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
};
export const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

/* ---- إشعارات ---- */
export function toast(msg, type = "info") {
  let box = $("#toasts");
  if (!box) { box = document.createElement("div"); box.id = "toasts"; box.setAttribute("role", "status"); document.body.append(box); }
  const t = document.createElement("div");
  t.className = `toast ${type}`; t.textContent = msg;
  box.append(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3800);
}

/* ---- شريط الوضع التجريبي ---- */
export function demoBanner() {
  if (!CONFIG.DEMO) return;
  const b = document.createElement("div");
  b.className = "demo-banner";
  b.textContent = "وضع تجريبي: لم تُربط قاعدة البيانات بعد، لذلك لا تُحفظ المشاركات الحقيقية.";
  document.body.prepend(b);
}

/* ---- النافذة السفلية ---- */
export function createSheet() {
  const scrim = document.createElement("div"); scrim.className = "scrim";
  const el = document.createElement("div");
  el.className = "sheet"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", "sheetTitle"); el.tabIndex = -1;
  el.innerHTML = `<div class="grab"></div><button class="x" aria-label="إغلاق">×</button><h2 id="sheetTitle"></h2><div class="sheet-body"></div>`;
  document.body.append(scrim, el);
  const body = $(".sheet-body", el), title = $("#sheetTitle", el);
  let last = null, y0 = null;

  const close = () => {
    el.classList.remove("open"); scrim.classList.remove("open");
    document.body.style.overflow = "";
    last?.focus?.();
  };
  async function open(titleHtml, content) {
    last = document.activeElement;
    title.innerHTML = titleHtml;
    body.innerHTML = typeof content === "function" ? '<p class="hint center">جارٍ التحميل…</p>' : content;
    el.scrollTop = 0;
    el.classList.add("open"); scrim.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => $(".x", el).focus(), 50);
    if (typeof content === "function") {
      try { body.innerHTML = await content(); }
      catch (e) { body.innerHTML = `<p class="hint center">${esc(errorText(e))}</p>`; }
    }
  }
  $(".x", el).addEventListener("click", close);
  scrim.addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && el.classList.contains("open")) close(); });
  el.addEventListener("touchstart", e => { if (el.scrollTop === 0) y0 = e.touches[0].clientY; }, { passive: true });
  el.addEventListener("touchend", e => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 90) close(); y0 = null; }, { passive: true });
  return { open, close, el };
}

export function copyText(text) {
  return navigator.clipboard?.writeText(text).then(() => toast("تم النسخ", "ok")).catch(() => toast("تعذّر النسخ", "error"));
}
