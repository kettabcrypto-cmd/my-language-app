// في ملف js/api.js
class CurrencyAPI {
    constructor() {
        this.cacheDuration = 55 * 60 * 1000; // 55 دقيقة
    }

    // جلب جميع الأسعار في طلب واحد
    async getAllExchangeRates() {
        try {
            // التحقق من الكاش أولاً
            const cached = this.getCachedRates();
            if (cached && (Date.now() - cached.timestamp) < this.cacheDuration) {
                console.log('Using cached rates');
                return cached.rates;
            }

            console.log('Fetching fresh rates from API...');
            
            // إنشاء وعود لجميع العملات
            const promises = CONFIG.TARGET_CURRENCIES.map(currency => 
                this.fetchRate('USD', currency)
            );
            
            // تنفيذ جميع الطلبات بالتوازي
            const results = await Promise.allSettled(promises);
            
            // تجميع النتائج
            const rates = { USD: 1.0 };
            
            results.forEach((result, index) => {
                const currency = CONFIG.TARGET_CURRENCIES[index];
                if (result.status === 'fulfilled' && result.value) {
                    rates[currency] = result.value;
                } else {
                    console.error(`Failed to fetch rate for ${currency}:`, result.reason);
                    rates[currency] = this.getDefaultRate(currency);
                }
            });
            
            // حفظ في الكاش
            this.saveToCache(rates);
            
            return rates;
            
        } catch (error) {
            console.error('Error fetching rates:', error);
            return this.getCachedRates()?.rates || this.getDefaultRates();
        }
    }

    // جلب سعر عملة واحدة
    async fetchRate(fromCurrency, toCurrency) {
        try {
            const response = await fetch(
                `${CONFIG.TWELVEDATA_API_URL}?symbol=${fromCurrency}/${toCurrency}&apikey=${CONFIG.TWELVEDATA_API_KEY}`
            );
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error') {
                console.error(`API error for ${fromCurrency}/${toCurrency}:`, data.message);
                return null;
            }
            
            return parseFloat(data.rate);
            
        } catch (error) {
            console.error(`Error fetching ${fromCurrency}/${toCurrency}:`, error);
            return null;
        }
    }

    // الحصول على الصورة
    getFlagImage(currencyCode) {
        let flagCode = currencyCode.toLowerCase();
        
        // استثناءات خاصة
        if (CONFIG.CURRENCY_FLAG_MAPPING[currencyCode]) {
            flagCode = CONFIG.CURRENCY_FLAG_MAPPING[currencyCode];
        }
        
        // AED بدون حرف x
        if (flagCode === 'aed') {
            return `${CONFIG.IMAGE_BASE_URL}100-currency-${flagCode}.png`;
        }
        
        return `${CONFIG.IMAGE_BASE_URL}100-currency-${flagCode}x.png`;
    }

    // التخزين المؤقت
    saveToCache(rates) {
        const cacheData = {
            rates: rates,
            timestamp: Date.now()
        };
        localStorage.setItem('exchangeRates', JSON.stringify(cacheData));
        localStorage.setItem('lastUpdate', new Date().toISOString());
    }

    getCachedRates() {
        try {
            const cached = localStorage.getItem('exchangeRates');
            if (!cached) return null;
            
            const data = JSON.parse(cached);
            const age = Date.now() - data.timestamp;
            
            if (age > this.cacheDuration) {
                return null;
            }
            
            return data;
        } catch (e) {
            return null;
        }
    }

    // الأسعار الافتراضية
    getDefaultRates() {
        return {
            USD: 1.0,
            EUR: 0.93,
            GBP: 0.79,
            JPY: 148.0,
            CAD: 1.35,
            AUD: 1.51,
            CHF: 0.88,
            CNY: 7.18,
            AED: 3.67,
            SAR: 3.75,
            QAR: 3.64,
            EGP: 30.9,
            TRY: 28.5,
            INR: 83.0,
            RUB: 91.5,
            BRL: 4.95,
            ZAR: 18.7,
            MXN: 17.2,
            KRW: 1310.0,
            MAD: 10.1,
            TND: 3.11
        };
    }

    getDefaultRate(currency) {
        const defaults = this.getDefaultRates();
        return defaults[currency] || 1.0;
    }
}

const currencyAPI = new CurrencyAPI();
