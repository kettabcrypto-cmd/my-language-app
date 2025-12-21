/**
 * نظام إدارة تنبيهات أسعار العملات
 */

class PriceAlerts {
    constructor() {
        this.alerts = [];
        this.notificationPermission = 'default';
        this.checkInterval = null;
        this.init();
    }

    /**
     * تهيئة النظام
     */
    init() {
        this.loadAlerts();
        this.requestNotificationPermission();
        this.startMonitoring();
        
        // تحديث البيانات كل دقيقة
        this.checkInterval = setInterval(() => this.checkAllAlerts(), 60000);
    }

    /**
     * طلب إذن الإشعارات
     */
    async requestNotificationPermission() {
        if ('Notification' in window) {
            this.notificationPermission = Notification.permission;
            if (this.notificationPermission === 'default') {
                this.notificationPermission = await Notification.requestPermission();
            }
        }
    }

    /**
     * تحميل التنبيهات من التخزين المحلي
     */
    loadAlerts() {
        try {
            const saved = localStorage.getItem('currencyPriceAlerts');
            this.alerts = saved ? JSON.parse(saved) : [];
            console.log(`تم تحميل ${this.alerts.length} تنبيهات`);
        } catch (error) {
            console.error('خطأ في تحميل التنبيهات:', error);
            this.alerts = [];
        }
    }

    /**
     * حفظ التنبيهات في التخزين المحلي
     */
    saveAlerts() {
        try {
            localStorage.setItem('currencyPriceAlerts', JSON.stringify(this.alerts));
        } catch (error) {
            console.error('خطأ في حفظ التنبيهات:', error);
        }
    }

    /**
     * إضافة تنبيه جديد
     * @param {Object} alertData - بيانات التنبيه
     */
    addAlert(alertData) {
        const alert = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            ...alertData,
            createdAt: new Date().toISOString(),
            isActive: true,
            triggered: false,
            triggerCount: 0
        };

        this.alerts.push(alert);
        this.saveAlerts();
        this.showNotification('تنبيه جديد', `تم إضافة تنبيه لـ ${alert.baseCurrency}/${alert.targetCurrency}`);
        
