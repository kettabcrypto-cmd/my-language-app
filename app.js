// ========== التطبيق الرئيسي ==========
class CurrencyApp {
    constructor() {
        this.api = new CurrencyAPI();
        this.currentRates = null;
        this.activePage = 'ratesPage';
        this.fromCurrency = 'USD';
        this.toCurrency = 'EUR';
        this.displayedCurrencies = ['EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR', 'CAD', 'AUD'];
    }
    
    async init() {
        console.log('🚀 بدء CurrencyApp...');
        
        // التحقق من وجود العناصر
        if (!this.checkElements()) {
            return;
        }
        
        // إخفاء رسالة التحميل
        this.hideLoadingMessage();
        
        // إعداد الأحداث
        this.setupNavigation();
        this.setupConverter();
        this.setupSettings();
        this.setupModals();
        
        // تحميل الأسعار
        await this.loadRates();
        
        console.log('✅ التطبيق جاهز');
    }
    
    checkElements() {
        const ratesList = document.getElementById('ratesList');
        if (!ratesList) {
            console.error('❌ العنصر #ratesList غير موجود في HTML');
            return false;
        }
        return true;
    }
    
    hideLoadingMessage() {
        const ratesList = document.getElementById('ratesList');
        if (ratesList) {
            ratesList.innerHTML = '';
        }
    }
    
    async loadRates() {
        console.log('📡 جلب الأسعار...');
        
        try {
            this.currentRates = await this.api.getRealTimeRates();
            
            if (this.currentRates && this.currentRates.rates) {
                this.updateRatesPage();
                this.updateConverter();
                this.updateSettings();
                console.log('✅ الأسعار محملة بنجاح');
                return true;
            } else {
                throw new Error('لا توجد بيانات في الاستجابة');
            }
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الأسعار:', error);
            this.showMessage('⚠️ استخدام بيانات افتراضية', 'warning');
            this.currentRates = this.api.getFallbackRates();
            this.updateRatesPage();
            return false;
        }
    }
    
    // ========== صفحة الأسعار ==========
    updateRatesPage() {
        const ratesList = document.getElementById('ratesList');
        if (!ratesList || !this.currentRates) {
            console.error('❌ لا يمكن تحديث الصفحة: ratesList أو currentRates غير موجود');
            return;
        }
        
        ratesList.innerHTML = '';
        
        this.displayedCurrencies.forEach(currencyCode => {
            const rate = this.currentRates.rates[currencyCode];
            if (rate) {
                const rateItem = this.createRateItem(currencyCode, rate);
                ratesList.appendChild(rateItem);
            }
        });
        
        console.log(`✅ تم عرض ${this.displayedCurrencies.length} عملة`);
    }
    
