// error-handler.js - معالجة الأخطاء والتسجيل
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.init();
    }
    
    init() {
        // التقاط أخطاء JavaScript غير المعالجة
        window.addEventListener('error', (event) => {
            this.captureError({
                type: 'unhandled_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.toString(),
                stack: event.error?.stack
            });
        });
        
        // التقاط وعود مرفوضة غير معالجة
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError({
                type: 'unhandled_rejection',
                reason: event.reason?.toString(),
                stack: event.reason?.stack
            });
        });
        
        // تحميل الأخطاء السابقة
        this.loadErrors();
    }
    
    captureError(errorData) {
        const error = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            ...errorData,
            userAgent: navigator.userAgent,
            url: window.location.href,
            language: navigator.language,
            online: navigator.onLine
        };
        
        this.errors.unshift(error);
        
        // الحفاظ على العدد الأقصى
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }
        
        // حفظ الأخطاء
        this.saveErrors();
        
        // تسجيل في الكونسول
        console.error('❌ Error captured:', error);
        
        // إرسال إشعار خطأ
        this.showErrorNotification(error);
        
        return error;
    }
    
    generateId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    saveErrors() {
        try {
            localStorage.setItem('currencypro_errors', JSON.stringify({
                errors: this.errors,
                lastUpdated: new Date().toISOString(),
                totalErrors: this.errors.length
            }));
        } catch (error) {
            console.error('Failed to save errors:', error);
        }
    }
    
    loadErrors() {
        try {
            const saved = localStorage.getItem('currencypro_errors');
            if (saved) {
                const data = JSON.parse(saved);
                this.errors = data.errors || [];
            }
        } catch (error) {
            console.error('Failed to load errors:', error);
        }
    }
    
    showErrorNotification(error) {
        // إنشاء إشعار خطأ
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        
        notification.innerHTML = `
            <div class="error-header">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Application Error</span>
                <button class="error-close">&times;</button>
            </div>
            <div class="error-body">
                <p>Something went wrong. The app will continue to work with limited functionality.</p>
                <button class="error-details-btn">Show Details</button>
                <button class="error-report-btn">Report Error</button>
            </div>
            <div class="error-details" style="display: none;">
                <pre>${JSON.stringify(error, null, 2)}</pre>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 9999;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // إضافة الأنيميشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .error-header {
                padding: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-weight: bold;
                border-bottom: 1px solid rgba(255,255,255,0.2);
            }
            
            .error-body {
                padding: 15px;
            }
            
            .error-body p {
                margin-bottom: 10px;
                font-size: 14px;
            }
            
            .error-body button {
                padding: 8px 15px;
                margin-right: 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
            }
            
            .error-details-btn {
                background: rgba(255,255,255,0.2);
                color: white;
            }
            
            .error-report-btn {
                background: white;
                color: #dc3545;
            }
            
            .error-details {
                padding: 15px;
                background: rgba(0,0,0,0.2);
                max-height: 200px;
                overflow: auto;
                font-size: 12px;
                border-top: 1px solid rgba(255,255,255,0.2);
            }
            
            .error-details pre {
                margin: 0;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            
            .error-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        
        if (!document.querySelector('#error-styles')) {
            style.id = 'error-styles';
            document.head.appendChild(style);
        }
        
        // إضافة الأحداث
        notification.querySelector('.error-close').addEventListener('click', () => {
            notification.remove();
        });
        
        notification.querySelector('.error-details-btn').addEventListener('click', () => {
            const details = notification.querySelector('.error-details');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
        
        notification.querySelector('.error-report-btn').addEventListener('click', () => {
            this.reportError(error);
            notification.remove();
        });
        
        // إزالة تلقائية بعد 10 ثواني
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                notification.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 10000);
    }
    
    reportError(error) {
        // يمكن تعديل هذا لإرسال الخطأ لخادمك
        const reportData = {
            error: error,
            app_version: '1.0.0',
            report_time: new Date().toISOString(),
            user_id: localStorage.getItem('currencypro_user_id') || 'anonymous'
        };
        
        // إرسال الخطأ
        fetch('https://your-error-reporting-service.com/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        }).catch(() => {
            // الخطأ مخزن محلياً ويمكن إرساله لاحقاً
        });
        
        // عرض رسالة للمستخدم
        alert('Thank you for reporting the error. We will investigate and fix it soon.');
    }
    
    // الحصول على إحصائيات الأخطاء
    getErrorStats() {
        const last24h = this.errors.filter(error => {
            const errorTime = new Date(error.timestamp);
            const now = new Date();
            return (now - errorTime) < 24 * 60 * 60 * 1000;
        });
        
        const errorTypes = {};
        this.errors.forEach(error => {
            errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
        });
        
        return {
            total_errors: this.errors.length,
            last_24h_errors: last24h.length,
            error_types: errorTypes,
            last_error: this.errors[0],
            first_error: this.errors[this.errors.length - 1]
        };
    }
    
    // تصدير الأخطاء
    exportErrors(format = 'json') {
        const data = {
            errors: this.errors,
            stats: this.getErrorStats(),
            export_date: new Date().toISOString(),
            total_count: this.errors.length
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        }
        
        return data;
    }
    
    // مسح الأخطاء القديمة
    clearOldErrors(days = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        this.errors = this.errors.filter(error => {
            const errorDate = new Date(error.timestamp);
            return errorDate > cutoff;
        });
        
        this.saveErrors();
        
        return this.errors.length;
    }
    
    // مسح جميع الأخطاء
    clearAllErrors() {
        this.errors = [];
        this.saveErrors();
        
        return true;
    }
    
    // تسجيل خطأ يدوياً
    logError(type, message, data = {}) {
        return this.captureError({
            type: type,
            message: message,
            ...data
        });
    }
    
    // تسجيل تحذير
    logWarning(message, data = {}) {
        console.warn('⚠️ Warning:', message, data);
        
        return this.captureError({
            type: 'warning',
            message: message,
            ...data,
            severity: 'warning'
        });
    }
    
    // تسجيل معلومات
    logInfo(message, data = {}) {
        console.info('ℹ️ Info:', message, data);
        
        return this.captureError({
            type: 'info',
            message: message,
            ...data,
            severity: 'info'
        });
    }
}
