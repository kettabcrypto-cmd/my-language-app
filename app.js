class CurrencyApp {
    constructor() {
        this.api = new CurrencyAPI();
        this.currentRates = null;
        this.activePage = 'ratesPage';
        this.displayedCurrencies = ['EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR', 'CAD', 'AUD'];
    }
    
    async init() {
        console.log('🚀 بدء تطبيق CurrencyPro');
        this.setupNavigation();
        await this.loadRates();
        this.startAutoUpdate();
    }
    
    async loadRates() {
        try {
            this.currentRates = await this.api.getRealTimeRates();
            this.updateRatesPage();
        } catch (error) {
            console.error('❌ خطأ في تحميل الأسعار:', error);
            this.currentRates = this.api.getFallbackRates();
            this.updateRatesPage();
        }
    }
    
    // ========== صفحة الأسعار كبطاقات ==========
    updateRatesPage() {
        const ratesList = document.getElementById('ratesList');
        if (!ratesList || !this.currentRates) return;
        
        ratesList.innerHTML = '';
        
        this.displayedCurrencies.forEach(currencyCode => {
            const rate = this.currentRates.rates[currencyCode];
            if (rate) {
                const rateCard = this.createRateCard(currencyCode, rate);
                ratesList.appendChild(rateCard);
            }
        });
    }
    
    createRateCard(currencyCode, rate) {
        const card = document.createElement('div');
        card.className = 'rate-card';
        
        // الحصول على الصورة
        const imageUrl = CONFIG.RATES_IMAGES[currencyCode];
        const currencyName = CONFIG.CURRENCY_NAMES[currencyCode]?.ar || currencyCode;
        
        // تنسيق البطاقة
        card.innerHTML = `
            <div class="card-header">
                <img src="${imageUrl}" alt="${currencyCode}" class="card-currency-icon">
                <div class="card-currency-info">
                    <h3 class="card-currency-code">${currencyCode}</h3>
                    <p class="card-currency-name">${currencyName}</p>
                </div>
            </div>
            <div class="card-body">
                <div class="card-rate">
                    <span class="card-rate-value">${rate.toFixed(4)}</span>
                    <span class="card-rate-label">لكل دولار أمريكي</span>
                </div>
            </div>
            <div class="card-footer">
                <small>آخر تحديث: ${new Date().toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'})}</small>
            </div>
        `;
        
        // حدث النقر للبطاقة
        card.addEventListener('click', () => {
            this.selectCurrencyForConverter(currencyCode);
        });
        
        return card;
    }
    
    selectCurrencyForConverter(currencyCode) {
        this.toCurrency = currencyCode;
        this.updateConverter();
        this.switchPage('convertPage');
    }
    
    // ========== إعداد التنقل ==========
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = item.getAttribute('data-page');
                this.switchPage(targetPage);
                
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                this.activePage = targetPage;
            });
        });
    }
    
    switchPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) targetPage.classList.add('active');
    }
    
    // ========== المحول ==========
    updateConverter() {
        if (!this.currentRates) return;
        
        // تحديث الأعلام في المحول
        const fromFlag = document.getElementById('fromFlagImg');
        const toFlag = document.getElementById('toFlagImg');
        
        if (fromFlag) {
            fromFlag.src = CONFIG.CONVERTER_IMAGES[this.fromCurrency || 'USD'];
            fromFlag.alt = this.fromCurrency || 'USD';
        }
        
        if (toFlag) {
            toFlag.src = CONFIG.CONVERTER_IMAGES[this.toCurrency || 'EUR'];
            toFlag.alt = this.toCurrency || 'EUR';
        }
        
        // تحديث الرموز
        document.getElementById('fromCurrencyCode').textContent = this.fromCurrency || 'USD';
        document.getElementById('toCurrencyCode').textContent = this.toCurrency || 'EUR';
        
        // تحديث سعر الصرف
        this.updateExchangeRate();
    }
    
    updateExchangeRate() {
        const rateText = document.getElementById('rateText');
        if (!rateText || !this.currentRates) return;
        
        const fromRate = this.currentRates.rates[this.fromCurrency || 'USD'] || 1;
        const toRate = this.currentRates.rates[this.toCurrency || 'EUR'] || 1;
        
        if (fromRate && toRate) {
            const exchangeRate = toRate / fromRate;
            rateText.textContent = `1 ${this.fromCurrency || 'USD'} = ${exchangeRate.toFixed(4)} ${this.toCurrency || 'EUR'}`;
        }
    }
    
    // ========== التحديث التلقائي ==========
    startAutoUpdate() {
        setInterval(() => {
            this.loadRates();
        }, CONFIG.UPDATE_INTERVAL);
    }
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    const app = new CurrencyApp();
    app.init();
});

// إضافة CSS للبطاقات
const cardStyles = document.createElement('style');
cardStyles.textContent = `
    .rate-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        margin: 10px 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        border: 1px solid #e0e0e0;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .rate-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        border-color: #3498db;
    }
    
    .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
    }
    
    .card-currency-icon {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        margin-right: 12px;
        object-fit: contain;
        background: #f8f9fa;
        padding: 5px;
    }
    
    .card-currency-info {
        flex: 1;
    }
    
    .card-currency-code {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
        color: #2c3e50;
    }
    
    .card-currency-name {
        margin: 2px 0 0;
        font-size: 14px;
        color: #7f8c8d;
    }
    
    .card-body {
        text-align: center;
        padding: 10px 0;
    }
    
    .card-rate {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .card-rate-value {
        font-size: 28px;
        font-weight: bold;
        color: #27ae60;
        line-height: 1.2;
    }
    
    .card-rate-label {
        font-size: 12px;
        color: #95a5a6;
        margin-top: 4px;
    }
    
    .card-footer {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #eee;
        text-align: center;
    }
    
    .card-footer small {
        font-size: 11px;
        color: #bdc3c7;
    }
    
    /* تحسين قائمة الأسعار */
    #ratesList {
        padding: 15px;
    }
    
    /* تحسين العناوين */
    .page-title {
        text-align: center;
        margin: 20px 0;
        color: #2c3e50;
        font-size: 24px;
    }
    
    .section-title {
        font-size: 18px;
        color: #34495e;
        margin: 15px 0;
        padding-left: 15px;
    }
`;
document.head.appendChild(cardStyles);
