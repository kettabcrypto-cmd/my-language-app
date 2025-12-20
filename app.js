class ForexApp {
    constructor() {
        this.api = apiService;
        this.forexData = {};
        this.interval = null;
        
        // تهيئة عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }
    
    async init() {
        console.log('بدء التطبيق...');
        
        // إعداد التنقل
        this.setupNavigation();
        
        // إعداد البحث
        this.setupSearch();
        
        // إعداد محول العملات
        this.setupConverter();
        
        // تحديث العداد
        this.updateRequestCounter();
        
        // تحديث الوقت
        this.updateTime();
        
        // تحميل البيانات
        await this.loadData();
        
        // إعداد التحديث التلقائي
        this.setupAutoUpdate();
        
        // إعداد أزرار العرض
        this.setupViewButtons();
    }
    
    async loadData() {
        console.log('جاري تحميل البيانات...');
        
        // عرض مؤشر تحميل
        this.showLoading();
        
        try {
            // جلب جميع بيانات العملات
            this.forexData = await this.api.getAllForexData();
            
            // تخزين الأسعار السابقة لحساب التغيير
            this.saveCurrentRates();
            
            // تحديث جميع العروض
            this.updateAllDisplays();
            
            console.log('تم تحميل البيانات بنجاح');
            
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            
            // عرض رسالة خطأ
            this.showError();
            
            // استخدام بيانات افتراضية
            this.forexData = this.api.getDefaultForexData();
            this.updateAllDisplays();
        }
    }
    
    updateAllDisplays() {
        // تحديث قائمة العملات الرئيسية
        this.updateForexList();
        
        // تحديث شريط العملات السريع
        this.updateQuickBar();
        
        // تحديث الإحصائيات
        this.updateStats();
        
        // تحديث وقت التحديث
        this.updateLastUpdateTime();
        
        // إخفاء مؤشر التحميل
        this.hideLoading();
    }
    
    updateForexList() {
        const container = document.getElementById('forexList');
        if (!container) {
            console.error('عنصر forexList غير موجود!');
            return;
        }
        
        if (!this.forexData || Object.keys(this.forexData).length === 0) {
            container.innerHTML = `
                <div class="forex-item" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #ff9800; margin-bottom: 10px;"></i>
                    <p>لا توجد بيانات متاحة حالياً</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        CONFIG.FOREX_PAIRS.forEach(pair => {
            const data = this.forexData[pair];
            if (!data) return;
            
            const [from, to] = pair.split('/');
            const rate = parseFloat(data.rate) || 0;
            
            // حساب التغيير من الأسعار السابقة
            const previousRate = this.getPreviousRate(pair);
            const change = previousRate ? rate - previousRate : 0;
            const changePercent = previousRate ? (change / previousRate) * 100 : 0;
            
            // سعر العرض والطلب (بسيط)
            const bid = rate;
            const ask = rate * 1.0002;
            const high = rate * 1.0015;
            const low = rate * 0.9985;
            
            // تنسيق الوقت
            const time = data.timestamp ? this.formatTime(data.timestamp) : this.formatTime(Date.now());
            
            html += `
                <div class="forex-item">
                    <div class="forex-symbol">
                        <span class="currency-flag-small">${CONFIG.CURRENCY_FLAGS[from] || '🏳️'}</span>
                        <div>
                            <div class="currency-code">${pair}</div>
                            <div class="currency-name">${CONFIG.CURRENCY_NAMES[from] || from} / ${CONFIG.CURRENCY_NAMES[to] || to}</div>
                        </div>
                    </div>
                    <div class="price-cell">${bid.toFixed(from === 'JPY' ? 2 : 4)}</div>
                    <div class="price-cell">${ask.toFixed(from === 'JPY' ? 2 : 4)}</div>
                    <div class="change-cell ${change >= 0 ? 'change-up' : 'change-down'}">
                        ${change >= 0 ? '+' : ''}${change.toFixed(4)}
                        <br>
                        <small>(${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)</small>
                    </div>
                    <div class="price-cell">${high.toFixed(from === 'JPY' ? 2 : 4)}</div>
                    <div class="price-cell">${low.toFixed(from === 'JPY' ? 2 : 4)}</div>
                    <div class="time-cell">${time}</div>
                </div>
            `;
        });
        
        container.innerHTML = html || `
            <div class="forex-item" style="grid-column: 1/-1; text-align: center; padding: 20px;">
                لا توجد بيانات لعرضها
            </div>
        `;
        
        // إضافة أحداث النقر للعملات السريعة
        this.setupQuickPairClicks();
    }
    
    updateQuickBar() {
        const container = document.getElementById('quickPairs');
        if (!container) return;
        
        const quickPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/AED', 'USD/SAR', 'USD/EGP'];
        let html = '';
        
        quickPairs.forEach(pair => {
            const data = this.forexData[pair];
            if (!data) return;
            
            const rate = parseFloat(data.rate) || 0;
            const previousRate = this.getPreviousRate(pair);
            const change = previousRate ? rate - previousRate : 0;
            const [from, to] = pair.split('/');
            
            html += `
                <div class="quick-pair" data-pair="${pair}" title="${CONFIG.CURRENCY_NAMES[from] || from} إلى ${CONFIG.CURRENCY_NAMES[to] || to}">
                    <span class="pair-symbol">${pair}</span>
                    <span class="pair-price">${rate.toFixed(from === 'JPY' ? 2 : 4)}</span>
                    <span class="pair-change ${change >= 0 ? 'change-up' : 'change-down'}">
                        ${change >= 0 ? '+' : ''}${change.toFixed(4)}
                    </span>
                </div>
            `;
        });
        
        container.innerHTML = html || '<div class="quick-pair">جار التحميل...</div>';
    }
    
    updateStats() {
        // حساب الإحصائيات
        let topGainer = { pair: '', change: -Infinity };
        let topLoser = { pair: '', change: Infinity };
        let totalPairs = 0;
        
        CONFIG.FOREX_PAIRS.forEach(pair => {
            const data = this.forexData[pair];
            if (!data) return;
            
            totalPairs++;
            const previousRate = this.getPreviousRate(pair);
            if (previousRate) {
                const change = (parseFloat(data.rate) - previousRate) / previousRate * 100;
                
                if (change > topGainer.change) {
                    topGainer = { pair: pair, change: change };
                }
                if (change < topLoser.change) {
                    topLoser = { pair: pair, change: change };
                }
            }
        });
        
        // تحديث DOM
        document.getElementById('totalCurrencies').textContent = totalPairs;
        document.getElementById('topGainer').textContent = topGainer.pair ? 
            `${topGainer.pair} (${topGainer.change.toFixed(2)}%)` : '--';
        document.getElementById('topLoser').textContent = topLoser.pair ? 
            `${topLoser.pair} (${topLoser.change.toFixed(2)}%)` : '--';
        document.getElementById('lastUpdateTime').textContent = this.formatTime(Date.now());
    }
    
    // إعداد محول العملات
    setupConverter() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        const amountInput = document.getElementById('amount');
        const swapBtn = document.getElementById('swapCurrencies');
        
        // تعبئة خيارات العملات
        this.populateCurrencyOptions();
        
        // أحداث
        const updateHandler = () => this.updateConversion();
        
        fromSelect.addEventListener('change', () => {
            document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS[fromSelect.value] || '🏳️';
            updateHandler();
        });
        
        toSelect.addEventListener('change', () => {
            document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS[toSelect.value] || '🏳️';
            updateHandler();
        });
        
        amountInput.addEventListener('input', updateHandler);
        
        swapBtn.addEventListener('click', () => {
            const fromVal = fromSelect.value;
            const toVal = toSelect.value;
            
            fromSelect.value = toVal;
            toSelect.value = fromVal;
            
            document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS[fromSelect.value] || '🏳️';
            document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS[toSelect.value] || '🏳️';
            
            this.updateConversion();
        });
        
        // تحديث أولي
        setTimeout(() => this.updateConversion(), 500);
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
            // محاولة استخدام البيانات المخزنة أولاً
            let rate = this.getCachedRate(from, to);
            
            if (!rate) {
                const rateData = await this.api.getExchangeRate(from, to);
                rate = rateData?.rate ? parseFloat(rateData.rate) : 0;
            }
            
            if (rate > 0) {
                const converted = amount * rate;
                document.getElementById('convertedAmount').textContent = converted.toFixed(2);
                document.getElementById('exchangeRate').textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
                document.getElementById('inverseRate').textContent = `1 ${to} = ${(1/rate).toFixed(4)} ${from}`;
            } else {
                document.getElementById('convertedAmount').textContent = '--';
                document.getElementById('exchangeRate').textContent = 'لا تتوفر بيانات';
            }
            
        } catch (error) {
            console.error('خطأ في التحويل:', error);
            document.getElementById('convertedAmount').textContent = 'خطأ';
        }
    }
    
    // أدوات مساعدة
    getPreviousRate(pair) {
        const cached = localStorage.getItem(`prev_${pair}`);
        return cached ? parseFloat(cached) : null;
    }
    
    saveCurrentRates() {
        CONFIG.FOREX_PAIRS.forEach(pair => {
            const data = this.forexData[pair];
            if (data && data.rate) {
                // حفظ السعر الحالي كسعر سابق للمرة القادمة
                localStorage.setItem(`prev_${pair}`, data.rate);
            }
        });
    }
    
    getCachedRate(from, to) {
        if (from === to) return 1;
        
        // البحث في البيانات الحالية
        const directPair = `${from}/${to}`;
        if (this.forexData[directPair] && this.forexData[directPair].rate) {
            return parseFloat(this.forexData[directPair].rate);
        }
        
        // محاولة العكس
        const inversePair = `${to}/${from}`;
        if (this.forexData[inversePair] && this.forexData[inversePair].rate) {
            return 1 / parseFloat(this.forexData[inversePair].rate);
        }
        
        return null;
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
    }
    
    updateTime() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        document.getElementById('lastUpdateTime').textContent = now.toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
    }
    
    updateRequestCounter() {
        const stored = localStorage.getItem('api_requests');
        const requests = stored ? JSON.parse(stored) : { date: new Date().toDateString(), count: 0 };
        
        const counter = document.getElementById('apiCounter');
        if (counter) {
            counter.textContent = `${requests.count || 0}/800`;
        }
    }
    
    populateCurrencyOptions() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        
        // مسح الخيارات الحالية
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        
        // إضافة العملات
        Object.keys(CONFIG.CURRENCY_NAMES).forEach(code => {
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            
            option1.value = option2.value = code;
            option1.textContent = option2.textContent = `${CONFIG.CURRENCY_FLAGS[code] || '🏳️'} ${code}`;
            
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
        const sections = document.querySelectorAll('main > section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const tab = link.getAttribute('data-tab');
                
                // تحديث الروابط النشطة
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // إظهار/إخفاء الأقسام
                sections.forEach(section => {
                    section.classList.remove('active');
                    section.style.display = 'none';
                });
                
                const targetSection = document.getElementById(`${tab}-section`);
                if (targetSection) {
                    targetSection.classList.add('active');
                    targetSection.style.display = 'block';
                }
            });
        });
    }
    
    setupSearch() {
        const searchInput = document.getElementById('forexSearch');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            const items = document.querySelectorAll('.forex-item');
            
            if (searchTerm === '') {
                items.forEach(item => item.style.display = 'grid');
                return;
            }
            
            items.forEach(item => {
                const symbol = item.querySelector('.currency-code')?.textContent?.toLowerCase() || '';
                const name = item.querySelector('.currency-name')?.textContent?.toLowerCase() || '';
                
                if (symbol.includes(searchTerm) || name.includes(searchTerm)) {
                    item.style.display = 'grid';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    setupViewButtons() {
        const viewButtons = document.querySelectorAll('.view-btn');
        const marketList = document.querySelector('.market-list');
        
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (marketList) {
                    if (view === 'list') {
                        marketList.style.maxHeight = 'none';
                    } else {
                        marketList.style.maxHeight = '500px';
                    }
                }
            });
        });
    }
    
    setupQuickPairClicks() {
        document.querySelectorAll('.quick-pair').forEach(pair => {
            pair.addEventListener('click', () => {
                const pairSymbol = pair.getAttribute('data-pair');
                const [from, to] = pairSymbol.split('/');
                
                // تعيين في محول العملات
                document.getElementById('fromCurrency').value = from;
                document.getElementById('toCurrency').value = to;
                
                document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS[from] || '🏳️';
                document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS[to] || '🏳️';
                
                document.getElementById('amount').value = '100';
                
                // الانتقال لتبويب المحول
                document.querySelector('[data-tab="converter"]').click();
                
                // تحديث التحويل
                setTimeout(() => this.updateConversion(), 100);
            });
        });
    }
    
    setupAutoUpdate() {
        // تحديث البيانات كل ساعة
        this.interval = setInterval(() => {
            console.log('تحديث تلقائي للبيانات...');
            this.loadData();
        }, CONFIG.UPDATE_INTERVAL);
        
        // تحديث الوقت كل دقيقة
        setInterval(() => {
            this.updateTime();
        }, 60000);
    }
    
    showLoading() {
        const container = document.getElementById('forexList');
        if (container) {
            container.innerHTML = `
                <div class="forex-item" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #2962ff; margin-bottom: 15px;"></i>
                    <p>جارٍ تحميل بيانات العملات...</p>
                </div>
            `;
        }
    }
    
    hideLoading() {
        // لا حاجة لعمل شيء، العرض يتم تحديثه بالفعل
    }
    
    showError() {
        const container = document.getElementById('forexList');
        if (container) {
            container.innerHTML = `
                <div class="forex-item" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef5350;">
                    <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 15px;"></i>
                    <p>فشل تحميل البيانات من الخادم</p>
                    <p style="font-size: 14px; margin-top: 10px;">يتم استخدام البيانات المخزنة محلياً</p>
                </div>
            `;
        }
    }
}

// بدء التطبيق تلقائياً
const app = new ForexApp();
