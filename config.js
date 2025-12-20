const CONFIG = {
    API_KEY: 'b83fce53976843bbb59336c03f9a6a30',
    API_BASE_URL: 'https://api.twelvedata.com',
    
    // Forex Pairs (20 major pairs)
    FOREX_PAIRS: [
        'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'USD/CAD',
        'AUD/USD', 'NZD/USD', 'USD/CNY', 'USD/AED', 'USD/SAR',
        'USD/KWD', 'USD/BHD', 'USD/OMR', 'USD/QAR', 'USD/JOD',
        'USD/EGP', 'USD/TRY', 'USD/RUB', 'USD/INR', 'USD/ZAR'
    ],
    
    // Currency Names in English
    CURRENCY_NAMES: {
        'USD': 'US Dollar',
        'EUR': 'Euro',
        'GBP': 'British Pound',
        'JPY': 'Japanese Yen',
        'CHF': 'Swiss Franc',
        'CAD': 'Canadian Dollar',
        'AUD': 'Australian Dollar',
        'NZD': 'New Zealand Dollar',
        'CNY': 'Chinese Yuan',
        'AED': 'UAE Dirham',
        'SAR': 'Saudi Riyal',
        'KWD': 'Kuwaiti Dinar',
        'BHD': 'Bahraini Dinar',
        'OMR': 'Omani Rial',
        'QAR': 'Qatari Riyal',
        'JOD': 'Jordanian Dinar',
        'EGP': 'Egyptian Pound',
        'TRY': 'Turkish Lira',
        'RUB': 'Russian Ruble',
        'INR': 'Indian Rupee',
        'ZAR': 'South African Rand'
    },
    
    // Currency Flags
    CURRENCY_FLAGS: {
        'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
        'CHF': '🇨🇭', 'CAD': '🇨🇦', 'AUD': '🇦🇺', 'NZD': '🇳🇿',
        'CNY': '🇨🇳', 'AED': '🇦🇪', 'SAR': '🇸🇦', 'KWD': '🇰🇼',
        'BHD': '🇧🇭', 'OMR': '🇴🇲', 'QAR': '🇶🇦', 'JOD': '🇯🇴',
        'EGP': '🇪🇬', 'TRY': '🇹🇷', 'RUB': '🇷🇺', 'INR': '🇮🇳',
        'ZAR': '🇿🇦'
    },
    
    // Popular conversions for quick buttons
    POPULAR_CONVERSIONS: [
        { from: 'USD', to: 'EUR', amount: 1000, label: 'USD to EUR' },
        { from: 'EUR', to: 'USD', amount: 1000, label: 'EUR to USD' },
        { from: 'USD', to: 'GBP', amount: 1000, label: 'USD to GBP' },
        { from: 'GBP', to: 'USD', amount: 1000, label: 'GBP to USD' },
        { from: 'USD', to: 'AED', amount: 1000, label: 'USD to AED' },
        { from: 'USD', to: 'SAR', amount: 1000, label: 'USD to SAR' },
        { from: 'USD', to: 'EGP', amount: 1000, label: 'USD to EGP' },
        { from: 'USD', to: 'JPY', amount: 1000, label: 'USD to JPY' }
    ],
    
    // Quick pairs for dashboard
    QUICK_PAIRS: [
        'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
        'USD/CAD', 'AUD/USD', 'USD/AED', 'USD/SAR'
    ],
    
    // Update intervals (in milliseconds)
    UPDATE_INTERVAL: 60 * 60 * 1000, // 1 hour
    COUNTDOWN_INTERVAL: 60 * 1000, // 1 minute
    
    // Storage keys
    STORAGE_KEYS: {
        FOREX_DATA: 'fx_market_data',
        WATCHLIST: 'fx_watchlist',
        LAST_UPDATE: 'last_data_update',
        API_REQUESTS: 'api_request_count'
    }
};
