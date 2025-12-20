// التكوين الأساسي للتطبيق
const CONFIG = {
    // روابط الصور من GitHub
    IMAGE_BASE_URL: "https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/flags/",
    
    // TwelveData API
    TWELVEDATA_API_KEY: "b83fce53976843bbb59336c03f9a6a30",
    TWELVEDATA_API_URL: "https://api.twelvedata.com/exchange_rate",
    
    // إعدادات التحديث
    REFRESH_INTERVAL: 60 * 60 * 1000, // تحديث كل ساعة (60 دقيقة)
    CACHE_DURATION: 55 * 60 * 1000, // تخزين البيانات لمدة 55 دقيقة
    
    // العملات المتاحة في التطبيق
    DEFAULT_CURRENCIES: [
        { code: "USD", name: "US Dollar", symbol: "$", flag: "usd.png" },
        { code: "EUR", name: "Euro", symbol: "€", flag: "eur.png" },
        { code: "GBP", name: "British Pound", symbol: "£", flag: "gbp.png" },
        { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "jpy.png" },
        { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "cad.png" },
        { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "aud.png" },
        { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "chf.png" },
        { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "cny.png" },
        { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "aed.png" },
        { code: "SAR", name: "Saudi Riyal", symbol: "ر.س", flag: "sar.png" },
        { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق", flag: "qar.png" },
        { code: "EGP", name: "Egyptian Pound", symbol: "£", flag: "egp.png" },
        { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "try.png" },
        { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "inr.png" },
        { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "rub.png" },
        { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "brl.png" },
        { code: "ZAR", name: "South African Rand", symbol: "R", flag: "zar.png" },
        { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "mxn.png" }
    ],
    
    // العملات الأساسية التي سنجلب أسعارها من USD
    TARGET_CURRENCIES: [
        "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", 
        "AED", "SAR", "QAR", "EGP", "TRY", "INR", "RUB", 
        "BRL", "ZAR", "MXN"
    ],
    
    // إصدار التطبيق
    APP_VERSION: "2.9.0",
    
    // إعدادات التطبيق الافتراضية
    DEFAULT_SETTINGS: {
        theme: "light",
        language: "en",
        baseCurrency: "USD",
        trackedCurrencies: ["USD", "EUR", "GBP", "JPY", "AED", "SAR", "QAR"]
    }
};

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
