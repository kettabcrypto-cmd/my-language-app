class CurrencyApp {
    constructor() {
        this.api = new CurrencyAPI();
        this.currentRates = null;
        this.updateInterval = null;
    }
    
    async init() {
        console.log('🚀 بدء تطبيق CurrencyPro مع TwelveData API');
        
        this.showLoading(true);
        
        try {
            // تحميل الأسعار الأولية
            await this.loadRates();
            
            // تفعيل التحديث التلقائي
            this.startAutoUpdate();
            
            // إعداد الأحداث
            this.setupEvents();
            
            this.showNotification('✅ تم تحديث الأسعار بنجاح', 'success');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة التطبيق:', error);
            this.showNotification('⚠️ استخدام بيانات افتراضية', 'warning');
            
            // استخدام البيانات الافتراضية
            this.currentRates = this.api.getFallbackRates();
            this.renderRates();
        } finally {
            this.showLoading(false);
        }
    }
    
    async loadRates() {
        console.log('🔄 جاري تحديث الأسعار...');
        
        try {
            this.currentRates = await this.api.getRealTimeRates();
            
            if (this.currentRates && this.currentRates.rates) {
                this.renderRates();
                this.updateLastUpdateTime();
            }
            
        } catch (error) {
            console.error('❌ فشل تحميل الأسعار:', error);
            throw error;
        }
    }
    
    renderRates() {
        const ratesContainer = document.querySelector('.currency-rates ul');
        
        if (!ratesContainer) {
            console.error('❌ عنصر قائمة الأسعار غير موجود');
            return;
        }
        
        ratesContainer.innerHTML = '';
        
        if (!this.currentRates || !this.currentRates.rates) {
            ratesContainer.innerHTML = '<li>لا توجد بيانات</li>';
            return;
        }
        
        const { rates } = this.currentRates;
        
        Object.entries(rates).forEach(([currency, rate]) => {
            // تخطي USD (لأنها الأساس)
            if (currency === 'USD') return;
            
            const li = document.createElement('li');
            li.className = 'currency-item';
            
            // أيقونة العلم (إذا موجودة في CONFIG)
            let flagHtml = '';
            if (CONFIG.CURRENCY_FLAGS && CONFIG.CURRENCY_FLAGS[currency]) {
                flagHtml = `<img src="${CONFIG.CURRENCY_FLAGS[currency]}" alt="${currency}" class="currency-flag">`;
            }
            
            li.innerHTML = `
                <div class="currency-info">
                    ${flagHtml}
                    <span class="currency-code">${currency}</span>
                    <span class="currency-name">${this.getCurrencyName(currency)}</span>
                </div>
                <div class="currency-rate">
                    <span class="rate-value">${rate.toFixed(4)}</span>
                    <span class="rate-label">لكل دولار</span>
                </div>
            `;
            
            ratesContainer.appendChild(li);
        });
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
        return names[code] || code;
    }
    
    updateLastUpdateTime() {
        const updateElement = document.getElementById('last-update');
        
        if (updateElement && this.currentRates) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('ar-SA');
            updateElement.textContent = `آخر تحديث: ${timeStr}`;
        }
    }
    
    startAutoUpdate() {
        // إيقاف أي تحديث سابق
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // تفعيل التحديث التلقائي
        this.updateInterval = setInterval(async () => {
            await this.loadRates();
        }, CONFIG.UPDATE_INTERVAL);
        
        console.log(`🔄 تفعيل التحديث التلقائي كل ${CONFIG.UPDATE_INTERVAL / 1000} ثانية`);
    }
    
    setupEvents() {
        // زر تحديث يدوي
        const refreshBtn = document.getElementById('refresh-rates');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadRates());
        }
        
        // زر إضافة عملة
        const addCurrencyBtn = document.querySelector('.add-currency');
        if (addCurrencyBtn) {
            addCurrencyBtn.addEventListener('click', () => this.showAddCurrencyModal());
        }
    }
    
    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
            loadingElement.textContent = 'جاري تحديث أسعار العملات...';
        }
    }
    
    showNotification(message, type = 'info') {
        console.log(`📢 ${message}`);
        
        // يمكنك إضافة واجهة إشعارات هنا
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = '#4caf50';
        } else if (type === 'warning') {
            notification.style.background = '#ff9800';
        } else if (type === 'error') {
            notification.style.background = '#f44336';
        } else {
            notification.style.background = '#2196f3';
        }
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 3 ثواني
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const app = new CurrencyApp();
    app.init();
});

// إضافة أنماط CSS بسيطة للرسوم المتحركة
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .currency-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-bottom: 1px solid #eee;
        transition: background 0.3s;
    }
    .currency-item:hover {
        background: #f5f5f5;
    }
    .currency-flag {
        width: 24px;
        height: 16px;
        margin-right: 10px;
        border-radius: 2px;
    }
    .currency-info {
        display: flex;
        align-items: center;
    }
    .currency-code {
        font-weight: bold;
        margin-right: 8px;
    }
    .currency-name {
        color: #666;
        font-size: 0.9em;
    }
    .rate-value {
        font-weight: bold;
        color: #2c3e50;
    }
    .rate-label {
        font-size: 0.8em;
        color: #7f8c8d;
        margin-left: 5px;
    }
`;
document.head.appendChild(style);
