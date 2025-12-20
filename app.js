class ForexApp {
    constructor() {
        this.api = apiService;
        this.forexData = {};
        this.interval = null;
        this.init();
    }
    
    async init() {
        // إعداد التنقل
        this.setupNavigation();
        
        // إعداد البحث
        this.setupSearch();
        
        // إعداد محول العملات
        this.setupConverter();
        
        // تحميل البيانات الأولية
        await this.loadData();
        
        // إعداد التحديث التلقائي
        this.setupAutoUpdate();
        
        // تحديث العداد
        this.updateRequestCounter();
    }
    
    async loadData() {
        // جلب جميع بيانات العملات في طلب واحد
        this.forexData = await this.api.getAllForexData();
        
        // تحديث العرض
        this.updateForexDisplay();
        
        // تحديث شريط العملات السريع
        this.updateQuickBar();
        
        // تحديث الإحصائيات
        this.updateStats();
        
        // تحديث وقت التحديث
        this.updateTime();
    }
    
    updateForexDisplay() {
        const container = document.getElementById('forexList');
        if (!container || !this.forexData) return;
        
        let html = '';
        
        CONFIG.FOREX_PAIRS.forEach((pair, index) => {
            const data = this.forexData[pair];
            if (!data) return;
            
            const [from, to] = pair.split('/');
            const rate = parseFloat(data.rate) || 0;
            const previousRate = this.getPreviousRate(pair);
            const change = previousRate ? rate - previousRate : 0;
            const changePercent = previousRate ? (change / previousRate) * 100 : 0;
            
            // سعر العرض والطلب (مبسط)
            const bid = rate;
            const ask = rate * 1.0002; // فرق بسيط
            const high = rate * 1.001;
            const low = rate * 0.999;
            
            html += `
                <div class="forex-item">
                    <div class="forex-symbol">
                        <span class="currency-flag-small">${CONFIG.CURRENCY_FLAGS[from] || '🏳️'}</span>
                        <div>
                            <div class="currency-code">${pair}</div>
                            <div class="currency-name">${CONFIG.CURRENCY_NAMES[from] || from} / ${CONFIG.CURRENCY_NAMES[to] || to}</div>
                        </div>
                    </div>
                    <div class="price-cell">${bid.toFixed(4)}</div>
                    <div class="price-cell">${ask.toFixed(4)}</div>
                    <div class="change-cell ${change >= 0 ? 'change-up' : 'change-down'}">
                        ${change >= 0 ? '+' : ''}${change.toFixed(4)} (${changePercent.toFixed(2)}%)
                    </div>
                    <div class="price-cell">${high.toFixed(4)}</div>
                    <div class="price-cell">${low.toFixed(4)}</div>
                    <div class="time-cell">${this.formatTime(data.timestamp)}</div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<div class="forex-item">لا توجد بيانات</div>';
    }
    
    updateQuickBar() {
        const container = document.getElementById('quickPairs');
        if (!container) return;
        
        const quickPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD', 'USD/AED'];
        let html = '';
        
        quickPairs.forEach(pair => {
            const data = this.forexData[pair];
            if (!data) return;
            
            const rate = parseFloat(data.rate) || 0;
            const previousRate = this.getPreviousRate(pair);
            const change = previousRate ? rate - previousRate : 0;
            
            html += `
                <div class="quick-pair" data-pair="${pair}">
                    <span class="pair-symbol">${pair}</span>
                    <span class="pair-price">${rate.toFixed(4)}</span>
                    <span class="pair-change ${change >= 0 ? 'change-up' : 'change-down'}">
                        ${change >= 0 ? '+' : ''}${change.toFixed(4)}
                    </span>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    setupAutoUpdate() {
        // تحديث كل ساعة
        this.interval = setInterval(() => {
            this.loadData();
        }, CONFIG.UPDATE_INTERVAL);
        
        // تحديث الوقت كل دقيقة
        setInterval(() => {
            this.updateTime();
        }, 60000);
    }
    
    setupConverter() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        const amountInput = document.getElementById('amount');
        const swapBtn = document.getElementById('swapCurrencies');
        
        // تعبئة خيارات العملات
        this.populateCurrencyOptions();
        
        // أحداث
        [fromSelect, toSelect, amountInput].forEach(el => {
            el.addEventListener('change', () => this.updateConversion());
            el.addEventListener('input', () => this.updateConversion());
        });
        
        swapBtn.addEventListener('click', () => {
            const fromVal = fromSelect.value;
            const toVal = toSelect.value;
            
            fromSelect.value = toVal;
            toSelect.value = fromVal;
            
            // تحديث الأعلام
            document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS[fromSelect.value] || '🏳️';
            document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS[toSelect.value] || '🏳️';
            
            this.updateConversion();
        });
        
        // تحديث التحويل الأولي
        setTimeout(() => this.updateConversion(), 1000);
    }
    
    async updateConversion() {
        const from = document.getElementById('fromCurrency').value;
        const to = document.getElementById('toCurrency').value;
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        
        if (from === to) {
            document.getElementById('convertedAmount').textContent = amount.toFixed(2);
            document.getElementById('exchangeRate').textContent = `1 ${from} = 1 ${to}`;
            document.getElementById('inverseRate').textContent = `1 ${to} = 1 ${from}`;
            return;
        }
        
        try {
            const rateData = await this.api.getExchangeRate(from, to);
            const rate = rateData?.rate || 0;
            
            if (rate > 0) {
                const converted = amount * rate;
                document.getElementById('convertedAmount').textContent = converted.toFixed(2);
                document.getElementById('exchangeRate').textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
                document.getElementById('inverseRate').textContent = `1 ${to} = ${(1/rate).toFixed(4)} ${from}`;
            }
        } catch (error) {
            console.error('خطأ في التحويل:', error);
        }
    }
    
    // أدوات مساعدة
    getPreviousRate(pair) {
        const cached = localStorage.getItem(`prev_${pair}`);
        return cached ? parseFloat(cached) : null;
    }
    
    formatTime(timestamp) {
        if (!timestamp) return '--:--';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }
    
    updateTime() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('lastUpdateTime').textContent = now.toLocaleTimeString('ar-EG');
    }
    
    updateStats() {
        // تحديث الإحصائيات
        document.getElementById('totalCurrencies').textContent = CONFIG.FOREX_PAIRS.length;
        // يمكن إضافة المزيد من الإحصائيات
    }
    
    updateRequestCounter() {
        const requests = JSON.parse(localStorage.getItem('api_requests') || '{}');
        const today = new Date().toDateString();
        
        if (requests.date !== today) {
            requests.date = today;
            requests.count = 0;
            localStorage.setItem('api_requests', JSON.stringify(requests));
        }
        
        const counter = document.getElementById('apiCounter');
        if (counter) {
            counter.textContent = `${requests.count || 0}/800`;
        }
    }
    
    populateCurrencyOptions() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        
        Object.keys(CONFIG.CURRENCY_NAMES).forEach(code => {
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            
            option1.value = option2.value = code;
            option1.textContent = option2.textContent = `${CONFIG.CURRENCY_FLAGS[code] || '🏳️'} ${code} - ${CONFIG.CURRENCY_NAMES[code]}`;
            
            fromSelect.appendChild(option1);
            toSelect.appendChild(option2);
        });
        
        // تعيين القيم الافتراضية
        fromSelect.value = 'USD';
        toSelect.value = 'EUR';
        document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS.USD;
        document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS.EUR;
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.header-nav a');
        const sections = document.querySelectorAll('section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const tab = link.getAttribute('data-tab');
                
                // تحديث الروابط النشطة
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // إظهار/إخفاء الأقسام
                sections.forEach(section => {
                    section.style.display = 'none';
                });
                
                document.getElementById(`${tab}-section`).style.display = 'block';
            });
        });
    }
    
    setupSearch() {
        const searchInput = document.getElementById('forexSearch');
        
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const items = document.querySelectorAll('.forex-item');
            
            items.forEach(item => {
                const symbol = item.querySelector('.currency-code').textContent;
                const name = item.querySelector('.currency-name').textContent;
                
                if (symbol.toLowerCase().includes(searchTerm) || name.toLowerCase().includes(searchTerm)) {
                    item.style.display = 'grid';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ForexApp();
});
