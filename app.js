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
            lastUpdate: localStorage.getItem('lastRatesUpdate') || null,
            nextUpdate: localStorage.getItem('nextRatesUpdate') || null
        };
        
        this.refreshInterval = 60 * 60 * 1000; // ساعة واحدة
        this.refreshTimer = null;
        
        this.initialize();
    }

    async initialize() {
        // تحميل الأسعار أول مرة
        await this.loadRates();
        
        // تحديث الواجهة
        this.updateRatesDisplay();
        this.updateConverterDisplay();
        this.updateLastUpdateDisplay();
        
        // إعداد الأحداث
        this.setupEventListeners();
        
        // بدء التحديث التلقائي
        this.startAutoRefresh();
        
        console.log('CurrencyApp initialized with auto-refresh every hour');
    }

    async loadRates() {
        try {
            console.log('📊 Loading exchange rates from API...');
            const rates = await currencyAPI.getAllExchangeRates();
            
            // تحديث الحالة
            this.state.rates = rates;
            this.state.lastUpdate = new Date().toISOString();
            
            // حساب وقت التحديث التالي
            const nextUpdateTime = Date.now() + this.refreshInterval;
            this.state.nextUpdate = new Date(nextUpdateTime).toISOString();
            
            // حفظ في localStorage
            localStorage.setItem('lastRatesUpdate', this.state.lastUpdate);
            localStorage.setItem('nextRatesUpdate', this.state.nextUpdate);
            
            console.log('✅ Rates loaded successfully');
            console.log('📅 Next auto-refresh at:', new Date(nextUpdateTime).toLocaleTimeString());
            
            return rates;
            
        } catch (error) {
            console.error('❌ Failed to load rates:', error);
            
            // استخدام الأسعار المخزنة
            const cached = currencyAPI.getCachedRates();
            if (cached) {
                this.state.rates = cached.rates;
                console.log('🔄 Using cached rates');
            } else {
                console.log('⚠️ Using default rates');
            }
            
            return this.state.rates;
        }
    }

    startAutoRefresh() {
        // إلغاء المؤقت السابق إذا كان موجوداً
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            console.log('🔄 Restarting auto-refresh timer');
        }
        
        // حساب الوقت المتبقي حتى التحديث التالي
        let timeUntilNextRefresh = this.refreshInterval;
        
        if (this.state.nextUpdate) {
            const nextUpdateTime = new Date(this.state.nextUpdate).getTime();
            const now = Date.now();
            timeUntilNextRefresh = Math.max(nextUpdateTime - now, 1000); // ثانية واحدة على الأقل
        }
        
        // تعيين المؤقت
        this.refreshTimer = setTimeout(async () => {
            console.log('🔄 Auto-refresh triggered');
            
            try {
                await this.loadRates();
                this.updateRatesDisplay();
                this.updateConverterDisplay();
                this.updateLastUpdateDisplay();
                
                // إظهار إشعار صامت
                this.showAutoUpdateNotification();
                
            } catch (error) {
                console.error('❌ Auto-refresh failed:', error);
            }
            
            // إعادة تعيين المؤقت للتحديث التالي
            this.startAutoRefresh();
            
        }, timeUntilNextRefresh);
        
        console.log(`⏰ Next auto-refresh in ${Math.round(timeUntilNextRefresh / 60000)} minutes`);
    }

    updateLastUpdateDisplay() {
        const lastUpdateElement = document.getElementById('lastUpdateTime');
        const nextUpdateElement = document.getElementById('nextUpdateTime');
        
        if (lastUpdateElement && this.state.lastUpdate) {
            const lastUpdateDate = new Date(this.state.lastUpdate);
            const now = new Date();
            const diffMinutes = Math.floor((now - lastUpdateDate) / (1000 * 60));
            
            let timeText;
            if (diffMinutes < 1) {
                timeText = 'Just now';
            } else if (diffMinutes < 60) {
                timeText = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
            } else {
                const diffHours = Math.floor(diffMinutes / 60);
                timeText = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            }
            
            lastUpdateElement.innerHTML = `
                ${lastUpdateDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}<br>
                <small style="color: var(--text-secondary);">${timeText}</small>
            `;
        }
        
        if (nextUpdateElement && this.state.nextUpdate) {
            const nextUpdateDate = new Date(this.state.nextUpdate);
            const now = new Date();
            const diffMinutes = Math.floor((nextUpdateDate - now) / (1000 * 60));
            
            let timeText;
            if (diffMinutes < 1) {
                timeText = 'Any moment';
            } else if (diffMinutes < 60) {
                timeText = `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
            } else {
                const diffHours = Math.floor(diffMinutes / 60);
                const remainingMinutes = diffMinutes % 60;
                timeText = `in ${diffHours}h ${remainingMinutes}m`;
            }
            
            nextUpdateElement.innerHTML = `
                ${nextUpdateDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}<br>
                <small style="color: var(--text-secondary);">${timeText}</small>
            `;
        }
    }

    showAutoUpdateNotification() {
        // إشعار صامت في الكونسول فقط
        console.log('🔄 Rates auto-updated successfully at', new Date().toLocaleTimeString());
        
        // يمكنك إضافة إشعار بسيط إذا أردت
        const notification = document.createElement('div');
        notification.className = 'auto-update-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Rates updated</span>
            <small>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 10px;
            background: var(--primary-color);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: fadeInOut 3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 3 ثوان
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(10px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // باقي الدوال كما هي...
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
        
        const exchangeRate = toRate / fromRate;
        const convertedAmount = (this.state.amount * exchangeRate).toFixed(2);
        
        document.getElementById('toAmount').value = convertedAmount;
        document.getElementById('toCurrencyCode').textContent = this.state.toCurrency;
        document.getElementById('fromCurrencyCode').textContent = this.state.fromCurrency;
        
        document.getElementById('midMarketRate').textContent = 
            `${this.state.fromCurrency} = ${exchangeRate.toFixed(4)} ${this.state.toCurrency} at the mid-market rate`;
        
        this.updateCurrencyImages();
    }

    updateCurrencyImages() {
        // تحديث صور العملات
        const fromImage = document.getElementById('fromCurrencyImage');
        const toImage = document.getElementById('toCurrencyImage');
        
        if (fromImage) {
            const fromUrl = currencyAPI.getFlagImage(this.state.fromCurrency);
            fromImage.innerHTML = `
                <img src="${fromUrl}" 
                     alt="${this.state.fromCurrency}"
                     onerror="this.parentElement.innerHTML='<div class=\"image-placeholder\">${this.state.fromCurrency}</div>'">
            `;
        }
        
        if (toImage) {
            const toUrl = currencyAPI.getFlagImage(this.state.toCurrency);
            toImage.innerHTML = `
                <img src="${toUrl}" 
                     alt="${this.state.toCurrency}"
                     onerror="this.parentElement.innerHTML='<div class=\"image-placeholder\">${this.state.toCurrency}</div>'">
            `;
        }
    }

    setupEventListeners() {
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
        
        // إضافة/إزالة العملات
        document.addEventListener('click', (e) => {
            // إزالة عملة
            if (e.target.closest('.remove-btn')) {
                const btn = e.target.closest('.remove-btn');
                const currencyCode = btn.dataset.currency;
                this.removeCurrency(currencyCode);
            }
            
            // إضافة عملة
            if (e.target.closest('.add-currency-modal-btn')) {
                const btn = e.target.closest('.add-currency-modal-btn');
                const currencyCode = btn.dataset.currency;
                this.addCurrency(currencyCode);
            }
        });
    }

    removeCurrency(currencyCode) {
        const index = this.state.trackedCurrencies.indexOf(currencyCode);
        if (index > -1) {
            this.state.trackedCurrencies.splice(index, 1);
            localStorage.setItem('trackedCurrencies', JSON.stringify(this.state.trackedCurrencies));
            this.updateRatesDisplay();
            console.log(`🗑️ Removed ${currencyCode} from tracked currencies`);
        }
    }

    addCurrency(currencyCode) {
        if (!this.state.trackedCurrencies.includes(currencyCode)) {
            this.state.trackedCurrencies.push(currencyCode);
            localStorage.setItem('trackedCurrencies', JSON.stringify(this.state.trackedCurrencies));
            this.updateRatesDisplay();
            console.log(`➕ Added ${currencyCode} to tracked currencies`);
        }
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting CurrencyPro App...');
    window.currencyApp = new CurrencyApp();
});
