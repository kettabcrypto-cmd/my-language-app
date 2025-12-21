// app.js - التطبيق الرئيسي (معدل)
class CurrencyApp {
    constructor() {
        this.ui = null;
        this.api = null;
        this.init();
    }
    
    async init() {
        console.log('🚀 بدء تطبيق CurrencyPro...');
        
        // انتظار تحميل DOM
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        try {
            // تهيئة API أولاً
            this.api = new CurrencyAPI();
            
            // تهيئة واجهة المستخدم
            this.ui = new UIManager();
            
            // تحميل البيانات الأولية
            await this.loadInitialData();
            
            // بدء التحديث التلقائي
            this.startAutoUpdate();
            
            // اختبار الاتصال بالAPI
            await this.testAPIConnection();
            
            console.log('✅ تم تهيئة التطبيق بنجاح');
            
        } catch (error) {
            console.error('❌ فشل تهيئة التطبيق:', error);
            Utils.showNotification('Failed to initialize app', 'error');
        }
    }
    
    async loadInitialData() {
        console.log('📂 تحميل البيانات الأولية...');
        
        const storage = new StorageManager();
        const shouldUpdate = storage.shouldUpdate();
        
        if (shouldUpdate) {
            console.log('🔄 البيانات قديمة، جاري التحديث...');
            await this.updateExchangeRates();
        } else {
            console.log('✅ البيانات حديثة، استخدام المخزنة');
            
            // تحديث الواجهة بالبيانات المخزنة
            const data = storage.load();
            if (data && data.exchangeRates) {
                console.log('📊 استخدام الأسعار المخزنة:', data.exchangeRates);
                this.ui.currentRates = data.exchangeRates;
            }
            
            this.ui.updateRatesDisplay();
            this.ui.updateConverterDisplay();
            this.ui.updateLastUpdateDisplay();
            
            if (data?.lastUpdate) {
                const updateTime = new Date(data.lastUpdate);
                const timeAgo = Utils.getTimeAgo(updateTime);
                console.log(`⏰ آخر تحديث: ${timeAgo}`);
            }
        }
    }
    
    async updateExchangeRates() {
        console.log('🔄 تحديث أسعار الصرف...');
        
        try {
            if (!this.api) {
                this.api = new CurrencyAPI();
            }
            
            Utils.showNotification('Updating exchange rates...', 'info');
            
            // جلب الأسعار من API
            const ratesData = await this.api.getRates();
            
            console.log('📊 بيانات الأسعار المستلمة:', ratesData);
            
            // حفظ الأسعار الجديدة
            this.ui.currentRates = ratesData;
            
            const storage = new StorageManager();
            storage.updateRates(ratesData.rates, ratesData.timestamp);
            
            // تحديث الواجهة
            this.ui.updateRatesDisplay();
            this.ui.updateConverterDisplay();
            this.ui.updateLastUpdateDisplay();
            
            const message = ratesData.success ? 
                `✅ Rates updated (${ratesData.source})` : 
                '⚠️ Using default rates (API failed)';
            
            Utils.showNotification(message, ratesData.success ? 'success' : 'warning');
            
            return ratesData.success;
            
        } catch (error) {
            console.error('❌ فشل تحديث الأسعار:', error);
            Utils.showNotification('Failed to update rates', 'error');
            return false;
        }
    }
    
    startAutoUpdate() {
        const storage = new StorageManager();
        const settings = storage.getSettings();
        
        if (settings.autoUpdate !== false) {
            console.log('⏰ تفعيل التحديث التلقائي كل ساعة...');
            
            // تحديث فوري عند التشغيل
            setTimeout(() => {
                this.updateExchangeRates();
            }, 2000);
            
            // التحديث الدوري كل ساعة
            setInterval(() => {
                const shouldUpdate = storage.shouldUpdate();
                if (shouldUpdate) {
                    console.log('⏰ التحديث التلقائي...');
                    this.updateExchangeRates();
                }
            }, CONFIG.UPDATE_INTERVAL);
        }
    }
    
    async testAPIConnection() {
        console.log('🔗 اختبار اتصال API...');
        
        try {
            const testUrl = `${CONFIG.API_BASE_URL}/exchange_rate?symbol=USD/EUR&apikey=${CONFIG.API_KEY}`;
            console.log('🔗 اختبار الاتصال بـ:', testUrl);
            
            const response = await fetch(testUrl);
            const data = await response.json();
            
            console.log('✅ اتصال API ناجح:', data);
            return true;
            
        } catch (error) {
            console.error('❌ فشل اتصال API:', error);
            return false;
        }
    }
}

// بدء التطبيق
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CurrencyApp();
    window.app = app;
    window.Utils = Utils; // لجعل Utils متاحة للتصحيح
});
