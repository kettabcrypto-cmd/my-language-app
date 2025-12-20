// في ملف js/app.js - تحديث دالة updateCurrencyImages
updateCurrencyImages() {
    // صورة العملة المصدر
    const fromImageContainer = document.getElementById('fromCurrencyImage');
    if (fromImageContainer) {
        fromImageContainer.innerHTML = '';
        const fromImg = this.utils.createCurrencyImageElementEnhanced(appState.fromCurrency);
        fromImageContainer.appendChild(fromImg);
    }
    
    // صورة العملة الهدف
    const toImageContainer = document.getElementById('toCurrencyImage');
    if (toImageContainer) {
        toImageContainer.innerHTML = '';
        const toImg = this.utils.createCurrencyImageElementEnhanced(appState.toCurrency);
        toImageContainer.appendChild(toImg);
    }
}
