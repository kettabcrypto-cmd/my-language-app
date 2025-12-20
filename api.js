// خدمة API مبسطة - طلب واحد فقط لكل تحديث

class APIService {
    constructor() {
        this.baseURL = 'https://api.twelvedata.com';
        this.apiKey = CONFIG.API_KEY;
    }
    
    // طلب واحد لجميع العملات
    async getAllForexData() {
        const cacheKey = 'all_forex_data';
        
        // التحقق من التخزين المؤقت أولاً
        if (this.isCacheValid(cacheKey, 60)) {
            const cached = this.getCachedData(cacheKey);
            if (cached) {
                console.log('استخدام البيانات المخزنة للعملات');
                return cached;
            }
        }
        
        try {
            // طلب واحد لجميع العملات
            const symbols = CONFIG.FOREX_PAIRS.join(',');
            const response = await fetch(
                `${this.baseURL}/exchange_rate?symbol=${symbols}&apikey=${this.apiKey}`
            );
            
            if (!response.ok) throw new Error('خطأ في الشبكة');
            
            const data = await response.json();
            
            // تحديث عداد الطلبات
            this.updateRequestCounter();
            
            // تخزين البيانات
            this.cacheData(cacheKey, data);
            
            // تخزين كل عملة بشكل منفصل أيضاً
            CONFIG.FOREX_PAIRS.forEach(pair => {
                if (data[pair]) {
                    this.cacheData(`forex_${pair}`, data[pair]);
                }
            });
            
            return data;
            
        } catch (error) {
            console.error('خطأ في جلب بيانات العملات:', error);
            
            // محاولة استخدام البيانات المخزنة
            const cached = this.getCachedData(cacheKey);
            if (cached) {
                console.log('استخدام البيانات المخزنة بعد الخطأ');
                return cached;
            }
            
            // بيانات افتراضية في حالة الفشل
            return this.getDefaultForexData();
        }
    }
    
    // جلب سعر صرف لعملتين
    async getExchangeRate(from, to) {
        const cacheKey = `rate_${from}_${to}`;
        
        // التحقق من التخزين المؤقت
        if (this.isCacheValid(cacheKey, 5)) {
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;
        }
        
        try {
            const response = await fetch(
                `${this.baseURL}/exchange_rate?symbol=${from}/${to}&apikey=${this.apiKey}`
            );
            
            if (!response.ok) throw new Error('خطأ في الشبكة');
            
            const data = await response.json();
            
            // تحديث العداد
            this.updateRequestCounter();
            
            // تخزين البيانات
            this.cacheData(cacheKey, data);
            
            return data;
            
        } catch (error) {
            console.error('خطأ في جلب سعر الصرف:', error);
            
            // محاولة الحساب من البيانات المخزنة
            return this.calculateRateFromCache(from, to);
        }
    }
    
    // التحقق من صلاحية التخزين المؤقت
    isCacheValid(key, minutes = 60) {
        const cached = localStorage.getItem(key);
        if (!cached) return false;
        
        try {
            const data = JSON.parse(cached);
            const now = Date.now();
            const cacheAge = now - data.timestamp;
            const maxAge = minutes * 60 * 1000;
            
            return cacheAge < maxAge;
        } catch {
            return false;
        }
    }
    
    // جلب البيانات المخزنة
    getCachedData(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            
            const data = JSON.parse(cached);
            return data.data;
        } catch {
            return null;
        }
    }
    
    // تخزين البيانات
    cacheData(key, data) {
        try {
            const cacheItem = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
            console.error('خطأ في تخزين البيانات:', error);
        }
    }
    
    // تحديث عداد الطلبات
    updateRequestCounter() {
        const today = new Date().toDateString();
        const requests = JSON.parse(localStorage.getItem('api_requests') || '{}');
        
        if (requests.date !== today) {
            requests.date = today;
            requests.count = 0;
        }
        
        requests.count = (requests.count || 0) + 1;
        localStorage.setItem('api_requests', JSON.stringify(requests));
        
        // تحديث العرض
        const counter = document.getElementById('apiCounter');
        if (counter) {
            counter.textContent = `${requests.count}/800`;
        }
    }
    
    // بيانات افتراضية للعملات
    getDefaultForexData() {
        const defaultRates = {};
        const baseRate = 1;
        
        CONFIG.FOREX_PAIRS.forEach(pair => {
            const [from, to] = pair.split('/');
            let rate = baseRate;
            
            // أسعار افتراضية تقريبية
            const defaultRatesMap = {
                'EUR/USD': 1.08, 'GBP/USD': 1.26, 'USD/JPY': 148.5,
                'USD/CHF': 0.88, 'USD/CAD': 1.35, 'AUD/USD': 0.66,
                'NZD/USD': 0.61, 'USD/CNY': 7.18, 'USD/AED': 3.67,
                'USD/SAR': 3.75, 'USD/KWD': 0.31, 'USD/BHD': 0.38,
                'USD/OMR': 0.38, 'USD/QAR': 3.64, 'USD/JOD': 0.71,
                'USD/EGP': 30.9, 'USD/TRY': 32.1, 'USD/RUB': 92.5,
                'USD/INR': 83.2, 'USD/ZAR': 18.9
            };
            
            rate = defaultRatesMap[pair] || (from === 'USD' ? 1 : 0.92);
            
            defaultRates[pair] = {
                symbol: pair,
                rate: rate,
                timestamp: Date.now()
            };
        });
        
        return defaultRates;
    }
    
    // حساب السعر من البيانات المخزنة
    calculateRateFromCache(from, to) {
        if (from === to) return { rate: 1 };
        
        // محاولة العثور على سعر مباشر
        const directKey = `rate_${from}_${to}`;
        const directCached = this.getCachedData(directKey);
        if (directCached) return directCached;
        
        // محاولة حساب عبر USD
        const fromToUSD = this.getCachedData(`forex_${from}/USD`);
        const usdToTo = this.getCachedData(`forex_USD/${to}`);
        
        if (fromToUSD && usdToTo) {
            const rate = fromToUSD.rate * usdToTo.rate;
            return { rate: rate };
        }
        
        return null;
    }
}

const apiService = new APIService();
