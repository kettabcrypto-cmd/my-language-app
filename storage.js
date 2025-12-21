// storage.js - إدارة التخزين المحلي
class StorageManager {
    constructor() {
        this.storageKey = 'currencyProData';
        this.init();
    }
    
    init() {
        // تهيئة التخزين إذا كان فارغاً
        if (!this.load()) {
            this.save({
                theme: CONFIG.DEFAULT_SETTINGS.theme,
                trackedCurrencies: CONFIG.DEFAULT_TRACKED,
                fromCurrency: CONFIG.DEFAULT_SETTINGS.fromCurrency,
                toCurrency: CONFIG.DEFAULT_SETTINGS.toCurrency,
                amount: CONFIG.DEFAULT_SETTINGS.amount,
                exchangeRates: null,
                lastUpdate: null,
                settings: {
                    autoUpdate: true,
                    updateInterval: CONFIG.UPDATE_INTERVAL
                }
            });
        }
    }
    
    // حفظ البيانات
    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ فشل حفظ البيانات:', error);
            return false;
        }
    }
    
    // تحميل البيانات
    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ فشل تحميل البيانات:', error);
            return null;
        }
    }
    
    // تحديث الأسعار
    updateRates(rates, timestamp) {
        const current = this.load();
        if (!current) return false;
        
        current.exchangeRates = rates;
        current.lastUpdate = timestamp || new Date().toISOString();
        
        return this.save(current);
    }
    
    // تحديث الإعدادات
    updateSettings(settings) {
        const current = this.load();
        if (!current) return false;
        
        current.settings = { ...current.settings, ...settings };
        return this.save(current);
    }
    
    // الحصول على الإعدادات
    getSettings() {
        const current = this.load();
        return current?.settings || {};
    }
    
    // الحصول على الأسعار
    getRates() {
        const current = this.load();
        return current?.exchangeRates || null;
    }
    
    // التحقق إذا كانت البيانات تحتاج للتحديث
    shouldUpdate() {
        const current = this.load();
        if (!current || !current.lastUpdate) return true;
        
        const lastUpdate = new Date(current.lastUpdate);
        const now = new Date();
        const diffMinutes = (now - lastUpdate) / (1000 * 60);
        
        // إذا مرت ساعة على آخر تحديث
        return diffMinutes >= 60;
    }
    
    // مسح التخزين
    clear() {
        localStorage.removeItem(this.storageKey);
        this.init();
    }
}
