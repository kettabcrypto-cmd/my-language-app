// Main application logic with auto-refresh

class CurrencyConverterApp {
    constructor() {
        this.api = currencyAPI;
        this.utils = Utils;
        this.notificationTimeout = null;
        this.initializeApp();
    }

    // تهيئة التطبيق
    async initializeApp() {
        try {
            // تطبيق الثيم واللغة
            this.utils.applyTheme(appState.theme);
            this.utils.applyLanguage(appState.language);
            
            // تحميل أسعار الصرف
            await this.loadExchangeRates();
            
            // تحديث الواجهة
            this.updateRatesDisplay();
            this.updateConverterDisplay();
            this.updateLastUpdateDisplay();
            
            // إعداد المستمعين للأحداث
            this.setupEventListeners();
            
            // بدء التحديث التلقائي
            this.api.startAutoRefresh();
            
            // حفظ النسخة للنافذة للوصول من API
            window.appInstance = this;
            
            console.log('Currency Converter App initialized successfully');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to initialize app. Using cached data.');
            
            // استخدام البيانات المخزنة في حالة الفشل
            if (!appState.exchangeRates) {
                appState.exchangeRates = this.api.getDefaultRates();
                this.updateRatesDisplay();
                this.updateConverterDisplay();
            }
        }
    }

    // تحميل أسعار الصرف
    async loadExchangeRates() {
        try {
            const rates = await this.api.getAllRatesFromUSD();
            appState.exchangeRates = rates;
            this.utils.saveState();
            
            // تحديث عرض وقت التحديث
            this.updateLastUpdateDisplay();
            
        } catch (error) {
            console.error('Error loading exchange rates:', error);
            
            // استخدام البيانات المخزنة
            const cachedData = this.api.getCachedRates();
            if (cachedData) {
                appState.exchangeRates = cachedData.rates;
                console.log('Using cached rates due to error');
            } else {
                appState.exchangeRates = this.api.getDefaultRates();
                console.log('Using default rates due to error');
            }
            
            this.showError(`Using offline data: ${error.message}`);
        }
    }

    // تحديث عرض وقت التحديث الأخير
    updateLastUpdateDisplay() {
        const updateInfo = this.api.getUpdateInfo();
        
        // يمكنك إضافة هذا في صفحة الإعدادات
        const updateElement = document.getElementById('lastUpdateInfo');
        if (updateElement) {
            const lastUpdate = updateInfo.lastUpdate ? 
                updateInfo.lastUpdate.toLocaleTimeString() : 'Never';
            const nextUpdate = updateInfo.nextUpdate ? 
                this.api.formatUpdateTime(updateInfo.nextUpdate) : 'Unknown';
            
            updateElement.innerHTML = `
                <div style="margin-top: 10px; font-size: 12px; color: var(--text-secondary);">
                    <div>Last update: ${lastUpdate}</div>
                    <div>Next update: ${nextUpdate}</div>
                    <div>API calls today: ${updateInfo.apiCallsToday}/24</div>
                </div>
            `;
        }
    }

