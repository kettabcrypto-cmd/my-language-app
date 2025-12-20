// التطبيق الرئيسي

class CurrencyStockApp {
    constructor() {
        this.apiService = apiService;
        this.currentTab = 'forex';
        this.forexData = {};
        this.stocksData = {};
        this.conversionRates = {};
        
        this.init();
    }
    
    async init() {
        // تهيئة التبويبات
        this.setupTabs();
        
        // تهيئة محول العملات
        this.setupCurrencyConverter();
        
        // تحميل البيانات الأولية
        await this.loadInitialData();
        
        // إعداد التحديث التلقائي
        this.setupAutoRefresh();
        
        // تحديث عرض طلبات API
        this.updateAPIRequestDisplay();
        
        // تحديث وقت آخر تحديث
        this.updateLastUpdateTime();
    }
    
    // إعداد التبويبات
    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // تحديث التبويب النشط
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // إظهار المحتوى المناسب
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabId).classList.add('active');
                
                this.currentTab = tabId;
                
                // تحميل بيانات التبويب إذا لزم
                if (tabId === 'stocks' && Object.keys(this.stocksData).length === 0) {
                    this.loadStocksData();
                }
            });
        });
        
        // أزرار التحديث
        document.getElementById('refreshForex').addEventListener('click', () => {
            this.loadForexData(true);
        });
        
        document.getElementById('refreshStocks').addEventListener('click', () => {
            this.loadStocksData(true);
        });
    }
    
    // تحميل البيانات الأولية
    async loadInitialData() {
        // تحميل بيانات العملات
        await this.loadForexData();
        
        // تحميل بيانات الأسهم (بتأخير لتقليل الحمل)
        setTimeout(() => {
            this.loadStocksData();
        }, 2000);
    }
    
    // تحميل بيانات العملات
    async loadForexData(forceRefresh = false) {
        const forexGrid = document.getElementById('forexGrid');
        
        // عرض حالة التحميل
        forexGrid.innerHTML = `
            <div class="loading" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p>جار تحميل أسعار العملات...</p>
            </div>
        `;
        
        try {
            // جلب رموز العملات
            const symbols = CONFIG.FOREX_PAIRS.map(pair => pair.symbol);
            
            // جلب البيانات
            const data = await this.apiService.getBatchForexRates(symbols);
            this.forexData = data;
            
            // تحديث العرض
            this.updateForexDisplay();
            
            // حفظ وقت التحديث
            this.saveLastUpdate();
            
            // تحديث خيارات محول العملات
            this.updateCurrencyConverterOptions();
            
        } catch (error) {
            console.error('خطأ في تحميل بيانات العملات:', error);
            forexGrid.innerHTML = `
                <div class="error" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <p>فشل تحميل بيانات العملات. تحقق من اتصال الإنترنت.</p>
                </div>
            `;
        }
    }
    
    // تحديث عرض العملات
    updateForexDisplay() {
        const forexGrid = document.getElementById('forexGrid');
        
        if (!forexGrid || Object.keys(this.forexData).length === 0) return;
        
        let html = '';
        
        CONFIG.FOREX_PAIRS.forEach(pair => {
            const data = this.forexData[pair.symbol];
            
            if (data && data.rate) {
                // حساب التغيير (بسيط - في تطبيق حقيقي سيأتي من API)
                const price = parseFloat(data.rate);
                const change = (Math.random() - 0.5) * 0.01; // بيانات وهمية للتغيير
                const changePercent = (change / price) * 100;
                
                const currency = {
                    symbol: pair.symbol,
                    name: pair.name,
                    price: price,
                    change: change,
                    change_percent: changePercent
                };
                
                html += Utils.createCurrencyCard(currency);
            } else {
                // عرض بيانات افتراضية في حالة عدم وجود بيانات
                html += `
                    <div class="currency-card">
                        <div class="currency-info">
                            <h3>${pair.symbol.replace('/USD', '')}</h3>
                            <p>${pair.name}</p>
                        </div>
                        <div class="currency-price">
                            <div class="price">--</div>
                            <div class="change">لا توجد بيانات</div>
                        </div>
                    </div>
                `;
            }
        });
        
        forexGrid.innerHTML = html;
    }
    
    // تحميل بيانات الأسهم
    async loadStocksData(forceRefresh = false) {
        const stocksTableBody = document.getElementById('stocksTableBody');
        
        // عرض حالة التحميل
        stocksTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p>جار تحميل بيانات الأسهم...</p>
                </td>
            </tr>
        `;
        
        try {
            // جلب بيانات الأسهم
            const data = await this.apiService.getBatchStockQuotes(CONFIG.STOCKS);
            this.stocksData = data;
            
            // تحديث العرض
            this.updateStocksDisplay();
            
            // إعداد البحث والتصفية
            this.setupStockFilters();
            
            // حفظ وقت التحديث
            this.saveLastUpdate();
            
        } catch (error) {
            console.error('خطأ في تحميل بيانات الأسهم:', error);
            stocksTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                        <p>فشل تحميل بيانات الأسهم. تحقق من اتصال الإنترنت.</p>
                    </td>
                </tr>
            `;
        }
    }
    
    // تحديث عرض الأسهم
    updateStocksDisplay(filteredStocks = null) {
        const stocksTableBody = document.getElementById('stocksTableBody');
        
        if (!stocksTableBody) return;
        
        const stocksToDisplay = filteredStocks || Object.values(this.stocksData);
        
        if (stocksToDisplay.length === 0) {
            stocksTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        لا توجد نتائج مطابقة للبحث
                    </td>
                </tr>
            `;
            return;
        }
        
        // ترتيب الأسهم حسب السعر (تنازلي)
        const sortedStocks = stocksToDisplay
            .filter(stock => stock && stock.symbol)
            .sort((a, b) => {
                const priceA = parseFloat(a.price) || 0;
                const priceB = parseFloat(b.price) || 0;
                return priceB - priceA;
            });
        
        let html = '';
        
        sortedStocks.forEach((stock, index) => {
            if (stock && stock.symbol) {
                // حساب التغيير
                const price = parseFloat(stock.price) || 0;
                const open = parseFloat(stock.open) || price;
                const change = price - open;
                const changePercent = open !== 0 ? (change / open) * 100 : 0;
                
                const stockWithChange = {
                    ...stock,
                    change: change,
                    percent_change: changePercent
                };
                
                html += Utils.createStockRow(stockWithChange, index);
            }
        });
        
        stocksTableBody.innerHTML = html;
    }
    
    // إعداد البحث والتصفية للأسهم
    setupStockFilters() {
        const searchInput = document.getElementById('stockSearch');
        const filterSelect = document.getElementById('stockFilter');
        
        if (!searchInput || !filterSelect) return;
        
        const applyFilters = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filterType = filterSelect.value;
            
            let filtered = Object.values(this.stocksData).filter(stock => {
                if (!stock || !stock.symbol) return false;
                
                // البحث
                const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm) || 
                                     (stock.name && stock.name.toLowerCase().includes(searchTerm));
                
                if (!matchesSearch) return false;
                
                // التصفية حسب النوع
                if (filterType === 'all') return true;
                
                const price = parseFloat(stock.price) || 0;
                const open = parseFloat(stock.open) || price;
                const change = price - open;
                
                if (filterType === 'gainers') return change > 0;
                if (filterType === 'losers') return change < 0;
                
                return true;
            });
            
            this.updateStocksDisplay(filtered);
        };
        
        searchInput.addEventListener('input', applyFilters);
        filterSelect.addEventListener('change', applyFilters);
    }
    
    // إعداد محول العملات
    setupCurrencyConverter() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        const amountInput = document.getElementById('amount');
        const swapBtn = document.getElementById('swapCurrencies');
        const convertBtn = document.getElementById('convertBtn');
        const quickConversions = document.getElementById('quickConversions');
        
        // تعبئة خيارات العملات
        this.updateCurrencyConverterOptions();
        
        // تعيين القيم الافتراضية
        fromSelect.value = 'USD';
        toSelect.value = 'EUR';
        
        // حدث تبديل العملات
        swapBtn.addEventListener('click', () => {
            const fromValue = fromSelect.value;
            const toValue = toSelect.value;
            
            fromSelect.value = toValue;
            toSelect.value = fromValue;
            
            this.performConversion();
        });
        
        // حدث التحويل
        convertBtn.addEventListener('click', () => {
            this.performConversion();
        });
        
        // التحويل عند تغيير القيم
        [fromSelect, toSelect, amountInput].forEach(element => {
            element.addEventListener('change', () => {
                this.performConversion();
            });
            
            element.addEventListener('input', () => {
                if (element === amountInput) {
                    this.performConversion();
                }
            });
        });
        
        // التحويلات السريعة
        this.setupQuickConversions();
        
        // التحويل الأولي
        setTimeout(() => {
            this.performConversion();
        }, 1000);
    }
    
    // تحديث خيارات محول العملات
    updateCurrencyConverterOptions() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        
        if (!fromSelect || !toSelect) return;
        
        // مسح الخيارات الحالية
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        
        // إضافة خيارات العملات
        CONFIG.POPULAR_CURRENCIES.forEach(currency => {
            const option1 = document.createElement('option');
            option1.value = currency.code;
            option1.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
            
            const option2 = option1.cloneNode(true);
            
            fromSelect.appendChild(option1);
            toSelect.appendChild(option2);
        });
    }
    
    // إعداد التحويلات السريعة
    setupQuickConversions() {
        const quickConversions = document.getElementById('quickConversions');
        
        if (!quickConversions) return;
        
        const conversions = [
            { from: 'USD', to: 'EUR', amount: 100, label: '100 دولار إلى يورو' },
            { from: 'USD', to: 'GBP', amount: 100, label: '100 دولار إلى جنيه' },
            { from: 'EUR', to: 'USD', amount: 100, label: '100 يورو إلى دولار' },
            { from: 'GBP', to: 'USD', amount: 100, label: '100 جنيه إلى دولار' },
            { from: 'USD', to: 'AED', amount: 100, label: '100 دولار إلى درهم' },
            { from: 'USD', to: 'SAR', amount: 100, label: '100 دولار إلى ريال' }
        ];
        
        let html = '';
        
        conversions.forEach(conv => {
            html += `
                <div class="quick-conversion" data-from="${conv.from}" data-to="${conv.to}" data-amount="${conv.amount}">
                    <h4>${conv.label}</h4>
                    <p class="quick-result" id="quick_${conv.from}_${conv.to}">--</p>
                </div>
            `;
        });
        
        quickConversions.innerHTML = html;
        
        // إضافة أحداث النقر
        quickConversions.querySelectorAll('.quick-conversion').forEach(el => {
            el.addEventListener('click', () => {
                const from = el.getAttribute('data-from');
                const to = el.getAttribute('data-to');
                const amount = el.getAttribute('data-amount');
                
                document.getElementById('fromCurrency').value = from;
                document.getElementById('toCurrency').value = to;
                document.getElementById('amount').value = amount;
                
                this.performConversion();
            });
        });
        
        // تحديث التحويلات السريعة
        this.updateQuickConversions();
    }
    
    // تحديث التحويلات السريعة
    async updateQuickConversions() {
        const conversions = [
            { from: 'USD', to: 'EUR' },
            { from: 'USD', to: 'GBP' },
            { from: 'EUR', to: 'USD' },
            { from: 'GBP', to: 'USD' },
            { from: 'USD', to: 'AED' },
            { from: 'USD', to: 'SAR' }
        ];
        
        for (const conv of conversions) {
            const resultElement = document.getElementById(`quick_${conv.from}_${conv.to}`);
            if (!resultElement) continue;
            
            try {
                const conversion = await this.apiService.getCurrencyConversion(conv.from, conv.to);
                if (conversion && conversion.rate) {
                    const amount = 100;
                    const converted = amount * conversion.rate;
                    resultElement.textContent = `${Utils.formatNumber(converted, 2)} ${conv.to}`;
                }
            } catch (error) {
                console.error(`خطأ في تحديث التحويل السريع ${conv.from} إلى ${conv.to}:`, error);
            }
        }
    }
    
    // تنفيذ التحويل
    async performConversion() {
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        const convertedAmountElement = document.getElementById('convertedAmount');
        const conversionRateElement = document.getElementById('conversionRate');
        
        if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
            if (fromCurrency === toCurrency && amount > 0) {
                convertedAmountElement.value = Utils.formatNumber(amount, 2);
                conversionRateElement.textContent = `السعر: 1 ${fromCurrency} = 1 ${toCurrency}`;
            }
            return;
        }
        
        // عرض تحميل
        convertedAmountElement.value = 'جار الحساب...';
        conversionRateElement.textContent = 'جاري جلب سعر الصرف...';
        
        try {
            // جلب سعر الصرف
            const conversion = await this.apiService.getCurrencyConversion(fromCurrency, toCurrency);
            
            if (conversion && conversion.rate) {
                const rate = conversion.rate;
                const converted = amount * rate;
                
                // تحديث النتائج
                convertedAmountElement.value = Utils.formatNumber(converted, 2);
                conversionRateElement.textContent = `السعر: 1 ${fromCurrency} = ${Utils.formatNumber(rate, 4)} ${toCurrency}`;
                
                // تخزين سعر الصرف
                const key = `${fromCurrency}_${toCurrency}`;
                this.conversionRates[key] = {
                    rate: rate,
                    timestamp: conversion.timestamp
                };
            } else {
                throw new Error('لا توجد بيانات للتحويل');
            }
        } catch (error) {
            console.error('خطأ في التحويل:', error);
            convertedAmountElement.value = 'خطأ';
            conversionRateElement.textContent = 'فشل جلب سعر الصرف';
        }
    }
    
    // إعداد التحديث التلقائي
    setupAutoRefresh() {
        // تحديث بيانات العملات كل ساعة
        setInterval(() => {
            this.loadForexData(true);
            
            // تحديث الأسهم بعد 5 دقائق لتوزيع الطلبات
            setTimeout(() => {
                this.loadStocksData(true);
            }, 5 * 60 * 1000);
            
            // تحديث وقت آخر تحديث
            this.updateLastUpdateTime();
        }, CONFIG.UPDATE_INTERVAL);
        
        // تحديث وقت العرض كل دقيقة
        setInterval(() => {
            this.updateLastUpdateTime();
        }, 60 * 1000);
    }
    
    // حفظ وقت آخر تحديث
    saveLastUpdate() {
        Utils.saveToStorage(CONFIG.STORAGE_KEYS.LAST_UPDATE, {
            timestamp: new Date().getTime()
        });
        
        this.updateLastUpdateTime();
    }
    
    // تحديث وقت العرض
    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('lastUpdateTime');
        if (!lastUpdateElement) return;
        
        const lastUpdate = Utils.getFromStorage(CONFIG.STORAGE_KEYS.LAST_UPDATE);
        
        if (lastUpdate && lastUpdate.timestamp) {
            const timeStr = Utils.formatDateTime(lastUpdate.timestamp);
            lastUpdateElement.textContent = `آخر تحديث: ${timeStr}`;
        } else {
            lastUpdateElement.textContent = `آخر تحديث: الآن`;
        }
    }
    
    // تحديث عرض طلبات API
    updateAPIRequestDisplay() {
        const requests = Utils.getFromStorage(CONFIG.STORAGE_KEYS.API_REQUESTS) || {};
        const today = new Date().toDateString();
        
        if (requests.date !== today) {
            requests.date = today;
            requests.count = 0;
            Utils.saveToStorage(CONFIG.STORAGE_KEYS.API_REQUESTS, requests);
        }
        
        const display = document.getElementById('apiRequests');
        if (display) {
            display.textContent = `طلبات API اليومية: ${requests.count || 0}/800`;
        }
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CurrencyStockApp();
});