    createRateItem(currencyCode, rate) {
        const item = document.createElement('div');
        item.className = 'rate-item';
        item.dataset.currency = currencyCode;
        
        // اسم الصورة
        const imageFile = this.getCurrencyImageFile(currencyCode);
        const imageUrl = `https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/assets/${imageFile}`;
        
        // اسم العملة
        const currencyName = CONFIG.CURRENCY_NAMES?.[currencyCode]?.ar || currencyCode;
        
        item.innerHTML = `
            <img src="${imageUrl}" alt="${currencyCode}" class="currency-image"
                 onerror="this.src='https://flagcdn.com/w40/${this.getCountryCode(currencyCode)}.png'">
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
        
        // حدث النقر للانتقال للمحول
        item.addEventListener('click', () => {
            this.toCurrency = currencyCode;
            this.updateConverter();
            this.switchPage('convertPage');
        });
        
        return item;
    }
    
    getCurrencyImageFile(currencyCode) {
        const imageMap = {
            'USD': '101-currency-usd.png',
            'EUR': '100-currency-eurx.png',
            'GBP': '102-currency-gbpx.png',
            'JPY': '105-currency-jpyx.png',
            'AED': '118-currency-aed.png',
            'SAR': '116-currency-sarx.png',
            'QAR': '117-currency-qarx.png',
            'CAD': '101-currency-cadx.png',
            'AUD': '104-currency-audx.png',
            'CHF': '103-currency-chfx.png',
            'TRY': '109-currency-tryx.png',
            'CNY': '110-currency-cnyx.png',
            'BRL': '107-currency-brlx.png',
            'MXN': '108-currency-mxnx.png',
            'RUB': '112-currency-rubx.png',
            'KRW': '106-currency-krwx.png',
            'MYR': '111-currency-myrx.png',
            'MAD': '113-currency-madx.png',
            'EGP': '114-currency-egbx.png',
            'TND': '115-currency-tndx.png'
        };
        
        return imageMap[currencyCode] || '101-currency-usd.png';
    }
    
    getCountryCode(currencyCode) {
        const map = {
            'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp',
            'CHF': 'ch', 'CAD': 'ca', 'AUD': 'au', 'AED': 'ae',
            'SAR': 'sa', 'QAR': 'qa', 'TRY': 'tr', 'CNY': 'cn',
            'BRL': 'br', 'MXN': 'mx', 'ARS': 'ar', 'RUB': 'ru',
            'ZAR': 'za', 'KRW': 'kr', 'INR': 'in', 'HKD': 'hk',
            'MYR': 'my', 'MAD': 'ma', 'EGP': 'eg', 'TND': 'tn'
        };
        return map[currencyCode] || 'un';
    }
    
    // ========== التنقل ==========
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetPage = item.getAttribute('data-page');
                this.switchPage(targetPage);
                
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                this.activePage = targetPage;
            });
        });
        
        console.log('✅ التنقل معتمد');
    }
    
    switchPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
    
    // ========== المحول ==========
    setupConverter() {
        const swapBtn = document.getElementById('swapCurrencies');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                console.log('🔄 تبديل العملات');
                this.swapCurrencies();
            });
        }
        
        const changeFromBtn = document.getElementById('changeFromCurrencyBtn');
        const changeToBtn = document.getElementById('changeToCurrencyBtn');
        
        if (changeFromBtn) {
            changeFromBtn.addEventListener('click', () => this.openCurrencyModal('from'));
        }
        
        if (changeToBtn) {
            changeToBtn.addEventListener('click', () => this.openCurrencyModal('to'));
        }
        
        const fromAmount = document.getElementById('fromAmount');
        if (fromAmount) {
            fromAmount.addEventListener('input', () => this.updateConversion());
        }
        
        console.log('✅ المحول معتمد');
    }
    
    updateConverter() {
        if (!this.currentRates) return;
        
        this.updateCurrencyFlag('from', this.fromCurrency);
        this.updateCurrencyFlag('to', this.toCurrency);
        
        document.getElementById('fromCurrencyCode').textContent = this.fromCurrency;
        document.getElementById('toCurrencyCode').textContent = this.toCurrency;
        
        this.updateExchangeRate();
        this.updateConversion();
    }
    
    updateCurrencyFlag(type, currencyCode) {
        const flagElement = document.getElementById(`${type}FlagImg`);
        if (!flagElement) return;
        
        const imageFile = this.getConverterImageFile(currencyCode);
        const imageUrl = `https://raw.githubusercontent.com/kettabcrypto-cmd/my-language-app/main/assets/${imageFile}`;
        
        flagElement.src = imageUrl;
        flagElement.alt = currencyCode;
        
        flagElement.onerror = () => {
            flagElement.src = `https://flagcdn.com/w40/${this.getCountryCode(currencyCode)}.png`;
        };
    }
    
    getConverterImageFile(currencyCode) {
        const imageMap = {
            'USD': '101-currency-usd.png',
            'EUR': '100-currency-eur.png',
            'GBP': '102-currency-gbp.png',
            'JPY': '113-currency-jpy.png',
            'AED': '123-currency-aed.png',
            'SAR': '121-currency-sar.png',
            'QAR': '122-currency-qar.png',
            'CAD': '104-currency-cad.png',
            'AUD': '105-currency-aud.png',
            'CHF': '103-currency-chf.png',
            'TRY': '106-currency-try.png',
            'CNY': '107-currency-cny.png',
            'BRL': '108-currency-brl.png',
            'MXN': '109-currency-mxn.png',
            'ARS': '110-currency-ars.png',
            'RUB': '111-currency-rub.png',
            'ZAR': '112-currency-zar.png',
            'KRW': '114-currency-krw.png',
            'INR': '115-currency-inr.png',
            'HKD': '116-currency-hkd.png',
            'MYR': '117-currency-myr.png',
            'MAD': '118-currency-mad.png',
            'EGP': '119-currency-egp.png',
            'TND': '120-currency-tnd.png'
        };
        
        return imageMap[currencyCode] || '101-currency-usd.png';
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
        [this.fromCurrency, this.toCurrency] = [this.toCurrency, this.fromCurrency];
        this.updateConverter();
    }
    
