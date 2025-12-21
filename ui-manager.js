// ui-manager.js
class UIManager {
    constructor() {
        this.screens = {
            converter: document.getElementById('converter-screen'),
            rates: document.getElementById('rates-screen'),
            settings: document.getElementById('settings-screen')
        };
        
        this.initializeEventListeners();
        this.applyDarkMode();
    }

    // تهيئة مستمعي الأحداث
    initializeEventListeners() {
        // أزرار التنقل
        document.getElementById('settings-btn').addEventListener('click', () => this.showScreen('settings'));
        document.getElementById('rates-btn').addEventListener('click', () => this.showScreen('rates'));
        document.getElementById('convert-btn').addEventListener('click', () => this.performConversion());
        document.getElementById('converter-btn').addEventListener('click', () => this.showScreen('converter'));
        document.getElementById('settings-btn-2').addEventListener('click', () => this.showScreen('settings'));
        
        // أزرار العودة
        document.querySelectorAll('.back-button').forEach(button => {
            button.addEventListener('click', () => this.showScreen('converter'));
        });
        
        // تبديل العملات
        document.getElementById('swap-currencies').addEventListener('click', () => this.swapCurrencies());
        
        // تحديث التحويل عند تغيير المدخلات
        document.getElementById('from-amount').addEventListener('input', () => this.performConversion());
        document.getElementById('from-currency').addEventListener('change', () => this.performConversion());
        document.getElementById('to-currency').addEventListener('change', () => this.performConversion());
        
        // إعدادات المظهر
        document.getElementById('light-mode').addEventListener('click', () => this.setLightMode());
        document.getElementById('dark-mode').addEventListener('click', () => this.setDarkMode());
        
        // التحديث التلقائي
        document.getElementById('auto-update').addEventListener('change', (e) => {
            storage.setAutoUpdate(e.target.checked);
        });
    }

    // عرض شاشة معينة
    showScreen(screenName) {
        // إخفاء جميع الشاشات
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // إظهار الشاشة المطلوبة
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
        
        // إذا كانت شاشة الأسعار، نقوم بتحديث القائمة
        if (screenName === 'rates') {
            this.updateRatesList();
        }
        
        // إذا كانت شاشة الإعدادات، نقوم بتحديث المعلومات
        if (screenName === 'settings') {
            this.updateSettingsInfo();
        }
    }

    // تحديث قائمة أسعار العملات
    updateRatesList(ratesData) {
        const ratesList = document.getElementById('rates-list');
        const data = ratesData || storage.loadData();
        
        if (!data.rates || Object.keys(data.rates).length === 0) {
            ratesList.innerHTML = '<p class="no-rates">لا توجد بيانات للأسعار حالياً. جاري التحميل...</p>';
            return;
        }
        
        let html = '';
        const baseCurrency = data.baseCurrency || 'USD';
        
        // إضافة العملة الأساسية أولاً
        html += `
            <div class="rate-item">
                <div class="currency-code">${baseCurrency}</div>
                <div class="currency-rate">1 ${baseCurrency} = 1.0000 ${baseCurrency}</div>
            </div>
        `;
        
        // إضافة العملات الأخرى
        Object.keys(data.rates).forEach(currency => {
            if (currency !== baseCurrency && data.rates[currency]) {
                const rate = data.rates[currency].toFixed(4);
                html += `
                    <div class="rate-item">
                        <div class="currency-code">${currency}</div>
                        <div class="currency-rate">1 ${baseCurrency} = ${rate} ${currency}</div>
                    </div>
                `;
            }
        });
        
        ratesList.innerHTML = html;
        
        // تحديث وقت آخر تحديث
        document.getElementById('last-update-time').textContent = 
            new Date(data.lastUpdate * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.getElementById('last-update-status').textContent = storage.getLastUpdateTime();
    }

    // تحديث معلومات الإعدادات
    updateSettingsInfo() {
        const data = storage.loadData();
        
        // تحديث وقت آخر تحديث
        document.getElementById('update-time').textContent = 
            data.lastUpdate ? new Date(data.lastUpdate * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '10:46';
        
        document.getElementById('update-status').textContent = storage.getLastUpdateTime();
        
        // تحديث حالة التحديث التلقائي
        document.getElementById('auto-update').checked = data.autoUpdate;
        
        // تحديث وضع المظهر
        if (data.darkMode) {
            document.getElementById('dark-mode').classList.add('active');
            document.getElementById('light-mode').classList.remove('active');
        } else {
            document.getElementById('light-mode').classList.add('active');
            document.getElementById('dark-mode').classList.remove('active');
        }
    }

    // تنفيذ عملية التحويل
    performConversion() {
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;
        const amount = parseFloat(document.getElementById('from-amount').value) || 0;
        
        const data = storage.loadData();
        let convertedAmount = 0;
        
        if (data.rates && Object.keys(data.rates).length > 0) {
            convertedAmount = currencyAPI.convert(amount, fromCurrency, toCurrency, {
                base: data.baseCurrency,
                rates: data.rates
            });
        } else {
            // استخدام البيانات الافتراضية إذا لم تكن هناك بيانات
            const fallbackData = currencyAPI.getFallbackRates('USD');
            convertedAmount = currencyAPI.convert(amount, fromCurrency, toCurrency, {
                base: 'USD',
                rates: fallbackData.rates
            });
        }
        
        // تحديث المبلغ المحول
        document.getElementById('to-amount').value = convertedAmount.toFixed(2);
        
        // تحديث عرض سعر الصرف
        const exchangeRate = currencyAPI.getExchangeRate(fromCurrency, toCurrency, data.rates);
        document.getElementById('rate-display').textContent = 
            `1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency}`;
    }

    // تبديل العملات
    swapCurrencies() {
        const fromCurrency = document.getElementById('from-currency');
        const toCurrency = document.getElementById('to-currency');
        
        const tempCurrency = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = tempCurrency;
        
        // تنفيذ التحويل بعد التبديل
        this.performConversion();
    }

    // تطبيق الوضع الداكن
    applyDarkMode() {
        const data = storage.loadData();
        if (data.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // تعيين الوضع الفاتح
    setLightMode() {
        document.getElementById('light-mode').classList.add('active');
        document.getElementById('dark-mode').classList.remove('active');
        storage.setDarkMode(false);
        document.body.classList.remove('dark-mode');
    }

    // تعيين الوضع الداكن
    setDarkMode() {
        document.getElementById('dark-mode').classList.add('active');
        document.getElementById('light-mode').classList.remove('active');
        storage.setDarkMode(true);
        document.body.classList.add('dark-mode');
    }

    // عرض رسالة للمستخدم
    showMessage(text, type = 'info') {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }

    // عرض/إخفاء شاشة التحميل
    showLoading(show) {
        const loadingEl = document.getElementById('loading');
        loadingEl.style.display = show ? 'flex' : 'none';
    }
}

// تصدير الكلاس لاستخدامه في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
