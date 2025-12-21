// storage.js - إدارة التخزين المحلي المتقدمة
class StorageManager {
    constructor() {
        this.storageKey = 'currencyProData';
        this.currentData = this.load();
        this.init();
    }
    
    init() {
        // تهيئة التخزين إذا كان فارغاً
        if (!this.currentData) {
            this.currentData = this.getDefaultData();
            this.save();
        }
    }
    
    getDefaultData() {
        return {
            // الإعدادات
            settings: {
                theme: CONFIG.APP_SETTINGS.defaultTheme,
                autoUpdate: CONFIG.APP_SETTINGS.autoUpdate,
                updateFrequency: CONFIG.APP_SETTINGS.updateInterval,
                defaultFromCurrency: CONFIG.APP_SETTINGS.defaultFromCurrency,
                defaultToCurrency: CONFIG.APP_SETTINGS.defaultToCurrency,
                lastUpdateCheck: null
            },
            
            // العملات المتابعة
            trackedCurrencies: [...CONFIG.DEFAULT_TRACKED_CURRENCIES],
            
            // آخر تحويل
            lastConversion: {
                fromCurrency: CONFIG.APP_SETTINGS.defaultFromCurrency,
                toCurrency: CONFIG.APP_SETTINGS.defaultToCurrency,
                amount: CONFIG.APP_SETTINGS.defaultAmount,
                date: new Date().toISOString()
            },
            
            // الأسعار المخزنة
            exchangeRates: {
                rates: { USD: 1.0, ...CONFIG.DEFAULT_RATES },
                timestamp: new Date().toISOString(),
                success: false,
                source: 'default'
            },
            
            // تاريخ التحديثات
            updateHistory: [],
            
            // إصدار البيانات
            dataVersion: '1.0',
            lastModified: new Date().toISOString()
        };
    }
    
    // حفظ البيانات
    save() {
        try {
            this.currentData.lastModified = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentData));
            return true;
        } catch (error) {
            console.error('❌ فشل حفظ البيانات:', error);
            Utils.showNotification('Failed to save data', 'error');
            return false;
        }
    }
    
    // تحميل البيانات
    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            
            // التحقق من إصدار البيانات
            if (parsed.dataVersion !== '1.0') {
                console.log('⚠️ إصدار بيانات قديم، إعادة التعيين');
                return null;
            }
            
            return parsed;
        } catch (error) {
            console.error('❌ فشل تحميل البيانات:', error);
            return null;
        }
    }
    
    // تحديث الأسعار
    updateRates(rates, success = true, source = 'api') {
        if (!this.currentData) return false;
        
        this.currentData.exchangeRates = {
            rates: rates,
            timestamp: new Date().toISOString(),
            success: success,
            source: source
        };
        
        // إضافة للسجل
        this.currentData.updateHistory.unshift({
            timestamp: new Date().toISOString(),
            success: success,
            source: source,
            ratesCount: Object.keys(rates).length
        });
        
        // الاحتفاظ فقط بآخر 50 تحديث
        if (this.currentData.updateHistory.length > 50) {
            this.currentData.updateHistory = this.currentData.updateHistory.slice(0, 50);
        }
        
        return this.save();
    }
    
    // تحديث الإعدادات
    updateSettings(newSettings) {
        if (!this.currentData) return false;
        
        this.currentData.settings = { ...this.currentData.settings, ...newSettings };
        return this.save();
    }
    
    // إضافة عملة للمتابعة
    addTrackedCurrency(currencyCode) {
        if (!this.currentData) return false;
        
        if (!this.currentData.trackedCurrencies.includes(currencyCode)) {
            this.currentData.trackedCurrencies.push(currencyCode);
            return this.save();
        }
        
        return true;
    }
    
    // إزالة عملة من المتابعة
    removeTrackedCurrency(currencyCode) {
        if (!this.currentData) return false;
        
        const index = this.currentData.trackedCurrencies.indexOf(currencyCode);
        if (index > -1) {
            this.currentData.trackedCurrencies.splice(index, 1);
            return this.save();
        }
        
        return true;
    }
    
    // تحديث العملات المتابعة
    updateTrackedCurrencies(currencies) {
        if (!this.currentData) return false;
        
        this.currentData.trackedCurrencies = [...currencies];
        return this.save();
    }
    
    // حفظ آخر تحويل
    saveLastConversion(fromCurrency, toCurrency, amount) {
        if (!this.currentData) return false;
        
        this.currentData.lastConversion = {
            fromCurrency: fromCurrency,
            toCurrency: toCurrency,
            amount: amount,
            date: new Date().toISOString()
        };
        
        return this.save();
    }
    
    // الحصول على الأسعار المخزنة
    getRates() {
        return this.currentData?.exchangeRates || null;
    }
    
    // الحصول على الإعدادات
    getSettings() {
        return this.currentData?.settings || CONFIG.APP_SETTINGS;
    }
    
    // الحصول على العملات المتابعة
    getTrackedCurrencies() {
        return this.currentData?.trackedCurrencies || CONFIG.DEFAULT_TRACKED_CURRENCIES;
    }
    
    // الحصول على آخر تحويل
    getLastConversion() {
        return this.currentData?.lastConversion || null;
    }
    
    // التحقق إذا كانت الأسعار قديمة
    areRatesStale(minutes = 30) {
        const rates = this.getRates();
        if (!rates || !rates.timestamp) return true;
        
        const lastUpdate = new Date(rates.timestamp);
        const now = new Date();
        const diffMinutes = (now - lastUpdate) / (1000 * 60);
        
        return diffMinutes > minutes;
    }
    
    // إعادة التعيين للإعدادات الافتراضية
    resetToDefaults() {
        this.currentData = this.getDefaultData();
        return this.save();
    }
    
    // مسح جميع البيانات
    clearAll() {
        try {
            localStorage.removeItem(this.storageKey);
            this.currentData = this.getDefaultData();
            this.save();
            return true;
        } catch (error) {
            console.error('❌ فشل مسح البيانات:', error);
            return false;
        }
    }
    
    // تصدير البيانات
    exportData() {
        return JSON.stringify(this.currentData, null, 2);
    }
    
    // استيراد البيانات
    importData(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            
            // التحقق من الهيكل الأساسي
            if (!imported.settings || !imported.trackedCurrencies) {
                throw new Error('Invalid data structure');
            }
            
            this.currentData = imported;
            this.save();
            return true;
        } catch (error) {
            console.error('❌ فشل استيراد البيانات:', error);
            return false;
        }
    }
}
