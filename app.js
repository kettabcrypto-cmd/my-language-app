// app.js
// تهيئة المتغيرات العالمية
let currencyAPI;
let storage;
let uiManager;

// دالة تهيئة التطبيق
async function initApp() {
    console.log('جاري تهيئة تطبيق CurrencyPro مع TwelveData API...');
    
    // تهيئة المكونات
    storage = new CurrencyStorage();
    currencyAPI = new CurrencyAPI();
    uiManager = new UIManager();
    
    // تحميل البيانات المخزنة
    const savedData = storage.loadData();
    
    // التحقق مما إذا كانت الأسعار بحاجة للتحديث
    const shouldUpdate = savedData.autoUpdate && storage.shouldUpdateRates();
    const noData = Object.keys(savedData.rates).length === 0;
    
    if (shouldUpdate || noData) {
        await updateExchangeRates();
    } else {
        // استخدام البيانات المخزنة
        console.log('استخدام الأسعار المخزنة محلياً');
        uiManager.updateRatesList(savedData);
        uiManager.performConversion();
    }
    
    // بدء مؤقت التحديث التلقائي (كل ساعة)
    startAutoUpdateTimer();
    
    // تحديث التحويل عند تحميل الصفحة
    uiManager.performConversion();
    
    console.log('تم تهيئة التطبيق بنجاح مع TwelveData API');
}

// تحديث أسعار الصرف
async function updateExchangeRates() {
    try {
        uiManager.showLoading(true);
        
        console.log('جاري تحديث أسعار الصرف من TwelveData...');
        const savedData = storage.loadData();
        const baseCurrency = savedData.baseCurrency || 'USD';
        
        const ratesData = await currencyAPI.fetchAllRates(baseCurrency);
        
        // حفظ الأسعار في التخزين المحلي
        storage.updateRates(ratesData);
        
        // تحديث واجهة المستخدم
        uiManager.updateRatesList(ratesData);
        uiManager.performConversion();
        
        // تحديث وقت التحديث في الواجهة
        uiManager.updateSettingsInfo();
        
        // عرض رسالة نجاح
        uiManager.showMessage('تم تحديث أسعار الصرف بنجاح', 'success');
        
        console.log('تم تحديث أسعار الصرف:', ratesData);
        
    } catch (error) {
        console.error('فشل تحديث أسعار الصرف:', error);
        uiManager.showMessage('فشل تحديث الأسعار. استخدام البيانات المخزنة.', 'error');
        
        // استخدام البيانات المخزنة كاحتياطي
        const savedData = storage.loadData();
        uiManager.updateRatesList(savedData);
        uiManager.performConversion();
        
    } finally {
        uiManager.showLoading(false);
    }
}

// تحديد أسعار الصرف يدوياً
async function manualUpdateRates() {
    await updateExchangeRates();
}

// تغيير العملة الأساسية
async function changeBaseCurrency(newBaseCurrency) {
    try {
        uiManager.showLoading(true);
        
        console.log(`تغيير العملة الأساسية إلى: ${newBaseCurrency}`);
        
        const savedData = storage.loadData();
        const ratesData = await currencyAPI.fetchAllRates(newBaseCurrency);
        
        // حفظ الأسعار مع العملة الأساسية الجديدة
        storage.updateRates(ratesData);
        
        // تحديث واجهة المستخدم
        uiManager.updateRatesList(ratesData);
        uiManager.performConversion();
        
        uiManager.showMessage(`تم تغيير العملة الأساسية إلى ${newBaseCurrency}`, 'success');
        
    } catch (error) {
        console.error('فشل تغيير العملة الأساسية:', error);
        uiManager.showMessage('فشل تغيير العملة الأساسية', 'error');
    } finally {
        uiManager.showLoading(false);
    }
}

// بدء مؤقت التحديث التلقائي
function startAutoUpdateTimer() {
    // التحقق من التحديث كل 5 دقائق (للحفاظ على عدد الطلبات)
    setInterval(async () => {
        const savedData = storage.loadData();
        
        if (savedData.autoUpdate && storage.shouldUpdateRates()) {
            console.log('التحديث التلقائي: جاري تحديث الأسعار...');
            await updateExchangeRates();
        }
    }, 300000); // كل 5 دقائق
    
    // تحديث الوقت المعروض كل دقيقة
    setInterval(() => {
        uiManager.updateSettingsInfo();
        
        // إذا كانت شاشة الأسعار مفتوحة، تحديث وقت التحديث
        if (document.getElementById('rates-screen').classList.contains('active')) {
            document.getElementById('last-update-status').textContent = storage.getLastUpdateTime();
        }
    }, 60000);
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);

// إضافة زر تحديث يدوي إلى الواجهة
function addManualUpdateButton() {
    const converterScreen = document.getElementById('converter-screen');
    const rateInfo = document.querySelector('.rate-info');
    
    if (rateInfo && !document.getElementById('manual-update-btn')) {
        const updateButton = document.createElement('button');
        updateButton.id = 'manual-update-btn';
        updateButton.className = 'update-button';
        updateButton.innerHTML = '<i class="fas fa-sync-alt"></i> تحديث الأسعار';
        updateButton.addEventListener('click', manualUpdateRates);
        
        rateInfo.appendChild(updateButton);
    }
}

// جعل الدوال متاحة عالمياً
window.currencyAPI = currencyAPI;
window.storage = storage;
window.uiManager = uiManager;
window.updateExchangeRates = updateExchangeRates;
window.manualUpdateRates = manualUpdateRates;
window.changeBaseCurrency = changeBaseCurrency;
