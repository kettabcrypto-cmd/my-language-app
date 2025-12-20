// ملف: utils.js
const Utils = {
    // تنسيق الأرقام مع فواصل
    formatNumber(num, decimals = 2) {
        return parseFloat(num).toLocaleString('ar-SA', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    // تنسيق العملة
    formatCurrency(amount, currencyCode) {
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'SAR': 'ر.س',
            'AED': 'د.إ',
            'EGP': 'ج.م'
        };
        
        const symbol = symbols[currencyCode] || currencyCode;
        return `${this.formatNumber(amount)} ${symbol}`;
    },

    // تحميل بيانات من ملف JSON
    async loadJSON(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error loading JSON:', error);
            return null;
        }
    },

    // إنشاء عنصر HTML
    createElement(tag, className, text = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text) element.textContent = text;
        return element;
    },

    // إظهار رسالة للمستخدم
    showMessage(message, type = 'info') {
        const messageDiv = this.createElement('div', `message ${type}`);
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    },

    // تحويل التاريخ العربي
    formatArabicDate(date) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleDateString('ar-SA', options);
    }
};

// للاستخدام العام
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
