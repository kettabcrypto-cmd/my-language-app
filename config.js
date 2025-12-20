// في ملف js/config.js
const CONFIG = {
    // رابط الصور الأساسي - تأكد من وضع الصور على GitHub
    IMAGE_BASE_URL: "https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/",
    
    // TwelveData API - مفتاحك الحقيقي
    TWELVEDATA_API_KEY: "b83fce53976843bbb59336c03f9a6a30",
    TWELVEDATA_API_URL: "https://api.twelvedata.com/exchange_rate",
    
    // تحديث كل ساعة (60 دقيقة)
    REFRESH_INTERVAL: 60 * 60 * 1000,
    
    // العملات التي سنجلب أسعارها
    TARGET_CURRENCIES: [
        "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY",
        "AED", "SAR", "QAR", "EGP", "TRY", "INR", "RUB",
        "BRL", "ZAR", "MXN", "KRW", "MAD", "TND"
    ],
    
    // التعيين بين رموز العملات وأسماء الصور
    CURRENCY_FLAG_MAPPING: {
        "QAR": "dar",
        "TRY": "trv", 
        "BRL": "brk",
        "USD": "usd"
    }
};
