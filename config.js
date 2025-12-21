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
    SUPPORTED_CURRENCIES: [
        'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD',
        'AED', 'SAR', 'QAR', 'TRY', 'CNY', 'BRL', 'MXN',
        'ARS', 'RUB', 'ZAR', 'KRW', 'INR', 'HKD', 'MYR',
        'MAD', 'EGP', 'TND'
    ],
    
    CURRENCY_PAIRS: [
        'USD/EUR', 'USD/GBP', 'USD/JPY', 'USD/CHF', 'USD/CAD',
        'USD/AUD', 'USD/AED', 'USD/SAR', 'USD/QAR', 'USD/TRY',
        'USD/CNY', 'USD/BRL', 'USD/MXN', 'USD/ARS', 'USD/RUB',
        'USD/ZAR', 'USD/KRW', 'USD/INR', 'USD/HKD', 'USD/MYR',
        'USD/MAD', 'USD/EGP', 'USD/TND'
    ],
    
    // إعدادات Time Series
    INTERVAL: '5min',
    OUTPUT_SIZE: 1,
    
    // تحديث كل 30 دقيقة
    UPDATE_INTERVAL: 30 * 60 * 1000,
    
    // **أسماء العملات**
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
    
    // **صور العملات للمحول (النوع الأول)**
    CONVERTER_IMAGES: {
        'USD': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/101-currency-usd.png',
        'EUR': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/100-currency-eur.png',
        'GBP': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/102-currency-gbp.png',
        'JPY': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/113-currency-jpy.png',
        'CHF': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/103-currency-chf.png',
        'CAD': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/104-currency-cad.png',
        'AUD': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/105-currency-aud.png',
        'AED': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/123-currency-aed.png',
        'SAR': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/121-currency-sar.png',
        'QAR': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/122-currency-qar.png',
        'TRY': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/106-currency-try.png',
        'CNY': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/107-currency-cny.png',
        'BRL': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/108-currency-brl.png',
        'MXN': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/109-currency-mxn.png',
        'ARS': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/110-currency-ars.png',
        'RUB': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/111-currency-rub.png',
        'ZAR': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/112-currency-zar.png',
        'KRW': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/114-currency-krw.png',
        'INR': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/115-currency-inr.png',
        'HKD': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/116-currency-hkd.png',
        'MYR': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/117-currency-myr.png',
        'MAD': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/118-currency-mad.png',
        'EGP': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/119-currency-egp.png',
        'TND': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/120-currency-tnd.png'
    },
    
    // **صور العملات لقائمة الأسعار (النوع الثاني - x)**
    RATES_IMAGES: {
        'USD': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/101-currency-usd.png',
        'EUR': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/100-currency-eurx.png',
        'GBP': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/102-currency-gbpx.png',
        'JPY': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/105-currency-jpyx.png',
        'CHF': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/103-currency-chfx.png',
        'CAD': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/101-currency-cadx.png',
        'AUD': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/104-currency-audx.png',
        'AED': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/118-currency-aed.png',
        'SAR': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/116-currency-sarx.png',
        'QAR': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/117-currency-qarx.png',
        'TRY': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/109-currency-tryx.png',
        'CNY': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/110-currency-cnyx.png',
        'BRL': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/107-currency-brlx.png',
        'MXN': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/108-currency-mxnx.png',
        'ARS': null, // لا توجد صورة
        'RUB': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/112-currency-rubx.png',
        'ZAR': null, // لا توجد صورة
        'KRW': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/106-currency-krwx.png',
        'INR': null, // لا توجد صورة
        'HKD': null, // لا توجد صورة
        'MYR': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/111-currency-myrx.png',
        'MAD': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/113-currency-madx.png',
        'EGP': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/114-currency-egbx.png',
        'TND': 'https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/115-currency-tndx.png'
    },
    
    // **روابط احتياطية إذا لم توجد الصور**
    FALLBACK_IMAGES: {
        'USD': 'https://flagcdn.com/w40/us.png',
        'EUR': 'https://flagcdn.com/w40/eu.png',
        'GBP': 'https://flagcdn.com/w40/gb.png',
        'JPY': 'https://flagcdn.com/w40/jp.png',
        'CHF': 'https://flagcdn.com/w40/ch.png',
        'CAD': 'https://flagcdn.com/w40/ca.png',
        'AUD': 'https://flagcdn.com/w40/au.png',
        'AED': 'https://flagcdn.com/w40/ae.png',
        'SAR': 'https://flagcdn.com/w40/sa.png',
        'QAR': 'https://flagcdn.com/w40/qa.png',
        'TRY': 'https://flagcdn.com/w40/tr.png',
        'CNY': 'https://flagcdn.com/w40/cn.png',
        'BRL': 'https://flagcdn.com/w40/br.png',
        'MXN': 'https://flagcdn.com/w40/mx.png',
        'ARS': 'https://flagcdn.com/w40/ar.png',
        'RUB': 'https://flagcdn.com/w40/ru.png',
        'ZAR': 'https://flagcdn.com/w40/za.png',
        'KRW': 'https://flagcdn.com/w40/kr.png',
        'INR': 'https://flagcdn.com/w40/in.png',
        'HKD': 'https://flagcdn.com/w40/hk.png',
        'MYR': 'https://flagcdn.com/w40/my.png',
        'MAD': 'https://flagcdn.com/w40/ma.png',
        'EGP': 'https://flagcdn.com/w40/eg.png',
        'TND': 'https://flagcdn.com/w40/tn.png'
    }
};
