// في ملف js/api.js - تحديث دالة getFlagImageUrl
getFlagImageUrl(currencyCode) {
    // الحصول على رمز الصورة المناسب
    const flagCode = getFlagCode(currencyCode);
    
    // إنشاء اسم الملف باستخدام الدالة من CONFIG
    const fileName = CONFIG.getImageFileName(flagCode);
    
    // إرجاع الرابط الكامل
    return CONFIG.getImageUrl(flagCode);
}

// دالة بديلة بسيطة
getSimpleFlagUrl(currencyCode) {
    const flagCode = getFlagCode(currencyCode);
    return `${CONFIG.IMAGE_BASE_URL}100-currency-${flagCode}x.png`;
}
