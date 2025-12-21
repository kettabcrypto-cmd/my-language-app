// currency-api.js
class CurrencyAPI {
    constructor() {
        // API Key الخاص بـ TwelveData - استخدم المفتاح الذي قدمته
        this.apiKey = 'b83fce53976843bbb59336c03f9a6a30';
        this.baseUrl = 'https://api.twelvedata.com';
        
        // العملات المدعومة (رموز TwelveData)
        this.supportedCurrencies = [
            'USD', 'EUR', 'GBP', 'JPY', 
            'AED', 'SAR', 'QAR', 'MXN', 
            'AUD', 'KRW'
        ];
        
        // أزواج العملات الافتراضية مع USD كأساس
        this.currencyPairs = [
            'USD/EUR', 'USD/GBP', 'USD/JPY', 'USD/AED',
            'USD/SAR', 'USD/QAR', 'USD/MXN', 'USD/AUD', 'USD/KRW'
        ];
    }

    // جلب جميع أسعار العملات في طلب واحد
    async fetchAllRates(baseCurrency = 'USD') {
        try {
            console.log(`جاري جلب أسعار العملات باستخدام TwelveData API`);
            
            // مع TwelveData، نحتاج لجلب كل زوج على حدة أو استخدام endpoint مختلف
            // سنستخدم time_series endpoint مع interval=1min للحصول على آخر سعر
            
            const rates = {};
            const baseRates = {};
            
            // جلب سعر USD كأساس (دائماً 1)
            rates['USD'] = 1;
            
            // جلب الأسعار للعملات الأخرى مقابل USD
            for (const currency of this.supportedCurrencies) {
                if (currency === 'USD') continue;
                
                try {
                    const rate = await this.fetchExchangeRate('USD', currency);
                    if (rate) {
                        rates[currency] = rate;
                        baseRates[currency] = rate;
                    }
                } catch (error) {
                    console.warn(`فشل جلب سعر ${currency}:`, error);
                    // استخدام سعر افتراضي
                    rates[currency] = this.getDefaultRate(currency);
                }
            }
            
            // إذا كانت العملة الأساسية ليست USD، نحتاج لإعادة حساب الأسعار
            if (baseCurrency !== 'USD') {
                return this.convertRatesToBase(baseCurrency, rates);
            }
            
            return {
                base: 'USD',
                rates: rates,
                timestamp: Math.floor(Date.now() / 1000),
                nextUpdate: Math.floor(Date.now() / 1000) + 3600
            };
            
        } catch (error) {
            console.error('خطأ في جلب أسعار العملات من TwelveData:', error);
            
            // إرجاع بيانات تجريبية في حالة فشل API
            return this.getFallbackRates(baseCurrency);
        }
    }

