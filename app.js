class CurrencyApp {
    constructor() {
        this.api = new CurrencyAPI();
        this.storage = new StorageManager();
        this.currentRates = null;
        this.displayedCurrencies = this.storage.load()?.trackedCurrencies || 
                                  ['EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR', 'CAD', 'AUD'];
        this.fromCurrency = 'USD';
        this.toCurrency = 'EUR';
        this.selectedCurrencyType = null; // 'from' or 'to'
    }
    
    async init() {
        this.showLoader();
        this.setupEventListeners();
        await this.loadRates();
        this.hideLoader();
    }
    
    setupEventListeners() {
        // إدارة العملات
        document.getElementById('addCurrencyBtn').addEventListener('click', () => this.showManageCurrenciesModal());
        document.getElementById('manageCurrenciesBtn').addEventListener('click', () => this.showManageCurrenciesModal());
        
        // المحول
        document.getElementById('changeFromCurrencyBtn').addEventListener('click', () => this.openCurrencyModal('from'));
        document.getElementById('changeToCurrencyBtn').addEventListener('click', () => this.openCurrencyModal('to'));
        document.getElementById('swapCurrencies').addEventListener('click', () => this.swapCurrencies());
        
        // تحديث
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshRates());
        
        // المودالات
        document.getElementById('closeManageModal').addEventListener('click', () => this.closeModal('manageCurrenciesModal'));
        document.getElementById('closeCurrencyModal').addEventListener('click', () => this.closeModal('currencySelectModal'));
        
        // البحث
        document.getElementById('currencySearch').addEventListener('input', (e) => this.filterCurrencies(e.target.value));
    }
    
    async loadRates() {
        try {
            this.currentRates = await this.api.getRealTimeRates();
            this.updateAllDisplays();
            this.storage.updateRates(this.currentRates.rates, new Date().toISOString());
        } catch (error) {
            console.error('Failed to load rates:', error);
            this.currentRates = this.api.getFallbackRates();
            this.updateAllDisplays();
        }
    }
    
    updateAllDisplays() {
        this.updateRatesPage();
        this.updateConverter();
        this.updateSettings();
    }
    
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
        
        // تحديث وقت آخر تحديث
        const lastUpdate = document.getElementById('ratesLastUpdate');
        if (lastUpdate) {
            lastUpdate.innerHTML = `<i class="fas fa-clock"></i> Updated: ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }
    }
    
    createRateItem(currencyCode, rate) {
        const item = document.createElement('div');
        item.className = 'rate-item';
        item.dataset.currency = currencyCode;
        
        // الحصول على اسم الصورة من CONFIG
        const imageUrl = CONFIG.RATES_IMAGES[currencyCode] || 
                         `https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/assets/101-currency-usd.png`;
        
        const currencyName = CONFIG.CURRENCY_NAMES[currencyCode]?.en || currencyCode;
        
        item.innerHTML = `
            <div class="rate-item-left">
                <img src="${imageUrl}" alt="${currencyCode}" class="currency-image"
                     onerror="this.onerror=null; this.src='https://flagcdn.com/w40/${this.getCountryCode(currencyCode)}.png'">
                <div class="rate-info">
                    <div class="currency-symbol">${currencyCode}</div>
                    <div class="currency-name">${currencyName}</div>
                </div>
            </div>
            <div class="rate-item-right">
                <div class="rate-value">${rate.toFixed(4)}</div>
                <button class="remove-currency-btn" data-currency="${currencyCode}" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // حدث إزالة العملة
        const removeBtn = item.querySelector('.remove-currency-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeCurrency(currencyCode);
        });
        
        // حدث النقر للتحويل
        item.addEventListener('click', () => {
            this.toCurrency = currencyCode;
            this.updateConverter();
            this.switchPage('convertPage');
        });
        
        return item;
    }
    
    removeCurrency(currencyCode) {
        this.displayedCurrencies = this.displayedCurrencies.filter(c => c !== currencyCode);
        this.updateRatesPage();
        
        // تحديث التخزين
        const storedData = this.storage.load();
        if (storedData) {
            storedData.trackedCurrencies = this.displayedCurrencies;
            this.storage.save(storedData);
        }
        
        this.showNotification(`Removed ${currencyCode} from list`, 'success');
    }
    
    // إدارة العملات
    showManageCurrenciesModal() {
        this.populateManageModal();
        document.getElementById('manageCurrenciesModal').style.display = 'flex';
    }
    
    populateManageModal() {
        const displayedList = document.getElementById('displayedCurrenciesList');
        const availableList = document.getElementById('availableCurrenciesList');
        
        displayedList.innerHTML = '';
        availableList.innerHTML = '';
        
        // العملات المعروضة
        this.displayedCurrencies.forEach(code => {
            const item = this.createManageCurrencyItem(code, true);
            displayedList.appendChild(item);
        });
        
        // العملات المتاحة
        const allCurrencies = Object.keys(CONFIG.CURRENCY_NAMES);
        const availableCurrencies = allCurrencies.filter(code => 
            code !== 'USD' && !this.displayedCurrencies.includes(code)
        );
        
        availableCurrencies.forEach(code => {
            const item = this.createManageCurrencyItem(code, false);
            availableList.appendChild(item);
        });
    }
    
    createManageCurrencyItem(currencyCode, isDisplayed) {
        const item = document.createElement('div');
        item.className = 'currency-manage-item';
        item.dataset.currency = currencyCode;
        
        const imageUrl = CONFIG.RATES_IMAGES[currencyCode];
        const currencyName = CONFIG.CURRENCY_NAMES[currencyCode]?.en || currencyCode;
        
        item.innerHTML = `
            <img src="${imageUrl}" alt="${currencyCode}" class="manage-currency-image">
            <div class="manage-currency-info">
                <div class="manage-currency-code">${currencyCode}</div>
                <div class="manage-currency-name">${currencyName}</div>
            </div>
            <button class="manage-action-btn">
                <i class="fas fa-${isDisplayed ? 'minus' : 'plus'}"></i>
            </button>
        `;
        
        const actionBtn = item.querySelector('.manage-action-btn');
        actionBtn.addEventListener('click', () => {
            if (isDisplayed) {
                this.removeCurrency(currencyCode);
            } else {
                this.addCurrency(currencyCode);
            }
            this.populateManageModal();
        });
        
        return item;
    }
    
    addCurrency(currencyCode) {
        if (!this.displayedCurrencies.includes(currencyCode)) {
            this.displayedCurrencies.push(currencyCode);
            this.updateRatesPage();
            
            // تحديث التخزين
            const storedData = this.storage.load();
            if (storedData) {
                storedData.trackedCurrencies = this.displayedCurrencies;
                this.storage.save(storedData);
            }
            
            this.showNotification(`Added ${currencyCode} to list`, 'success');
        }
    }
    
    // باقي الدوال تبقى كما هي مع تعديلات بسيطة...
    
    // أدوات مساعدة
    showLoader() {
        document.getElementById('loaderOverlay').style.display = 'flex';
    }
    
    hideLoader() {
        document.getElementById('loaderOverlay').style.display = 'none';
    }
    
    showNotification(message, type = 'info') {
        // تنفيذ الإشعار
        console.log(`${type}: ${message}`);
    }
    
    getCountryCode(currencyCode) {
        const map = {
            'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp',
            'AED': 'ae', 'SAR': 'sa', 'QAR': 'qa', 'CAD': 'ca',
            'AUD': 'au', 'CHF': 'ch', 'CNY': 'cn', 'TRY': 'tr'
        };
        return map[currencyCode] || 'un';
    }
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    if (typeof CONFIG === 'undefined' || typeof CurrencyAPI === 'undefined') {
        alert('Configuration error. Please check console.');
        return;
    }
    
    try {
        const app = new CurrencyApp();
        app.init();
    } catch (error) {
        console.error('App initialization failed:', error);
    }
});
