// api.js - API معدل ليعمل مع TwelveData
class CurrencyAPI {
    constructor() {
        this.apiKey = CONFIG.API_KEY;
        this.baseUrl = CONFIG.API_BASE_URL;
        this.cache = {};
        this.lastFetch = null;
        this.isFetching = false;
    }
    
    // الطريقة الرئيسية لجلب الأسعار
    async getRealTimeRates() {
        try {
            console.log('🚀 جلب أسعار حقيقية من TwelveData...');
            
            // منع طلبات متعددة في نفس الوقت
            if (this.isFetching) {
                console.log('⏳ طلب قيد المعالجة، الانتظار...');
                return this.cache.rates || this.getDefaultRates();
            }
            
            this.isFetching = true;
            
            // اختبار 1: استخدام currency_exchange_rate endpoint
            let rates = await this.tryCurrencyExchangeEndpoint();
            
            // اختبار 2: إذا فشل الأول، استخدم exchange_rate
            if (!rates.success) {
                console.log('🔄 تجربة endpoint آخر...');
                rates = await this.tryExchangeRateEndpoint();
            }
            
            // اختبار 3: إذا فشل الاثنان، استخدم البيانات الافتراضية
            if (!rates.success) {
                console.log('⚠️ استخدام البيانات الافتراضية');
                rates = this.getDefaultRates();
            }
            
            // التخزين المؤقت
            this.cache.rates = rates;
            this.lastFetch = Date.now();
            this.isFetching = false;
            
            console.log('✅ الأسعار المستلمة:', {
                source: rates.source,
                currencies: Object.keys(rates.rates).length,
                sample: {
                    EUR: rates.rates.EUR,
                    GBP: rates.rates.GBP,
                    JPY: rates.rates.JPY
                }
            });
            
            return rates;
            
        } catch (error) {
            console.error('❌ خطأ في جلب الأسعار الحقيقية:', error);
            this.isFetching = false;
            return this.getDefaultRates();
        }
    }
    
    // الطريقة 1: استخدام currency_exchange_rate endpoint
    async tryCurrencyExchangeEndpoint() {
        try {
            console.log('🔗 تجربة currency_exchange_rate endpoint...');
            
            // العملات المطلوبة
            const currencies = ['EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR', 'MXN', 'AUD', 'KRW'];
            const rates = { USD: 1.0 };
            
            // جلب كل سعر على حدة (لكن يمكن تحسينه)
            for (const currency of currencies) {
                try {
                    const rate = await this.fetchCurrencyExchangeRate('USD', currency);
                    rates[currency] = rate;
                    console.log(`✅ ${currency}: ${rate}`);
                } catch (error) {
                    console.warn(`⚠️ فشل جلب ${currency}:`, error.message);
                    rates[currency] = this.getDefaultRate(currency);
                }
            }
            
            return {
                success: true,
                rates: rates,
                timestamp: new Date().toISOString(),
                source: 'currency_exchange_endpoint'
            };
            
        } catch (error) {
            console.error('❌ فشل currency_exchange_endpoint:', error);
            return { success: false };
        }
    }
    
    // الطريقة 2: استخدام exchange_rate endpoint
    async tryExchangeRateEndpoint() {
        try {
            console.log('🔗 تجربة exchange_rate endpoint...');
            
            // إنشاء URL لعدة أزواج
            const symbols = ['USD/EUR', 'USD/GBP', 'USD/JPY', 'USD/AED', 'USD/SAR', 'USD/QAR'].join(',');
            const url = `${this.baseUrl}/exchange_rate?symbol=${symbols}&apikey=${this.apiKey}`;
            
            console.log('🌐 URL:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 استجابة API:', data);
            
            // معالجة الاستجابة
            const rates = { USD: 1.0 };
            
            if (data && typeof data === 'object') {
                // TwelveData قد تعيد كائناً بسيطاً
                if (data.rate) {
                    // إذا كان سعر واحد فقط
                    rates.EUR = parseFloat(data.rate);
                } else {
                    // البحث عن الأسعار في الاستجابة
                    Object.keys(data).forEach(key => {
                        if (key.includes('/')) {
                            const targetCurrency = key.split('/')[1];
                            const rateData = data[key];
                            
                            if (rateData && rateData.rate) {
                                rates[targetCurrency] = parseFloat(rateData.rate);
                            }
                        }
                    });
                }
            }
            
            // تعبئة العملات المفقودة
            this.fillMissingRates(rates);
            
            return {
                success: true,
                rates: rates,
                timestamp: new Date().toISOString(),
                source: 'exchange_rate_endpoint'
            };
            
        } catch (error) {
            console.error('❌ فشل exchange_rate_endpoint:', error);
            return { success: false };
        }
    }
    
    // جلب سعر صرف محدد
    async fetchCurrencyExchangeRate(base, target) {
        if (base === target) return 1.0;
        
        const url = `${this.baseUrl}/currency_exchange_rate?` +
            `base=${base}&` +
            `target=${target}&` +
            `apikey=${this.apiKey}`;
        
        console.log(`🔗 جلب ${base}/${target}: ${url}`);
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message || 'خطأ في API');
            }
            
            if (data.rate) {
                return parseFloat(data.rate);
            }
            
            throw new Error('لا يوجد rate في الاستجابة');
            
        } catch (error) {
            console.error(`❌ فشل جلب ${base}/${target}:`, error);
            throw error;
        }
    }
    
    // تعبئة العملات المفقودة بالبيانات الافتراضية
    fillMissingRates(rates) {
        const requiredCurrencies = ['EUR', 'GBP', 'JPY', 'AED', 'SAR', 'QAR', 'MXN', 'AUD', 'KRW'];
        const defaultRates = this.getDefaultRates().rates;
        
        requiredCurrencies.forEach(currency => {
            if (!rates[currency] || rates[currency] === 1) {
                rates[currency] = defaultRates[currency] || 1;
                console.log(`📝 استخدام سعر افتراضي لـ ${currency}: ${rates[currency]}`);
            }
        });
    }
    
    // سعر افتراضي لعملة معينة
    getDefaultRate(currency) {
        const defaultRates = this.getDefaultRates().rates;
        return defaultRates[currency] || 1.0;
    }
    
    // البيانات الافتراضية
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
    
    // واجهة متوافقة مع بقية التطبيق
    async getRates() {
        return this.getRealTimeRates();
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
            console.warn(`⚠️ أسعار غير متوفرة: ${fromCurrency}/${toCurrency}`);
            return 0;
        }
        
        const amountInUSD = amount / rates[fromCurrency];
        const result = amountInUSD * rates[toCurrency];
        
        return parseFloat(result.toFixed(4));
    }
    
    // الحصول على سعر الصرف
    getExchangeRate(fromCurrency, toCurrency, ratesData) {
        if (!ratesData || !ratesData.rates) {
            return 1;
        }
        
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