        return alert.id;
    }

    /**
     * إنشاء تنبيه
     * @param {string} baseCurrency - العملة الأساسية
     * @param {string} targetCurrency - العملة الهدف
     * @param {number} targetPrice - السعر المستهدف
     * @param {string} condition - الشرط ('above' أو 'below')
     * @param {string} alertName - اسم التنبيه (اختياري)
     */
    createAlert(baseCurrency, targetCurrency, targetPrice, condition = 'above', alertName = '') {
        return this.addAlert({
            baseCurrency: baseCurrency.toUpperCase(),
            targetCurrency: targetCurrency.toUpperCase(),
            targetPrice,
            condition,
            alertName: alertName || `تنبيه ${baseCurrency}/${targetCurrency}`,
            pair: `${baseCurrency.toUpperCase()}/${targetCurrency.toUpperCase()}`
        });
    }

    /**
     * التحقق من جميع التنبيهات
     * @param {Object} currentRates - الأسعار الحالية
     */
    async checkAllAlerts(currentRates = null) {
        if (!currentRates) {
            // جلب الأسعار من API إذا لم يتم توفيرها
            try {
                currentRates = await this.fetchCurrentRates();
            } catch (error) {
                console.error('خطأ في جلب الأسعار:', error);
                return;
            }
        }

        const now = new Date();
        const triggeredAlerts = [];

        for (const alert of this.alerts) {
            if (!alert.isActive || alert.triggered) continue;

            const rate = currentRates[alert.pair];
            if (!rate) continue;

            const shouldTrigger = alert.condition === 'above' 
                ? rate >= alert.targetPrice 
                : rate <= alert.targetPrice;

            if (shouldTrigger) {
                alert.triggered = true;
                alert.triggeredAt = now.toISOString();
                alert.triggerCount++;
                alert.currentPrice = rate;
                
                triggeredAlerts.push(alert);
                this.triggerAlert(alert, rate);
            }
        }

        if (triggeredAlerts.length > 0) {
            this.saveAlerts();
            this.updateUI(triggeredAlerts);
        }
    }

    /**
     * تفعيل التنبيه
     * @param {Object} alert - التنبيه
     * @param {number} currentPrice - السعر الحالي
     */
    triggerAlert(alert, currentPrice) {
        const title = `🚨 ${alert.alertName}`;
        const message = this.generateAlertMessage(alert, currentPrice);
        
        // إشعار المتصفح
        this.showNotification(title, message);
        
        // إشعار داخل التطبيق
        this.showInAppNotification(alert, message);
        
        // تسجيل الحدث
        this.logAlertEvent(alert, currentPrice);
        
        // إمكانية إضافة صوت
        this.playAlertSound();
    }

    /**
     * توليد رسالة التنبيه
     */
    generateAlertMessage(alert, currentPrice) {
        const pair = alert.pair;
        const target = alert.targetPrice.toFixed(4);
        const current = currentPrice.toFixed(4);
        const change = ((currentPrice - alert.targetPrice) / alert.targetPrice * 100).toFixed(2);
        
        return `سعر ${pair} وصل إلى ${current} (المستهدف: ${target})\nالتغير: ${change}%`;
    }

    /**
     * عرض إشعار المتصفح
     */
    showNotification(title, message) {
        if (this.notificationPermission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/assets/icons/currency-alert.png',
                badge: '/assets/icons/badge.png'
            });
        }
        
        // Fallback للمتصفحات التي لا تدعم Notifications API
        if ('alert' in window) {
            console.log(`[${title}] ${message}`);
        }
    }

    /**
     * عرض إشعار داخل التطبيق
     */
    showInAppNotification(alert, message) {
        // إنشاء عنصر الإشعار
        const notificationEl = document.createElement('div');
        notificationEl.className = 'currency-alert-notification';
        notificationEl.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">🚨</span>
                <div class="alert-text">
                    <strong>${alert.alertName}</strong>
                    <p>${message}</p>
                    <small>${new Date().toLocaleTimeString()}</small>
                </div>
                <button class="close-alert">×</button>
            </div>
        `;

        // إضافة إلى واجهة المستخدم
        const container = document.getElementById('alerts-container') || this.createAlertsContainer();
        container.insertBefore(notificationEl, container.firstChild);

        // إضافة مستمع للأحداث
        notificationEl.querySelector('.close-alert').addEventListener('click', () => {
            notificationEl.remove();
        });

        // إزالة تلقائية بعد 10 ثواني
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.remove();
            }
        }, 10000);
    }

    /**
     * إنشاء حاوية الإشعارات إذا لم تكن موجودة
     */
    createAlertsContainer() {
        const container = document.createElement('div');
        container.id = 'alerts-container';
        container.className = 'alerts-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 9999;
        `;
        document.body.appendChild(container);
        return container;
    }

    /**
     * تشغيل صوت التنبيه
     */
    playAlertSound() {
        const audio = new Audio('/assets/sounds/alert.mp3');
        audio.play().catch(e => console.log('تعذر تشغيل الصوت:', e));
    }

    /**
     * جلب الأسعار الحالية
     */
    async fetchCurrentRates() {
        // استدعاء API التطبيق الحالي
        try {
            const response = await fetch('/api/exchange-rates');
            const data = await response.json();
            return this.formatRatesForAlerts(data);
        } catch (error) {
            console.error('خطأ في جلب الأسعار:', error);
            throw error;
        }
    }

    /**
     * تنسيق الأسعار للتنبيهات
     */
    formatRatesForAlerts(ratesData) {
        const formatted = {};
        // تحويل البيانات إلى تنسيق الزوج/السعر
        // هذا يعتمد على هيكل بيانات تطبيقك
        return formatted;
    }

    /**
     * تحديث واجهة المستخدم
     */
    updateUI(triggeredAlerts) {
        // تحديث أي عناصر واجهة مرتبطة بالتنبيهات
        const alertCount = this.getActiveAlertsCount();
        this.updateAlertBadge(alertCount);
    }

    /**
     * الحصول على عدد التنبيهات النشطة
     */
    getActiveAlertsCount() {
        return this.alerts.filter(a => a.isActive && !a.triggered).length;
    }

    /**
     * تحديث شارة التنبيهات
     */
    updateAlertBadge(count) {
        const badge = document.getElementById('alert-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    /**
     * تسجيل حدث التنبيه
     */
    logAlertEvent(alert, price) {
        const event = {
            type: 'ALERT_TRIGGERED',
            alertId: alert.id,
            pair: alert.pair,
            targetPrice: alert.targetPrice,
            actualPrice: price,
            timestamp: new Date().toISOString()
        };
        
        // حفظ في localStorage
        const logs = JSON.parse(localStorage.getItem('alertLogs') || '[]');
        logs.push(event);
        localStorage.setItem('alertLogs', JSON.stringify(logs.slice(-100))); // حفظ آخر 100 حدث
    }

    /**
     * الحصول على جميع التنبيهات
     */
    getAllAlerts() {
        return [...this.alerts];
    }

    /**
     * الحصول على التنبيهات النشطة
     */
    getActiveAlerts() {
        return this.alerts.filter(a => a.isActive);
    }

    /**
     * الحصول على التنبيهات التي تم تفعيلها
     */
    getTriggeredAlerts() {
        return this.alerts.filter(a => a.triggered);
    }

    /**
     * تعطيل/تفعيل تنبيه
     */
    toggleAlert(alertId, isActive) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.isActive = isActive;
            this.saveAlerts();
            return true;
        }
        return false;
    }

    /**
     * حذف تنبيه
     */
    deleteAlert(alertId) {
        const index = this.alerts.findIndex(a => a.id === alertId);
        if (index !== -1) {
            this.alerts.splice(index, 1);
            this.saveAlerts();
            return true;
        }
        return false;
    }

    /**
     * حذف جميع التنبيهات
     */
    clearAllAlerts() {
        this.alerts = [];
        this.saveAlerts();
    }

    /**
     * بدء المراقبة
     */
    startMonitoring() {
        console.log('بدأ مراقبة أسعار العملات...');
    }

    /**
     * إيقاف المراقبة
     */
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// تصدير الكلاس للاستخدام
export default PriceAlerts;