    // تحديث عرض أسعار العملات
    updateRatesDisplay() {
        const ratesList = document.getElementById('ratesList');
        if (!ratesList) return;
        
        ratesList.innerHTML = '';
        
        if (!appState.exchangeRates) {
            ratesList.innerHTML = `
                <div class="rate-item">
                    <div class="rate-info">
                        <div class="currency-name">Loading rates...</div>
                    </div>
                </div>
            `;
            return;
        }
        
        appState.trackedCurrencies.forEach(currencyCode => {
            const rate = appState.exchangeRates[currencyCode];
            if (rate === undefined) return;
            
            const currency = this.utils.getCurrencyInfo(currencyCode);
            const rateItem = document.createElement('div');
            rateItem.className = 'rate-item';
            rateItem.innerHTML = `
                <div class="currency-image-container">
                    ${currencyCode}
                </div>
                <div class="rate-info">
                    <div class="rate-header">
                        <div class="currency-name">${currency.code}</div>
                        <div class="rate-value">${this.utils.formatNumber(rate, 4)}</div>
                    </div>
                    <div class="currency-pair">${currency.code} / USD</div>
                </div>
                <div class="rate-actions">
                    <button class="action-btn remove-btn" data-currency="${currency.code}" title="Remove">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            // إضافة صورة العملة
            const imgContainer = rateItem.querySelector('.currency-image-container');
            const img = this.utils.createCurrencyImageElement(currencyCode);
            imgContainer.innerHTML = '';
            imgContainer.appendChild(img);
            
            ratesList.appendChild(rateItem);
        });
        
        // تحديث عرض وقت التحديث
        this.updateLastUpdateDisplay();
    }

    // تحديث عرض المحول
    updateConverterDisplay() {
        if (!appState.exchangeRates) return;
        
        const fromRate = appState.exchangeRates[appState.fromCurrency];
        const toRate = appState.exchangeRates[appState.toCurrency];
        
        if (!fromRate || !toRate) return;
        
        // حساب السعر
        const exchangeRate = toRate / fromRate;
        const convertedAmount = appState.amount * exchangeRate;
        
        // تحديث القيم
        document.getElementById('toAmount').value = this.utils.formatNumber(convertedAmount, 2);
        document.getElementById('toCurrencyCode').textContent = appState.toCurrency;
        document.getElementById('fromCurrencyCode').textContent = appState.fromCurrency;
        
        // تحديث معدل السوق
        document.getElementById('midMarketRate').textContent = 
            `${appState.fromCurrency} = ${exchangeRate.toFixed(4)} ${appState.toCurrency} at the mid-market rate`;
        
        // تحديث صور العملات
        this.updateCurrencyImages();
    }

    // تحديث صور العملات
    updateCurrencyImages() {
        // صورة العملة المصدر
        const fromImageContainer = document.getElementById('fromCurrencyImage');
        fromImageContainer.innerHTML = '';
        const fromImg = this.utils.createCurrencyImageElement(appState.fromCurrency);
        fromImageContainer.appendChild(fromImg);
        
        // صورة العملة الهدف
        const toImageContainer = document.getElementById('toCurrencyImage');
        toImageContainer.innerHTML = '';
        const toImg = this.utils.createCurrencyImageElement(appState.toCurrency);
        toImageContainer.appendChild(toImg);
    }

    // إعداد المستمعين للأحداث
    setupEventListeners() {
        // التنقل بين الصفحات
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPage(item.dataset.page);
            });
        });
        
        // تغيير اللغة
        document.getElementById('languageSelector').addEventListener('change', (e) => {
            this.utils.applyLanguage(e.target.value);
        });
        
        // تبديل العملات
        document.getElementById('swapCurrencies').addEventListener('click', () => {
            this.swapCurrencies();
        });
        
        // تغيير عملة المصدر
        document.getElementById('changeFromCurrencyBtn').addEventListener('click', () => {
            this.showChangeCurrencyModal('from');
        });
        
        // تغيير عملة الوجهة
        document.getElementById('changeToCurrencyBtn').addEventListener('click', () => {
            this.showChangeCurrencyModal('to');
        });
        
        // إدخال المبلغ
        document.getElementById('fromAmount').addEventListener('input', (e) => {
            this.handleAmountInput(e.target.value);
        });
        
        // زر إضافة عملة
        document.getElementById('addCurrencyBtn').addEventListener('click', () => {
            this.showAddCurrencyModal();
        });
        
        // إغلاق النوافذ
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.hideModal('addCurrencyModal');
        });
        
        document.getElementById('closeChangeModalBtn').addEventListener('click', () => {
            this.hideModal('changeCurrencyModal');
        });
        
        // إغلاق النوافذ عند النقر خارجها
        document.getElementById('addCurrencyModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal('addCurrencyModal');
            }
        });
        
        document.getElementById('changeCurrencyModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal('changeCurrencyModal');
            }
        });
        
        // تغيير الثيم
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.utils.applyTheme(e.target.dataset.theme);
            });
        });
        
        // تحديث يدوي (إضافة زر جديد في الإعدادات)
        this.setupRefreshButton();
        
        // التعامل مع الأحداث بالتفويض
        document.addEventListener('click', (e) => {
            this.handleDelegatedEvents(e);
        });
    }

    // التعامل مع الأحداث بالتفويض
    handleDelegatedEvents(e) {
        // إزالة عملة من القائمة
        if (e.target.closest('.remove-btn')) {
            const btn = e.target.closest('.remove-btn');
            const currencyCode = btn.dataset.currency;
            this.removeCurrency(currencyCode);
        }
        
        // إضافة عملة من النافذة المنبثقة
        if (e.target.closest('.add-currency-modal-btn')) {
            const btn = e.target.closest('.add-currency-modal-btn');
            const currencyCode = btn.dataset.currency;
            this.addCurrency(currencyCode);
        }
        
        // اختيار عملة في نافذة التغيير
        if (e.target.closest('.currency-option') && 
            e.target.closest('#changeCurrencyList')) {
            const option = e.target.closest('.currency-option');
            const currencyCode = option.dataset.currency;
            this.selectCurrencyForConversion(currencyCode);
        }
    }

    // إضافة زر التحديث في الإعدادات
    setupRefreshButton() {
        const settingsGroup = document.querySelector('#settingsPage .settings-section');
        
        if (settingsGroup) {
            const refreshSection = document.createElement('div');
            refreshSection.className = 'settings-group';
            refreshSection.innerHTML = `
                <div class="group-title">Data & Updates</div>
                <div class="setting-item">
                    <div class="setting-info">
                        <h3>Refresh Rates</h3>
                        <p>Manually update exchange rates</p>
                        <div id="lastUpdateInfo"></div>
                    </div>
                    <button class="theme-option" id="manualRefreshBtn" style="background-color: var(--primary-color); color: white;">
                        <i class="fas fa-sync-alt"></i> Refresh Now
                    </button>
                </div>
            `;
            
            settingsGroup.appendChild(refreshSection);
            
            // إضافة مستمع الحدث
            document.getElementById('manualRefreshBtn').addEventListener('click', async () => {
                const btn = document.getElementById('manualRefreshBtn');
                const originalText = btn.innerHTML;
                
                try {
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
                    btn.disabled = true;
                    
                    await this.api.refreshRates();
                    this.showNotification('Rates updated successfully!');
                    
                } catch (error) {
                    this.showError(`Update failed: ${error.message}`);
                } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
        }
    }

    // التبديل بين الصفحات
    switchPage(pageId) {
        // تحديث التبويب النشط
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        
        document.querySelector(`.nav-item[data-page="${pageId}"]`).classList.add('active');
        
        // إظهار الصفحة المحددة
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    // تبديل العملات
    swapCurrencies() {
        [appState.fromCurrency, appState.toCurrency] = [appState.toCurrency, appState.fromCurrency];
        this.utils.saveState();
        this.updateConverterDisplay();
    }

    // معالجة إدخال المبلغ
    handleAmountInput(value) {
        const sanitized = this.utils.sanitizeAmountInput(value);
        const amount = parseFloat(sanitized) || 0;
        
        appState.amount = amount;
        this.utils.saveState();
        this.updateConverterDisplay();
    }

    // إظهار نافذة إضافة عملة
    showAddCurrencyModal() {
        const modal = document.getElementById('addCurrencyModal');
        const list = document.getElementById('availableCurrenciesList');
        
        list.innerHTML = '';
        
        // إظهار العملات غير المضافة
        CONFIG.DEFAULT_CURRENCIES.forEach(currency => {
            if (appState.trackedCurrencies.includes(currency.code)) {
                return;
            }
            
            const option = document.createElement('div');
            option.className = 'currency-option';
            option.dataset.currency = currency.code;
            option.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="width: 40px; height: 40px; flex-shrink: 0; background-color: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px;">
                        ${currency.code}
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">${currency.code}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${currency.name}</div>
                    </div>
                </div>
                <button class="action-btn add-currency-modal-btn" data-currency="${currency.code}" style="border-color: var(--primary-color); color: var(--primary-color);">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            
            list.appendChild(option);
        });
        
        if (list.children.length === 0) {
            list.innerHTML = `<div style="text-align: center; padding: 30px 20px; color: var(--text-secondary);">All currencies are already added</div>`;
        }
        
        modal.classList.add('active');
    }

    // إظهار نافذة تغيير العملة
    showChangeCurrencyModal(type) {
        appState.changingCurrency = type;
        const modal = document.getElementById('changeCurrencyModal');
        const title = document.getElementById('changeCurrencyTitle');
        const list = document.getElementById('changeCurrencyList');
        
        title.textContent = type === 'from' ? 'Select From Currency' : 'Select To Currency';
        list.innerHTML = '';
        
        // إظهار جميع العملات المتاحة
        CONFIG.DEFAULT_CURRENCIES.forEach(currency => {
            const rate = appState.exchangeRates ? appState.exchangeRates[currency.code] : 1;
            const isSelected = (type === 'from' && currency.code === appState.fromCurrency) || 
                              (type === 'to' && currency.code === appState.toCurrency);
            
            const option = document.createElement('div');
            option.className = `currency-option ${isSelected ? 'selected' : ''}`;
            option.dataset.currency = currency.code;
            option.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="width: 40px; height: 40px; flex-shrink: 0; background-color: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px;">
                        ${currency.code}
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">${currency.code}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${currency.name} - ${rate ? rate.toFixed(4) : 'N/A'}</div>
                    </div>
                </div>
                ${isSelected ? '<i class="fas fa-check" style="color: var(--primary-color);"></i>' : ''}
            `;
            
            list.appendChild(option);
        });
        
        modal.classList.add('active');
    }

