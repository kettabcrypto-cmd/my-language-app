// Configuration for CurrencyPro App
const CONFIG = {
    // API Configuration
    API_KEY: 'b83fce53976843bbb59336c03f9a6a30',
    API_URL: 'https://api.twelvedata.com/exchange_rate',
    
    // Image URLs - Using your provided image names
    IMAGE_BASE_URL: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/',
    
    // Image mapping for converter page (your requested names)
    CONVERTER_IMAGES: {
        'EUR': '100-currency-eur.png',
        'USD': '101-currency-usd.png',
        'GBP': '102-currency-gbp.png',
        'CHF': '103-currency-chf.png',
        'CAD': '104-currency-cad.png',
        'AUD': '105-currency-aud.png',
        'TRY': '106-currency-try.png',
        'CNY': '107-currency-cny.png',
        'BRL': '108-currency-brl.png',
        'MXN': '109-currency-mxn.png',
        'ARS': '110-currency-ars.png',
        'RUB': '111-currency-rub.png',
        'ZAR': '112-currency-zar.png',
        'JPY': '113-currency-jpy.png',
        'KRW': '114-currency-krw.png',
        'INR': '115-currency-inr.png',
        'HKD': '116-currency-hkd.png',
        'MYR': '117-currency-myr.png',
        'MAD': '118-currency-mad.png',
        'EGP': '119-currency-egp.png',
        'TND': '120-currency-tnd.png',
        'SAR': '121-currency-sar.png',
        'QAR': '122-currency-qar.png',
        'AED': '123-currency-aed.png'
    },
    
    // Image mapping for rates page (simpler names)
    RATES_IMAGES: {
        'EUR': '100-currency-eur.png',
        'USD': '101-currency-usd.png',
        'GBP': '102-currency-gbp.png',
        'CHF': '103-currency-chf.png',
        'CAD': '104-currency-cad.png',
        'AUD': '105-currency-aud.png',
        'TRY': '106-currency-try.png',
        'CNY': '107-currency-cny.png',
        'BRL': '108-currency-brl.png',
        'MXN': '109-currency-mxn.png',
        'ARS': '110-currency-ars.png',
        'RUB': '111-currency-rub.png',
        'ZAR': '112-currency-zar.png',
        'JPY': '113-currency-jpy.png',
        'KRW': '114-currency-krw.png',
        'INR': '115-currency-inr.png',
        'HKD': '116-currency-hkd.png',
        'MYR': '117-currency-myr.png',
        'MAD': '118-currency-mad.png',
        'EGP': '119-currency-egp.png',
        'TND': '120-currency-tnd.png',
        'SAR': '121-currency-sar.png',
        'QAR': '122-currency-qar.png',
        'AED': '123-currency-aed.png'
    },
    
    // Update intervals
    UPDATE_INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
    CACHE_DURATION: 55 * 60 * 1000, // 55 minutes cache
    
    // All available currencies
    ALL_CURRENCIES: [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'JPY', name: 'Japanese Yen' },
        { code: 'CHF', name: 'Swiss Franc' },
        { code: 'CAD', name: 'Canadian Dollar' },
        { code: 'AUD', name: 'Australian Dollar' },
        { code: 'CNY', name: 'Chinese Yuan' },
        { code: 'AED', name: 'UAE Dirham' },
        { code: 'SAR', name: 'Saudi Riyal' },
        { code: 'QAR', name: 'Qatari Riyal' },
        { code: 'EGP', name: 'Egyptian Pound' },
        { code: 'TRY', name: 'Turkish Lira' },
        { code: 'INR', name: 'Indian Rupee' },
        { code: 'RUB', name: 'Russian Ruble' },
        { code: 'BRL', name: 'Brazilian Real' },
        { code: 'ZAR', name: 'South African Rand' },
        { code: 'MXN', name: 'Mexican Peso' },
        { code: 'KRW', name: 'South Korean Won' },
        { code: 'HKD', name: 'Hong Kong Dollar' },
        { code: 'MYR', name: 'Malaysian Ringgit' },
        { code: 'MAD', name: 'Moroccan Dirham' },
        { code: 'TND', name: 'Tunisian Dinar' },
        { code: 'ARS', name: 'Argentine Peso' }
    ],
    
    // Default tracked currencies
    DEFAULT_TRACKED: ['USD', 'EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR'],
    
    // Default settings
    DEFAULT_SETTINGS: {
        theme: 'light',
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100
    }
};

// App State
const AppState = {
    theme: localStorage.getItem('theme') || CONFIG.DEFAULT_SETTINGS.theme,
    trackedCurrencies: JSON.parse(localStorage.getItem('trackedCurrencies')) || CONFIG.DEFAULT_TRACKED,
    fromCurrency: localStorage.getItem('fromCurrency') || CONFIG.DEFAULT_SETTINGS.fromCurrency,
    toCurrency: localStorage.getItem('toCurrency') || CONFIG.DEFAULT_SETTINGS.toCurrency,
    amount: parseFloat(localStorage.getItem('amount')) || CONFIG.DEFAULT_SETTINGS.amount,
    exchangeRates: JSON.parse(localStorage.getItem('exchangeRates')) || null,
    lastUpdate: localStorage.getItem('lastUpdate') || null,
    changingCurrency: null
};

// Helper function to save state
function saveAppState() {
    localStorage.setItem('theme', AppState.theme);
    localStorage.setItem('trackedCurrencies', JSON.stringify(AppState.trackedCurrencies));
    localStorage.setItem('fromCurrency', AppState.fromCurrency);
    localStorage.setItem('toCurrency', AppState.toCurrency);
    localStorage.setItem('amount', AppState.amount.toString());
    
    if (AppState.exchangeRates) {
        localStorage.setItem('exchangeRates', JSON.stringify(AppState.exchangeRates));
    }
    
    if (AppState.lastUpdate) {
        localStorage.setItem('lastUpdate', AppState.lastUpdate);
    }
}
