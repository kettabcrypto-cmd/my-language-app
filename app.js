// app.js - التطبيق الرئيسي
class CurrencyApp {
    constructor() {
        this.ui = null;
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
            // تهيئة واجهة المستخدم
            this.ui = new UIManager();
            
            // تحميل البيانات الأولية
            await this.loadInitialData();
            
            // بدء التحديث التلقائي
            this.ui.startAutoUpdate();
            
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
            await this.ui.updateExchangeRates();
        } else {
            console.log('✅ البيانات حديثة، استخدام المخزنة');
            
            // تحديث الواجهة بالبيانات المخزنة
            this.ui.updateRatesDisplay();
            this.ui.updateConverterDisplay();
            this.ui.updateLastUpdateDisplay();
            
            const data = storage.load();
            if (data?.lastUpdate) {
                const updateTime = new Date(data.lastUpdate);
                const timeAgo = Utils.getTimeAgo(updateTime);
                console.log(`⏰ آخر تحديث: ${timeAgo}`);
            }
        }
    }
}

// بدء التطبيق
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CurrencyApp();
    window.app = app; // لجعل التطبيق متاحاً في الكونسول للتصحيح
});
