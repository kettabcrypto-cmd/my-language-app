// utils.js - أدوات مساعدة متقدمة
class Utils {
    // تنسيق الأرقام
    static formatNumber(num, decimals = 4) {
        const number = parseFloat(num);
        if (isNaN(number)) return '0.0000';
        
        return number.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    // تنسيق المال
    static formatCurrency(amount, currencyCode = 'USD', decimals = 2) {
        const number = parseFloat(amount);
        if (isNaN(number)) return `0.00 ${currencyCode}`;
        
        return number.toLocaleString('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).replace(currencyCode, '').trim() + ' ' + currencyCode;
    }
    
    // تنسيق التاريخ والوقت
    static formatDateTime(date) {
        if (!date) return '--:--';
        
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
    
    static formatTime(date) {
        if (!date) return '--:--';
        
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
    
    // حساب الوقت المنقضي
    static getTimeAgo(timestamp) {
        if (!timestamp) return 'Never';
        
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes === 1) return '1 minute ago';
        if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours === 1) return '1 hour ago';
        if (diffHours < 24) return `${diffHours} hours ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 30) return `${diffDays} days ago`;
        
        return Utils.formatDateTime(past);
    }
    
    // الحصول على رابط الصورة
    static getImageUrl(currencyCode, type = 'converter') {
        const imageMap = type === 'converter' ? CONFIG.CONVERTER_IMAGES : CONFIG.RATES_IMAGES;
        const imageName = imageMap[currencyCode];
        
        if (imageName) {
            return CONFIG.IMAGE_BASE_URL + imageName;
        }
        
        // الصورة الافتراضية
        return CONFIG.IMAGE_BASE_URL + '101-currency-usd.png';
    }
    
    // الحصول على كود الدولة للعلم
    static getCountryCode(currencyCode) {
        return CONFIG.COUNTRY_CODES[currencyCode] || 'un';
    }
    
    // الحصول على اسم العملة
    static getCurrencyName(currencyCode, language = 'en') {
        const name = CONFIG.CURRENCY_NAMES[currencyCode];
        if (!name) return currencyCode;
        
        return name[language] || name.en || currencyCode;
    }
    
    // التحقق من صحة العملة
    static isValidCurrency(currencyCode) {
        return currencyCode in CONFIG.CURRENCY_NAMES;
    }
    
    // تنظيم إدخال الأرقام
    static sanitizeAmountInput(value) {
        // إزالة أي شيء غير رقم أو نقطة عشرية
        let sanitized = value.replace(/[^\d.]/g, '');
        
        // التأكد من وجود نقطة عشرية واحدة فقط
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // تقليل المنازل العشرية إلى 10
        if (parts.length === 2 && parts[1].length > 10) {
            sanitized = parts[0] + '.' + parts[1].substring(0, 10);
        }
        
        return sanitized;
    }
    
    // إنشاء عنصر عملة للمودال
    static createCurrencyElement(currencyCode, isSelected = false, isDisabled = false) {
        const div = document.createElement('div');
        div.className = 'currency-grid-item';
        if (isSelected) div.classList.add('selected');
        if (isDisabled) div.classList.add('disabled');
        
        const imageUrl = Utils.getImageUrl(currencyCode, 'converter');
        const currencyName = Utils.getCurrencyName(currencyCode);
        
        div.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${currencyCode}" 
                 class="currency-grid-image"
                 onerror="this.onerror=null; this.src='https://flagcdn.com/w40/${Utils.getCountryCode(currencyCode)}.png'">
            <div class="currency-grid-code">${currencyCode}</div>
            <div class="currency-grid-name">${currencyName}</div>
        `;
        
        div.dataset.currency = currencyCode;
        return div;
    }
    
    // إنشاء عنصر العملة للقائمة
    static createRateItemElement(currencyCode, rate, showRemove = true) {
        const div = document.createElement('div');
        div.className = 'rate-item';
        
        const imageUrl = Utils.getImageUrl(currencyCode, 'rates');
        const currencyName = Utils.getCurrencyName(currencyCode);
        
        div.innerHTML = `
            <div class="rate-item-left">
                <img src="${imageUrl}" 
                     alt="${currencyCode}" 
                     class="currency-image"
                     onerror="this.onerror=null; this.src='https://flagcdn.com/w40/${Utils.getCountryCode(currencyCode)}.png'">
                <div class="rate-info">
                    <div class="currency-symbol">${currencyCode}</div>
                    <div class="currency-name">${currencyName}</div>
                </div>
            </div>
            <div class="rate-item-right">
                <div class="rate-value">${Utils.formatNumber(rate)}</div>
                ${showRemove ? `
                <button class="remove-currency-btn" data-currency="${currencyCode}" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
                ` : ''}
            </div>
        `;
        
        return div;
    }
    
    // عرض إشعار للمستخدم
    static showNotification(message, type = 'info', duration = 3000) {
        // إزالة أي إشعارات سابقة
        const oldNotification = document.querySelector('.notification-overlay');
        if (oldNotification) oldNotification.remove();
        
        const notification = document.createElement('div');
        notification.className = 'notification-overlay';
        
        let icon = 'info-circle';
        let bgColor = '#3498db';
        
        switch(type) {
            case 'success':
                icon = 'check-circle';
                bgColor = '#28a745';
                break;
            case 'error':
                icon = 'exclamation-circle';
                bgColor = '#dc3545';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                bgColor = '#ffc107';
                break;
        }
        
        notification.innerHTML = `
            <div class="notification" style="background-color: ${bgColor};">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            z-index: 9999;
            animation: notificationSlideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // إضافة الأنيميشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlideDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .notification {
                background-color: #3498db;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 500;
                max-width: 90%;
                animation: notificationSlideDown 0.3s ease;
            }
            
            .notification i {
                font-size: 20px;
            }
        `;
        
        if (!document.querySelector('#notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }
        
        // إزالة الإشعار بعد المدة المحددة
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            notification.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }
    
    // تحميل الصورة مع fallback
    static loadImageWithFallback(imgElement, imageUrl, fallbackUrl) {
        imgElement.onerror = function() {
            this.onerror = null;
            this.src = fallbackUrl;
        };
        imgElement.src = imageUrl;
    }
    
    // إضافة فاصل آلاف للأرقام
    static addThousandsSeparator(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}