    // ========== الإعدادات ==========
    setupSettings() {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                themeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.setTheme(option.getAttribute('data-theme'));
            });
        });
        
        const savedTheme = localStorage.getItem('currencypro-theme') || 'light';
        this.setTheme(savedTheme);
        document.querySelector(`.theme-option[data-theme="${savedTheme}"]`)?.classList.add('active');
        
        console.log('✅ الإعدادات معتمدة');
    }
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('currencypro-theme', theme);
    }
    
    updateSettings() {
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        const lastUpdateStatus = document.getElementById('lastUpdateStatus');
        
        if (lastUpdateTime) {
            const now = new Date();
            lastUpdateTime.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
        
        if (lastUpdateStatus) {
            lastUpdateStatus.textContent = this.currentRates?.success ? 'محدث الآن' : 'بيانات افتراضية';
            lastUpdateStatus.style.color = this.currentRates?.success ? '#28a745' : '#ffc107';
        }
    }
    
    // ========== المودالات ==========
    setupModals() {
        const addBtn = document.getElementById('addCurrencyBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddCurrencyModal());
        }
        
        document.getElementById('closeModalBtn')?.addEventListener('click', () => {
            document.getElementById('addCurrencyModal').style.display = 'none';
        });
        
        document.getElementById('closeChangeModalBtn')?.addEventListener('click', () => {
            document.getElementById('changeCurrencyModal').style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target.id === 'addCurrencyModal') {
                document.getElementById('addCurrencyModal').style.display = 'none';
            }
            if (e.target.id === 'changeCurrencyModal') {
                document.getElementById('changeCurrencyModal').style.display = 'none';
            }
        });
        
        console.log('✅ المودالات معتمدة');
    }
    
    showAddCurrencyModal() {
        alert('ميزة إضافة عملة - قيد التطوير');
        // يمكنك تفعيل الكود الحقيقي عندما تعمل الأساسيات
    }
    
    openCurrencyModal(type) {
        alert(`تغيير العملة ${type === 'from' ? 'المصدر' : 'الهدف'} - قيد التطوير`);
        // يمكنك تفعيل الكود الحقيقي عندما تعمل الأساسيات
    }
    
    // ========== أدوات مساعدة ==========
    showMessage(message, type = 'info') {
        console.log(`${type === 'warning' ? '⚠️' : '📢'} ${message}`);
        
        // عرض رسالة مؤقتة
        const messageDiv = document.createElement('div');
        messageDiv.className = 'temp-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            background: ${type === 'warning' ? '#ff9800' : '#2196f3'};
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// ========== بدء التطبيق ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM جاهز');
    
    // تحقق من أن CONFIG موجود
    if (typeof CONFIG === 'undefined') {
        console.error('❌ CONFIG غير موجود! تأكد من تحميل config.js أولاً');
        alert('خطأ: ملف الإعدادات (config.js) غير محمل');
        return;
    }
    
    // تحقق من أن CurrencyAPI موجود
    if (typeof CurrencyAPI === 'undefined') {
        console.error('❌ CurrencyAPI غير موجود! تأكد من تحميل api.js');
        alert('خطأ: واجهة API (api.js) غير محملة');
        return;
    }
    
    // بدء التطبيق
    try {
        const app = new CurrencyApp();
        app.init();
    } catch (error) {
        console.error('❌ خطأ فادح في بدء التطبيق:', error);
        alert('خطأ في بدء التطبيق: ' + error.message);
    }
});

// ========== CSS إضافي ==========
const appStyles = document.createElement('style');
appStyles.textContent = `
    /* البطاقات */
    .rate-item {
        display: flex;
        align-items: center;
        padding: 15px;
        margin: 10px 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        border: 1px solid #e8e8e8;
        transition: all 0.3s;
        cursor: pointer;
    }
    
    .rate-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.12);
        border-color: #3498db;
    }
    
    .currency-image {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        margin-right: 15px;
        object-fit: contain;
        background: #f8f9fa;
        padding: 5px;
    }
    
    .rate-info {
        flex: 1;
    }
    
    .rate-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
    }
    
    .currency-name {
        font-weight: bold;
        font-size: 18px;
        color: #2c3e50;
    }
    
    .rate-display-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .rate-value {
        font-weight: bold;
        font-size: 22px;
        color: #27ae60;
    }
    
    .rate-label {
        font-size: 14px;
        color: #7f8c8d;
    }
    
    /* الرسوم المتحركة */
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    /* رسائل مؤقتة */
    .temp-message {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(appStyles);
