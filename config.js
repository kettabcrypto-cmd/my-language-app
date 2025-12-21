// config.js
const CONFIG = {
    // API Configuration
    API_KEY: 'b83fce53976843bbb59336c03f9a6a30',
    API_BASE_URL: 'https://api.twelvedata.com',
    
    // Default Settings
    DEFAULT_BASE_CURRENCY: 'USD',
    DEFAULT_TARGET_CURRENCY: 'EUR',
    
    // Refresh intervals (in milliseconds)
    REFRESH_INTERVAL: 5 * 60 * 1000, // 5 دقائق
    FAST_REFRESH_INTERVAL: 30 * 1000, // 30 ثانية للبيانات الحيوية
    
    // App Settings
    CACHE_DURATION: 10 * 60 * 1000, // 10 دقائق للتخزين المؤقت
    MAX_HISTORY_ITEMS: 50,
    
    // Display Settings
    DECIMAL_PLACES: 4,
    DEFAULT_CURRENCY_COUNT: 25,
    
    // Supported Currencies (Major + Popular)
    POPULAR_CURRENCIES: [
        'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 
        'AED', 'SAR', 'EGP', 'QAR', 'KWD', 'OMR', 'BHD', 'JOD',
        'TRY', 'INR', 'RUB', 'ZAR', 'MXN', 'BRL', 'KRW', 'SGD'
    ],
    
    // Currency Metadata
    CURRENCY_NAMES: {
        'USD': 'الدولار الأمريكي',
        'EUR': 'اليورو الأوروبي',
        'GBP': 'الجنيه الإسترليني',
        'JPY': 'الين الياباني',
        'CAD': 'الدولار الكندي',
        'AUD': 'الدولار الأسترالي',
        'CHF': 'الفرنك السويسري',
        'CNY': 'اليوان الصيني',
        'AED': 'الدرهم الإماراتي',
        'SAR': 'الريال السعودي',
        'EGP': 'الجنيه المصري',
        'QAR': 'الريال القطري',
        'KWD': 'الدينار الكويتي',
        'OMR': 'الريال العماني',
        'BHD': 'الدينار البحريني',
        'JOD': 'الدينار الأردني',
        'TRY': 'الليرة التركية',
        'INR': 'الروبية الهندية',
        'RUB': 'الروبل الروسي',
        'ZAR': 'الراند الجنوب أفريقي',
        'MXN': 'البيزو المكسيكي',
        'BRL': 'الريال البرازيلي',
        'KRW': 'الوون الكوري',
        'SGD': 'الدولار السنغافوري'
    },
    
    // Flags for currencies
    CURRENCY_FLAGS: {
        'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
        'CAD': '🇨🇦', 'AUD': '🇦🇺', 'CHF': '🇨🇭', 'CNY': '🇨🇳',
        'AED': '🇦🇪', 'SAR': '🇸🇦', 'EGP': '🇪🇬', 'QAR': '🇶🇦',
        'KWD': '🇰🇼', 'OMR': '🇴🇲', 'BHD': '🇧🇭', 'JOD': '🇯🇴',
        'TRY': '🇹🇷', 'INR': '🇮🇳', 'RUB': '🇷🇺', 'ZAR': '🇿🇦',
        'MXN': '🇲🇽', 'BRL': '🇧🇷', 'KRW': '🇰🇷', 'SGD': '🇸🇬'
    },
    
    // API Endpoints
    ENDPOINTS: {
        EXCHANGE_RATE: '/exchange_rate',
        TIME_SERIES: '/time_series',
        CURRENCY_PAIRS: '/currency_pairs',
        QUOTE: '/quote'
    }
};

// تخزين البيانات في localStorage
const STORAGE_KEYS = {
    EXCHANGE_RATES: 'currencypro_exchange_rates',
    LAST_UPDATE: 'currencypro_last_update',
    FAVORITES: 'currencypro_favorites',
    CONVERSION_HISTORY: 'currencypro_history',
    SETTINGS: 'currencypro_settings'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, STORAGE_KEYS };
}
