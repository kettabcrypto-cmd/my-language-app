// ملف: app.js
class CurrencyApp {
    constructor() {
        this.api = apiService;
        this.utils = Utils;
        this.init();
    }

    async init() {
        // انتظار تحميل الصفحة
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.run());
        } else {
            this.run();
        }
    }

    async run() {
        try {
            // 1. عرض جميع العملات المتاحة
            await this.displayAllCurrencies();
            
            // 2. عرض العملات مقابل USD
            await this.displayRatesVsUSD();
            
            // 3. إعداد محول العملات
            this.setupCurrencyConverter();
            
            // 4. عرض أسعار الذهب
            await this.displayGoldPrices();
            
            console.log('✅ التطبيق جاهز للاستخدام');
        } catch (error) {
            console.error('❌ خطأ في تشغيل التطبيق:', error);
        }
    }

    // 1. عرض جميع العملات المتاحة
    async displayAllCurrencies() {
        const container = document.getElementById('currencyList');
        if (!container) return;

        container.innerHTML = '<p>⏳ جاري تحميل العملات...</p>';
        
        const currencies = await this.api.getAllCurrencies();
        
        if (!currencies) {
            container.innerHTML = '<p class="error">❌ فشل تحميل العملات</p>';
            return;
        }

        let html = '<div class="currencies-grid">';
        
        // عرض أول 20 عملة فقط لكي لا نثقل الصفحة
        Object.entries(currencies).slice(0, 20).forEach(([code, name]) => {
            html += `
                <div class="currency-card">
                    <strong>${code}</strong>
                    <span>${name}</span>
                </div>
            `;
        });
        
        html += '</div>';
        
        container.innerHTML = html;
    }

    // 2. عرض العملات مقابل USD
    async displayRatesVsUSD() {
        const container = document.getElementById('ratesTable');
        if (!container) return;

        container.innerHTML = '<p>⏳ جاري تحميل الأسعار...</p>';
        
        const rates = await this.api.getAllRatesVsUSD();
        
        if (!rates) {
            container.innerHTML = '<p class="error">❌ فشل تحميل الأسعار</p>';
            return;
        }

        let html = '<table class="rates-table"><thead><tr><th>العملة</th><th>السعر مقابل USD</th></tr></thead><tbody>';
        
        // عرض أهم 10 عملات
        const importantCurrencies = ['EUR', 'GBP', 'SAR', 'AED', 'EGP', 'JPY', 'CAD', 'AUD'];
        
        importantCurrencies.forEach(currency => {
            if (rates[currency]) {
                html += `
                    <tr>
                        <td><strong>${currency}</strong></td>
                        <td>${this.utils.formatNumber(rates[currency], 4)}</td>
                    </tr>
                `;
            }
        });
        
        html += '</tbody></table>';
        
        container.innerHTML = html;
    }

    // 3. إعداد محول العملات
    setupCurrencyConverter() {
        const convertBtn = document.getElementById('convertBtn');
        const amountInput = document.getElementById('amount');
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        const resultDiv = document.getElementById('result');

        if (!convertBtn) return;

        // تعبئة قوائم العملات
        this.populateCurrencySelects();

        convertBtn.addEventListener('click', async () => {
            const amount = parseFloat(amountInput.value);
            const from = fromSelect.value;
            const to = toSelect.value;

            if (!amount || amount <= 0) {
                this.utils.showMessage('⚠️ الرجاء إدخال مبلغ صحيح', 'warning');
                return;
            }

            resultDiv.innerHTML = '<p>⏳ جاري التحويل...</p>';
            
            const result = await this.api.convertCurrency(amount, from, to);
            
            if (result) {
                resultDiv.innerHTML = `
                    <div class="conversion-result">
                        <h3>✅ نتيجة التحويل</h3>
                        <p>${this.utils.formatCurrency(amount, from)} =</p>
                        <p class="big-result">${this.utils.formatCurrency(result.convertedAmount, to)}</p>
                        <p class="rate">السعر: 1 ${from} = ${this.utils.formatNumber(result.rate, 4)} ${to}</p>
                        <p class="date">🕒 ${result.date}</p>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = '<p class="error">❌ فشل في التحويل</p>';
            }
        });
    }

    // تعبئة قوائم العملات
    async populateCurrencySelects() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        
        if (!fromSelect || !toSelect) return;

        const currencies = await this.api.getAllCurrencies();
        
        if (!currencies) return;

        // العملات الأساسية
        const mainCurrencies = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP'];
        
        mainCurrencies.forEach(currency => {
            if (currencies[currency]) {
                const option1 = new Option(`${currency} - ${currencies[currency]}`, currency);
                const option2 = new Option(`${currency} - ${currencies[currency]}`, currency);
                
                fromSelect.add(option1);
                toSelect.add(option2);
            }
        });

        // تعيين القيم الافتراضية
        fromSelect.value = 'USD';
        toSelect.value = 'SAR';
    }

    // 4. عرض أسعار الذهب
    async displayGoldPrices() {
        const container = document.getElementById('goldPrices');
        if (!container) return;

        container.innerHTML = '<p>⏳ جاري تحميل أسعار الذهب...</p>';
        
        const prices = await this.api.getGoldAndSilverPrices();
        
        if (!prices) {
            container.innerHTML = '<p class="error">❌ فشل تحميل أسعار الذهب</p>';
            return;
        }

        // تحميل بيانات العيارات من الملف المحلي
        const karatsData = await this.utils.loadJSON('data/gold-karats.json');
        
        let html = '<div class="gold-prices-container">';
        
        html += `
            <div class="price-section">
                <h3>🥇 أسعار الذهب (للأوقية بالدولار)</h3>
                <div class="karats-grid">
        `;
        
        // عرض أسعار العيارات
        const karats = [
            { key: 'gold24k', name: karatsData?.['24k']?.name || 'ذهب عيار 24' },
            { key: 'gold22k', name: karatsData?.['22k']?.name || 'ذهب عيار 22' },
            { key: 'gold21k', name: karatsData?.['21k']?.name || 'ذهب عيار 21' },
            { key: 'gold18k', name: karatsData?.['18k']?.name || 'ذهب عيار 18' }
        ];
        
        karats.forEach(karat => {
            html += `
                <div class="karat-card">
                    <h4>${karat.name}</h4>
                    <p class="price">$${this.utils.formatNumber(prices[karat.key], 2)}</p>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
            
            <div class="price-section">
                <h3>🥈 سعر الفضة (للأوقية بالدولار)</h3>
                <p class="price silver">$${this.utils.formatNumber(prices.silver, 2)}</p>
            </div>
            
            <p class="update-time">🕒 آخر تحديث: ${prices.lastUpdated}</p>
        </div>
        `;
        
        container.innerHTML = html;
    }
}

// بدء التطبيق عند تحميل الصفحة
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        new CurrencyApp();
    });
}
