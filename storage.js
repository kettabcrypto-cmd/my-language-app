// storage.js
class CurrencyStorage {
    constructor() {
        this.storageKey = 'currencyProData';
        this.defaultData = {
            rates: {},
            lastUpdate: null,
            nextUpdate: null,
            baseCurrency: 'USD',
            autoUpdate: true,
            darkMode: true
        };
    }

    // تحميل البيانات من التخزين المحلي
    loadData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                return {...this.defaultData, ...parsedData};
            }
        } catch (error) {
            console.error('خطأ في تحميل البيانات من التخزين المحلي:', error);
        }
        
        return this.defaultData;
    }

    // حفظ البيانات في التخزين المحلي
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات في التخزين المحلي:', error);
            return false;
        }
    }

    // تحديث الأسعار في التخزين
    updateRates(ratesData) {
        const currentData = this.loadData();
        
        currentData.rates = ratesData.rates;
        currentData.lastUpdate = ratesData.timestamp;
        currentData.nextUpdate = ratesData.nextUpdate;
        currentData.baseCurrency = ratesData.base;
        
        this.saveData(currentData);
        
        return currentData;
    }

    // التحقق مما إذا كانت الأسعار بحاجة للتحديث
    shouldUpdateRates() {
        const data = this.loadData();
        
        // إذا لم تكن هناك بيانات مخزنة
        if (!data.lastUpdate) return true;
        
        // إذا تم تجاوز وقت التحديث التالي
        const now = Math.floor(Date.now() / 1000);
        if (data.nextUpdate && now >= data.nextUpdate) return true;
        
        // إذا مرت ساعة على آخر تحديث (للاحتياط)
        const oneHour = 3600;
        if (now - data.lastUpdate >= oneHour) return true;
        
        return false;
    }

    // الحصول على وقت آخر تحديث بصيغة مقروءة
    getLastUpdateTime() {
        const data = this.loadData();
        
        if (!data.lastUpdate) return 'لم يتم التحديث بعد';
        
        const updateDate = new Date(data.lastUpdate * 1000);
        const now = new Date();
        const diffInMinutes = Math.floor((now - updateDate) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'الآن';
        if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
        
        return updateDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // تغيير إعدادات التحديث التلقائي
    setAutoUpdate(enabled) {
        const data = this.loadData();
        data.autoUpdate = enabled;
        this.saveData(data);
    }

    // تغيير وضع التطبيق (داكن/فاتح)
    setDarkMode(enabled) {
        const data = this.loadData();
        data.darkMode = enabled;
        this.saveData(data);
    }
}

// تصدير الكلاس لاستخدامه في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyStorage;
}
