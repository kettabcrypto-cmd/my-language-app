// utils.js - أدوات مساعدة
const Utils = {
    // تنسيق الأرقام
    formatNumber: (num, decimals = 4) => {
        const number = parseFloat(num);
        if (isNaN(number)) return '0.0000';
        
        return number.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },
    
    // تنسيق الوقت
    formatTime: (date) => {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // حساب الوقت المنقضي
    getTimeAgo: (updateTime) => {
        const now = new Date();
        const update = new Date(updateTime);
        const diffMinutes = Math.floor((now - update) / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        
        const hours = Math.floor(diffMinutes / 60);
        return `${hours}h ago`;
    },
    
    // الحصول على رابط الصورة
    getImageUrl: (currencyCode, type = 'converter') => {
        const imageMap = type === 'converter' ? CONFIG.CONVERTER_IMAGES : CONFIG.RATES_IMAGES;
        const imageName = imageMap[currencyCode];
        
        if (imageName) {
            return CONFIG.IMAGE_BASE_URL + imageName;
        }
        
        // الصورة الافتراضية
        return CONFIG.IMAGE_BASE_URL + '101-currency-usd.png';
    },
    
    // إنشاء عنصر العملة
    createCurrencyElement: (currency, type = 'rates') => {
        const div = document.createElement('div');
        const imageUrl = Utils.getImageUrl(currency.code, 'rates');
        
        if (type === 'rates') {
            div.className = 'rate-item';
            div.innerHTML = `
                <img src="${imageUrl}" 
                     alt="${currency.code}" 
                     class="currency-image"
                     onerror="this.src='${CONFIG.IMAGE_BASE_URL}101-currency-usd.png'">
                <div class="rate-info">
                    <div class="rate-header">
                        <div class="currency-name">${currency.code}</div>
                    </div>
                    <div class="rate-display-line">Loading rate...</div>
                </div>
                <div class="rate-actions">
                    <button class="action-btn remove-btn" data-currency="${currency.code}" title="Remove">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        }
        
        return div;
    },
    
    // عرض إشعار
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        let icon = 'info-circle';
        let bgColor = 'var(--primary-color)';
        
        if (type === 'success') {
            icon = 'check-circle';
            bgColor = '#28a745';
        } else if (type === 'error') {
            icon = 'exclamation-circle';
            bgColor = '#dc3545';
        }
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-10px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};
