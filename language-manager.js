// language-manager.js - إدارة اللغات والدولية
class LanguageManager {
    constructor() {
        this.languages = {
            en: {
                code: 'en',
                name: 'English',
                dir: 'ltr',
                flag: '🇺🇸',
                translations: {
                    // التنقل
                    'app_title': 'CurrencyPro',
                    'rates': 'Rates',
                    'convert': 'Convert',
                    'settings': 'Settings',
                    
                    // صفحة الأسعار
                    'exchange_rates': 'Exchange Rates',
                    'currency_rates': 'Currency Rates',
                    'add_currency': 'Add Currency',
                    'manage_currencies': 'Manage Currencies',
                    'last_updated': 'Last updated',
                    'loading_rates': 'Loading rates...',
                    'tap_to_convert': 'Tap to convert',
                    
                    // صفحة المحول
                    'currency_converter': 'Currency Converter',
                    'from': 'From',
                    'to': 'To',
                    'amount': 'Amount',
                    'convert': 'Convert',
                    'swap': 'Swap',
                    'mid_market_rate': 'Mid-market rate',
                    'mid_market_rate_used': 'Mid-market rate used',
                    'enter_amount': 'Enter amount',
                    
                    // صفحة الإعدادات
                    'appearance': 'Appearance',
                    'updates': 'Updates',
                    'currencies': 'Currencies',
                    'dark_mode': 'Dark Mode',
                    'change_appearance': 'Change app appearance',
                    'light': 'Light',
                    'dark': 'Dark',
                    'auto_update': 'Auto Update',
                    'updates_every_hour': 'Updates every hour',
                    'enabled': 'Enabled',
                    'disabled': 'Disabled',
                    'last_update': 'Last Update',
                    'exchange_rates_status': 'Exchange rates status',
                    'default_currencies': 'Default Currencies',
                    'manage_displayed_currencies': 'Manage displayed currencies',
                    'reset_to_defaults': 'Reset to Defaults',
                    'restore_all_settings': 'Restore all settings',
                    'manage': 'Manage',
                    'reset': 'Reset',
                    
                    // المودالات
                    'select_currency': 'Select Currency',
                    'search_currencies': 'Search currencies...',
                    'cancel': 'Cancel',
                    'select': 'Select',
                    'close': 'Close',
                    'save_changes': 'Save Changes',
                    'displayed_currencies': 'Displayed Currencies',
                    'tap_to_remove': 'Tap to remove from list',
                    'available_currencies': 'Available Currencies',
                    'tap_to_add': 'Tap to add to list',
                    
                    // رسائل
                    'currency_added': 'Currency added',
                    'currency_removed': 'Currency removed',
                    'rates_updated': 'Rates updated',
                    'conversion_copied': 'Conversion copied to clipboard',
                    'settings_saved': 'Settings saved',
                    'reset_complete': 'Reset complete',
                    'error_loading_rates': 'Error loading rates',
                    'using_cached_data': 'Using cached data',
                    'no_internet': 'No internet connection',
                    'check_connection': 'Please check your connection',
                    
                    // أسماء العملات
                    'USD': 'US Dollar',
                    'EUR': 'Euro',
                    'GBP': 'British Pound',
                    'JPY': 'Japanese Yen',
                    'AED': 'UAE Dirham',
                    'SAR': 'Saudi Riyal',
                    'QAR': 'Qatari Riyal',
                    'CAD': 'Canadian Dollar',
                    'AUD': 'Australian Dollar',
                    'CHF': 'Swiss Franc',
                    'TRY': 'Turkish Lira',
                    'CNY': 'Chinese Yuan',
                    'BRL': 'Brazilian Real',
                    'MXN': 'Mexican Peso',
                    'RUB': 'Russian Ruble',
                    'ZAR': 'South African Rand',
                    'KRW': 'South Korean Won',
                    'INR': 'Indian Rupee',
                    'HKD': 'Hong Kong Dollar',
                    'MYR': 'Malaysian Ringgit',
                    'MAD': 'Moroccan Dirham',
                    'EGP': 'Egyptian Pound',
                    'TND': 'Tunisian Dinar'
                }
            },
            ar: {
                code: 'ar',
                name: 'العربية',
                dir: 'rtl',
                flag: '🇸🇦',
                translations: {
                    // التنقل
                    'app_title': 'محول العملات',
                    'rates': 'الأسعار',
                    'convert': 'تحويل',
                    'settings': 'الإعدادات',
                    
                    // صفحة الأسعار
                    'exchange_rates': 'أسعار الصرف',
                    'currency_rates': 'أسعار العملات',
                    'add_currency': 'إضافة عملة',
                    'manage_currencies': 'إدارة العملات',
                    'last_updated': 'آخر تحديث',
                    'loading_rates': 'جاري تحميل الأسعار...',
                    'tap_to_convert': 'انقر للتحويل',
                    
                    // صفحة المحول
                    'currency_converter': 'محول العملات',
                    'from': 'من',
                    'to': 'إلى',
                    'amount': 'المبلغ',
                    'convert': 'تحويل',
                    'swap': 'تبديل',
                    'mid_market_rate': 'سعر السوق الوسطى',
                    'mid_market_rate_used': 'تم استخدام سعر السوق الوسطى',
                    'enter_amount': 'أدخل المبلغ',
                    
                    // صفحة الإعدادات
                    'appearance': 'المظهر',
                    'updates': 'التحديثات',
                    'currencies': 'العملات',
                    'dark_mode': 'الوضع المظلم',
                    'change_appearance': 'تغيير مظهر التطبيق',
                    'light': 'فاتح',
                    'dark': 'مظلم',
                    'auto_update': 'تحديث تلقائي',
                    'updates_every_hour': 'تحديث كل ساعة',
                    'enabled': 'مفعل',
                    'disabled': 'معطل',
                    'last_update': 'آخر تحديث',
                    'exchange_rates_status': 'حالة أسعار الصرف',
                    'default_currencies': 'العملات الافتراضية',
                    'manage_displayed_currencies': 'إدارة العملات المعروضة',
                    'reset_to_defaults': 'إعادة التعيين',
                    'restore_all_settings': 'استعادة جميع الإعدادات',
                    'manage': 'إدارة',
                    'reset': 'إعادة تعيين',
                    
                    // المودالات
                    'select_currency': 'اختر العملة',
                    'search_currencies': 'ابحث في العملات...',
                    'cancel': 'إلغاء',
                    'select': 'اختيار',
                    'close': 'إغلاق',
                    'save_changes': 'حفظ التغييرات',
                    'displayed_currencies': 'العملات المعروضة',
                    'tap_to_remove': 'انقر للإزالة من القائمة',
                    'available_currencies': 'العملات المتاحة',
                    'tap_to_add': 'انقر للإضافة للقائمة',
                    
                    // رسائل
                    'currency_added': 'تمت إضافة العملة',
                    'currency_removed': 'تمت إزالة العملة',
                    'rates_updated': 'تم تحديث الأسعار',
                    'conversion_copied': 'تم نسخ التحويل للحافظة',
                    'settings_saved': 'تم حفظ الإعدادات',
                    'reset_complete': 'تمت إعادة التعيين',
                    'error_loading_rates': 'خطأ في تحميل الأسعار',
                    'using_cached_data': 'جاري استخدام البيانات المخزنة',
                    'no_internet': 'لا يوجد اتصال بالإنترنت',
                    'check_connection': 'يرجى التحقق من الاتصال',
                    
                    // أسماء العملات
                    'USD': 'دولار أمريكي',
                    'EUR': 'يورو',
                    'GBP': 'جنيه إسترليني',
                    'JPY': 'ين ياباني',
                    'AED': 'درهم إماراتي',
                    'SAR': 'ريال سعودي',
                    'QAR': 'ريال قطري',
                    'CAD': 'دولار كندي',
                    'AUD': 'دولار أسترالي',
                    'CHF': 'فرنك سويسري',
                    'TRY': 'ليرة تركية',
                    'CNY': 'يوان صيني',
                    'BRL': 'ريال برازيلي',
                    'MXN': 'بيزو مكسيكي',
                    'RUB': 'روبل روسي',
                    'ZAR': 'راند جنوب أفريقي',
                    'KRW': 'وون كوري جنوبي',
                    'INR': 'روبية هندية',
                    'HKD': 'دولار هونغ كونغ',
                    'MYR': 'رينغيت ماليزي',
                    'MAD': 'درهم مغربي',
                    'EGP': 'جنيه مصري',
                    'TND': 'دينار تونسي'
                }
            }
        };
        
        this.currentLanguage = 'en';
        this.init();
    }
    
