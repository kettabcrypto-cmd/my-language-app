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
            
            // بناء URL لـ TwelveData API
            // سنستخدم endpoint مختلف للحصول على أفضل النتائج
            const url = `${this.baseUrl}/exchange_rate?` +
                `symbol=USD/EUR,USD/GBP,USD/JPY,USD/AED,USD/SAR,USD/QAR,USD/MXN,USD/AUD,USD/KRW&` +
                `apikey=${this.apiKey}&` +
                `format=JSON`;
            
            console.log('🌐 جاري الاتصال بـ TwelveData API...', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ استجابة API غير ناجحة:', response.status, errorText);
                throw new Error(`فشل جلب البيانات: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 استجابة API:', data);
            
            // معالجة الاستجابة
            const processedRates = this.processAPIResponse(data);
            
            // التخزين المؤقت
            this.cache.rates = processedRates;
            this.lastFetch = now;
            
            console.log('✅ تم جلب الأسعار بنجاح:', processedRates);
            return processedRates;
            
        } catch (error) {
            console.error('❌ خطأ في جلب الأسعار:', error);
            
            // استخدام البيانات الافتراضية في حالة الفشل
            const defaultRates = this.getDefaultRates();
            console.log('⚠️ استخدام البيانات الافتراضية:', defaultRates);
            return defaultRates;
        }
    }
    
    // معالجة استجابة API
    processAPIResponse(data) {
        console.log('🔧 معالجة استجابة API...', data);
        
        // إنشاء كائن الأسعار الأساسي
        const rates = { USD: 1.0 };
        
        // تحليل البيانات بناءً على هيكل TwelveData
        if (data && typeof data === 'object') {
            // TwelveData تعيد كائناً مع أزواج العملات كمفاتيح
            Object.entries(data).forEach(([key, value]) => {
                if (key.includes('/')) {
                    // استخراج رمز العملة الهدف
                    const targetCurrency = key.split('/')[1];
                    
                    if (value && value.rate) {
                        rates[targetCurrency] = parseFloat(value.rate);
                    } else if (typeof value === 'number') {
                        rates[targetCurrency] = value;
                    }
                }
            });
        }
        
        // إضافة العملات المفقودة بالبيانات الافتراضية
        this.fillMissingRates(rates);
        
        return {
            success: true,
            rates: rates,
            timestamp: new Date().toISOString(),
            source: 'twelvedata_api'
        };
    }
    
    // تعبئة العملات المفقودة
    fillMissingRates(rates) {
        const defaultRates = this.getDefaultRates();
        
        // قائمة العملات المطلوبة
        const requiredCurrencies = [
            'EUR', 'GBP', 'JPY', 'AED', 
            'SAR', 'QAR', 'MXN', 'AUD', 'KRW'
        ];
        
        requiredCurrencies.forEach(currency => {
            if (!rates[currency] || rates[currency] === 1) {
                rates[currency] = defaultRates.rates[currency] || 1;
            }
        });
    }
    
    // البيانات الافتراضية (للأسعار المشهورة)
    getDefaultRates() {
        return {
            success: false,
            rates: {
                USD: 1.0000,
                EUR: 0.9300,
                GBP: 0.7900,
                JPY: 148.0000,
                CHF: 0.8800,
                CAD: 1.3500,
                AUD: 1.5600,
                CNY: 7.1800,
                AED: 3.6700,
                SAR: 3.7500,
                QAR: 3.6400,
                EGP: 30.9000,
                TRY: 28.5000,
                INR: 83.0000,
                RUB: 91.5000,
                BRL: 4.9500,
                ZAR: 18.7000,
                MXN: 17.2000,
                KRW: 1310.0000,
                HKD: 7.8200,
                MYR: 4.6700,
                MAD: 10.1000,
                TND: 3.1100,
                ARS: 350.0000
            },
            timestamp: new Date().toISOString(),
            source: 'default_fallback'
        };
    }
    
    // طريقة بديلة: جلب كل سعر على حدة (إذا فشلت الطريقة الأولى)
    async getRatesFallback() {
        try {
            console.log('🔄 استخدام الطريقة البديلة لجلب الأسعار...');
            
            const rates = { USD: 1.0 };
            const promises = [];
            
            // العملات الرئيسية فقط لعدم استهلاك الكثير من الطلبات
            const mainCurrencies = ['EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR'];
            
            for (const currency of mainCurrencies) {
                promises.push(
                    this.fetchSingleRate('USD', currency)
                        .then(rate => {
                            rates[currency] = rate;
                        })
                        .catch(error => {
                            console.warn(`❌ فشل جلب سعر USD/${currency}:`, error);
                            const defaultRates = this.getDefaultRates();
                            rates[currency] = defaultRates.rates[currency] || 1;
                        })
                );
            }
            
            await Promise.all(promises);
            
            return {
                success: true,
                rates: rates,
                timestamp: new Date().toISOString(),
                source: 'fallback_method'
            };
            
        } catch (error) {
            console.error('❌ فشل الطريقة البديلة:', error);
            return this.getDefaultRates();
        }
    }
    
    // جلب سعر صرف واحد
    async fetchSingleRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return 1.0;
        
        const url = `${this.baseUrl}/exchange_rate?` +
            `symbol=${fromCurrency}/${toCurrency}&` +
            `apikey=${this.apiKey}`;
        
        console.log(`🌐 جاري جلب سعر ${fromCurrency}/${toCurrency}...`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`فشل جلب السعر: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
            throw new Error(data.message || 'خطأ في API');
        }
        
        return parseFloat(data.rate);
    }
    
    // الدالة الرئيسية (محاولة الطريقة الأولى، ثم البديلة)
    async getRates() {
        try {
            // محاولة الطريقة الأولى (batch)
            const batchResult = await this.getAllRatesInOneRequest();
            if (batchResult.success) {
                return batchResult;
            }
        } catch (error) {
            console.warn('⚠️ فشل الطريقة الأولى:', error);
        }
        
        // محاولة الطريقة البديلة
        try {
            const fallbackResult = await this.getRatesFallback();
            if (fallbackResult.success) {
                return fallbackResult;
            }
        } catch (error) {
            console.warn('⚠️ فشل الطريقة البديلة:', error);
        }
        
        // استخدام البيانات الافتراضية
        return this.getDefaultRates();
    }
    
    // تحويل مبلغ
    convertAmount(amount, fromCurrency, toCurrency, ratesData) {
        if (!ratesData || !ratesData.rates) {
            console.warn('⚠️ لا توجد بيانات أسعار للتحويل');
            return 0;
        }
        
        const rates = ratesData.rates;
        
        if (fromCurrency === toCurrency) {
            return amount;
        }
        
        if (!rates[fromCurrency] || !rates[toCurrency]) {
            console.warn(`⚠️ أسعار العملات غير متوفرة: ${fromCurrency}/${toCurrency}`);
            console.log('📊 الأسعار المتوفرة:', Object.keys(rates));
            return 0;
        }
        
        // التحويل عبر USD
        const amountInUSD = amount / rates[fromCurrency];
        const result = amountInUSD * rates[toCurrency];
        
        console.log(`💰 التحويل: ${amount} ${fromCurrency} = ${result} ${toCurrency}`);
        return result;
    }
    
    // الحصول على سعر الصرف
    getExchangeRate(fromCurrency, toCurrency, ratesData) {
        if (!ratesData || !ratesData.rates) {
            console.warn('⚠️ لا توجد بيانات أسعار');
            return 1;
        }
        
        const rates = ratesData.rates;
        
        if (fromCurrency === toCurrency) {
            return 1.0;
        }
        
        if (!rates[fromCurrency] || !rates[toCurrency]) {
            console.warn(`⚠️ أسعار العملات غير متوفرة: ${fromCurrency}/${toCurrency}`);
            return 1;
        }
        
        return rates[toCurrency] / rates[fromCurrency];
    }
}
