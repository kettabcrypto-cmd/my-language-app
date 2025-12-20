// في ملف js/app.js - إضافة هذه الدوال
class CurrencyApp {
    // ... الكود السابق ...
    
    updateApiUsageDisplay() {
        const apiUsageElement = document.getElementById('apiUsage');
        const apiStatusElement = document.getElementById('apiStatus');
        
        if (!apiUsageElement || !apiStatusElement) return;
        
        const usage = currencyAPI.getApiUsage();
        
        apiUsageElement.textContent = `${usage.count}/${usage.limit}`;
        
        // تحديث اللون بناءً على النسبة
        if (usage.percentage >= 100) {
            apiUsageElement.style.color = '#dc3545';
            apiStatusElement.textContent = 'Limit reached';
            apiStatusElement.className = 'update-status error';
        } else if (usage.percentage > 80) {
            apiUsageElement.style.color = '#ffc107';
            apiStatusElement.textContent = 'Almost at limit';
            apiStatusElement.className = 'update-status warning';
        } else {
            apiUsageElement.style.color = '#28a745';
            apiStatusElement.textContent = 'Normal';
            apiStatusElement.className = 'update-status updated';
        }
    }
    
    updateLastUpdateDisplay() {
        // ... الكود السابق ...
        
        // تحديث استخدام الـAPI أيضاً
        this.updateApiUsageDisplay();
    }
}
