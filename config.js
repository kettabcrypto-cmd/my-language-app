// ⚙️ إعدادات المشروع — عدّل القيم هنا فقط.
// مفتاح anon عام بطبيعته ومصمم ليوضع في الواجهة؛ الأمان في دوال SQL وليس في إخفائه.
export const CONFIG = {
  SUPABASE_URL: "",        // مثال: https://abcdxyz.supabase.co
  SUPABASE_ANON_KEY: "",   // Project Settings → API → anon public

  // قالب رابط الاختصار. {url} يُستبدل برابط صفحة التحقق الخاص بكل زائر.
  // مثال لمعظم مواقع الاختصار: "https://YOUR-SHORTENER/st?api=YOUR_KEY&url={url}"
  // اتركه فارغاً أثناء التجربة ليذهب الزائر مباشرة إلى صفحة التحقق.
  SHORTENER_TEMPLATE: "",

  TELEGRAM_CHANNEL: "https://t.me/Dz2link",
  TELEGRAM_GROUP: "https://t.me/hh6442",
  CURRENCY: "$",

  // الوضع التجريبي: يعمل تلقائياً عند ترك بيانات Supabase فارغة
  get DEMO() { return !this.SUPABASE_URL || !this.SUPABASE_ANON_KEY; },
  DEMO_SETTINGS: {
    cycleAnchor: "2026-11-09T00:00:00Z",
    openHours: 14,
    gapHours: 10,
    minSeconds: 15,
    prizes: [
      { from: 1,  to: 1,   each: 5 },
      { from: 2,  to: 10,  each: 2 },
      { from: 11, to: 20,  each: 0.5 },
      { from: 21, to: 50,  each: 0.2 },
      { from: 51, to: 100, each: 0.1 }
    ]
  }
};
