// API functions for real-time exchange rates using TwelveData

class CurrencyAPI {
    constructor() {
        this.cacheDuration = CONFIG.CACHE_DURATION;
        this.refreshInterval = CONFIG.REFRESH_INTERVAL;
        this.refreshTimer = null;
    }

    // جلب جميع الأسعار في طلب واحد
    async getAllRatesFromUSD() {
        try {
            // التحقق من عدد الطلبات اليومية
            this.checkDailyApiLimit();
            
            // التحقق من وجود بيانات مخزنة حديثاً
            const cachedData = this.getCachedRates();
            if (cachedData && Date.now() - cachedData.timestamp < this.cacheDuration) {
                console.log('Using cached rates');
                return cachedData.rates;
            }

            console.log('Fetching fresh rates from TwelveData API');
            
            // إنشاء وعود متعددة لجلب كل الأسعار
            const ratePromises = CONFIG.TARGET_CURRENCIES.map(currency => 
                this.getExchangeRate('USD', currency)
            );
            
            // تنفيذ جميع الطلبات بالتوازي
            const results = await Promise.allSettled(ratePromises);
            
            // تجميع النتائج
            const rates = { USD: 1.0 }; // USD مقابل نفسه = 1
            
            results.forEach((result, index) => {
                const currency = CONFIG.TARGET_CURRENCIES[index];
                if (result.status === 'fulfilled' && result.value) {
                    rates[currency] = result.value;
                } else {
                    // استخدام القيمة المخزنة مسبقاً في حالة الفشل
                    const cached = cachedData ? cachedData.rates[currency] : null;
                    rates[currency] = cached || this.getDefaultRate(currency);
                }
            });
            
            // تخزين البيانات في localStorage
            const cacheData = {
                rates: rates,
                base: 'USD',
                timestamp: Date.now()
            };
            
            localStorage.setItem('exchangeRates', JSON.stringify(cacheData));
            localStorage.setItem('lastUpdate', new Date().toISOString());
            
            // حساب وقت التحديث التالي
            const nextUpdateTime = Date.now() + this.refreshInterval;
            localStorage.setItem('nextUpdate', nextUpdateTime.toString());
            appState.nextUpdate = nextUpdateTime;
            
            // تحديث عداد الطلبات
            updateApiCallCounter();
            
            // بدء مؤقت التحديث التلقائي
            this.startAutoRefresh();
            
            return rates;
            
        } catch (error) {
            console.error('Error fetching all rates:', error);
            
            // استخدام بيانات مخزنة في حالة فشل الاتصال
            const cachedData = this.getCachedRates();
            if (cachedData) {
                return cachedData.rates;
            }
            
            return this.getDefaultRates();
        }
    }

