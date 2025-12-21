// app.js - التطبيق الرئيسي
document.addEventListener('DOMContentLoaded', async function() {
    console.log('CurrencyPro App Initializing...');
    
    // تهيئة التطبيق
    await initApp();
    
    // تحميل البيانات
    await loadInitialData();
    
    // إعداد Event Listeners
    setupEventListeners();
    
    // بدء التحديث التلقائي
    startAutoRefresh();
    
    console.log('CurrencyPro App Ready!');
});

/**
 * تهيئة التطبيق
 */
async function initApp() {
    // عرض حالة التحميل
    showLoadingState();
    
    // تحميل الإعدادات
    await loadSettings();
    
    // التحقق من حالة API
    await checkAPIConnection();
    
    // تهيئة الواجهة
    initializeUI();
}

/**
 * تحميل البيانات الأولية
 */
async function loadInitialData() {
    try {
        // 1. جلب أسعار العملات
        await loadExchangeRates();
        
        // 2. تعبئة محول العملات
        populateCurrencySelectors();
        
        // 3. تحميل العملات المفضلة
        loadFavorites();
        
        // 4. تحميل المخطط البياني
        loadMiniChart();
        
        // 5. تحديث الواجهة
        updateDisplay();
        
        // إخفاء حالة التحميل
        hideLoadingState();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showErrorMessage('فشل تحميل البيانات. الرجاء التحقق من اتصال الإنترنت.');
    }
}

/**
 * جلب أسعار العملات
 */
