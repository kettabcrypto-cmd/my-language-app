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
        'USD/CAD', 'USD/AUD', 'USD/CHF',
        'USD/TRY', 'USD/CNY', 'USD/BRL',
        'USD/MXN', 'USD/ARS', 'USD/RUB',
        'USD/ZAR', 'USD/KRW', 'USD/INR',
        'USD/HKD', 'USD/MYR', 'USD/MAD',
        'USD/EGP', 'USD/TND'
    ],
    
    // إعدادات Time Series
    INTERVAL: '5min',
    OUTPUT_SIZE: 1,
    
    // تحديث كل 30 دقيقة
    UPDATE_INTERVAL: 30 * 60 * 1000,
    
    // **إعدادات التطبيق**
    APP_SETTINGS: {
        defaultTheme: 'light',
        defaultFromCurrency: 'USD',
        defaultToCurrency: 'EUR',
        defaultAmount: 100,
        autoUpdate: true,
        updateInterval: 30 // دقائق
    },
    
    // **العملات المتابعة افتراضياً**
    DEFAULT_TRACKED_CURRENCIES: ['EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR', 'CAD', 'AUD'],
    
    // **أسماء العملات الكاملة**
    CURRENCY_NAMES: {
        'USD': { ar: 'دولار أمريكي', en: 'US Dollar' },
        'EUR': { ar: 'يورو', en: 'Euro' },
        'GBP': { ar: 'جنيه إسترليني', en: 'British Pound' },
        'JPY': { ar: 'ين ياباني', en: 'Japanese Yen' },
        'CHF': { ar: 'فرنك سويسري', en: 'Swiss Franc' },
        'CAD': { ar: 'دولار كندي', en: 'Canadian Dollar' },
        'AUD': { ar: 'دولار أسترالي', en: 'Australian Dollar' },
        'AED': { ar: 'درهم إماراتي', en: 'UAE Dirham' },
        'SAR': { ar: 'ريال سعودي', en: 'Saudi Riyal' },
        'QAR': { ar: 'ريال قطري', en: 'Qatari Riyal' },
        'TRY': { ar: 'ليرة تركية', en: 'Turkish Lira' },
        'CNY': { ar: 'يوان صيني', en: 'Chinese Yuan' },
        'BRL': { ar: 'ريال برازيلي', en: 'Brazilian Real' },
        'MXN': { ar: 'بيزو مكسيكي', en: 'Mexican Peso' },
        'ARS': { ar: 'بيزو أرجنتيني', en: 'Argentine Peso' },
        'RUB': { ar: 'روبل روسي', en: 'Russian Ruble' },
        'ZAR': { ar: 'راند جنوب أفريقي', en: 'South African Rand' },
        'KRW': { ar: 'وون كوري جنوبي', en: 'South Korean Won' },
        'INR': { ar: 'روبية هندية', en: 'Indian Rupee' },
        'HKD': { ar: 'دولار هونغ كونغ', en: 'Hong Kong Dollar' },
        'MYR': { ar: 'رينغيت ماليزي', en: 'Malaysian Ringgit' },
        'MAD': { ar: 'درهم مغربي', en: 'Moroccan Dirham' },
        'EGP': { ar: 'جنيه مصري', en: 'Egyptian Pound' },
        'TND': { ar: 'دينار تونسي', en: 'Tunisian Dinar' }
    },
    
    // **روابط صور العملات للمحول (النوع الأول)**
    CONVERTER_IMAGES: {
        'USD': '101-currency-usd.png',
        'EUR': '100-currency-eur.png',
        'GBP': '102-currency-gbp.png',
        'JPY': '113-currency-jpy.png',
        'CHF': '103-currency-chf.png',
        'CAD': '104-currency-cad.png',
        'AUD': '105-currency-aud.png',
        'AED': '123-currency-aed.png',
        'SAR': '121-currency-sar.png',
        'QAR': '122-currency-qar.png',
        'TRY': '106-currency-try.png',
        'CNY': '107-currency-cny.png',
        'BRL': '108-currency-brl.png',
        'MXN': '109-currency-mxn.png',
        'ARS': '110-currency-ars.png',
        'RUB': '111-currency-rub.png',
        'ZAR': '112-currency-zar.png',
        'KRW': '114-currency-krw.png',
        'INR': '115-currency-inr.png',
        'HKD': '116-currency-hkd.png',
        'MYR': '117-currency-myr.png',
        'MAD': '118-currency-mad.png',
        'EGP': '119-currency-egp.png',
        'TND': '120-currency-tnd.png'
    },
    
    // **روابط صور العملات لقائمة الأسعار (النوع الثاني)**
    RATES_IMAGES: {
        'USD': '101-currency-usd.png',
        'EUR': '100-currency-eurx.png',
        'GBP': '102-currency-gbpx.png',
        'JPY': '105-currency-jpyx.png',
        'CHF': '103-currency-chfx.png',
        'CAD': '101-currency-cadx.png',
        'AUD': '104-currency-audx.png',
        'AED': '118-currency-aed.png',
        'SAR': '116-currency-sarx.png',
        'QAR': '117-currency-qarx.png',
        'TRY': '109-currency-tryx.png',
        'CNY': '110-currency-cnyx.png',
        'BRL': '107-currency-brlx.png',
        'MXN': '108-currency-mxnx.png',
        'ARS': '110-currency-ars.png',
        'RUB': '112-currency-rubx.png',
        'ZAR': '112-currency-zar.png',
        'KRW': '106-currency-krwx.png',
        'INR': '115-currency-inr.png',
        'HKD': '116-currency-hkd.png',
        'MYR': '111-currency-myrx.png',
        'MAD': '113-currency-madx.png',
        'EGP': '114-currency-egbx.png',
        'TND': '115-currency-tndx.png'
    },
    
    // **روابط قاعدة الصور**
    IMAGE_BASE_URL: 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/assets/',
    
    // **رموز الدول للأعلام البديلة**
    COUNTRY_CODES: {
        'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp',
        'CHF': 'ch', 'CAD': 'ca', 'AUD': 'au', 'AED': 'ae',
        'SAR': 'sa', 'QAR': 'qa', 'TRY': 'tr', 'CNY': 'cn',
        'BRL': 'br', 'MXN': 'mx', 'ARS': 'ar', 'RUB': 'ru',
        'ZAR': 'za', 'KRW': 'kr', 'INR': 'in', 'HKD': 'hk',
        'MYR': 'my', 'MAD': 'ma', 'EGP': 'eg', 'TND': 'tn'
    },
    
    // **أسعار افتراضية للطوارئ**
    DEFAULT_RATES: {
        'EUR': 0.85404,
        'GBP': 0.79000,
        'JPY': 148.50,
        'AED': 3.6725,
        'SAR': 3.7500,
        'QAR': 3.6400,
        'CAD': 1.3500,
        'AUD': 1.5600,
        'CHF': 0.8800,
        'TRY': 32.500,
        'CNY': 7.1800,
        'BRL': 5.2000,
        'MXN': 17.800,
        'ARS': 850.00,
        'RUB': 92.500,
        'ZAR': 19.200,
        'KRW': 1350.00,
        'INR': 83.500,
        'HKD': 7.8200,
        'MYR': 4.7500,
        'MAD': 10.200,
        'EGP': 30.900,
        'TND': 3.1500
    }
};
