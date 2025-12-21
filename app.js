// ========== التطبيق الرئيسي ==========
class CurrencyApp {
    constructor() {
        this.api = new CurrencyAPI();
        this.currentRates = null;
        this.activePage = 'ratesPage';
        this.fromCurrency = 'USD';
        this.toCurrency = 'EUR';
        this.displayedCurrencies = ['EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR', 'CAD', 'AUD'];
    }
    
    async init() {
        console.log('🚀 بدء CurrencyApp...');
        
        // إخفاء رسالة التحميل الافتراضية
        this.hideLoadingMessage();
        
        // إعداد جميع الأحداث
        this.setupNavigation();
        this.setupConverter();
        this.setupSettings();
        this.setupModals();
        
        // تحميل الأسعار
        await this.loadRates();
        
        // تحديث كل 30 دقيقة
        this.startAutoUpdate();
        
        console.log('✅ التطبيق جاهز');
    }
    
    hideLoadingMessage() {
        const ratesList = document.getElementById('ratesList');
        if (ratesList) {
            // إزالة عنصر التحميل الافتراضي
            ratesList.innerHTML = '';
        }
    }
    
    async loadRates() {
        console.log('📡 جلب الأسعار...');
        
        try {
            this.currentRates = await this.api.getRealTimeRates();
            
            if (this.currentRates && this.currentRates.rates) {
                this.updateRatesPage();
                this.updateConverter();
                this.updateSettings();
                return true;
            }
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الأسعار:', error);
            this.showError('فشل تحميل الأسعار الحية. استخدام بيانات افتراضية.');
            this.currentRates = this.api.getFallbackRates();
            this.updateRatesPage();
        }
        
        return false;
    }
    
    // ========== صفحة الأسعار ==========
    updateRatesPage() {
        const ratesList = document.getElementById('ratesList');
        if (!ratesList || !this.currentRates) return;
        
        ratesList.innerHTML = '';
        
        this.displayedCurrencies.forEach(currencyCode => {
            const rate = this.currentRates.rates[currencyCode];
            if (rate) {
                const rateItem = this.createRateItem(currencyCode, rate);
                ratesList.appendChild(rateItem);
            }
        });
    }
    
    createRateItem(currencyCode, rate) {
        const item = document.createElement('div');
        item.className = 'rate-item';
        item.dataset.currency = currencyCode;
        
        // اسم الصورة من الملفات التي أعطيتني إياها
        const imageFile = this.getCurrencyImageFile(currencyCode);
        const imageUrl = `https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/assets/${imageFile}`;
        
        // اسم العملة بالعربية
        const currencyName = CONFIG.CURRENCY_NAMES?.[currencyCode]?.ar || currencyCode;
        
        item.innerHTML = `
            <img src="${imageUrl}" alt="${currencyCode}" class="currency-image"
                 onerror="this.onerror=null; this.src='https://flagcdn.com/w40/${this.getCountryCode(currencyCode)}.png'">
            <div class="rate-info">
                <div class="rate-header">
                    <div class="currency-name">${currencyCode}</div>
                </div>
                <div class="rate-display-line">
                    <span class="rate-value">${rate.toFixed(4)}</span>
                    <span class="rate-label">${currencyName}</span>
                </div>
            </div>
        `;
        
        // حدث النقر: الانتقال للمحول
        item.addEventListener('click', () => {
            this.toCurrency = currencyCode;
            this.updateConverter();
            this.switchPage('convertPage');
        });
        
        return item;
    }
    
    getCurrencyImageFile(currencyCode) {
        const imageMap = {
            'USD': '101-currency-usd.png',
            'EUR': '100-currency-eurx.png',
            'GBP': '102-currency-gbpx.png',
            'JPY': '105-currency-jpyx.png',
            'AED': '118-currency-aed.png',
            'SAR': '116-currency-sarx.png',
            'QAR': '117-currency-qarx.png',
            'CAD': '101-currency-cadx.png',
            'AUD': '104-currency-audx.png',
            'CHF': '103-currency-chfx.png',
            'TRY': '109-currency-tryx.png',
            'CNY': '110-currency-cnyx.png',
            'BRL': '107-currency-brlx.png',
            'MXN': '108-currency-mxnx.png',
            'RUB': '112-currency-rubx.png',
            'KRW': '106-currency-krwx.png',
            'MYR': '111-currency-myrx.png',
            'MAD': '113-currency-madx.png',
            'EGP': '114-currency-egbx.png',
            'TND': '115-currency-tndx.png'
        };
        
        return imageMap[currencyCode] || '101-currency-usd.png';
    }
    
