// في ملف js/utils.js - تحديث دالة createCurrencyImageElement
static createCurrencyImageElement(currencyCode) {
    const currency = this.getCurrencyInfo(currencyCode);
    
    // الحصول على رمز الصورة المناسب
    const flagCode = getFlagCode(currencyCode);
    
    // إنشاء عنصر الصورة
    const img = document.createElement('img');
    
    // استخدام الرابط مع الصيغة الصحيحة
    img.src = `${CONFIG.IMAGE_BASE_URL}100-currency-${flagCode}x.png`;
    
    img.alt = `${currency.name} flag`;
    img.className = 'currency-image';
    
    // معالجة الخطأ في تحميل الصورة
    img.onerror = function() {
        console.log(`Failed to load flag for ${currencyCode}, using placeholder`);
        
        // إنشاء عنصر نائب مع رمز العملة
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.textContent = currencyCode;
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.fontWeight = '700';
        placeholder.style.fontSize = '14px';
        
        // استبدال الصورة بالنائب
        if (this.parentNode) {
            this.parentNode.innerHTML = '';
            this.parentNode.appendChild(placeholder);
        }
    };
    
    // معالجة تحميل الصورة بنجاح
    img.onload = function() {
        console.log(`Successfully loaded flag for ${currencyCode}`);
    };
    
    return img;
}

// دالة محسنة مع خيارات متعددة للصور
static createCurrencyImageElementEnhanced(currencyCode) {
    const currency = this.getCurrencyInfo(currencyCode);
    const flagCode = getFlagCode(currencyCode);
    
    // إنشاء حاوية للصورة
    const container = document.createElement('div');
    container.className = 'currency-image-container';
    
    // إنشاء الصورة
    const img = document.createElement('img');
    img.src = `${CONFIG.IMAGE_BASE_URL}100-currency-${flagCode}x.png`;
    img.alt = `${currency.name} flag`;
    img.className = 'currency-image';
    
    // النائب في حالة فشل التحميل
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.textContent = currencyCode;
    placeholder.style.display = 'none'; // مخفي في البداية
    
    // إضافة كلاهما للحاوية
    container.appendChild(img);
    container.appendChild(placeholder);
    
    // عند فشل تحميل الصورة
    img.onerror = function() {
        this.style.display = 'none';
        placeholder.style.display = 'flex';
    };
    
    // عند نجاح تحميل الصورة
    img.onload = function() {
        this.style.display = 'block';
        placeholder.style.display = 'none';
    };
    
    return container;
}

// دالة للحصول على معلومات العملة
static getCurrencyInfo(currencyCode) {
    const currency = CONFIG.DEFAULT_CURRENCIES.find(c => c.code === currencyCode);
    
    if (currency) {
        return currency;
    }
    
    // إذا لم تكن العملة في القائمة، إنشاء معلومات افتراضية
    return {
        code: currencyCode,
        name: currencyCode,
        symbol: currencyCode,
        flagCode: currencyCode.toLowerCase()
    };
}
