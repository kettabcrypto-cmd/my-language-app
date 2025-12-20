// في ملف js/config.js
const CONFIG = {
    // رابط الصور الأساسي - التأكد من المسار الصحيح
    IMAGE_BASE_URL: "https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/",
    
    // دالة لإنشاء اسم الملف بناءً على رمز العملة
    getImageFileName: (currencyCode) => {
        // تحويل رمز العملة إلى أحرف صغيرة وإضافة x في النهاية
        return `100-currency-${currencyCode.toLowerCase()}x.png`;
    },
    
    // دالة للحصول على رابط الصورة الكامل
    getImageUrl: (currencyCode) => {
        return CONFIG.IMAGE_BASE_URL + CONFIG.getImageFileName(currencyCode);
    },
    
    // TwelveData API
    TWELVEDATA_API_KEY: "b83fce53976843bbb59336c03f9a6a30",
    TWELVEDATA_API_URL: "https://api.twelvedata.com/exchange_rate",
    
    // إعدادات التحديث
    REFRESH_INTERVAL: 60 * 60 * 1000, // تحديث كل ساعة
    CACHE_DURATION: 55 * 60 * 1000, // تخزين البيانات لمدة 55 دقيقة
    
    // العملات المتاحة في التطبيق مع أسماء الصور المناسبة
    DEFAULT_CURRENCIES: [
        // العملات الأساسية
        { code: "USD", name: "US Dollar", symbol: "$", flagCode: "usd" },
        { code: "EUR", name: "Euro", symbol: "€", flagCode: "eur" },
        { code: "GBP", name: "British Pound", symbol: "£", flagCode: "gbp" },
        { code: "JPY", name: "Japanese Yen", symbol: "¥", flagCode: "jpy" },
        { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flagCode: "cad" },
        { code: "AUD", name: "Australian Dollar", symbol: "A$", flagCode: "aud" },
        { code: "CHF", name: "Swiss Franc", symbol: "CHF", flagCode: "chf" },
        { code: "CNY", name: "Chinese Yuan", symbol: "¥", flagCode: "cny" },
        
        // العملات العربية والإسلامية
        { code: "AED", name: "UAE Dirham", symbol: "د.إ", flagCode: "aed" },
        { code: "SAR", name: "Saudi Riyal", symbol: "ر.س", flagCode: "sar" },
        { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق", flagCode: "dar" }, // لاحظ: dar بدلاً من qar
        { code: "EGP", name: "Egyptian Pound", symbol: "£", flagCode: "egp" },
        
        // عملات أخرى
        { code: "TRY", name: "Turkish Lira", symbol: "₺", flagCode: "trv" }, // trv بدلاً من try
        { code: "INR", name: "Indian Rupee", symbol: "₹", flagCode: "inr" },
        { code: "RUB", name: "Russian Ruble", symbol: "₽", flagCode: "rub" },
        { code: "BRL", name: "Brazilian Real", symbol: "R$", flagCode: "brk" }, // brk بدلاً من brl
        { code: "ZAR", name: "South African Rand", symbol: "R", flagCode: "zar" },
        { code: "MXN", name: "Mexican Peso", symbol: "$", flagCode: "mxn" },
        { code: "KRW", name: "South Korean Won", symbol: "₩", flagCode: "krw" },
        
        // عملات إضافية من قائمتك
        { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", flagCode: "mad" },
        { code: "TND", name: "Tunisian Dinar", symbol: "د.ت", flagCode: "tnd" }
    ],
    
    // تعيين رموز الصور الخاصة (حيث تختلف عن رموز العملات)
    CURRENCY_FLAG_MAPPING: {
        // العملات التي لها رموز صور مختلفة عن رموز العملات
        "QAR": "dar",    // QAR يستخدم صورة dar
        "TRY": "trv",    // TRY يستخدم صورة trv
        "BRL": "brk",    // BRL يستخدم صورة brk
        // يمكن إضافة المزيد إذا لزم الأمر
    },
    
    // العملات التي سنجلب أسعارها من USD
    TARGET_CURRENCIES: [
        "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", 
        "AED", "SAR", "QAR", "EGP", "TRY", "INR", "RUB", 
        "BRL", "ZAR", "MXN", "KRW", "MAD", "TND"
    ],
    
    // إصدار التطبيق
    APP_VERSION: "3.0.0",
    
    // إعدادات التطبيق الافتراضية
    DEFAULT_SETTINGS: {
        theme: "light",
        language: "en",
        baseCurrency: "USD",
        trackedCurrencies: ["USD", "EUR", "GBP", "AED", "SAR", "QAR", "EGP"]
    }
};

// دالة مساعدة للحصول على رمز الصورة
function getFlagCode(currencyCode) {
    // إذا كان هناك تعيين خاص، استخدمه
    if (CONFIG.CURRENCY_FLAG_MAPPING[currencyCode]) {
        return CONFIG.CURRENCY_FLAG_MAPPING[currencyCode];
    }
    // وإلا استخدم رمز العملة نفسه
    return currencyCode.toLowerCase();
}

// حالة التطبيق
let appState = {
    theme: localStorage.getItem('theme') || CONFIG.DEFAULT_SETTINGS.theme,
    language: localStorage.getItem('language') || CONFIG.DEFAULT_SETTINGS.language,
    trackedCurrencies: JSON.parse(localStorage.getItem('trackedCurrencies')) || CONFIG.DEFAULT_SETTINGS.trackedCurrencies,
    fromCurrency: localStorage.getItem('fromCurrency') || "USD",
    toCurrency: localStorage.getItem('toCurrency') || "EUR",
    amount: parseFloat(localStorage.getItem('amount')) || 100,
    exchangeRates: JSON.parse(localStorage.getItem('exchangeRates')) || null,
    lastUpdate: localStorage.getItem('lastUpdate') || null,
    nextUpdate: localStorage.getItem('nextUpdate') || null,
    apiCallsToday: parseInt(localStorage.getItem('apiCallsToday')) || 0,
    lastApiCallDate: localStorage.getItem('lastApiCallDate') || null,
    changingCurrency: null,
    isRefreshing: false
};

// تتبع عدد طلبات API اليومية
function updateApiCallCounter() {
    const today = new Date().toDateString();
    
    if (appState.lastApiCallDate !== today) {
        appState.apiCallsToday = 0;
        appState.lastApiCallDate = today;
    }
    
    appState.apiCallsToday++;
    localStorage.setItem('apiCallsToday', appState.apiCallsToday.toString());
    localStorage.setItem('lastApiCallDate', today);
    
    console.log(`API calls today: ${appState.apiCallsToday}/24`);
}
