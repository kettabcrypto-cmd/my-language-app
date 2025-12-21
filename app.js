class CurrencyApp {
    constructor() {
        this.api = new CurrencyAPI();
        this.currentRates = null;
        this.updateInterval = null;
        this.lastUpdateTime = null;
    }
    
    async init() {
        console.log('🚀 بدء تطبيق CurrencyPro مع TwelveData API');
        
        // إخفاء رسالة التحميل الافتراضية
        this.hideDefaultLoading();
        
        try {
            // تحميل الأسعار الأولية
            await this.loadRates();
            
            // تفعيل التحديث التلقائي كل 30 دقيقة
            this.startAutoUpdate(30 * 60 * 1000); // 30 دقيقة
            
            // إعداد الأحداث
            this.setupEvents();
            
            // تحديث الوقت
            this.updateLastUpdateTime();
            
            console.log('✅ التطبيق جاهز');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة التطبيق:', error);
            this.showError('خطأ في تحميل الأسعار الحية. استخدام بيانات افتراضية.');
            
            // استخدام البيانات الافتراضية
            this.currentRates = this.api.getFallbackRates();
            this.renderRates();
        }
    }
    
    hideDefaultLoading() {
        const loadingElement = document.querySelector('.rate-display-line');
        if (loadingElement && loadingElement.textContent.includes('Loading')) {
            loadingElement.textContent = 'جاري التحميل...';
        }
    }
    
    async loadRates() {
        console.log('🔄 جاري تحديث الأسعار...');
        
        try {
            this.currentRates = await this.api.getRealTimeRates();
            
            if (this.currentRates && this.currentRates.rates) {
                this.renderRates();
                this.updateLastUpdateTime();
                this.updateConverterRates();
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ فشل تحميل الأسعار:', error);
            this.showError('فشل الاتصال بخدمة الأسعار');
            throw error;
        }
    }
    
    renderRates() {
        const ratesList = document.getElementById('ratesList');
        
        if (!ratesList) {
            console.error('❌ عنصر قائمة الأسعار غير موجود');
            return;
        }
        
        // مسح المحتوى القديم
        ratesList.innerHTML = '';
        
        if (!this.currentRates || !this.currentRates.rates) {
            ratesList.innerHTML = `
                <div class="rate-item">
                    <div class="rate-info">
                        <div class="rate-display-line">لا توجد بيانات</div>
                    </div>
                </div>
            `;
            return;
        }
        
        const { rates } = this.currentRates;
        const currenciesToShow = ['EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR', 'CAD', 'AUD'];
        
        currenciesToShow.forEach(currency => {
            if (rates[currency] && currency !== 'USD') {
                const rateItem = this.createRateItem(currency, rates[currency]);
                ratesList.appendChild(rateItem);
            }
        });
    }
    
    createRateItem(currencyCode, rate) {
        const rateItem = document.createElement('div');
        rateItem.className = 'rate-item';
        
        const flagUrl = CONFIG.CURRENCY_FLAGS && CONFIG.CURRENCY_FLAGS[currencyCode] 
            ? CONFIG.CURRENCY_FLAGS[currencyCode]
            : `https://flagcdn.com/w40/${this.getCountryCode(currencyCode)}.png`;
        
        rateItem.innerHTML = `
            <img src="${flagUrl}" alt="${currencyCode}" class="currency-image" 
                 onerror="this.src='https://via.placeholder.com/40x30/cccccc/666666?text=${currencyCode}'">
            <div class="rate-info">
                <div class="rate-header">
                    <div class="currency-name">${currencyCode}</div>
                </div>
                <div class="rate-display-line">
                    <span class="rate-value">${rate.toFixed(4)}</span>
                    <span class="rate-label">${this.getCurrencyName(currencyCode)}</span>
                </div>
            </div>
        `;
        
        return rateItem;
    }
    
    getCountryCode(currencyCode) {
        const countryMap = {
            'USD': 'us',
            'EUR': 'eu',
            'GBP': 'gb',
            'JPY': 'jp',
            'AED': 'ae',
            'SAR': 'sa',
            'QAR': 'qa',
            'CAD': 'ca',
            'AUD': 'au',
            'CHF': 'ch',
            'CNY': 'cn'
        };
        return countryMap[currencyCode] || 'un';
    }
    
    getCurrencyName(code) {
        const names = {
            'EUR': 'يورو',
            'GBP': 'جنيه إسترليني',
            'JPY': 'ين ياباني',
            'AED': 'درهم إماراتي',
            'SAR': 'ريال سعودي',
            'QAR': 'ريال قطري',
            'CAD': 'دولار كندي',
            'AUD': 'دولار أسترالي',
            'CHF': 'فرنك سويسري',
            'CNY': 'يوان صيني'
        };
        return names[code] || '';
    }
    
    updateLastUpdateTime() {
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        const lastUpdateStatus = document.getElementById('lastUpdateStatus');
        
        if (lastUpdateTime) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            lastUpdateTime.textContent = timeStr;
        }
        
        if (lastUpdateStatus) {
            lastUpdateStatus.textContent = this.currentRates && this.currentRates.success 
                ? 'محدث الآن' 
                : 'بيانات افتراضية';
            lastUpdateStatus.style.color = this.currentRates && this.currentRates.success 
                ? '#28a745' 
                : '#ffc107';
        }
    }
    
    updateConverterRates() {
        if (!this.currentRates || !this.currentRates.rates) return;
        
        const rates = this.currentRates.rates;
        const fromCurrency = document.getElementById('fromCurrencyCode').textContent;
        const toCurrency = document.getElementById('toCurrencyCode').textContent;
        
        if (rates[fromCurrency] && rates[toCurrency]) {
            const exchangeRate = rates[toCurrency] / rates[fromCurrency];
            const rateText = document.getElementById('rateText');
            
            if (rateText) {
                rateText.textContent = `1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency}`;
            }
            
            // تحديث المبلغ المحول
            const fromAmount = document.getElementById('fromAmount');
            const toAmount = document.getElementById('toAmount');
            
            if (fromAmount && toAmount) {
                const amount = parseFloat(fromAmount.value) || 100;
                const converted = amount * exchangeRate;
                toAmount.value = converted.toFixed(2);
            }
        }
    }
    
    startAutoUpdate(interval = 30 * 60 * 1000) {
        // إيقاف أي تحديث سابق
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // تفعيل التحديث التلقائي
        this.updateInterval = setInterval(async () => {
            console.log('⏰ تحديث تلقائي للأسعار...');
            await this.loadRates();
        }, interval);
        
        console.log(`🔄 تفعيل التحديث التلقائي كل ${interval / 60000} دقيقة`);
    }
    
    setupEvents() {
        // زر تحديث يدوي (إذا أردت إضافته)
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadRates());
        }
        
        // زر إضافة عملة
        const addCurrencyBtn = document.getElementById('addCurrencyBtn');
        if (addCurrencyBtn) {
            addCurrencyBtn.addEventListener('click', () => {
                this.showAvailableCurrencies();
            });
        }
        
        // زر تبديل العملات في المحول
        const swapBtn = document.getElementById('swapCurrencies');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                this.swapCurrencies();
            });
        }
        
        // تحديث المحول عند تغيير المبلغ
        const fromAmount = document.getElementById('fromAmount');
        if (fromAmount) {
            fromAmount.addEventListener('input', () => {
                this.updateConverterRates();
            });
        }
    }
    
    swapCurrencies() {
        const fromCode = document.getElementById('fromCurrencyCode');
        const toCode = document.getElementById('toCurrencyCode');
        const fromFlag = document.getElementById('fromFlagImg');
        const toFlag = document.getElementById('toFlagImg');
        
        // تبديل الرموز
        const tempCode = fromCode.textContent;
        fromCode.textContent = toCode.textContent;
        toCode.textContent = tempCode;
        
        // تبديل الأعلام
        const tempFlag = fromFlag.src;
        fromFlag.src = toFlag.src;
        toFlag.src = tempFlag;
        
        // تحديث الأسعار
        this.updateConverterRates();
    }
    
    showAvailableCurrencies() {
        const modal = document.getElementById('addCurrencyModal');
        const currencyList = document.getElementById('availableCurrenciesList');
        
        if (!modal || !currencyList) return;
        
        // إظهار القائمة
        modal.style.display = 'flex';
        
        // ملء القائمة بالعملات المتاحة
        const availableCurrencies = Object.keys(this.currentRates?.rates || {});
        
        currencyList.innerHTML = availableCurrencies
            .filter(currency => currency !== 'USD')
            .map(currency => `
                <div class="currency-option" data-currency="${currency}">
                    <img src="https://flagcdn.com/w40/${this.getCountryCode(currency)}.png" alt="${currency}">
                    <span>${currency} - ${this.getCurrencyName(currency)}</span>
                    <span class="currency-rate">${this.currentRates.rates[currency].toFixed(4)}</span>
                </div>
            `).join('');
        
        // إغلاق المودال
        const closeBtn = document.getElementById('closeModalBtn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
    }
    
    showError(message) {
        console.error('⚠️ خطأ:', message);
        
        // إضافة رسالة خطأ في قائمة الأسعار
        const ratesList = document.getElementById('ratesList');
        if (ratesList) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.cssText = `
                background: #ffebee;
                color: #c62828;
                padding: 10px;
                margin: 10px;
                border-radius: 4px;
                border: 1px solid #ffcdd2;
                text-align: center;
            `;
            ratesList.appendChild(errorDiv);
        }
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const app = new CurrencyApp();
    app.init();
});

// إضافة CSS إضافي
const style = document.createElement('style');
style.textContent = `
    .rate-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        transition: background-color 0.2s;
    }
    
    .rate-item:hover {
        background-color: #f8f9fa;
    }
    
    .currency-image {
        width: 40px;
        height: 30px;
        border-radius: 4px;
        margin-right: 12px;
        object-fit: cover;
    }
    
    .rate-info {
        flex: 1;
    }
    
    .rate-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }
    
    .currency-name {
        font-weight: 600;
        font-size: 16px;
        color: #333;
    }
    
    .rate-display-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .rate-value {
        font-weight: bold;
        font-size: 18px;
        color: #2c3e50;
    }
    
    .rate-label {
        font-size: 14px;
        color: #7f8c8d;
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
    }
    
    .currency-rate {
        margin-left: auto;
        font-weight: bold;
        color: #27ae60;
    }
    
    .mid-market-rate p {
        font-size: 12px;
        color: #666;
        text-align: center;
        margin: 8px 0;
    }
`;
document.head.appendChild(style);