async function loadExchangeRates() {
    const loadingElement = document.querySelector('.loading-rates');
    if (loadingElement) {
        loadingElement.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <p>جاري تحديث الأسعار من TwelveData API...</p>
        `;
    }
    
    try {
        // استخدام العملات الشائعة أولاً
        const symbols = CONFIG.POPULAR_CURRENCIES.filter(curr => curr !== 'USD');
        const rates = await CurrencyAPI.getMultipleRates(symbols, 'USD');
        
        // إضافة USD
        rates['USD'] = 1;
        
        // حفظ في localStorage
        localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATES, JSON.stringify(rates));
        localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
        
        console.log('Rates loaded successfully:', Object.keys(rates).length, 'currencies');
        
        // تحديث الواجهة
        updateRatesDisplay(rates);
        updateLastUpdateTime();
        
        return rates;
        
    } catch (error) {
        console.error('Error loading exchange rates:', error);
        
        // استخدام البيانات المحفوظة
        const cachedRates = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATES);
        if (cachedRates) {
            console.log('Using cached rates');
            return JSON.parse(cachedRates);
        }
        
        throw error;
    }
}

/**
 * تعبئة محول العملات
 */
function populateCurrencySelectors() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    
    if (!fromSelect || !toSelect) return;
    
    // مسح الخيارات الحالية
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    
    // جلب الأسعار
    const rates = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATES)) || {};
    const currencies = Object.keys(rates).sort();
    
    // إضافة العملات
    currencies.forEach(currency => {
        const option = createCurrencyOption(currency);
        
        const option1 = option.cloneNode(true);
        const option2 = option.cloneNode(true);
        
        fromSelect.appendChild(option1);
        toSelect.appendChild(option2);
    });
    
    // تعيين القيم الافتراضية
    fromSelect.value = CONFIG.DEFAULT_BASE_CURRENCY;
    toSelect.value = CONFIG.DEFAULT_TARGET_CURRENCY;
    
    // تحديث الأعلام
    updateCurrencyFlags();
}

/**
 * إنشاء خيار عملة
 */
function createCurrencyOption(currencyCode) {
    const option = document.createElement('option');
    option.value = currencyCode;
    
    const name = CONFIG.CURRENCY_NAMES[currencyCode] || currencyCode;
    const flag = CONFIG.CURRENCY_FLAGS[currencyCode] || '🏳️';
    
    option.textContent = `${flag} ${currencyCode} - ${name}`;
    option.dataset.flag = flag;
    
    return option;
}

/**
 * تحديث أعلام العملات
 */
function updateCurrencyFlags() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    const fromFlag = document.getElementById('from-flag');
    const toFlag = document.getElementById('to-flag');
    
    if (fromSelect && fromFlag) {
        const selectedOption = fromSelect.options[fromSelect.selectedIndex];
        fromFlag.textContent = selectedOption?.dataset.flag || '🏳️';
    }
    
    if (toSelect && toFlag) {
        const selectedOption = toSelect.options[toSelect.selectedIndex];
        toFlag.textContent = selectedOption?.dataset.flag || '🏳️';
    }
}

/**
 * تحويل العملات
 */
async function performConversion() {
    const amountInput = document.getElementById('amount');
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    
    if (!amountInput || !fromCurrency || !toCurrency) return;
    
    const amount = parseFloat(amountInput.value) || 0;
    const fromCurr = fromCurrency.value;
    const toCurr = toCurrency.value;
    
    if (amount <= 0) {
        showMessage('الرجاء إدخال مبلغ صحيح', 'error');
        return;
    }
    
    if (fromCurr === toCurr) {
        showMessage('لا يمكن تحويل العملة إلى نفسها', 'warning');
        return;
    }
    
    try {
        // جلب سعر الصرف
        const rateData = await CurrencyAPI.getExchangeRate(toCurr, fromCurr);
        const rate = rateData.rate;
        
        // حساب النتيجة
        const convertedAmount = amount * rate;
        
        // عرض النتيجة
        displayConversionResult(amount, fromCurr, convertedAmount, toCurr, rate, rateData.timestamp);
        
        // حفظ في السجل
        saveToHistory({
            amount,
            from: fromCurr,
            to: toCurr,
            rate,
            result: convertedAmount,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('Conversion error:', error);
        showMessage('فشل عملية التحويل. الرجاء المحاولة مرة أخرى.', 'error');
    }
}

/**
 * عرض نتيجة التحويل
 */
function displayConversionResult(amount, fromCurr, convertedAmount, toCurr, rate, timestamp) {
    const resultDiv = document.getElementById('result');
    const originalAmount = document.getElementById('original-amount');
    const convertedAmountEl = document.getElementById('converted-amount');
    const rateText = document.getElementById('rate-text');
    const resultTime = document.getElementById('result-time');
    
    if (!resultDiv || !originalAmount) return;
    
    // تحديث النصوص
    originalAmount.textContent = `${formatNumber(amount)} ${fromCurr}`;
    convertedAmountEl.textContent = `${formatNumber(convertedAmount)} ${toCurr}`;
    rateText.textContent = `سعر الصرف: 1 ${fromCurr} = ${formatNumber(rate)} ${toCurr}`;
    
    if (resultTime) {
        const timeStr = timestamp.toLocaleTimeString();
        resultTime.textContent = `تم التحويل في ${timeStr}`;
    }
    
    // إظهار نتيجة التحويل
    resultDiv.style.display = 'block';
    
    // إضافة تأثير بسيط
    resultDiv.style.animation = 'none';
    setTimeout(() => {
        resultDiv.style.animation = 'fadeIn 0.5s ease-in-out';
    }, 10);
}

/**
 * تحديث عرض الأسعار
 */
function updateRatesDisplay(rates) {
    const ratesGrid = document.getElementById('rates-grid');
    const totalCurrencies = document.getElementById('total-currencies');
    
    if (!ratesGrid) return;
    
    // مسح المحتوى الحالي
    ratesGrid.innerHTML = '';
    
    // تحويل إلى مصفوفة وفرز
    const ratesArray = Object.entries(rates).map(([currency, rate]) => ({
        currency,
        rate,
        name: CONFIG.CURRENCY_NAMES[currency] || currency,
        flag: CONFIG.CURRENCY_FLAGS[currency] || '🏳️'
    }));
    
    // الفرز حسب الإعدادات
    const sortBy = document.getElementById('sort-by')?.value || 'code';
    ratesArray.sort((a, b) => {
        switch(sortBy) {
            case 'name': return a.name.localeCompare(b.name);
            case 'rate': return b.rate - a.rate;
            case 'change': return 0; // يمكن إضافة منطق التغير
            default: return a.currency.localeCompare(b.currency);
        }
    });
    
    // تحديد عدد العناصر المعروضة
    const showCount = document.getElementById('show-count')?.value || '25';
    const displayCount = showCount === 'all' ? ratesArray.length : parseInt(showCount);
    const displayArray = ratesArray.slice(0, displayCount);
    
    // إنشاء البطاقات
    displayArray.forEach(item => {
        const card = createCurrencyCard(item);
        ratesGrid.appendChild(card);
    });
    
    // تحديث العداد
    if (totalCurrencies) {
        totalCurrencies.textContent = ratesArray.length;
    }
}

/**
 * إنشاء بطاقة عملة
 */
function createCurrencyCard(currencyData) {
    const card = document.createElement('div');
    card.className = 'currency-card';
    card.dataset.currency = currencyData.currency;
    
    const isFavorite = checkIfFavorite(currencyData.currency);
    
    card.innerHTML = `
        <div class="card-header">
            <div class="currency-info">
                <span class="currency-flag">${currencyData.flag}</span>
                <div class="currency-details">
                    <span class="currency-code">${currencyData.currency}</span>
                    <span class="currency-name">${currencyData.name}</span>
                </div>
            </div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                    data-currency="${currencyData.currency}"
                    title="${isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}">
                <i class="${isFavorite ? 'fas' : 'far'} fa-star"></i>
            </button>
        </div>
        <div class="card-body">
            <div class="exchange-rate">
                <span class="rate-value">${formatNumber(currencyData.rate)}</span>
                <span class="rate-label">USD/${currencyData.currency}</span>
            </div>
            <div class="currency-actions">
                <button class="action-btn use-as-from" data-currency="${currencyData.currency}" title="استخدام كعملة مصدر">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="action-btn use-as-to" data-currency="${currencyData.currency}" title="استخدام كعملة هدف">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * إعداد Event Listeners
 */
function setupEventListeners() {
    // زر التحويل
    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
        convertBtn.addEventListener('click', performConversion);
    }
    
    // زر التبديل
    const swapBtn = document.getElementById('swap-currencies');
    if (swapBtn) {
        swapBtn.addEventListener('click', swapCurrencies);
    }
    
    // تحديث الأسعار
    const refreshBtn = document.getElementById('refresh-rates');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshRates);
    }
    
    // البحث
    const searchInput = document.getElementById('search-currency');
    if (searchInput) {
        searchInput.addEventListener('input', filterCurrencies);
    }
    
    // تحديث الفلاتر
    const sortSelect = document.getElementById('sort-by');
    const countSelect = document.getElementById('show-count');
    
    if (sortSelect) sortSelect.addEventListener('change', updateRatesDisplayFromStorage);
    if (countSelect) countSelect.addEventListener('change', updateRatesDisplayFromStorage);
    
    // نسخ النتيجة
    const copyBtn = document.getElementById('copy-result');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyConversionResult);
    }
    
    // تحديث الأعلام عند تغيير العملات
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    
    if (fromSelect) fromSelect.addEventListener('change', updateCurrencyFlags);
    if (toSelect) toSelect.addEventListener('change', updateCurrencyFlags);
    
    // إضافة مفضلات افتراضية
    const addFavsBtn = document.getElementById('add-default-favs');
    if (addFavsBtn) {
        addFavsBtn.addEventListener('click', addDefaultFavorites);
    }
    
    // إخفاء/إظهار API Key
    const toggleApiBtn = document.getElementById('toggle-api-key');
    if (toggleApiBtn) {
        toggleApiBtn.addEventListener('click', toggleApiKeyVisibility);
    }
}

