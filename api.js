// في ملف js/api.js - إضافة هذه الدوال
class CurrencyAPI {
    // ... الكود السابق ...
    
    async getAllExchangeRates() {
        try {
            // تحديث عداد الـAPI
            this.updateApiCounter();
            
            // ... باقي الكود كما هو ...
        } catch (error) {
            // ... معالجة الأخطاء ...
        }
    }
    
    updateApiCounter() {
        const today = new Date().toDateString();
        let apiCallsToday = parseInt(localStorage.getItem('apiCallsToday')) || 0;
        const lastApiDate = localStorage.getItem('lastApiDate');
        
        // إعادة التعيين إذا كان يوم جديد
        if (lastApiDate !== today) {
            apiCallsToday = 0;
        }
        
        apiCallsToday++;
        
        // حفظ
        localStorage.setItem('apiCallsToday', apiCallsToday.toString());
        localStorage.setItem('lastApiDate', today);
        
        console.log(`📊 API calls today: ${apiCallsToday}/24`);
        
        return apiCallsToday;
    }
    
    getApiUsage() {
        const today = new Date().toDateString();
        const apiCallsToday = parseInt(localStorage.getItem('apiCallsToday')) || 0;
        const lastApiDate = localStorage.getItem('lastApiDate');
        
        // إذا كان يوم جديد، إعادة التعيين
        if (lastApiDate !== today) {
            return {
                count: 0,
                limit: 24,
                percentage: 0,
                status: 'fresh'
            };
        }
        
        const percentage = (apiCallsToday / 24) * 100;
        
        let status = 'good';
        if (percentage > 80) status = 'warning';
        if (percentage >= 100) status = 'limit';
        
        return {
            count: apiCallsToday,
            limit: 24,
            percentage: percentage,
            status: status
        };
    }
}
