// في ملف js/config.js
const CONFIG = {
    // رابط الصور الأساسي - تأكد من المسار الصحيح!
    IMAGE_BASE_URL: "https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/",
    
    // دالة لإنشاء اسم الملف
    getImageFileName: (flagCode) => {
        // استثناء: AED بدون حرف x
        if (flagCode === 'aed') {
            return `100-currency-${flagCode}.png`;
        }
        return `100-currency-${flagCode}x.png`;
    },
    
    // دالة للحصول على رابط الصورة
    getImageUrl: (flagCode) => {
        return CONFIG.IMAGE_BASE_URL + CONFIG.getImageFileName(flagCode);
    },
    
    // TwelveData API
    TWELVEDATA_API_KEY: "b83fce53976843bbb59336c03f9a6a30",
    TWELVEDATA_API_URL: "https://api.twelvedata.com/exchange_rate",
    
    // إعدادات التحديث
    REFRESH_INTERVAL: 60 * 60 * 1000, // تحديث كل ساعة
    CACHE_DURATION: 55 * 60 * 1000, // تخزين البيانات لمدة 55 دقيقة
    
    // العملات المتاحة في التطبيق
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
        { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق", flagCode: "dar" },
        { code: "EGP", name: "Egyptian Pound", symbol: "£", flagCode: "egp" },
        
        // عملات أخرى
        { code: "TRY", name: "Turkish Lira", symbol: "₺", flagCode: "trv" },
        { code: "INR", name: "Indian Rupee", symbol: "₹", flagCode: "inr" },
        { code: "RUB", name: "Russian Ruble", symbol: "₽", flagCode: "rub" },
        { code: "BRL", name: "Brazilian Real", symbol: "R$", flagCode: "brk" },
        { code: "ZAR", name: "South African Rand", symbol: "R", flagCode: "zar" },
        { code: "MXN", name: "Mexican Peso", symbol: "$", flagCode: "mxn" },
        { code: "KRW", name: "South Korean Won", symbol: "₩", flagCode: "krw" },
        { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", flagCode: "mad" },
        { code: "TND", name: "Tunisian Dinar", symbol: "د.ت", flagCode: "tnd" }
    ],
    
    // تعيين رموز الصور الخاصة
    CURRENCY_FLAG_MAPPING: {
        "QAR": "dar",
        "TRY": "trv",
        "BRL": "brk"
    },
    
    // العملات المستهدفة لجلب أسعارها
    TARGET_CURRENCIES: [
        "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", 
        "AED", "SAR", "QAR", "EGP", "TRY", "INR", "RUB", 
        "BRL", "ZAR", "MXN", "KRW", "MAD", "TND"
    ],
    
    // إصدار التطبيق
    APP_VERSION: "3.0.0",
    
    // الإعدادات الافتراضية
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