    getCountryCode(currencyCode) {
        const map = {
            'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp',
            'CHF': 'ch', 'CAD': 'ca', 'AUD': 'au', 'AED': 'ae',
            'SAR': 'sa', 'QAR': 'qa', 'TRY': 'tr', 'CNY': 'cn',
            'BRL': 'br', 'MXN': 'mx', 'ARS': 'ar', 'RUB': 'ru',
            'ZAR': 'za', 'KRW': 'kr', 'INR': 'in', 'HKD': 'hk',
            'MYR': 'my', 'MAD': 'ma', 'EGP': 'eg', 'TND': 'tn'
        };
        return map[currencyCode] || 'un';
    }
    
    // ========== التنقل ==========
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetPage = item.getAttribute('data-page');
                this.switchPage(targetPage);
                
                // تحديث التنشيط
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                this.activePage = targetPage;
            });
        });
    }
    
    switchPage(pageId) {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إظهار الصفحة المطلوبة
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // إذا كانت صفحة الأسعار، تحديثها
            if (pageId === 'ratesPage') {
                this.updateRatesPage();
            }
        }
    }
    
    // ========== المحول ==========
    setupConverter() {
        // زر تبديل العملات
        const swapBtn = document.getElementById('swapCurrencies');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.swapCurrencies());
        }
        
        // أزرار تغيير العملات
        const changeFromBtn = document.getElementById('changeFromCurrencyBtn');
        const changeToBtn = document.getElementById('changeToCurrencyBtn');
        
        if (changeFromBtn) {
            changeFromBtn.addEventListener('click', () => this.openCurrencyModal('from'));
        }
        
        if (changeToBtn) {
            changeToBtn.addEventListener('click', () => this.openCurrencyModal('to'));
        }
        
        // إدخال المبلغ
        const fromAmount = document.getElementById('fromAmount');
        if (fromAmount) {
            fromAmount.addEventListener('input', () => this.updateConversion());
        }
    }
    
    updateConverter() {
        if (!this.currentRates) return;
        
        // تحديث الأعلام
        this.updateCurrencyFlag('from', this.fromCurrency);
        this.updateCurrencyFlag('to', this.toCurrency);
        
        // تحديث الرموز
        document.getElementById('fromCurrencyCode').textContent = this.fromCurrency;
        document.getElementById('toCurrencyCode').textContent = this.toCurrency;
        
        // تحديث سعر الصرف والتحويل
        this.updateExchangeRate();
        this.updateConversion();
    }
    
    updateCurrencyFlag(type, currencyCode) {
        const flagElement = document.getElementById(`${type}FlagImg`);
        if (!flagElement) return;
        
        // صورة المحول (بدون x)
        const imageFile = this.getConverterImageFile(currencyCode);
        const imageUrl = `https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/assets/${imageFile}`;
        
        flagElement.src = imageUrl;
        flagElement.alt = currencyCode;
        
        flagElement.onerror = () => {
            flagElement.src = `https://flagcdn.com/w40/${this.getCountryCode(currencyCode)}.png`;
        };
    }
    
    getConverterImageFile(currencyCode) {
        const imageMap = {
            'USD': '101-currency-usd.png',
            'EUR': '100-currency-eur.png',
            'GBP': '102-currency-gbp.png',
            'JPY': '113-currency-jpy.png',
            'AED': '123-currency-aed.png',
            'SAR': '121-currency-sar.png',
            'QAR': '122-currency-qar.png',
            'CAD': '104-currency-cad.png',
            'AUD': '105-currency-aud.png',
            'CHF': '103-currency-chf.png',
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
        };
        
        return imageMap[currencyCode] || '101-currency-usd.png';
    }
    
    updateExchangeRate() {
        const rateText = document.getElementById('rateText');
        if (!rateText || !this.currentRates) return;
        
        const fromRate = this.currentRates.rates[this.fromCurrency] || 1;
        const toRate = this.currentRates.rates[this.toCurrency] || 1;
        
        if (fromRate && toRate) {
            const exchangeRate = toRate / fromRate;
            rateText.textContent = `1 ${this.fromCurrency} = ${exchangeRate.toFixed(4)} ${this.toCurrency}`;
        }
    }
    
    updateConversion() {
        const fromAmountInput = document.getElementById('fromAmount');
        const toAmountInput = document.getElementById('toAmount');
        
        if (!fromAmountInput || !toAmountInput || !this.currentRates) return;
        
        const amount = parseFloat(fromAmountInput.value) || 0;
        const fromRate = this.currentRates.rates[this.fromCurrency] || 1;
        const toRate = this.currentRates.rates[this.toCurrency] || 1;
        
        if (fromRate && toRate) {
            const convertedAmount = (amount / fromRate) * toRate;
            toAmountInput.value = convertedAmount.toFixed(2);
        }
    }
    
    swapCurrencies() {
        // تبديل العملات
        [this.fromCurrency, this.toCurrency] = [this.toCurrency, this.fromCurrency];
        this.updateConverter();
    }
    
    // ========== الإعدادات ==========
    setupSettings() {
        // تبديل الثيم
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                themeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.setTheme(option.getAttribute('data-theme'));
            });
        });
        
        // تحميل الثيم المحفوظ
        const savedTheme = localStorage.getItem('currencypro-theme') || 'light';
        this.setTheme(savedTheme);
        document.querySelector(`.theme-option[data-theme="${savedTheme}"]`)?.classList.add('active');
    }
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('currencypro-theme', theme);
    }
    
    updateSettings() {
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        const lastUpdateStatus = document.getElementById('lastUpdateStatus');
        
        if (lastUpdateTime) {
            const now = new Date();
            lastUpdateTime.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
        
        if (lastUpdateStatus) {
            lastUpdateStatus.textContent = this.currentRates?.success ? 'محدث الآن' : 'بيانات افتراضية';
            lastUpdateStatus.style.color = this.currentRates?.success ? '#28a745' : '#ffc107';
        }
    }
    
    // ========== المودالات ==========
    setupModals() {
        // زر إضافة عملة
        const addBtn = document.getElementById('addCurrencyBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddCurrencyModal());
        }
        
        // أزرار إغلاق المودالات
        document.getElementById('closeModalBtn')?.addEventListener('click', () => {
            document.getElementById('addCurrencyModal').style.display = 'none';
        });
        
        document.getElementById('closeChangeModalBtn')?.addEventListener('click', () => {
            document.getElementById('changeCurrencyModal').style.display = 'none';
        });
        
        // إغلاق عند النقر خارج المودال
        window.addEventListener('click', (e) => {
            if (e.target.id === 'addCurrencyModal') {
                document.getElementById('addCurrencyModal').style.display = 'none';
            }
            if (e.target.id === 'changeCurrencyModal') {
                document.getElementById('changeCurrencyModal').style.display = 'none';
            }
        });
    }
    
    showAddCurrencyModal() {
        const modal = document.getElementById('addCurrencyModal');
        const list = document.getElementById('availableCurrenciesList');
        
        if (!modal || !list || !this.currentRates) return;
        
        list.innerHTML = '';
        
        // عرض العملات غير المعروضة
        Object.keys(this.currentRates.rates).forEach(currencyCode => {
            if (currencyCode === 'USD' || this.displayedCurrencies.includes(currencyCode)) return;
            
            const option = document.createElement('div');
            option.className = 'currency-option';
            
            const imageFile = this.getCurrencyImageFile(currencyCode);
            const imageUrl = `https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/assets/${imageFile}`;
            const currencyName = CONFIG.CURRENCY_NAMES?.[currencyCode]?.ar || currencyCode;
            const rate = this.currentRates.rates[currencyCode];
            
            option.innerHTML = `
                <img src="${imageUrl}" alt="${currencyCode}"
                     onerror="this.src='https://flagcdn.com/w40/${this.getCountryCode(currencyCode)}.png'">
                <span>${currencyCode} - ${currencyName}</span>
                <span class="currency-rate">${rate.toFixed(4)}</span>
                <button class="add-btn-small">إضافة</button>
            `;
            
            option.querySelector('.add-btn-small').addEventListener('click', (e) => {
                e.stopPropagation();
                this.addCurrencyToDisplay(currencyCode);
                modal.style.display = 'none';
            });
            
            list.appendChild(option);
        });
        
        modal.style.display = 'flex';
    }
    
    addCurrencyToDisplay(currencyCode) {
        if (!this.displayedCurrencies.includes(currencyCode)) {
            this.displayedCurrencies.push(currencyCode);
            this.updateRatesPage();
        }
    }
    
    openCurrencyModal(type) {
        const modal = document.getElementById('changeCurrencyModal');
        const title = document.getElementById('changeCurrencyTitle');
        const list = document.getElementById('changeCurrencyList');
        
        if (!modal || !title || !list || !this.currentRates) return;
        
        title.textContent = type === 'from' ? 'اختر العملة المصدر' : 'اختر العملة الهدف';
        list.innerHTML = '';
        
        Object.keys(this.currentRates.rates).forEach(currencyCode => {
            const option = document.createElement('div');
            option.className = 'currency-option';
            
            const imageFile = this.getConverterImageFile(currencyCode);
            const imageUrl = `https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/assets/${imageFile}`;
            const currencyName = CONFIG.CURRENCY_NAMES?.[currencyCode]?.ar || currencyCode;
            const rate = this.currentRates.rates[currencyCode];
            
            option.innerHTML = `
                <img src="${imageUrl}" alt="${currencyCode}"
                     onerror="this.src='https://flagcdn.com/w40/${this.getCountryCode(currencyCode)}.png'">
                <span>${currencyCode} - ${currencyName}</span>
                <span class="currency-rate">${rate.toFixed(4)}</span>
            `;
            
            option.addEventListener('click', () => {
                if (type === 'from') {
                    this.fromCurrency = currencyCode;
                } else {
                    this.toCurrency = currencyCode;
                }
                this.updateConverter();
                modal.style.display = 'none';
            });
            
            list.appendChild(option);
        });
        
        modal.style.display = 'flex';
    }
    
    // ========== التحديث التلقائي ==========
    startAutoUpdate() {
        setInterval(async () => {
            console.log('🔄 تحديث تلقائي للأسعار...');
            await this.loadRates();
        }, CONFIG.UPDATE_INTERVAL || 1800000); // 30 دقيقة افتراضياً
    }
    
    // ========== أدوات مساعدة ==========
    showError(message) {
        console.error('⚠️:', message);
        // يمكنك إضافة عرض رسالة خطأ في الواجهة
    }
}

