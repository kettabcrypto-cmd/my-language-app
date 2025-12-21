class CurrencyApp {
    constructor() {
        this.api = new CurrencyAPI();
        this.currentRates = null;
        this.updateInterval = null;
        this.activePage = 'ratesPage';
        
        // العملات الافتراضية للمحول
        this.fromCurrency = 'USD';
        this.toCurrency = 'EUR';
        
        // العملات المعروضة
        this.displayedCurrencies = ['EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR', 'CAD', 'AUD'];
    }
    
    async init() {
        console.log('🚀 بدء تطبيق CurrencyPro');
        
        // إعداد جميع الأحداث
        this.setupNavigation();
        this.setupConverter();
        this.setupSettings();
        this.setupModals();
        this.setupButtons();
        
        // تحميل الأسعار الأولية
        await this.loadInitialRates();
        
        // بدء التحديث التلقائي
        this.startAutoUpdate();
        
        console.log('✅ التطبيق جاهز');
    }
    
    async loadInitialRates() {
        try {
            this.currentRates = await this.api.getRealTimeRates();
            
            if (this.currentRates && this.currentRates.rates) {
                // تحديث الصفحات
                this.updateRatesPage();
                this.updateConverter();
                this.updateSettings();
            }
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الأسعار:', error);
            this.currentRates = this.api.getFallbackRates();
            this.updateRatesPage();
        }
    }
    
    // ========== إعداد التنقل ==========
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetPage = item.getAttribute('data-page');
                this.switchPage(targetPage);
                
                // تحديث حالة التنشيط
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
        const rateItem = document.createElement('div');
        rateItem.className = 'rate-item';
        rateItem.dataset.currency = currencyCode;
        
        // الحصول على الصورة المناسبة
        const imageUrl = CONFIG.RATES_IMAGES[currencyCode] || 
                        CONFIG.FALLBACK_IMAGES[currencyCode] ||
                        'https://via.placeholder.com/40x30/cccccc/666666?text=' + currencyCode;
        
        const currencyName = CONFIG.CURRENCY_NAMES[currencyCode]?.ar || currencyCode;
        
        rateItem.innerHTML = `
            <img src="${imageUrl}" alt="${currencyCode}" class="currency-image"
                 onerror="this.onerror=null; this.src='${CONFIG.FALLBACK_IMAGES[currencyCode] || 'https://via.placeholder.com/40x30/cccccc/666666?text=' + currencyCode}'">
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
        
        // إضافة حدث النقر لتغيير العملة في المحول
        rateItem.addEventListener('click', () => {
            this.toCurrency = currencyCode;
            this.updateConverter();
            this.switchPage('convertPage');
            
            // تحديث التنشيط
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            document.querySelector('.nav-item[data-page="convertPage"]').classList.add('active');
        });
        
        return rateItem;
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
            changeFromBtn.addEventListener('click', () => {
                this.openCurrencyModal('from');
            });
        }
        
        if (changeToBtn) {
            changeToBtn.addEventListener('click', () => {
                this.openCurrencyModal('to');
            });
        }
        
        // إدخال المبلغ
        const fromAmount = document.getElementById('fromAmount');
        if (fromAmount) {
            fromAmount.addEventListener('input', () => {
                this.updateConversion();
            });
        }
        
        // تحديث المحول أول مرة
        this.updateConverter();
    }
    
    updateConverter() {
        if (!this.currentRates) return;
        
        // تحديث الأعلام
        this.updateCurrencyFlag('from', this.fromCurrency);
        this.updateCurrencyFlag('to', this.toCurrency);
        
        // تحديث الرموز
        document.getElementById('fromCurrencyCode').textContent = this.fromCurrency;
        document.getElementById('toCurrencyCode').textContent = this.toCurrency;
        
        // تحديث سعر الصرف
        this.updateExchangeRate();
        
        // تحديث التحويل
        this.updateConversion();
    }
    
    updateCurrencyFlag(type, currencyCode) {
        const flagElement = document.getElementById(`${type}FlagImg`);
        if (!flagElement) return;
        
        const imageUrl = CONFIG.CONVERTER_IMAGES[currencyCode] || 
                        CONFIG.FALLBACK_IMAGES[currencyCode];
        
        flagElement.src = imageUrl;
        flagElement.alt = currencyCode;
        
        // معالجة الخطأ في تحميل الصورة
        flagElement.onerror = () => {
            flagElement.src = CONFIG.FALLBACK_IMAGES[currencyCode] || 
                             'https://via.placeholder.com/40x30/cccccc/666666?text=' + currencyCode;
        };
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
        
        // تحديث المحول
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
                
                const theme = option.getAttribute('data-theme');
                this.setTheme(theme);
            });
        });
        
        // تحديث وقت التحديث
        this.updateLastUpdateTime();
    }
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('currencypro-theme', theme);
    }
    
    updateLastUpdateTime() {
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        const lastUpdateStatus = document.getElementById('lastUpdateStatus');
        
        if (lastUpdateTime && this.currentRates) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            lastUpdateTime.textContent = timeStr;
        }
        
        if (lastUpdateStatus) {
            lastUpdateStatus.textContent = this.currentRates?.success ? 'محدث الآن' : 'بيانات افتراضية';
            lastUpdateStatus.style.color = this.currentRates?.success ? '#28a745' : '#ffc107';
        }
    }
    
    updateSettings() {
        this.updateLastUpdateTime();
    }
    
    // ========== المودالات ==========
    setupModals() {
        // إغلاق المودالات
        const closeModalBtn = document.getElementById('closeModalBtn');
        const closeChangeModalBtn = document.getElementById('closeChangeModalBtn');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                document.getElementById('addCurrencyModal').style.display = 'none';
            });
        }
        
        if (closeChangeModalBtn) {
            closeChangeModalBtn.addEventListener('click', () => {
                document.getElementById('changeCurrencyModal').style.display = 'none';
            });
        }
        
        // إغلاق عند النقر خارج المودال
        window.addEventListener('click', (e) => {
            const addModal = document.getElementById('addCurrencyModal');
            const changeModal = document.getElementById('changeCurrencyModal');
            
            if (addModal && e.target === addModal) {
                addModal.style.display = 'none';
            }
            
            if (changeModal && e.target === changeModal) {
                changeModal.style.display = 'none';
            }
        });
    }
    
    openCurrencyModal(type) {
        const modal = document.getElementById('changeCurrencyModal');
        const title = document.getElementById('changeCurrencyTitle');
        const list = document.getElementById('changeCurrencyList');
        
        if (!modal || !title || !list) return;
        
        // تحديث العنوان
        title.textContent = type === 'from' ? 'اختر العملة المصدر' : 'اختر العملة الهدف';
        
        // ملء القائمة
        list.innerHTML = '';
        
        CONFIG.SUPPORTED_CURRENCIES.forEach(currencyCode => {
            if (!this.currentRates?.rates[currencyCode]) return;
            
            const currencyOption = document.createElement('div');
            currencyOption.className = 'currency-option';
            currencyOption.dataset.currency = currencyCode;
            
            const imageUrl = CONFIG.CONVERTER_IMAGES[currencyCode] || 
                            CONFIG.FALLBACK_IMAGES[currencyCode];
            
            const currencyName = CONFIG.CURRENCY_NAMES[currencyCode]?.ar || currencyCode;
            const rate = this.currentRates.rates[currencyCode];
            
            currencyOption.innerHTML = `
                <img src="${imageUrl}" alt="${currencyCode}" 
                     onerror="this.src='${CONFIG.FALLBACK_IMAGES[currencyCode] || 'https://via.placeholder.com/32x24/cccccc/666666?text=' + currencyCode}'">
                <span>${currencyCode} - ${currencyName}</span>
                <span class="currency-rate">${rate.toFixed(4)}</span>
            `;
            
            currencyOption.addEventListener('click', () => {
                if (type === 'from') {
                    this.fromCurrency = currencyCode;
                } else {
                    this.toCurrency = currencyCode;
                }
                
                this.updateConverter();
                modal.style.display = 'none';
            });
            
            list.appendChild(currencyOption);
        });
        
        modal.style.display = 'flex';
    }
    
    // ========== الأزرار ==========
    setupButtons() {
        // زر إضافة عملة
        const addCurrencyBtn = document.getElementById('addCurrencyBtn');
        if (addCurrencyBtn) {
            addCurrencyBtn.addEventListener('click', () => {
                this.showAvailableCurrencies();
            });
        }
    }
    
    showAvailableCurrencies() {
        const modal = document.getElementById('addCurrencyModal');
        const list = document.getElementById('availableCurrenciesList');
        
        if (!modal || !list || !this.currentRates) return;
        
        list.innerHTML = '';
        
        // عرض العملات غير المعروضة حالياً
        CONFIG.SUPPORTED_CURRENCIES.forEach(currencyCode => {
            if (this.displayedCurrencies.includes(currencyCode) || currencyCode === 'USD') return;
            
            if (this.currentRates.rates[currencyCode]) {
                const currencyOption = document.createElement('div');
                currencyOption.className = 'currency-option';
                currencyOption.dataset.currency = currencyCode;
                
                const imageUrl = CONFIG.RATES_IMAGES[currencyCode] || 
                                CONFIG.FALLBACK_IMAGES[currencyCode];
                
                const currencyName = CONFIG.CURRENCY_NAMES[currencyCode]?.ar || currencyCode;
                const rate = this.currentRates.rates[currencyCode];
                
                currencyOption.innerHTML = `
                    <img src="${imageUrl}" alt="${currencyCode}"
                         onerror="this.src='${CONFIG.FALLBACK_IMAGES[currencyCode] || 'https://via.placeholder.com/32x24/cccccc/666666?text=' + currencyCode}'">
                    <span>${currencyCode} - ${currencyName}</span>
                    <span class="currency-rate">${rate.toFixed(4)}</span>
                    <button class="add-btn-small">+ إضافة</button>
                `;
                
                const addBtn = currencyOption.querySelector('.add-btn-small');
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.addCurrencyToDisplay(currencyCode);
                    modal.style.display = 'none';
                });
                
                list.appendChild(currencyOption);
            }
        });
        
        modal.style.display = 'flex';
    }
    
    addCurrencyToDisplay(currencyCode) {
        if (!this.displayedCurrencies.includes(currencyCode)) {
            this.displayedCurrencies.push(currencyCode);
            this.updateRatesPage();
            localStorage.setItem('displayedCurrencies', JSON.stringify(this.displayedCurrencies));
        }
    }
    
    // ========== التحديث التلقائي ==========
    startAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(async () => {
            console.log('🔄 تحديث تلقائي للأسعار...');
            await this.loadInitialRates();
        }, CONFIG.UPDATE_INTERVAL);
    }
    
    // ========== التحميل/الحفظ ==========
    loadPreferences() {
        // تحميل الثيم
        const savedTheme = localStorage.getItem('currencypro-theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
            document.querySelector(`.theme-option[data-theme="${savedTheme}"]`)?.classList.add('active');
        }
        
        // تحميل العملات المعروضة
        const savedCurrencies = localStorage.getItem('displayedCurrencies');
        if (savedCurrencies) {
            this.displayedCurrencies = JSON.parse(savedCurrencies);
        }
    }
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    const app = new CurrencyApp();
    app.init();
});

// إضافة CSS إضافي
const style = document.createElement('style');
style.textContent = `
    .rate-item {
        cursor: pointer;
        transition: transform 0.2s;
    }
    
    .rate-item:hover {
        transform: translateX(5px);
        background-color: #f8f9fa;
    }
    
    .currency-option {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .currency-option:hover {
        background: #f5f5f5;
    }
    
    .currency-option img {
        width: 32px;
        height: 24px;
        margin-right: 12px;
        border-radius: 3px;
        object-fit: cover;
    }
    
    .currency-rate {
        margin-left: auto;
        font-weight: bold;
        color: #27ae60;
        margin-right: 12px;
    }
    
    .add-btn-small {
        background: #3498db;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .add-btn-small:hover {
        background: #2980b9;
    }
    
    [data-theme="dark"] {
        background: #1a1a1a;
        color: #ffffff;
    }
    
    [data-theme="dark"] .container {
        background: #2d2d2d;
    }
    
    .swap-icon-btn {
        cursor: pointer;
        transition: transform 0.3s;
    }
    
    .swap-icon-btn:hover {
        transform: rotate(180deg);
    }
`;
document.head.appendChild(style);
