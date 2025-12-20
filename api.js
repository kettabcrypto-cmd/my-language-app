// ملف: api.js
class ApiService {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = CONFIG.APP.CACHE_DURATION;
    }

    // 1. الحصول على جميع العملات المتاحة
    async getAllCurrencies() {
        const cacheKey = 'all_currencies';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `${CONFIG.FASTFOREX.BASE_URL}${CONFIG.FASTFOREX.ENDPOINTS.CURRENCIES}?api_key=${CONFIG.FASTFOREX_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            
            this.saveToCache(cacheKey, data.currencies);
            return data.currencies;
        } catch (error) {
            console.error('Error fetching currencies:', error);
            return {};
        }
    }

    // 2. جميع العملات مقابل USD
    async getAllRatesVsUSD() {
        const cacheKey = 'rates_vs_usd';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `${CONFIG.FASTFOREX.BASE_URL}${CONFIG.FASTFOREX.ENDPOINTS.FETCH_ALL}?from=USD&api_key=${CONFIG.FASTFOREX_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            
            this.saveToCache(cacheKey, data.results);
            return data.results;
        } catch (error) {
            console.error('Error fetching rates:', error);
            return {};
        }
    }

    // 3. تحويل العملات
    async convertCurrency(amount, from, to) {
        const cacheKey = `convert_${from}_${to}_${amount}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `${CONFIG.FASTFOREX.BASE_URL}${CONFIG.FASTFOREX.ENDPOINTS.CONVERT}?from=${from}&to=${to}&amount=${amount}&api_key=${CONFIG.FASTFOREX_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            
            const result = {
                amount: amount,
                from: from,
                to: to,
                rate: data.result[to] / amount,
                convertedAmount: data.result[to],
                date: new Date().toLocaleString('ar-SA')
            };
            
            this.saveToCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error converting currency:', error);
            return null;
        }
    }

    // 4. أسعار الذهب والفضة والعيارات
    async getGoldAndSilverPrices() {
        const cacheKey = 'gold_silver_prices';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // الحصول على سعر الذهب والفضة من CurrencyFreaks
            const url = `${CONFIG.CURRENCYFREAKS.BASE_URL}${CONFIG.CURRENCYFREAKS.ENDPOINTS.LATEST}?apikey=${CONFIG.CURRENCYFREAKS_API_KEY}&symbols=XAU,XAG`;
            const response = await fetch(url);
            const data = await response.json();
            
            // سعر أوقية الذهب بالدولار
            const goldPerOunceUSD = 1 / data.rates.XAU;
            
            // حساب العيارات المختلفة
            const goldPrices = {
                gold24k: goldPerOunceUSD,
                gold22k: goldPerOunceUSD * 0.9167,
                gold21k: goldPerOunceUSD * 0.875,
                gold18k: goldPerOunceUSD * 0.75,
                silver: 1 / data.rates.XAG,
                lastUpdated: new Date().toLocaleString('ar-SA')
            };
            
            this.saveToCache(cacheKey, goldPrices);
            return goldPrices;
        } catch (error) {
            console.error('Error fetching gold prices:', error);
            return null;
        }
    }

    // أدوات التخزين المؤقت
    getFromCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.cacheDuration) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }

    saveToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }
}

// إنشاء نسخة واحدة من الخدمة
const apiService = new ApiService();

// للاستخدام في المتصفح
if (typeof window !== 'undefined') {
    window.ApiService = apiService;
}

// للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiService;
}