    init() {
        // اكتشاف لغة المتصفح
        const browserLang = navigator.language.split('-')[0];
        const savedLang = localStorage.getItem('currencypro_language');
        
        // تحديد اللغة
        if (savedLang && this.languages[savedLang]) {
            this.currentLanguage = savedLang;
        } else if (this.languages[browserLang]) {
            this.currentLanguage = browserLang;
        }
        
        // تطبيق اللغة
        this.applyLanguage();
    }
    
    applyLanguage() {
        const lang = this.languages[this.currentLanguage];
        
        // تغيير اتجاه الصفحة
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = lang.code;
        
        // ترجمة العناصر
        this.translatePage();
        
        // حفظ الإعداد
        localStorage.setItem('currencypro_language', this.currentLanguage);
        
        // إرسال حدث تغيير اللغة
        this.dispatchLanguageChange();
    }
    
    translatePage() {
        const lang = this.languages[this.currentLanguage];
        const translations = lang.translations;
        
        // ترجمة جميع العناصر التي تحتوي على data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });
        
        // تحديث العناوين
        if (document.title.includes('CurrencyPro')) {
            document.title = translations['app_title'] || document.title;
        }
    }
    
    setLanguage(langCode) {
        if (this.languages[langCode]) {
            this.currentLanguage = langCode;
            this.applyLanguage();
            return true;
        }
        return false;
    }
    
