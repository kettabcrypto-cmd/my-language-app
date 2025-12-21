// app.js - إضافة اختبار API
class CurrencyApp {
    // ... الكود الحالي يبقى كما هو ...
    
    async testDirectAPI() {
        console.log('🧪 اختبار مباشر لـ TwelveData API...');
        
        try {
            // اختبار 1: جلب سعر EUR مباشرة
            const testUrl1 = `https://api.twelvedata.com/currency_exchange_rate?base=USD&target=EUR&apikey=${CONFIG.API_KEY}`;
            console.log('🔗 اختبار 1:', testUrl1);
            
            const response1 = await fetch(testUrl1);
            const data1 = await response1.json();
            console.log('📊 نتيجة اختبار 1:', data1);
            
            // اختبار 2: جلب سعر GBP
            const testUrl2 = `https://api.twelvedata.com/exchange_rate?symbol=USD/GBP&apikey=${CONFIG.API_KEY}`;
            console.log('🔗 اختبار 2:', testUrl2);
            
            const response2 = await fetch(testUrl2);
            const data2 = await response2.json();
            console.log('📊 نتيجة اختبار 2:', data2);
            
            return { data1, data2 };
            
        } catch (error) {
            console.error('❌ فشل الاختبار المباشر:', error);
            return null;
        }
    }
    
    async init() {
        console.log('🚀 بدء تطبيق CurrencyPro...');
        
        // ... الكود الحالي ...
        
        // اختبار API مباشر
        await this.testDirectAPI();
        
        // ... باقي الكود ...
    }
}
