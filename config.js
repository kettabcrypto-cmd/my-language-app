// config.js - إعدادات التطبيق
const CONFIG = {
    // API Configuration - باستخدام مفتاحك الحقيقي
    API_KEY: 'b83fce53976843bbb59336c03f9a6a30',
    API_BASE_URL: 'https://api.twelvedata.com',
    
    // الصور
    IMAGE_BASE_URL: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/',
    
    // صور صفحة الأسعار
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
    
    // صور المحول
    CONVERTER_IMAGES: {
        'EUR': '100-currency-eurx.png',
        'CAD': '101-currency-cadx.png',
        'GBP': '102-currency-gbpx.png',
        'CHF': '103-currency-chfx.png',
        'AUD': '104-currency-audx.png',
        'JPY': '105-currency-jpyx.png',
        'KRW': '106-currency-krwx.png',
        'BRL': '107-currency-brlx.png',
        'MXN': '108-currency-mxnx.png',
        'TRY': '109-currency-tryx.png',
        'CNY': '110-currency-cnyx.png',
        'MYR': '111-currency-myrx.png',
        'RUB': '112-currency-rubx.png',
        'MAD': '113-currency-madx.png',
        'EGP': '114-currency-egbx.png',
        'TND': '115-currency-tndx.png',
        'SAR': '116-currency-sarx.png',
        'QAR': '117-currency-qarx.png',
        'AED': '118-currency-aedx.png',
    },
    
    // التحديث كل ساعة
    UPDATE_INTERVAL: 60 * 60 * 1000, // 3600000 = ساعة واحدة
    CACHE_DURATION: 55 * 60 * 1000, // 55 دقيقة للتخزين المؤقت
    
    // جميع العملات المتاحة
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
    
    // العملات الافتراضية المتابعة
    DEFAULT_TRACKED: ['USD', 'EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR'],
    
    // الإعدادات الافتراضية
    DEFAULT_SETTINGS: {
        theme: 'light',
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100
    }
};