    // إخفاء النافذة المنبثقة
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // إضافة عملة للمتابعة
    addCurrency(currencyCode) {
        if (!appState.trackedCurrencies.includes(currencyCode)) {
            appState.trackedCurrencies.push(currencyCode);
            this.utils.saveState();
            this.updateRatesDisplay();
            this.showAddCurrencyModal(); // تحديث النافذة
            this.showNotification(`${currencyCode} added to tracked currencies`);
        }
    }

    // إزالة عملة من المتابعة
    removeCurrency(currencyCode) {
        const index = appState.trackedCurrencies.indexOf(currencyCode);
        if (index > -1) {
            appState.trackedCurrencies.splice(index, 1);
            this.utils.saveState();
            this.updateRatesDisplay();
            this.showNotification(`${currencyCode} removed from tracked currencies`);
        }
    }

    // اختيار عملة للتحويل
    selectCurrencyForConversion(currencyCode) {
        if (appState.changingCurrency === 'from') {
            appState.fromCurrency = currencyCode;
        } else if (appState.changingCurrency === 'to') {
            appState.toCurrency = currencyCode;
        }
        
        this.utils.saveState();
        this.updateConverterDisplay();
        this.hideModal('changeCurrencyModal');
    }

    // عرض إشعار
    showNotification(message, duration = 3000) {
        // إزالة الإشعار السابق إن وجد
        const existingNotification = document.querySelector('.app-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // إنشاء إشعار جديد
        const notification = document.createElement('div');
        notification.className = 'app-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--primary-color);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                font-size: 14px;
                font-weight: 500;
                max-width: 90%;
                text-align: center;
                animation: slideDown 0.3s ease;
            ">
                <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إخفاء الإشعار بعد المدة المحددة
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    // عرض خطأ
    showError(message, duration = 5000) {
        this.showNotification(`<i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> ${message}`, duration);
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new CurrencyConverterApp();
});