    getCurrentLanguage() {
        return this.languages[this.currentLanguage];
    }
    
    getAllLanguages() {
        return Object.values(this.languages);
    }
    
    getTranslation(key, defaultValue = '') {
        const lang = this.languages[this.currentLanguage];
        return lang.translations[key] || defaultValue;
    }
    
    translate(key, params = {}) {
        let translation = this.getTranslation(key, key);
        
        // استبدال المتغيرات
        Object.entries(params).forEach(([param, value]) => {
            translation = translation.replace(`{{${param}}}`, value);
        });
        
        return translation;
    }
    
    dispatchLanguageChange() {
        const event = new CustomEvent('languagechange', {
            detail: {
                language: this.currentLanguage,
                languageName: this.languages[this.currentLanguage].name,
                direction: this.languages[this.currentLanguage].dir
            }
        });
        document.dispatchEvent(event);
    }
    
    // إضافة ترجمة ديناميكية
    addTranslation(langCode, key, value) {
        if (this.languages[langCode]) {
            this.languages[langCode].translations[key] = value;
            this.applyLanguage(); // إعادة تطبيق الترجمة
        }
    }
    
    // تحميل ترجمات إضافية
    async loadTranslations(langCode, url) {
        try {
            const response = await fetch(url);
            const translations = await response.json();
            
            if (this.languages[langCode]) {
                this.languages[langCode].translations = {
                    ...this.languages[langCode].translations,
                    ...translations
                };
                this.applyLanguage();
            }
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }
    
    // إنشاء زر اختيار اللغة
    createLanguageSelector() {
        const container = document.createElement('div');
        container.className = 'language-selector';
        
        const currentLang = this.getCurrentLanguage();
        
        container.innerHTML = `
            <button class="language-current">
                <span class="language-flag">${currentLang.flag}</span>
                <span class="language-name">${currentLang.name}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="language-dropdown">
                ${this.getAllLanguages().map(lang => `
                    <button class="language-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                            data-lang="${lang.code}">
                        <span class="language-flag">${lang.flag}</span>
                        <span class="language-name">${lang.name}</span>
                        ${lang.code === this.currentLanguage ? '<i class="fas fa-check"></i>' : ''}
                    </button>
                `).join('')}
            </div>
        `;
        
        // إضافة الأحداث
        const currentBtn = container.querySelector('.language-current');
        const dropdown = container.querySelector('.language-dropdown');
        
        currentBtn.addEventListener('click', () => {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
        
        container.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', () => {
                const langCode = option.dataset.lang;
                this.setLanguage(langCode);
                dropdown.style.display = 'none';
            });
        });
        
        // إغلاق عند النقر خارج المربع
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
        
        return container;
    }
}
