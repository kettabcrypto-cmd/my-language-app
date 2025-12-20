// خدمة API للتواصل مع Twelve Data

class APIService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.apiKey = CONFIG.API_KEY;
    }
    
    // طلب عام مع معالجة الأخطاء
    async makeRequest(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        
        // إضافة المعلمات
        params.apikey = this.apiKey;
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });
        
        try {
            // تحديث عداد الطلبات
            Utils.updateRequestCount();
            
            const response = await fetch(url.toString());
            
            if (!response.ok) {
                throw new Error(`خطأ في الشبكة: ${response.status}`);
            }
            
            const data = await response.json();
            
            // التحقق من أخطاء API
            if (data.code && data.code !== 200) {
                throw new Error(data.message || 'خطأ في API');
            }
            
            return data;
        } catch (error) {
            console.error('خطأ في طلب API:', error);
            
            // استخدام البيانات المخزنة في حالة الخطأ
            return this.getCachedData(endpoint, params);
        }
    }
    
    // جلب البيانات المخزنة
    getCachedData(endpoint, params) {
        let cacheKey = '';
        
        if (endpoint.includes('/quote')) {
            cacheKey = params.symbol ? `stock_${params.symbol}` : 'stocks';
        } else if (endpoint.includes('/exchange_rate')) {
            cacheKey = params.symbol ? `forex_${params.symbol}` : 'forex';
        }
        
        if (cacheKey) {
            const cached = Utils.getFromStorage(cacheKey);
            if (cached) {
                console.log(`استخدام البيانات المخزنة لـ ${cacheKey}`);
                return cached.data;
            }
        }
        
        return null;
    }
    
    // جلب سعر صرف عملة
    async getExchangeRate(symbol) {
        const cachedKey = `forex_${symbol}`;
        
        // التحقق من البيانات المخزنة
        if (Utils.isDataValid(cachedKey)) {
            const cached = Utils.getFromStorage(cachedKey);
            if (cached) {
                return cached.data;
            }
        }
        
        const data = await this.makeRequest('/exchange_rate', {
            symbol: symbol
        });
        
        if (data && data.rate) {
            // تخزين البيانات
            Utils.saveToStorage(cachedKey, {
                data: data,
                timestamp: new Date().getTime()
            });
        }
        
        return data;
    }
    
    // جلب أسعار العملات دفعة واحدة (لتحسين الطلبات)
    async getBatchForexRates(symbols) {
        const results = {};
        const toFetch = [];
        
        // التحقق من البيانات المخزنة أولاً
        symbols.forEach(symbol => {
            const cachedKey = `forex_${symbol}`;
            
            if (Utils.isDataValid(cachedKey)) {
                const cached = Utils.getFromStorage(cachedKey);
                if (cached && cached.data) {
                    results[symbol] = cached.data;
                } else {
                    toFetch.push(symbol);
                }
            } else {
                toFetch.push(symbol);
            }
        });
        
        // إذا كانت جميع البيانات مخزنة وصالحة
        if (toFetch.length === 0) {
            return results;
        }
        
        // جلب البيانات الجديدة للمفقودة
        try {
            // استخدام batch request إن أمكن
            const batchData = await this.makeRequest('/exchange_rate', {
                symbol: toFetch.join(',')
            });
            
            if (batchData && typeof batchData === 'object') {
                Object.keys(batchData).forEach(key => {
                    if (batchData[key] && batchData[key].rate) {
                        const symbol = batchData[key].symbol;
                        results[symbol] = batchData[key];
                        
                        // تخزين البيانات
                        Utils.saveToStorage(`forex_${symbol}`, {
                            data: batchData[key],
                            timestamp: new Date().getTime()
                        });
                    }
                });
            }
        } catch (error) {
            console.error('خطأ في جلب دفعة العملات:', error);
        }
        
        return results;
    }
    
    // جلب بيانات سهم
    async getStockQuote(symbol) {
        const cachedKey = `stock_${symbol}`;
        
        // التحقق من البيانات المخزنة
        if (Utils.isDataValid(cachedKey, 30)) { // 30 دقيقة للأسهم
            const cached = Utils.getFromStorage(cachedKey);
            if (cached) {
                return cached.data;
            }
        }
        
        const data = await this.makeRequest('/quote', {
            symbol: symbol,
            interval: '1day'
        });
        
        if (data && data.symbol) {
            // تخزين البيانات
            Utils.saveToStorage(cachedKey, {
                data: data,
                timestamp: new Date().getTime()
            });
        }
        
        return data;
    }
    
    // جلب بيانات دفعة من الأسهم
    async getBatchStockQuotes(symbols) {
        const results = {};
        const toFetch = [];
        
        // التحقق من البيانات المخزنة أولاً
        symbols.forEach(symbol => {
            const cachedKey = `stock_${symbol}`;
            
            if (Utils.isDataValid(cachedKey, 30)) {
                const cached = Utils.getFromStorage(cachedKey);
                if (cached && cached.data) {
                    results[symbol] = cached.data;
                } else {
                    toFetch.push(symbol);
                }
            } else {
                toFetch.push(symbol);
            }
        });
        
        // إذا كانت جميع البيانات مخزنة وصالحة
        if (toFetch.length === 0) {
            return results;
        }
        
        // جلب البيانات الجديدة للمفقودة (بحد أقصى 8 رموز في الطلب الواحد)
        const batchSize = 8;
        for (let i = 0; i < toFetch.length; i += batchSize) {
            const batch = toFetch.slice(i, i + batchSize);
            
            try {
                const batchData = await this.makeRequest('/quote', {
                    symbol: batch.join(','),
                    interval: '1day'
                });
                
                if (batchData && typeof batchData === 'object') {
                    Object.keys(batchData).forEach(key => {
                        if (batchData[key] && batchData[key].symbol) {
                            const symbol = batchData[key].symbol;
                            results[symbol] = batchData[key];
                            
                            // تخزين البيانات
                            Utils.saveToStorage(`stock_${symbol}`, {
                                data: batchData[key],
                                timestamp: new Date().getTime()
                            });
                        }
                    });
                }
                
                // تأخير بين الطلبات لتجنب rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`خطأ في دفعة الأسهم ${i}:`, error);
            }
        }
        
        return results;
    }
    
    // جلب سعر صرف بين عملتين للمحول
    async getCurrencyConversion(from, to) {
        const symbol = `${from}/${to}`;
        const data = await this.getExchangeRate(symbol);
        
        if (data && data.rate) {
            return {
                from: from,
                to: to,
                rate: parseFloat(data.rate),
                timestamp: data.timestamp || new Date().getTime()
            };
        }
        
        return null;
    }
}

// إنشاء instance عام
const apiService = new APIService();