/**
 * تحديث الأسعار
 */
async function refreshRates() {
    const refreshBtn = document.getElementById('refresh-rates');
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        refreshBtn.disabled = true;
    }
    
    try {
        await loadExchangeRates();
        showMessage('تم تحديث الأسعار بنجاح', 'success');
    } catch (error) {
        showMessage('فشل تحديث الأسعار', 'error');
    } finally {
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            refreshBtn.disabled = false;
        }
    }
}

/**
 * تحديث الوقت الأخير
 */
function updateLastUpdateTime() {
    const lastUpdate = document.getElementById('last-update');
    const updateTime = document.getElementById('update-time');
    
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    
    if (lastUpdate) {
        lastUpdate.innerHTML = `<i class="fas fa-sync-alt"></i> تم التحديث: ${timeString}`;
    }
    
    if (updateTime) {
        updateTime.textContent = timeString;
    }
}

/**
 * تهيئة الواجهة
 */
function initializeUI() {
    // يمكن إضافة تهيئة إضافية هنا
}

/**
 * بدء التحديث التلقائي
 */
function startAutoRefresh() {
    // تحديث كل 5 دقائق
    setInterval(async () => {
        console.log('Auto-refreshing rates...');
        await loadExchangeRates();
    }, CONFIG.REFRESH_INTERVAL);
}

// تصدير الدوال للاستخدام في أدوات التطوير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initApp,
        loadExchangeRates,
        performConversion,
        refreshRates
    };
}