// ========== بدء التطبيق ==========
document.addEventListener('DOMContentLoaded', () => {
    const app = new CurrencyApp();
    app.init();
});

// ========== CSS إضافي ==========
const appStyles = document.createElement('style');
appStyles.textContent = `
    /* تحسين البطاقات */
    .rate-item {
        display: flex;
        align-items: center;
        padding: 15px;
        margin: 10px 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        border: 1px solid #e8e8e8;
        transition: all 0.3s;
        cursor: pointer;
    }
    
    .rate-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.12);
        border-color: #3498db;
    }
    
    .currency-image {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        margin-right: 15px;
        object-fit: contain;
        background: #f8f9fa;
        padding: 5px;
    }
    
    .rate-info {
        flex: 1;
    }
    
    .rate-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
    }
    
    .currency-name {
        font-weight: bold;
        font-size: 18px;
        color: #2c3e50;
    }
    
    .rate-display-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .rate-value {
        font-weight: bold;
        font-size: 22px;
        color: #27ae60;
    }
    
    .rate-label {
        font-size: 14px;
        color: #7f8c8d;
    }
    
    /* المودالات */
    .currency-option {
        display: flex;
        align-items: center;
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .currency-option:hover {
        background: #f5f5f5;
    }
    
    .currency-option img {
        width: 36px;
        height: 36px;
        margin-right: 12px;
        border-radius: 6px;
        object-fit: contain;
    }
    
    .currency-rate {
        margin-left: auto;
        font-weight: bold;
        color: #27ae60;
        margin-right: 15px;
    }
    
    .add-btn-small {
        background: #3498db;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
    }
    
    .add-btn-small:hover {
        background: #2980b9;
    }
    
    /* التحويل بين الثيمات */
    [data-theme="dark"] .rate-item {
        background: #2d2d2d;
        border-color: #404040;
        color: white;
    }
    
    [data-theme="dark"] .currency-name,
    [data-theme="dark"] .rate-value {
        color: #ecf0f1;
    }
    
    [data-theme="dark"] .rate-label {
        color: #bdc3c7;
    }
`;
document.head.appendChild(appStyles);
