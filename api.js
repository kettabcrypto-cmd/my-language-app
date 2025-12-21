// api.js - TwelveData API Integration
class TwelveDataAPI {
    constructor(apiKey) {
        this.apiKey = apiKey || CONFIG.API_KEY;
        this.baseUrl = CONFIG.API_BASE_URL;
        this.cache = new Map();
        this.cacheDuration = CONFIG.CACHE_DURATION;
    }

    /**
     * جلب سعر صرف زوج عملات
     */
    async getExchangeRate(symbol, baseCurrency = 'USD') {
        const cacheKey = `rate_${symbol}_${baseCurrency}`;
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            console.log(`Using cached rate for ${symbol}/${baseCurrency}`);
            return cached;
        }

        try {
            // TwelveData uses format like "USD/EUR"
            const pair = `${baseCurrency}/${symbol}`;
            
            const response = await fetch(
                `${this.baseUrl}/exchange_rate?symbol=${pair}&apikey=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message || 'API Error');
            }
            
            // تنسيق البيانات
            const result = {
                pair: data.symbol,
                rate: parseFloat(data.rate),
                timestamp: new Date(data.timestamp * 1000),
                base: baseCurrency,
                target: symbol,
                bid: data.bid,
                ask: data.ask
            };
            
            // تخزين في الكاش
            this.setCachedData(cacheKey, result);
            
            return result;
            
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            
            // Fallback: استخدام بيانات افتراضية
            return this.getFallbackRate(symbol, baseCurrency);
        }
    }

    /**
     * جلب أسعار متعددة مرة واحدة
     */
    async getMultipleRates(symbols, baseCurrency = 'USD') {
        try {
            const promises = symbols.map(symbol => 
                this.getExchangeRate(symbol, baseCurrency)
            );
            
            const results = await Promise.all(promises);
            const rates = {};
            
            results.forEach(result => {
                if (result) {
                    rates[result.target] = result.rate;
                }
            });
            
            return rates;
            
        } catch (error) {
            console.error('Error fetching multiple rates:', error);
            return {};
        }
    }

    /**
     * جلب بيانات تاريخية
     */
    async getHistoricalData(symbol, interval = '1day', outputsize = 30) {
        const cacheKey = `history_${symbol}_${interval}_${outputsize}`;
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${this.apiKey}`
            );
            
            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message);
            }
            
            const result = {
                symbol: symbol,
                interval: interval,
                data: data.values || [],
                meta: data.meta
            };
            
            this.setCachedData(cacheKey, result, 60 * 60 * 1000); // تخزين لمدة ساعة
            
            return result;
            
        } catch (error) {
            console.error('Error fetching historical data:', error);
            return { symbol, interval, data: [] };
        }
    }

    /**
     * جلب بيانات سريعة (Quote)
     */
    async getQuote(symbol) {
        try {
            const response = await fetch(
                `${this.baseUrl}/quote?symbol=${symbol}&apikey=${this.apiKey}`
            );
            
            const data = await response.json();
            
            return {
                symbol: symbol,
                price: parseFloat(data.close),
                change: parseFloat(data.percent_change),
                high: parseFloat(data.high),
                low: parseFloat(data.low),
                volume: data.volume,
                timestamp: new Date(data.datetime)
            };
            
        } catch (error) {
            console.error('Error fetching quote:', error);
            return null;
        }
    }

    /**
     * جلب قائمة أزواج العملات المتاحة
     */
    async getAvailablePairs() {
        try {
            const response = await fetch(
                `${this.baseUrl}/currency_pairs?apikey=${this.apiKey}`
            );
            
            const data = await response.json();
            
            if (data.data) {
                return data.data.map(pair => ({
                    symbol: pair.symbol,
                    base: pair.currency_base,
                    quote: pair.currency_quote,
                    name: pair.name
                }));
            }
            
            return [];
            
        } catch (error) {
            console.error('Error fetching currency pairs:', error);
            
            // Fallback: استخدام القائمة الافتراضية
            return CONFIG.POPULAR_CURRENCIES.map(currency => ({
                symbol: `USD/${currency}`,
                base: 'USD',
                quote: currency,
                name: `${CONFIG.CURRENCY_NAMES[currency] || currency} مقابل الدولار`
            }));
        }
    }

    /**
     * التحقق من حالة API
     */
    async checkAPIStatus() {
        try {
            const response = await fetch(
                `${this.baseUrl}/exchange_rate?symbol=USD/EUR&apikey=${this.apiKey}`
            );
            
            const data = await response.json();
            
            return {
                status: data.status !== 'error',
                message: data.status === 'error' ? data.message : 'API working',
                credits: data.credits
            };
            
        } catch (error) {
            return {
                status: false,
                message: error.message,
                credits: 0
            };
        }
    }

    /**
     * جلب بيانات افتراضية عند فشل API
     */
    getFallbackRate(symbol, baseCurrency) {
        // بيانات افتراضية للاختبار
        const fallbackRates = {
            'USD': 1,
            'EUR': 0.92,
            'GBP': 0.79,
            'JPY': 149.5,
            'AED': 3.67,
            'SAR': 3.75,
            'EGP': 30.9,
            'CAD': 1.35,
            'AUD': 1.52,
            'CHF': 0.88
        };
        
        const baseRate = fallbackRates[baseCurrency] || 1;
        const targetRate = fallbackRates[symbol] || 1;
        const rate = targetRate / baseRate;
        
        return {
            pair: `${baseCurrency}/${symbol}`,
            rate: rate,
            timestamp: new Date(),
            base: baseCurrency,
            target: symbol,
            bid: rate * 0.999,
            ask: rate * 1.001
        };
    }

    /**
     * جلب بيانات من الكاش
     */
    getCachedData(key) {
        const item = this.cache.get(key);
        
        if (item && Date.now() - item.timestamp < this.cacheDuration) {
            return item.data;
        }
        
        // إزالة البيانات المنتهية
        if (item) {
            this.cache.delete(key);
        }
        
        return null;
    }

    /**
     * تخزين بيانات في الكاش
     */
    setCachedData(key, data, duration = null) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now(),
            duration: duration || this.cacheDuration
        });
        
        // تنظيف الكاش القديم تلقائياً
        this.cleanCache();
    }

    /**
     * تنظيف الكاش
     */
    cleanCache() {
        const now = Date.now();
        
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.duration) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * مسح الكاش بالكامل
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * تحديث جميع البيانات
     */
    async refreshAllData() {
        console.log('Refreshing all data from API...');
        this.clearCache();
        
        // يمكن إضافة منطق تحديث إضافي هنا
        return true;
    }
}

// إنشاء مثيل API للاستخدام العام
const CurrencyAPI = new TwelveDataAPI(CONFIG.API_KEY);

// اختبار الاتصال عند التحميل
CurrencyAPI.checkAPIStatus().then(status => {
    console.log('API Status:', status);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TwelveDataAPI, CurrencyAPI };
}
