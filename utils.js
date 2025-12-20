// أدوات مساعدة للتطبيق

class Utils {
    // تنسيق الأرقام
    static formatNumber(num, decimals = 2) {
        return parseFloat(num).toLocaleString('ar-EG', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    // تنسيق التاريخ والوقت
    static formatDateTime(date) {
        return new Date(date).toLocaleString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    // حساب نسبة التغيير
    static calculateChange(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    }
    
    // تخزين بيانات في localStorage
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return false;
        }
    }
    
    // استرجاع بيانات من localStorage
    static getFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('خطأ في استرجاع البيانات:', error);
            return null;
        }
    }
    
    // تحديث عداد طلبات API
    static updateRequestCount() {
        const today = new Date().toDateString();
        const requests = Utils.getFromStorage(CONFIG.STORAGE_KEYS.API_REQUESTS) || {};
        
        if (requests.date !== today) {
            requests.date = today;
            requests.count = 0;
        }
        
        requests.count = (requests.count || 0) + 1;
        Utils.saveToStorage(CONFIG.STORAGE_KEYS.API_REQUESTS, requests);
        
        // تحديث العرض
        const display = document.getElementById('apiRequests');
        if (display) {
            display.textContent = `طلبات API اليومية: ${requests.count}/800`;
        }
        
        return requests.count;
    }
    
    // التحقق من صلاحية البيانات المخزنة
    static isDataValid(storageKey, maxAgeMinutes = 60) {
        const data = Utils.getFromStorage(storageKey);
        if (!data || !data.timestamp) return false;
        
        const now = new Date().getTime();
        const dataAge = now - data.timestamp;
        const maxAge = maxAgeMinutes * 60 * 1000;
        
        return dataAge < maxAge;
    }
    
    // إنشاء عنصر عملة
    static createCurrencyCard(currency) {
        const change = currency.change || 0;
        const changePercent = currency.change_percent || 0;
        
        return `
            <div class="currency-card">
                <div class="currency-info">
                    <h3>${currency.symbol.replace('/USD', '')}</h3>
                    <p>${currency.name}</p>
                </div>
                <div class="currency-price">
                    <div class="price">${Utils.formatNumber(currency.price, 4)}</div>
                    <div class="change ${change >= 0 ? 'positive' : 'negative'}">
                        ${change >= 0 ? '+' : ''}${Utils.formatNumber(change, 4)} 
                        (${change >= 0 ? '+' : ''}${Utils.formatNumber(changePercent, 2)}%)
                    </div>
                </div>
            </div>
        `;
    }
    
    // إنشاء صف سهم
    static createStockRow(stock, index) {
        const change = stock.change || 0;
        const changePercent = stock.percent_change || 0;
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td class="symbol">${stock.symbol}</td>
                <td class="name">${stock.name || stock.symbol}</td>
                <td class="price">$${Utils.formatNumber(stock.price, 2)}</td>
                <td class="${change >= 0 ? 'change-positive' : 'change-negative'}">
                    ${change >= 0 ? '+' : ''}$${Utils.formatNumber(Math.abs(change), 2)}
                </td>
                <td class="${changePercent >= 0 ? 'change-positive' : 'change-negative'}">
                    ${changePercent >= 0 ? '+' : ''}${Utils.formatNumber(changePercent, 2)}%
                </td>
                <td class="volume">${stock.volume ? Utils.formatNumber(stock.volume, 0) : 'N/A'}</td>
            </tr>
        `;
    }
}
