const CONFIG = {
    // API Configuration
    API_KEY: 'b83fce53976843bbb59336c03f9a6a30',
    API_BASE_URL: 'https://api.twelvedata.com',
    
    // Endpoints
    ENDPOINTS: {
        TIME_SERIES: 'time_series',
        CURRENCY_EXCHANGE_RATE: 'currency_exchange_rate'
    },
    
    // العملات المدعومة
    CURRENCY_PAIRS: [
        'USD/EUR', 'USD/GBP', 'USD/JPY', 
        'USD/AED', 'USD/SAR', 'USD/QAR',
        'USD/CAD', 'USD/AUD', 'USD/CHF'
    ],
    
    // إعدادات Time Series
    INTERVAL: '5min', // تغيير إلى 5 دقائق للبيانات الأكثر استقراراً
    OUTPUT_SIZE: 1, // آخر سعر فقط
    
    // تحديث كل 30 دقيقة (بدلاً من 1 دقيقة)
    UPDATE_INTERVAL: 30 * 60 * 1000, // 30 دقيقة = 1,800,000 مللي ثانية
    
    // الأعلام
    CURRENCY_FLAGS: {
        'USD': 'https://flagcdn.com/w40/us.png',
        'EUR': 'https://flagcdn.com/w40/eu.png',
        'GBP': 'https://flagcdn.com/w40/gb.png',
        'JPY': 'https://flagcdn.com/w40/jp.png',
        'AED': 'https://flagcdn.com/w40/ae.png',
        'SAR': 'https://flagcdn.com/w40/sa.png',
        'QAR': 'https://flagcdn.com/w40/qa.png',
        'CAD': 'https://flagcdn.com/w40/ca.png',
        'AUD': 'https://flagcdn.com/w40/au.png',
        'CHF': 'https://flagcdn.com/w40/ch.png'
    }
};
