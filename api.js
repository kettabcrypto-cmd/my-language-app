// api.js - الاتصال بـ TwelveData API
class CurrencyAPI {
    constructor() {
        this.apiKey = CONFIG.API_KEY;
        this.baseUrl = CONFIG.API_BASE_URL;
        this.cache = {};
        this.lastFetch = null;
    }
    
    // جلب جميع الأسعار في طلب واحد
    async getAllRatesInOneRequest() {
        try {
            console.log('🔄 جلب جميع أسعار العملات في طلب واحد...');
            
            // التحقق من التخزين المؤقت
            const now = Date.now();
            if (this.cache.rates && this.lastFetch && 
                (now - this.lastFetch) < CONFIG.CACHE_DURATION) {
                console.log('📂 استخدام البيانات المخزنة مؤقتاً');
                return this.cache.rates;
            }
            
            // إنشاء رموز جميع العملات مقابل USD
            const currencies = CONFIG.ALL_CURRENCIES.map(c => c.code).filter(c => c !== 'USD');
            const symbols = currencies.map(c => `USD/${c}`).join(',');
            
            // استخدام time_series endpoint مع interval=1min للحصول على آخر سعر
            const url = `${this.baseUrl}/time_series?` +
                `symbol=${symbols}&` +
                `interval=1min&` +
                `apikey=${this.apiKey}&` +
                `outputsize=1&` +
                `format=JSON`;
            
            console.log('🌐 جاري الاتصال بـ TwelveData API...');
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`فشل جلب البيانات: ${response.status}`);
            }
            
            const data = await response.json();
            
            // معالجة الاستجابة
            const processedRates = this.processBatchResponse(data);
            
            // التخزين المؤقت
            this.cache.rates = processedRates;
            this.lastFetch = now;
            
            console.log('✅ تم جلب الأسعار بنجاح');
            return processedRates;
            
        } catch (error) {
            console.error('❌ خطأ في جلب الأسعار:', error);
            
            // استخدام البيانات الافتراضية في حالة الفشل
            return this.getDefaultRates();
        }
    }
    
    // معالجة استجابة الـ batch
    processBatchResponse(data) {
        const rates = { USD: 1.0 };
        
        // الأسعار الافتراضية
        const defaultRates = {
            USD: 1.0,
            EUR: 0.93,
            GBP: 0.79,
            JPY: 148.0,
            CHF: 0.88,
            CAD: 1.35,
            AUD: 1.51,
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
            HKD: 7.82,
            MYR: 4.67,
            MAD: 10.1,
            TND: 3.11,
            ARS: 350.0
        };
        
        // محاولة استخراج الأسعار من الاستجابة
        CONFIG.ALL_CURRENCIES.forEach(currency => {
            if (currency.code === 'USD') return;
            
            const symbol = `USD/${currency.code}`;
            
            if (data[symbol]) {
                const symbolData = data[symbol];
                
                if (symbolData.values && symbolData.values.length > 0) {
                    // أخذ آخر سعر مغلق
                    rates[currency.code] = parseFloat(symbolData.values[0].close);
                } else if (symbolData.rate) {
                    // إذا كان endpoint مختلف
                    rates[currency.code] = parseFloat(symbolData.rate);
                } else {
                    // استخدام سعر افتراضي
                    rates[currency.code] = defaultRates[currency.code] || 1;
                }
            } else {
                // استخدام سعر افتراضي
                rates[currency.code] = defaultRates[currency.code] || 1;
            }
        });
        
        return {
            success: true,
            rates: rates,
            timestamp: new Date().toISOString(),
            source: 'twelvedata_batch'
        };
    }
    
    // البيانات الافتراضية
    getDefaultRates() {
        const defaultRates = {
            USD: 1.0,
            EUR: 0.93,
            GBP: 0.79,
            JPY: 148.0,
            CHF: 0.88,
            CAD: 1.35,
            AUD: 1.51,
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
            HKD: 7.82,
            MYR: 4.67,
            MAD: 10.1,
            TND: 3.11,
            ARS: 350.0
        };
        
        return {
            success: false,
            rates: defaultRates,
            timestamp: new Date().toISOString(),
            source: 'default_fallback'
        };
    }
    
    // تحويل مبلغ
    convertAmount(amount, fromCurrency, toCurrency, ratesData) {
        if (!ratesData || !ratesData.rates) return 0;
        
        const rates = ratesData.rates;
        
        if (fromCurrency === toCurrency) {
            return amount;
        }
        
        if (!rates[fromCurrency] || !rates[toCurrency]) {
            return 0;
        }
        
        // التحويل عبر USD
        const amountInUSD = amount / rates[fromCurrency];
        return amountInUSD * rates[toCurrency];
    }
    
    // الحصول على سعر الصرف
    getExchangeRate(fromCurrency, toCurrency, ratesData) {
        if (!ratesData || !ratesData.rates) return 1;
        
        const rates = ratesData.rates;
        
        if (fromCurrency === toCurrency) {
            return 1.0;
        }
        
        if (!rates[fromCurrency] || !rates[toCurrency]) {
            return 1;
        }
        
        return rates[toCurrency] / rates[fromCurrency];
    }
}
