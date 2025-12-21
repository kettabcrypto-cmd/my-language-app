class CurrencyAPI {
    constructor() {
        this.apiKey = CONFIG.API_KEY;
        this.baseUrl = CONFIG.API_BASE_URL;
        this.cache = null;
        this.cacheDuration = CONFIG.UPDATE_INTERVAL;
        this.rates = { USD: 1.0 };
    }
    
    // الطريقة الرئيسية - جلب جميع الأسعار مرة واحدة
    async fetchAllRates() {
        try {
            console.log('🚀 جلب أسعار العملات من TwelveData...');
            
            // التحقق من التخزين المؤقت
            if (this.cache && (Date.now() - this.cache.timestamp < this.cacheDuration)) {
                console.log('📦 استخدام البيانات المخزنة');
                return this.cache;
            }
            
            // جلب أسعار جميع أزواج العملات
            await this.fetchMultipleRates();
            
            const result = {
                success: true,
                rates: this.rates,
                timestamp: Date.now(),
                source: 'twelvedata_time_series'
            };
            
            this.cache = result;
            console.log('✅ تم جلب الأسعار بنجاح:', this.rates);
            
            return result;
            
        } catch (error) {
            console.error('❌ خطأ في جلب الأسعار:', error);
            return this.getFallbackRates();
        }
    }
    
    // جلب أسعار متعددة
    async fetchMultipleRates() {
        const promises = CONFIG.CURRENCY_PAIRS.map(pair => 
            this.fetchCurrencyRate(pair)
        );
        
        // جلب جميع الأسعار بالتوازي
        const results = await Promise.allSettled(promises);
        
        results.forEach((result, index) => {
            const pair = CONFIG.CURRENCY_PAIRS[index];
            const targetCurrency = pair.split('/')[1]; // العملة الهدف
            
            if (result.status === 'fulfilled' && result.value !== null) {
                this.rates[targetCurrency] = result.value;
            } else {
                console.warn(`⚠️ فشل جلب ${pair}، استخدام سعر افتراضي`);
                this.rates[targetCurrency] = this.getDefaultRate(targetCurrency);
            }
        });
    }
    
    // جلب سعر عملة واحدة
    async fetchCurrencyRate(symbol) {
        try {
            const url = `${this.baseUrl}/${CONFIG.ENDPOINTS.TIME_SERIES}?` +
                `symbol=${symbol}&` +
                `interval=${CONFIG.INTERVAL}&` +
                `outputsize=${CONFIG.OUTPUT_SIZE}&` +
                `apikey=${this.apiKey}`;
            
            console.log(`🔗 جلب ${symbol}:`, url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message || 'خطأ في API');
            }
            
            if (data.values && data.values.length > 0) {
                // استخدام سعر الإغلاق (close)
                const closePrice = parseFloat(data.values[0].close);
                console.log(`✅ ${symbol}: ${closePrice}`);
                return closePrice;
            }
            
            throw new Error('لا توجد بيانات');
            
        } catch (error) {
            console.error(`❌ فشل جلب ${symbol}:`, error.message);
            return null;
        }
    }
    
    // جلب سعر محدد (للاستخدام المباشر)
    async getExchangeRate(base, target) {
        if (base === target) return 1.0;
        
        try {
            const symbol = `${base}/${target}`;
            const rate = await this.fetchCurrencyRate(symbol);
            
            if (rate !== null) {
                return rate;
            }
            
            return this.getDefaultRate(target);
            
        } catch (error) {
            console.error(`❌ فشل جلب سعر ${base}/${target}:`, error);
            return this.getDefaultRate(target);
        }
    }
    
    // بيانات افتراضية للطوارئ
    getDefaultRate(currency) {
        const defaultRates = {
            'EUR': 0.85404,
            'GBP': 0.79000,
            'JPY': 148.50,
            'AED': 3.6725,
            'SAR': 3.7500,
            'QAR': 3.6400,
            'CAD': 1.3500,
            'AUD': 1.5600,
            'CHF': 0.8800,
            'CNY': 7.1800
        };
        return defaultRates[currency] || 1.0;
    }
    
    getFallbackRates() {
        const rates = { USD: 1.0 };
        
        CONFIG.CURRENCY_PAIRS.forEach(pair => {
            const targetCurrency = pair.split('/')[1];
            rates[targetCurrency] = this.getDefaultRate(targetCurrency);
        });
        
        return {
            success: false,
            rates: rates,
            timestamp: Date.now(),
            source: 'fallback_data'
        };
    }
    
    // واجهة متوافقة
    async getRealTimeRates() {
        return this.fetchAllRates();
    }
    
    async getRates() {
        return this.fetchAllRates();
    }
    
    // تحويل المبالغ
    convertAmount(amount, fromCurrency, toCurrency, ratesData) {
        if (!ratesData || !ratesData.rates) {
            ratesData = { rates: this.rates };
        }
        
        const rates = ratesData.rates;
        
        if (fromCurrency === toCurrency) return amount;
        
        if (!rates[fromCurrency] || !rates[toCurrency]) {
            console.warn(`⚠️ أسعار غير متوفرة: ${fromCurrency}/${toCurrency}`);
            return amount;
        }
        
        const amountInUSD = amount / rates[fromCurrency];
        const result = amountInUSD * rates[toCurrency];
        
        return parseFloat(result.toFixed(4));
    }
}