    // جلب سعر صرف عملة واحدة
    async getExchangeRate(fromCurrency, toCurrency) {
        try {
            const response = await fetch(
                `${CONFIG.TWELVEDATA_API_URL}?symbol=${fromCurrency}/${toCurrency}&apikey=${CONFIG.TWELVEDATA_API_KEY}`
            );
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error') {
                console.error(`API Error for ${fromCurrency}/${toCurrency}:`, data.message);
                return null;
            }
            
            return parseFloat(data.rate);
            
        } catch (error) {
            console.error(`Error fetching rate for ${fromCurrency}/${toCurrency}:`, error);
            return null;
        }
    }

    // التحقق من حدود API اليومية
    checkDailyApiLimit() {
        const today = new Date().toDateString();
        
        if (appState.lastApiCallDate !== today) {
            appState.apiCallsToday = 0;
            appState.lastApiCallDate = today;
        }
        
        if (appState.apiCallsToday >= 24) {
            throw new Error('Daily API limit reached (24 calls). Please try again tomorrow.');
        }
    }

    // الحصول على الأسعار المخزنة
    getCachedRates() {
        try {
            const cached = localStorage.getItem('exchangeRates');
            if (!cached) return null;
            
            const data = JSON.parse(cached);
            const age = Date.now() - data.timestamp;
            
            if (age > this.cacheDuration) {
                console.log('Cache expired, will refresh');
                return null;
            }
            
            return data;
        } catch (e) {
            console.error('Error reading cache:', e);
            return null;
        }
    }

    // الأسعار الافتراضية
    getDefaultRates() {
        const defaultRates = { USD: 1.0 };
        
        CONFIG.TARGET_CURRENCIES.forEach(currency => {
            defaultRates[currency] = this.getDefaultRate(currency);
        });
        
        return defaultRates;
    }

    // سعر افتراضي للعملة
    getDefaultRate(currency) {
        const defaultRates = {
            EUR: 0.85,
            GBP: 0.75,
            JPY: 110.50,
            CAD: 1.25,
            AUD: 1.35,
            CHF: 0.92,
            CNY: 6.45,
            AED: 3.67,
            SAR: 3.75,
            QAR: 3.64,
            EGP: 30.90,
            TRY: 8.50,
            INR: 74.50,
            RUB: 73.50,
            BRL: 5.25,
            ZAR: 14.50,
            MXN: 20.50
        };
        
        return defaultRates[currency] || 1.0;
    }

    // تحويل العملات
    convert(amount, fromCurrency, toCurrency, rates) {
        if (!rates || !rates[fromCurrency] || !rates[toCurrency]) {
            return 0;
        }
        
        // التحويل عبر USD كعملة أساسية
        if (fromCurrency === 'USD') {
            return amount * rates[toCurrency];
        } else if (toCurrency === 'USD') {
            return amount / rates[fromCurrency];
        } else {
            // التحويل عبر USD كعملة وسيطة
            const amountInUSD = amount / rates[fromCurrency];
            return amountInUSD * rates[toCurrency];
        }
    }

    // الحصول على رابط صورة العلم
    getFlagImageUrl(currencyCode) {
        return `${CONFIG.IMAGE_BASE_URL}${currencyCode.toLowerCase()}.png`;
    }

    // الحصول على معلومات التحديث
    getUpdateInfo() {
        const lastUpdate = localStorage.getItem('lastUpdate');
        const nextUpdate = localStorage.getItem('nextUpdate');
        
        return {
            lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
            nextUpdate: nextUpdate ? new Date(parseInt(nextUpdate)) : null,
            apiCallsToday: appState.apiCallsToday
        };
    }

    // تنسيق وقت التحديث
    formatUpdateTime(date) {
        if (!date) return 'Never';
        
        const now = new Date();
        const diff = date - now;
        
        if (diff > 0) {
            const minutes = Math.floor(diff / (1000 * 60));
            if (minutes < 60) {
                return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
            } else {
                const hours = Math.floor(minutes / 60);
                return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
            }
        } else {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    // بدء التحديث التلقائي
    startAutoRefresh() {
        // إلغاء المؤقت السابق إذا كان موجوداً
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        
        // حساب الوقت المتبقي للتحديث التالي
        const nextUpdate = parseInt(localStorage.getItem('nextUpdate') || '0');
        const timeUntilRefresh = nextUpdate - Date.now();
        
        if (timeUntilRefresh > 0) {
            this.refreshTimer = setTimeout(() => {
                this.refreshRates();
            }, timeUntilRefresh);
            
            console.log(`Next auto-refresh in ${Math.floor(timeUntilRefresh / 60000)} minutes`);
        } else {
            // إذا انتهى الوقت، تحديث فوري
            this.refreshTimer = setTimeout(() => {
                this.refreshRates();
            }, 1000);
        }
    }

    // تحديث الأسعار يدوياً
    async refreshRates(force = false) {
        if (appState.isRefreshing && !force) {
            console.log('Refresh already in progress');
            return;
        }
        
        try {
            appState.isRefreshing = true;
            console.log('Refreshing exchange rates...');
            
            const rates = await this.getAllRatesFromUSD();
            appState.exchangeRates = rates;
            
            // تحديث الواجهة
            if (window.appInstance) {
                window.appInstance.updateRatesDisplay();
                window.appInstance.updateConverterDisplay();
                window.appInstance.showNotification('Rates updated successfully');
            }
            
            console.log('Rates refreshed successfully');
            return rates;
            
        } catch (error) {
            console.error('Error refreshing rates:', error);
            
            if (window.appInstance) {
                window.appInstance.showError(`Failed to update rates: ${error.message}`);
            }
            
            throw error;
        } finally {
            appState.isRefreshing = false;
        }
    }

    // التحديث الفوري (للاختبار)
    async forceRefresh() {
        console.log('Forcing immediate refresh...');
        
        // مسح الكاش للتحديث الفوري
        localStorage.removeItem('exchangeRates');
        localStorage.removeItem('lastUpdate');
        
        return await this.refreshRates(true);
    }
}

// إنشاء نسخة من الـAPI
const currencyAPI = new CurrencyAPI();
