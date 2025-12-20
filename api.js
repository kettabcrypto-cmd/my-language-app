// خدمة API محدثة
class APIService {
    constructor() {
        this.baseURL = 'https://api.twelvedata.com';
        this.apiKey = 'b83fce53976843bbb59336c03f9a6a30';
        this.requestCount = 0;
    }
    
    // طلب جميع العملات في دفعة واحدة
    async getAllForexData() {
        const cacheKey = 'all_forex_data';
        
        // التحقق من التخزين المؤقت أولاً
        const cached = this.getCachedData(cacheKey);
        if (cached && this.isCacheValid(cached.timestamp, 60)) {
            console.log('استخدام البيانات المخزنة');
            return cached.data;
        }
        
        try {
            // Twelve Data تتطلب format=JSON
            const response = await fetch(
                `${this.baseURL}/exchange_rate?symbol=${CONFIG.FOREX_PAIRS.join(',')}&apikey=${this.apiKey}&format=JSON`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // تحديث العداد
            this.updateRequestCounter();
            
            // تخزين البيانات
            this.cacheData(cacheKey, data);
            
            console.log('تم جلب البيانات بنجاح:', Object.keys(data).length, 'عملة');
            return data;
            
        } catch (error) {
            console.error('خطأ في جلب البيانات:', error);
            
            // استخدام بيانات افتراضية في حالة الفشل
            return this.getDefaultForexData();
        }
    }
    
    // جلب سعر صرف واحد
    async getExchangeRate(from, to) {
        const cacheKey = `rate_${from}_${to}`;
        
        // التحقق من التخزين المؤقت
        const cached = this.getCachedData(cacheKey);
        if (cached && this.isCacheValid(cached.timestamp, 5)) {
            return cached.data;
        }
        
        try {
            const response = await fetch(
                `${this.baseURL}/exchange_rate?symbol=${from}/${to}&apikey=${this.apiKey}&format=JSON`
            );
            
            if (!response.ok) throw new Error('خطأ في الشبكة');
            
            const data = await response.json();
            
            this.updateRequestCounter();
            this.cacheData(cacheKey, data);
            
            return data;
            
        } catch (error) {
            console.error('خطأ في جلب سعر الصرف:', error);
            return null;
        }
    }
    
    // التحقق من صلاحية التخزين المؤقت
    isCacheValid(timestamp, minutes = 60) {
        const now = Date.now();
        const cacheAge = now - timestamp;
        const maxAge = minutes * 60 * 1000;
        return cacheAge < maxAge;
    }
    
    // جلب البيانات المخزنة
    getCachedData(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            
            return JSON.parse(cached);
        } catch (error) {
            console.error('خطأ في قراءة التخزين:', error);
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
            console.error('خطأ في التخزين:', error);
        }
    }
    
    // تحديث عداد الطلبات
    updateRequestCounter() {
        this.requestCount++;
        
        // تحديث localStorage
        const today = new Date().toDateString();
        const stored = localStorage.getItem('api_requests');
        let requests = stored ? JSON.parse(stored) : {};
        
        if (requests.date !== today) {
            requests = { date: today, count: 0 };
        }
        
        requests.count++;
        localStorage.setItem('api_requests', JSON.stringify(requests));
        
        // تحديث العرض
        const counter = document.getElementById('apiCounter');
        if (counter) {
            counter.textContent = `${requests.count}/800`;
        }
    }
    
    // بيانات افتراضية للعملات
    getDefaultForexData() {
        console.log('استخدام البيانات الافتراضية');
        
        const defaultData = {};
        const now = Date.now();
        
        // أسعار افتراضية تقريبية
        const defaultRates = {
            'EUR/USD': 1.0824, 'GBP/USD': 1.2618, 'USD/JPY': 148.52,
            'USD/CHF': 0.8847, 'USD/CAD': 1.3541, 'AUD/USD': 0.6583,
            'NZD/USD': 0.6124, 'USD/CNY': 7.185, 'USD/AED': 3.6725,
            'USD/SAR': 3.75, 'USD/KWD': 0.3075, 'USD/BHD': 0.376,
            'USD/OMR': 0.3845, 'USD/QAR': 3.64, 'USD/JOD': 0.709,
            'USD/EGP': 30.85, 'USD/TRY': 32.15, 'USD/RUB': 92.48,
            'USD/INR': 83.18, 'USD/ZAR': 18.92
        };
        
        CONFIG.FOREX_PAIRS.forEach(pair => {
            defaultData[pair] = {
                symbol: pair,
                rate: defaultRates[pair] || 1.0000,
                timestamp: now - Math.random() * 3600000 // وقت عشوائي خلال الساعة الماضية
            };
        });
        
        return defaultData;
    }
}

const apiService = new APIService();