    // جلب سعر صرف محدد
    async fetchExchangeRate(fromCurrency, toCurrency) {
        try {
            // إذا كانت العملتان متطابقتان
            if (fromCurrency === toCurrency) return 1;
            
            const symbol = `${fromCurrency}/${toCurrency}`;
            const url = `${this.baseUrl}/exchange_rate?symbol=${symbol}&apikey=${this.apiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`فشل جلب سعر الصرف: ${response.status}`);
            }
            
            const data = await response.json();
            
            // التحقق من استجابة API
            if (data.status === 'error') {
                throw new Error(`خطأ في TwelveData API: ${data.message}`);
            }
            
            return parseFloat(data.rate);
            
        } catch (error) {
            console.error(`فشل جلب سعر الصرف ${fromCurrency}/${toCurrency}:`, error);
            
            // محاولة بديلة باستخدام endpoint مختلف
            return await this.fetchTimeSeriesRate(fromCurrency, toCurrency);
        }
    }

    // طريقة بديلة لجلب السعر باستخدام time_series
    async fetchTimeSeriesRate(fromCurrency, toCurrency) {
        try {
            const symbol = `${fromCurrency}/${toCurrency}`;
            const url = `${this.baseUrl}/time_series?symbol=${symbol}&interval=1min&apikey=${this.apiKey}&outputsize=1`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`فشل جلب time_series: ${response.status}`);
            }
            
            const data = await response.json();
            
            // التحقق من استجابة API
            if (data.status === 'error') {
                throw new Error(`خطأ في TwelveData API: ${data.message}`);
            }
            
            // الحصول على آخر سعر مغلق
            if (data.values && data.values.length > 0) {
                return parseFloat(data.values[0].close);
            }
            
            return null;
            
        } catch (error) {
            console.error(`فشل جلب time_series rate ${fromCurrency}/${toCurrency}:`, error);
            return null;
        }
    }

    // تحويل الأسعار من USD إلى عملة أساسية أخرى
    convertRatesToBase(newBaseCurrency, usdRates) {
        if (!usdRates[newBaseCurrency]) {
            console.warn(`لا يوجد سعر للعملة الأساسية ${newBaseCurrency}`);
            return {
                base: 'USD',
                rates: usdRates,
                timestamp: Math.floor(Date.now() / 1000),
                nextUpdate: Math.floor(Date.now() / 1000) + 3600
            };
        }
        
        const newBaseRate = usdRates[newBaseCurrency];
        const newRates = {};
        
        // تحويل جميع الأسعار إلى العملة الأساسية الجديدة
        for (const currency in usdRates) {
            newRates[currency] = usdRates[currency] / newBaseRate;
        }
        
        return {
            base: newBaseCurrency,
            rates: newRates,
            timestamp: Math.floor(Date.now() / 1000),
            nextUpdate: Math.floor(Date.now() / 1000) + 3600
        };
    }

    // الأسعار الافتراضية للعملات (مقابل USD)
    getDefaultRate(currency) {
        const defaultRates = {
            'EUR': 0.9300,
            'GBP': 0.7900,
            'JPY': 148.0000,
            'AED': 3.6700,
            'SAR': 3.7500,
            'QAR': 3.6400,
            'MXN': 17.5000,
            'AUD': 1.5600,
            'KRW': 1330.0000
        };
        
        return defaultRates[currency] || 1;
    }

    // بيانات تجريبية لاستخدامها عند فشل الاتصال بالإنترنت أو API
    getFallbackRates(baseCurrency = 'USD') {
        const fallbackRates = {
            USD: 1.0000,
            EUR: 0.9300,
            GBP: 0.7900,
            JPY: 148.0000,
            AED: 3.6700,
            SAR: 3.7500,
            QAR: 3.6400,
            MXN: 17.5000,
            AUD: 1.5600,
            KRW: 1330.0000
        };
        
        // إذا كانت العملة الأساسية ليست USD، نقوم بتحويل الأسعار
        if (baseCurrency !== 'USD' && fallbackRates[baseCurrency]) {
            const baseRate = fallbackRates[baseCurrency];
            const convertedRates = {};
            
            for (const currency in fallbackRates) {
                convertedRates[currency] = fallbackRates[currency] / baseRate;
            }
            
            return {
                base: baseCurrency,
                rates: convertedRates,
                timestamp: Math.floor(Date.now() / 1000),
                nextUpdate: Math.floor(Date.now() / 1000) + 3600
            };
        }
        
        return {
            base: 'USD',
            rates: fallbackRates,
            timestamp: Math.floor(Date.now() / 1000),
            nextUpdate: Math.floor(Date.now() / 1000) + 3600
        };
    }

    // تحويل مبلغ بين عملتين
    convert(amount, fromCurrency, toCurrency, rates) {
        if (!rates || !rates[fromCurrency] || !rates[toCurrency]) {
            console.error('أسعار العملات غير متوفرة للتحويل');
            return 0;
        }
        
        // التحويل باستخدام الأسعار بالنسبة للعملة الأساسية
        if (rates.base === fromCurrency) {
            // إذا كانت العملة المصدر هي الأساس
            return amount * rates[toCurrency];
        } else if (rates.base === toCurrency) {
            // إذا كانت العملة الهدف هي الأساس
            return amount / rates[fromCurrency];
        } else {
            // تحويل من العملة المصدر إلى الأساس ثم إلى العملة الهدف
            const amountInBase = amount / rates[fromCurrency];
            return amountInBase * rates[toCurrency];
        }
    }

    // الحصول على سعر الصرف بين عملتين
    getExchangeRate(fromCurrency, toCurrency, rates) {
        if (fromCurrency === toCurrency) return 1;
        
        if (!rates || !rates[fromCurrency] || !rates[toCurrency]) {
            // استخدام البيانات الافتراضية
            const fallback = this.getFallbackRates('USD');
            return fallback.rates[toCurrency] / fallback.rates[fromCurrency];
        }
        
        // حساب سعر الصرف باستخدام الأسعار بالنسبة للعملة الأساسية
        return rates[toCurrency] / rates[fromCurrency];
    }
}

// تصدير الكلاس لاستخدامه في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyAPI;
}
