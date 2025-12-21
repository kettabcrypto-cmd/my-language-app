class CurrencyAPI {
    constructor() {
        this.apiKey = CONFIG.API_KEY;
        this.baseUrl = CONFIG.API_BASE_URL;
        this.cache = null;
        this.cacheDuration = CONFIG.UPDATE_INTERVAL;
        this.lastFetchTime = null;
    }
    
    // جلب جميع الأسعار مرة واحدة
    async fetchAllRates() {
        try {
            console.log('🚀 جلب أسعار العملات من TwelveData...');
            
            // التحقق من التخزين المؤقت
            if (this.cache && this.lastFetchTime && 
                (Date.now() - this.lastFetchTime < this.cacheDuration)) {
                console.log('📦 استخدام البيانات المخزنة');
                return this.cache;
            }
            
            // جلب أسعار جميع أزواج العملات
            const rates = await this.fetchMultipleRates();
            
            const result = {
                success: true,
                rates: rates,
                timestamp: Date.now(),
                source: 'twelvedata_api'
            };
            
            this.cache = result;
            this.lastFetchTime = Date.now();
            
            console.log('✅ تم جلب الأسعار بنجاح:', rates);
            return result;
            
        } catch (error) {
            console.error('❌ خطأ في جلب الأسعار:', error);
            return this.getFallbackRates();
        }
    }
    
    // جلب أسعار متعددة
    async fetchMultipleRates() {
        const rates = { USD: 1.0 };
        const promises = [];
        
        CONFIG.CURRENCY_PAIRS.forEach(pair => {
            promises.push(
                this.fetchCurrencyRate(pair).then(rate => {
                    if (rate !== null) {
                        const targetCurrency = pair.split('/')[1];
                        rates[targetCurrency] = rate;
                    }
                })
            );
        });
        
        await Promise.allSettled(promises);
        
        // ملء أي عملات فاشلة بالأسعار الافتراضية
        CONFIG.CURRENCY_PAIRS.forEach(pair => {
            const targetCurrency = pair.split('/')[1];
            if (!rates[targetCurrency]) {
                rates[targetCurrency] = CONFIG.DEFAULT_RATES[targetCurrency] || 1.0;
            }
        });
        
        return rates;
    }
    
    // جلب سعر عملة واحدة
    async fetchCurrencyRate(symbol) {
        try {
            const url = `${this.baseUrl}/${CONFIG.ENDPOINTS.TIME_SERIES}?` +
                `symbol=${symbol}&` +
                `interval=${CONFIG.INTERVAL}&` +
                `outputsize=${CONFIG.OUTPUT_SIZE}&` +
                `apikey=${this.apiKey}`;
            
            const response = await fetch(url, {
                timeout: 10000 // 10 ثواني timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message || 'خطأ في API');
            }
            
            if (data.values && data.values.length > 0) {
                const closePrice = parseFloat(data.values[0].close);
                return closePrice;
            }
            
            throw new Error('لا توجد بيانات');
            
        } catch (error) {
            console.error(`❌ فشل جلب ${symbol}:`, error.message);
            return null;
        }
    }
    
    // بيانات افتراضية للطوارئ
    getFallbackRates() {
        const rates = { USD: 1.0, ...CONFIG.DEFAULT_RATES };
        
        return {
            success: false,
            rates: rates,
            timestamp: Date.now(),
            source: 'fallback_data'
        };
    }
    
    // جلب سعر محدد
    async getExchangeRate(base, target) {
        if (base === target) return 1.0;
        
        try {
            const symbol = `${base}/${target}`;
            const rate = await this.fetchCurrencyRate(symbol);
            
            if (rate !== null) {
                return rate;
            }
            
            return CONFIG.DEFAULT_RATES[target] || 1.0;
            
        } catch (error) {
            console.error(`❌ فشل جلب سعر ${base}/${target}:`, error);
            return CONFIG.DEFAULT_RATES[target] || 1.0;
        }
    }
    
    // واجهة متوافقة للتطبيق
    async getRealTimeRates() {
        return this.fetchAllRates();
    }
    
    async getRates() {
        return this.fetchAllRates();
    }
    
    // تحويل المبلغ
    convertAmount(amount, fromCurrency, toCurrency, ratesData = null) {
        if (!ratesData) {
            ratesData = this.cache || this.getFallbackRates();
        }
        
        const rates = ratesData.rates;
        
        if (fromCurrency === toCurrency) return parseFloat(amount);
        
        if (!rates[fromCurrency] || !rates[toCurrency]) {
            console.warn(`⚠️ أسعار غير متوفرة: ${fromCurrency}/${toCurrency}`);
            return parseFloat(amount);
        }
        
        const amountInUSD = amount / rates[fromCurrency];
        const result = amountInUSD * rates[toCurrency];
        
        return parseFloat(result.toFixed(4));
    }
    
    // تحديث الأسعار يدوياً
    async forceRefresh() {
        this.cache = null;
        this.lastFetchTime = null;
        return this.fetchAllRates();
    }
}
