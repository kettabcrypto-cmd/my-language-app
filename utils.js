// Utility functions for CurrencyPro
class Utils {
    // Format number with commas
    static formatNumber(num, decimals = 4) {
        return parseFloat(num).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    // Format currency for display
    static formatCurrency(amount, currencyCode) {
        const formattedAmount = this.formatNumber(amount, 2);
        return `${currencyCode} ${formattedAmount}`;
    }
    
    // Sanitize amount input
    static sanitizeAmountInput(input) {
        // Remove everything except numbers and dot
        return input.replace(/[^0-9.]/g, '');
    }
    
    // Get currency name from code
    static getCurrencyName(code) {
        const currency = CONFIG.ALL_CURRENCIES.find(c => c.code === code);
        return currency ? currency.name : code;
    }
    
    // Show notification
    static showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.app-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `app-notification notification ${type}`;
        
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
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-10px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Update last update time display
    static updateLastUpdateDisplay() {
        const timeElement = document.getElementById('lastUpdateTime');
        const statusElement = document.getElementById('lastUpdateStatus');
        
        if (!timeElement || !statusElement) return;
        
        if (AppState.lastUpdate) {
            const updateTime = new Date(AppState.lastUpdate);
            const now = new Date();
            const diffMinutes = Math.floor((now - updateTime) / (1000 * 60));
            
            // Format time
            timeElement.textContent = updateTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Format status
            if (diffMinutes < 1) {
                statusElement.textContent = 'Just now';
                statusElement.style.color = '#28a745';
            } else if (diffMinutes < 60) {
                statusElement.textContent = `${diffMinutes}m ago`;
                statusElement.style.color = 'var(--primary-color)';
            } else {
                const hours = Math.floor(diffMinutes / 60);
                statusElement.textContent = `${hours}h ago`;
                statusElement.style.color = 'var(--text-secondary)';
            }
        } else {
            timeElement.textContent = '--:--';
            statusElement.textContent = 'Never updated';
            statusElement.style.color = 'var(--text-secondary)';
        }
    }
    
    // Apply theme
    static applyTheme(theme) {
        AppState.theme = theme;
        saveAppState();
        
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // Update theme buttons
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
    }
    
    // Start auto-update timer
    static startAutoUpdate() {
        // Clear existing timer
        if (window.updateTimer) {
            clearInterval(window.updateTimer);
        }
        
        // Update immediately
        window.updateRates();
        
        // Set interval for hourly updates
        window.updateTimer = setInterval(() => {
            console.log('Auto-updating exchange rates...');
            window.updateRates();
        }, CONFIG.UPDATE_INTERVAL);
        
        console.log(`Auto-update enabled: updates every ${CONFIG.UPDATE_INTERVAL / 60000} minutes`);
    }
}
