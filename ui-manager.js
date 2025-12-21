// ui-manager.js - إدارة واجهة المستخدم
class UIManager {
    constructor() {
        this.storage = new StorageManager();
        this.api = new CurrencyAPI();
        this.currentRates = null;
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.loadState();
        this.setupEventListeners();
        this.applyTheme();
        console.log('✅ تم تهيئة واجهة المستخدم');
    }
    
    cacheElements() {
        // الصفحات
        this.ratesPage = document.getElementById('ratesPage');
        this.convertPage = document.getElementById('convertPage');
        this.settingsPage = document.getElementById('settingsPage');
        
        // العناصر الرئيسية
        this.ratesList = document.getElementById('ratesList');
        this.fromAmount = document.getElementById('fromAmount');
        this.toAmount = document.getElementById('toAmount');
        this.fromCurrencyCode = document.getElementById('fromCurrencyCode');
        this.toCurrencyCode = document.getElementById('toCurrencyCode');
        this.rateText = document.getElementById('rateText');
        this.lastUpdateTime = document.getElementById('lastUpdateTime');
        this.lastUpdateStatus = document.getElementById('lastUpdateStatus');
        
        // الأزرار
        this.addCurrencyBtn = document.getElementById('addCurrencyBtn');
        this.changeFromCurrencyBtn = document.getElementById('changeFromCurrencyBtn');
        this.changeToCurrencyBtn = document.getElementById('changeToCurrencyBtn');
        this.swapCurrenciesBtn = document.getElementById('swapCurrencies');
        
        // النماذج
        this.addCurrencyModal = document.getElementById('addCurrencyModal');
        this.changeCurrencyModal = document.getElementById('changeCurrencyModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.closeChangeModalBtn = document.getElementById('closeChangeModalBtn');
        
        // التنقل
        this.navItems = document.querySelectorAll('.nav-item');
        
        // الثيمات
        this.themeOptions = document.querySelectorAll('.theme-option');
    }
    
    loadState() {
        const data = this.storage.load();
        if (!data) return;
        
        // تحميل الأسعار
        this.currentRates = data.exchangeRates;
        
        // تحديث العروض
        this.updateRatesDisplay();
        this.updateConverterDisplay();
        this.updateLastUpdateDisplay();
    }
    
    setupEventListeners() {
        // التنقل
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.closest('.nav-item'));
            });
        });
        
        // إضافة عملة
        this.addCurrencyBtn.addEventListener('click', () => {
            this.showAddCurrencyModal();
        });
        
        // تغيير العملات
        this.changeFromCurrencyBtn.addEventListener('click', () => {
            this.showChangeCurrencyModal('from');
        });
        
        this.changeToCurrencyBtn.addEventListener('click', () => {
            this.showChangeCurrencyModal('to');
        });
        
        // تبديل العملات
        this.swapCurrenciesBtn.addEventListener('click', () => {
            this.swapCurrencies();
        });
        
        // إدخال المبلغ
        this.fromAmount.addEventListener('input', (e) => {
            this.handleAmountInput(e);
        });
        
        // إغلاق النماذج
        this.closeModalBtn.addEventListener('click', () => {
            this.addCurrencyModal.classList.remove('active');
        });
        
        this.closeChangeModalBtn.addEventListener('click', () => {
            this.changeCurrencyModal.classList.remove('active');
        });
        
        // إغلاق النماذج بالضغط خارجها
        this.addCurrencyModal.addEventListener('click', (e) => {
            if (e.target === this.addCurrencyModal) {
                this.addCurrencyModal.classList.remove('active');
            }
        });
        
        this.changeCurrencyModal.addEventListener('click', (e) => {
            if (e.target === this.changeCurrencyModal) {
                this.changeCurrencyModal.classList.remove('active');
            }
        });
        
        // تغيير الثيم
        this.themeOptions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeTheme(e.target.dataset.theme);
            });
        });
        
        // تفويض الأحداث للعناصر الديناميكية
        document.addEventListener('click', (e) => {
            this.handleDynamicEvents(e);
        });
    }
    
    handleNavigation(navItem) {
        if (!navItem) return;
        
        // تحديث التنقل النشط
        this.navItems.forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');
        
        // إظهار الصفحة المختارة
        const pageId = navItem.dataset.page;
        [this.ratesPage, this.convertPage, this.settingsPage].forEach(page => {
            page.classList.remove('active');
        });
        
        if (pageId === 'ratesPage') this.ratesPage.classList.add('active');
        else if (pageId === 'convertPage') this.convertPage.classList.add('active');
        else if (pageId === 'settingsPage') this.settingsPage.classList.add('active');
    }
    
    updateRatesDisplay() {
        if (!this.ratesList) return;
        
        const data = this.storage.load();
        if (!data || !data.trackedCurrencies) return;
        
        this.ratesList.innerHTML = '';
        
        data.trackedCurrencies.forEach(currencyCode => {
            const currency = CONFIG.ALL_CURRENCIES.find(c => c.code === currencyCode);
            if (!currency) return;
            
            const rateItem = Utils.createCurrencyElement(currency, 'rates');
            
            // تحديث السعر إذا كان متوفراً
            if (this.currentRates && this.currentRates.rates && this.currentRates.rates[currencyCode]) {
                const rate = this.currentRates.rates[currencyCode];
                const rateDisplay = rateItem.querySelector('.rate-display-line');
                if (rateDisplay) {
                    rateDisplay.textContent = `1 USD = ${Utils.formatNumber(rate)} ${currencyCode}`;
                }
            }
            
            this.ratesList.appendChild(rateItem);
        });
    }
    
    updateConverterDisplay() {
        const data = this.storage.load();
        if (!data) return;
        
        // تحديث رموز العملات
        if (this.fromCurrencyCode) this.fromCurrencyCode.textContent = data.fromCurrency;
        if (this.toCurrencyCode) this.toCurrencyCode.textContent = data.toCurrency;
        
        // تحديث الصور
        this.updateCurrencyImages();
        
        // تحديث المبالغ
        if (this.fromAmount) this.fromAmount.value = data.amount || 100;
        
        // حساب التحويل إذا كانت الأسعار متوفرة
        if (this.currentRates && this.currentRates.rates) {
            const convertedAmount = this.api.convertAmount(
                data.amount || 100,
                data.fromCurrency,
                data.toCurrency,
                this.currentRates
            );
            
            if (this.toAmount) this.toAmount.value = Utils.formatNumber(convertedAmount, 2);
            
            // تحديث عرض السعر
            const exchangeRate = this.api.getExchangeRate(
                data.fromCurrency,
                data.toCurrency,
                this.currentRates
            );
            
            if (this.rateText) {
                this.rateText.textContent = 
                    `1 ${data.fromCurrency} = ${Utils.formatNumber(exchangeRate)} ${data.toCurrency}`;
            }
        }
    }
    
    updateCurrencyImages() {
        const data = this.storage.load();
        if (!data) return;
        
        // تحديث صور المحول
        const fromFlagImg = document.getElementById('fromFlagImg');
        const toFlagImg = document.getElementById('toFlagImg');
        
        if (fromFlagImg) {
            fromFlagImg.src = Utils.getImageUrl(data.fromCurrency, 'converter');
            fromFlagImg.onerror = function() {
                this.src = CONFIG.IMAGE_BASE_URL + '101-currency-usd.png';
            };
        }
        
        if (toFlagImg) {
            toFlagImg.src = Utils.getImageUrl(data.toCurrency, 'converter');
            toFlagImg.onerror = function() {
                this.src = CONFIG.IMAGE_BASE_URL + '101-currency-usd.png';
            };
        }
    }
    
    updateLastUpdateDisplay() {
        const data = this.storage.load();
        if (!data || !data.lastUpdate || !this.lastUpdateTime || !this.lastUpdateStatus) return;
        
        const updateTime = new Date(data.lastUpdate);
        this.lastUpdateTime.textContent = Utils.formatTime(updateTime);
        this.lastUpdateStatus.textContent = Utils.getTimeAgo(updateTime);
    }
    
    showAddCurrencyModal() {
        if (!this.addCurrencyModal) return;
        
        const list = document.getElementById('availableCurrenciesList');
        if (!list) return;
        
        list.innerHTML = '';
        
        const data = this.storage.load();
        const tracked = data?.trackedCurrencies || CONFIG.DEFAULT_TRACKED;
        
        // العملات غير المضافة
        const availableCurrencies = CONFIG.ALL_CURRENCIES.filter(currency => 
            !tracked.includes(currency.code)
        );
        
        if (availableCurrencies.length === 0) {
            list.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                    All currencies are already added
                </div>
            `;
        } else {
            availableCurrencies.forEach(currency => {
                const option = this.createCurrencyModalOption(currency, 'add');
                list.appendChild(option);
            });
        }
        
        this.addCurrencyModal.classList.add('active');
    }
    
    showChangeCurrencyModal(type) {
        if (!this.changeCurrencyModal) return;
        
        const title = document.getElementById('changeCurrencyTitle');
        const list = document.getElementById('changeCurrencyList');
        
        if (!title || !list) return;
        
        // تعيين النوع (from أو to)
        this.changingCurrency = type;
        title.textContent = type === 'from' ? 'Select From Currency' : 'Select To Currency';
        
        list.innerHTML = '';
        
        const data = this.storage.load();
        const currentCurrency = type === 'from' ? data.fromCurrency : data.toCurrency;
        
        // جميع العملات المتاحة
        CONFIG.ALL_CURRENCIES.forEach(currency => {
            const isSelected = currency.code === currentCurrency;
            const option = this.createCurrencyModalOption(currency, 'change', isSelected);
            list.appendChild(option);
        });
        
        this.changeCurrencyModal.classList.add('active');
    }
    
    createCurrencyModalOption(currency, type, isSelected = false) {
        const option = document.createElement('div');
        option.className = `currency-option ${isSelected ? 'selected' : ''}`;
        option.dataset.currency = currency.code;
        
        const imageUrl = Utils.getImageUrl(currency.code, 'rates');
        
        if (type === 'add') {
            option.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <img src="${imageUrl}" 
                         alt="${currency.code}" 
                         style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
                         onerror="this.src='${CONFIG.IMAGE_BASE_URL}101-currency-usd.png'">
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">${currency.code}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${currency.name}</div>
                    </div>
                </div>
                <button class="action-btn" style="border-color: var(--primary-color); color: var(--primary-color);" 
                        data-currency="${currency.code}">
                    <i class="fas fa-plus"></i>
                </button>
            `;
        } else {
            option.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <img src="${imageUrl}" 
                         alt="${currency.code}" 
                         style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
                         onerror="this.src='${CONFIG.IMAGE_BASE_URL}101-currency-usd.png'">
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">${currency.code}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${currency.name}</div>
                    </div>
                </div>
                ${isSelected ? '<i class="fas fa-check" style="color: var(--primary-color);"></i>' : ''}
            `;
        }
        
        return option;
    }
    
    handleAmountInput(e) {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        const amount = parseFloat(value) || 0;
        
        const data = this.storage.load();
        if (!data) return;
        
        data.amount = amount;
        this.storage.save(data);
        this.updateConverterDisplay();
    }
    
    swapCurrencies() {
        const data = this.storage.load();
        if (!data) return;
        
        const temp = data.fromCurrency;
        data.fromCurrency = data.toCurrency;
        data.toCurrency = temp;
        
        this.storage.save(data);
        this.updateConverterDisplay();
        Utils.showNotification('Currencies swapped', 'success');
    }
    
    changeTheme(theme) {
        const data = this.storage.load();
        if (!data) return;
        
        data.theme = theme;
        this.storage.save(data);
        this.applyTheme();
    }
    
    applyTheme() {
        const data = this.storage.load();
        const theme = data?.theme || CONFIG.DEFAULT_SETTINGS.theme;
        
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // تحديث أزرار الثيم
        this.themeOptions?.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
    }
    
    handleDynamicEvents(e) {
        // حذف عملة
        if (e.target.closest('.remove-btn')) {
            const button = e.target.closest('.remove-btn');
            const currencyCode = button.dataset.currency;
            this.removeCurrency(currencyCode);
        }
        
        // إضافة عملة من النافذة المنبثقة
        if (e.target.closest('.currency-option') && e.target.closest('#availableCurrenciesList')) {
            const option = e.target.closest('.currency-option');
            const button = option.querySelector('button');
            if (button) {
                const currencyCode = button.dataset.currency;
                this.addCurrency(currencyCode);
                this.addCurrencyModal.classList.remove('active');
            }
        }
        
        // اختيار عملة في نافذة التغيير
        if (e.target.closest('.currency-option') && e.target.closest('#changeCurrencyList')) {
            const option = e.target.closest('.currency-option');
            const currencyCode = option.dataset.currency;
            
            this.selectCurrency(currencyCode);
            this.changeCurrencyModal.classList.remove('active');
        }
    }
    
    addCurrency(currencyCode) {
        const data = this.storage.load();
        if (!data) return;
        
        if (!data.trackedCurrencies.includes(currencyCode)) {
            data.trackedCurrencies.push(currencyCode);
            this.storage.save(data);
            this.updateRatesDisplay();
            Utils.showNotification(`${currencyCode} added successfully`, 'success');
        }
    }
    
    removeCurrency(currencyCode) {
        const data = this.storage.load();
        if (!data) return;
        
        const index = data.trackedCurrencies.indexOf(currencyCode);
        if (index > -1) {
            data.trackedCurrencies.splice(index, 1);
            this.storage.save(data);
            this.updateRatesDisplay();
            Utils.showNotification(`${currencyCode} removed`, 'info');
        }
    }
    
    selectCurrency(currencyCode) {
        const data = this.storage.load();
        if (!data || !this.changingCurrency) return;
        
        if (this.changingCurrency === 'from') {
            data.fromCurrency = currencyCode;
        } else if (this.changingCurrency === 'to') {
            data.toCurrency = currencyCode;
        }
        
        this.storage.save(data);
        this.updateConverterDisplay();
        Utils.showNotification(`Currency changed to ${currencyCode}`, 'success');
    }
    
    // تحديث الأسعار من API
    async updateExchangeRates() {
        try {
            console.log('🔄 تحديث أسعار الصرف...');
            Utils.showNotification('Updating exchange rates...', 'info');
            
            const ratesData = await this.api.getAllRatesInOneRequest();
            
            // حفظ الأسعار الجديدة
            this.currentRates = ratesData;
            this.storage.updateRates(ratesData.rates, ratesData.timestamp);
            
            // تحديث الواجهة
            this.updateRatesDisplay();
            this.updateConverterDisplay();
            this.updateLastUpdateDisplay();
            
            Utils.showNotification(`Rates updated (${ratesData.source})`, 'success');
            
            return ratesData.success;
            
        } catch (error) {
            console.error('❌ فشل تحديث الأسعار:', error);
            Utils.showNotification('Failed to update rates', 'error');
            return false;
        }
    }
    
    // بدء التحديث التلقائي
    startAutoUpdate() {
        const settings = this.storage.getSettings();
        
        if (settings.autoUpdate !== false) {
            setInterval(() => {
                if (this.storage.shouldUpdate()) {
                    this.updateExchangeRates();
                }
            }, CONFIG.UPDATE_INTERVAL);
            
            console.log('⏰ تم تفعيل التحديث التلقائي كل ساعة');
        }
    }
}
