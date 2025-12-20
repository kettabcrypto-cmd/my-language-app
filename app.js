// في ملف js/app.js
class CurrencyApp {
    constructor() {
        this.state = {
            theme: localStorage.getItem('theme') || 'light',
            language: localStorage.getItem('language') || 'en',
            trackedCurrencies: JSON.parse(localStorage.getItem('trackedCurrencies')) || ['USD', 'EUR', 'GBP', 'JPY', 'AED'],
            fromCurrency: 'USD',
            toCurrency: 'EUR',
            amount: 100,
            rates: null,
            lastUpdate: null
        };
        
        this.refreshTimer = null;
        this.initialize();
    }

    async initialize() {
        // تحميل الأسعار أول مرة
        await this.loadRates();
        
        // تحديث الواجهة
        this.updateRatesDisplay();
        this.updateConverterDisplay();
        
        // إعداد الأحداث
        this.setupEventListeners();
        
        // بدء التحديث التلقائي
        this.startAutoRefresh();
    }

    async loadRates() {
        try {
            console.log('Loading exchange rates...');
            const rates = await currencyAPI.getAllExchangeRates();
            this.state.rates = rates;
            this.state.lastUpdate = new Date().toISOString();
            
            // حفظ في localStorage
            localStorage.setItem('lastRatesUpdate', this.state.lastUpdate);
            
            console.log('Rates loaded successfully');
            return rates;
            
        } catch (error) {
            console.error('Failed to load rates:', error);
            // استخدام الأسعار المخزنة
            const cached = currencyAPI.getCachedRates();
            if (cached) {
                this.state.rates = cached.rates;
            }
            return this.state.rates;
        }
    }

    startAutoRefresh() {
        // إلغاء المؤقت السابق إذا كان موجوداً
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        
        // تعيين مؤقت للتحديث كل ساعة
        this.refreshTimer = setTimeout(async () => {
            console.log('Auto-refreshing rates...');
            await this.loadRates();
            this.updateRatesDisplay();
            this.updateConverterDisplay();
            this.showNotification('Rates updated automatically');
            
            // إعادة تعيين المؤقت
            this.startAutoRefresh();
            
        }, CONFIG.REFRESH_INTERVAL);
        
        console.log(`Next auto-refresh in ${CONFIG.REFRESH_INTERVAL / 60000} minutes`);
    }

    updateRatesDisplay() {
        const ratesList = document.getElementById('ratesList');
        if (!ratesList || !this.state.rates) return;
        
        ratesList.innerHTML = '';
        
        this.state.trackedCurrencies.forEach(currencyCode => {
            const rate = this.state.rates[currencyCode];
            if (!rate) return;
            
            const rateItem = this.createRateItem(currencyCode, rate);
            ratesList.appendChild(rateItem);
        });
    }

    createRateItem(currencyCode, rate) {
        const item = document.createElement('div');
        item.className = 'rate-item';
        
        // الحصول على رابط الصورة
        const imageUrl = currencyAPI.getFlagImage(currencyCode);
        
        item.innerHTML = `
            <div class="currency-image-container">
                <img src="${imageUrl}" 
                     alt="${currencyCode}" 
                     class="currency-image"
                     onerror="this.parentElement.innerHTML='<div class=\"image-placeholder\">${currencyCode}</div>'">
            </div>
            <div class="rate-info">
                <div class="rate-header">
                    <div class="currency-name">${currencyCode}</div>
                    <div class="rate-value">${rate.toFixed(4)}</div>
                </div>
                <div class="currency-pair">${currencyCode} / USD</div>
            </div>
            <div class="rate-actions">
                <button class="action-btn remove-btn" data-currency="${currencyCode}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        return item;
    }

    updateConverterDisplay() {
        if (!this.state.rates) return;
        
        const fromRate = this.state.rates[this.state.fromCurrency] || 1;
        const toRate = this.state.rates[this.state.toCurrency] || 1;
        
        if (!fromRate || !toRate) return;
        
        // حساب سعر التحويل
        const exchangeRate = toRate / fromRate;
        const convertedAmount = (this.state.amount * exchangeRate).toFixed(2);
        
        // تحديث القيم
        document.getElementById('toAmount').value = convertedAmount;
        document.getElementById('toCurrencyCode').textContent = this.state.toCurrency;
        document.getElementById('fromCurrencyCode').textContent = this.state.fromCurrency;
        
        // تحديث معدل السوق
        document.getElementById('midMarketRate').textContent = 
            `${this.state.fromCurrency} = ${exchangeRate.toFixed(4)} ${this.state.toCurrency} at the mid-market rate`;
        
        // تحديث الصور
        this.updateCurrencyImages();
    }

    updateCurrencyImages() {
        // صورة العملة المصدر
        const fromImage = document.getElementById('fromCurrencyImage');
        if (fromImage) {
            const fromUrl = currencyAPI.getFlagImage(this.state.fromCurrency);
            fromImage.innerHTML = `
                <img src="${fromUrl}" 
                     alt="${this.state.fromCurrency}"
                     onerror="this.parentElement.innerHTML='<div class=\"image-placeholder\">${this.state.fromCurrency}</div>'">
            `;
        }
        
        // صورة العملة الهدف
        const toImage = document.getElementById('toCurrencyImage');
        if (toImage) {
            const toUrl = currencyAPI.getFlagImage(this.state.toCurrency);
            toImage.innerHTML = `
                <img src="${toUrl}" 
                     alt="${this.state.toCurrency}"
                     onerror="this.parentElement.innerHTML='<div class=\"image-placeholder\">${this.state.toCurrency}</div>'">
            `;
        }
    }

    async manualRefresh() {
        try {
            const rates = await this.loadRates();
            this.updateRatesDisplay();
            this.updateConverterDisplay();
            this.showNotification('Rates updated successfully!');
            return rates;
        } catch (error) {
            this.showNotification('Failed to update rates', true);
            throw error;
        }
    }

    showNotification(message, isError = false) {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : 'success'}`;
        notification.innerHTML = `
            <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
        `;
        
        // إضافة الأنماط
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: ${isError ? '#f8d7da' : '#d4edda'};
            color: ${isError ? '#721c24' : '#155724'};
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 3 ثوان
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    setupEventListeners() {
        // تحديث يدوي
        const refreshBtn = document.getElementById('manualRefreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.manualRefresh());
        }
        
        // المبلغ المدخل
        document.getElementById('fromAmount').addEventListener('input', (e) => {
            this.state.amount = parseFloat(e.target.value) || 0;
            this.updateConverterDisplay();
        });
        
        // تبديل العملات
        document.getElementById('swapCurrencies').addEventListener('click', () => {
            [this.state.fromCurrency, this.state.toCurrency] = 
            [this.state.toCurrency, this.state.fromCurrency];
            this.updateConverterDisplay();
        });
        
        // إضافة المزيد من الأحداث...
    }
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CurrencyApp();
});
