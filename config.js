// إعدادات التطبيق
const CONFIG = {
    API_KEY: 'b83fce53976843bbb59336c03f9a6a30',
    API_BASE_URL: 'https://api.twelvedata.com',
    
    // العملات المطلوبة (10 عملات مقابل USD)
    FOREX_PAIRS: [
        { symbol: 'EUR/USD', name: 'يورو/دولار' },
        { symbol: 'GBP/USD', name: 'جنيه/دولار' },
        { symbol: 'JPY/USD', name: 'ين/دولار' },
        { symbol: 'CHF/USD', name: 'فرنك/دولار' },
        { symbol: 'CAD/USD', name: 'دولار كندي/دولار' },
        { symbol: 'AUD/USD', name: 'دولار أسترالي/دولار' },
        { symbol: 'NZD/USD', name: 'دولار نيوزيلندي/دولار' },
        { symbol: 'CNY/USD', name: 'يوان/دولار' },
        { symbol: 'AED/USD', name: 'درهم/دولار' },
        { symbol: 'SAR/USD', name: 'ريال/دولار' }
    ],
    
    // رموز الأسهم العالمية (50 سهم)
    STOCKS: [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK.B', 'JNJ', 'JPM',
        'V', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'ADBE', 'PYPL', 'NFLX', 'CRM',
        'BAC', 'XOM', 'CSCO', 'PFE', 'VZ', 'INTC', 'ABT', 'TMO', 'WMT', 'CVX',
        'MRK', 'PEP', 'KO', 'T', 'ABBV', 'AVGO', 'COST', 'DHR', 'MDT', 'NKE',
        'ORCL', 'ACN', 'LIN', 'AMD', 'IBM', 'QCOM', 'TXN', 'UPS', 'CAT', 'SPY'
    ],
    
    // تحديث البيانات كل ساعة (مللي ثانية)
    UPDATE_INTERVAL: 60 * 60 * 1000,
    
    // تخزين محلي
    STORAGE_KEYS: {
        FOREX_DATA: 'forex_data',
        STOCKS_DATA: 'stocks_data',
        LAST_UPDATE: 'last_update',
        API_REQUESTS: 'api_requests'
    },
    
    // العملات للمحول
    POPULAR_CURRENCIES: [
        { code: 'USD', name: 'الدولار الأمريكي', flag: '🇺🇸' },
        { code: 'EUR', name: 'اليورو', flag: '🇪🇺' },
        { code: 'GBP', name: 'الجنيه الإسترليني', flag: '🇬🇧' },
        { code: 'JPY', name: 'الين الياباني', flag: '🇯🇵' },
        { code: 'CAD', name: 'الدولار الكندي', flag: '🇨🇦' },
        { code: 'AUD', name: 'الدولار الأسترالي', flag: '🇦🇺' },
        { code: 'CHF', name: 'الفرنك السويسري', flag: '🇨🇭' },
        { code: 'CNY', name: 'اليوان الصيني', flag: '🇨🇳' },
        { code: 'AED', name: 'الدرهم الإماراتي', flag: '🇦🇪' },
        { code: 'SAR', name: 'الريال السعودي', flag: '🇸🇦' }
    ]
};
