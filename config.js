// ملف: config.js
const CONFIG = {
    // FastForex API Key
    FASTFOREX_API_KEY: 'a84dfa8537-e4b5434d4a-t7k7n9',
    
    // CurrencyFreaks API Key  
    CURRENCYFREAKS_API_KEY: '2aec41d715fc4955a226b320fbc2ca0f',
    
    // إعدادات FastForex
    FASTFOREX: {
        BASE_URL: 'https://api.fastforex.io',
        ENDPOINTS: {
            CURRENCIES: '/currencies',
            FETCH_ALL: '/fetch-all',
            CONVERT: '/convert'
        }
    },
    
    // إعدادات CurrencyFreaks
    CURRENCYFREAKS: {
        BASE_URL: 'https://api.currencyfreaks.com/v2.0',
        ENDPOINTS: {
            LATEST: '/rates/latest',
            HISTORICAL: '/rates/historical'
        }
    },
    
    // إعدادات التطبيق
    APP: {
        CACHE_DURATION: 5 * 60 * 1000, // 5 دقائق
        DEFAULT_CURRENCY: 'USD',
        SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP']
    }
};

// تصدير الإعدادات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
