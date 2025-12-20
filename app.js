// Currency Dashboard App - Modern Version
class DashboardApp {
    constructor() {
        this.api = window.ApiService || null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        this.lastUpdate = null;
        this.initialize();
    }

    async initialize() {
        console.log('📊 Dashboard App Initializing...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    async start() {
        try {
            // Initialize UI components
            this.setupEventListeners();
            
            // Load initial data
            await this.loadDashboardData();
            
            // Start auto-refresh
            this.startAutoRefresh();
            
            console.log('✅ Dashboard App Started Successfully');
        } catch (error) {
            console.error('❌ Failed to start dashboard:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Currency converter
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.convertCurrency());
        }

        // Swap currencies
        const swapBtn = document.getElementById('swapBtn');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.swapCurrencies());
        }

        // Gold calculator
        const goldGrams = document.getElementById('goldGrams');
        const goldKarat = document.getElementById('goldKarat');
        if (goldGrams && goldKarat) {
            goldGrams.addEventListener('input', () => this.calculateGoldValue());
            goldKarat.addEventListener('change', () => this.calculateGoldValue());
        }

        // Amount input - auto convert on change
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.addEventListener('input', (e) => {
                if (e.target.value && e.target.value > 0) {
                    this.debouncedConvert();
                }
            });
        }

        // Currency select changes
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');
        if (fromCurrency && toCurrency) {
            fromCurrency.addEventListener('change', () => this.convertCurrency());
            toCurrency.addEventListener('change', () => this.convertCurrency());
        }
    }

    async loadDashboardData() {
        console.log('🔄 Loading dashboard data...');
        
        try {
            // Load gold and silver prices
            await this.loadMetalsPrices();
            
            // Load currency rates
            await this.loadCurrencyRates();
            
            // Update UI
            this.updateLastUpdateTime();
            this.updateRequestCount();
            
            this.showNotification('Dashboard data loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Using cached/sample data', 'warning');
            this.loadSampleData();
        }
    }

    async loadMetalsPrices() {
        if (!this.api) {
            console.warn('API service not available, using sample data');
            this.loadSampleMetalsData();
            return;
        }

        try {
            const prices = await this.api.getGoldAndSilverPrices();
            
            if (prices) {
                // Update gold prices
                this.updateElementText('goldPrice', `$${prices.gold24k.toFixed(2)}`);
                this.updateElementText('goldPriceLive', `$${prices.gold24k.toFixed(2)}`);
                
                // Update silver price
                this.updateElementText('silverPrice', `$${prices.silver.toFixed(2)}`);
                this.updateElementText('silverPriceLive', `$${prices.silver.toFixed(2)}`);
                
                // Update karats prices
                this.updateGoldKarats(prices);
                
                // Recalculate gold value if needed
                this.calculateGoldValue();
            }
        } catch (error) {
            console.error('Error loading metals prices:', error);
            throw error;
        }
    }

    async loadCurrencyRates() {
        if (!this.api) {
            console.warn('API service not available, using sample data');
            this.loadSampleRatesData();
            return;
        }

        try {
            const rates = await this.api.getAllRatesVsUSD();
            
            if (rates) {
                // Update quick stats
                if (rates.SAR) {
                    this.updateElementText('usdSarRate', rates.SAR.toFixed(4));
                }
                if (rates.EUR) {
                    this.updateElementText('usdEurRate', rates.EUR.toFixed(4));
                }
                if (rates.GBP) {
                    // Find GBP rate in rates table and update
                    this.updateRatesTable(rates);
                }
                
                // Update converter if there's an amount
                const amount = document.getElementById('amount').value;
                if (amount && amount > 0) {
                    this.convertCurrency();
                }
            }
        } catch (error) {
            console.error('Error loading currency rates:', error);
            throw error;
        }
    }

    updateRatesTable(rates) {
        // This would update the rates table with live data
        // For now, we'll just update the major pairs
        const pairs = {
            'USD/SAR': rates.SAR,
            'USD/EUR': rates.EUR,
            'USD/GBP': rates.GBP,
            'USD/AED': rates.AED,
            'USD/EGP': rates.EGP
        };
        
        // In a real implementation, you would update each row in the table
        console.log('Rates table updated:', pairs);
    }

    updateGoldKarats(prices) {
        const karatPrices = {
            '22K': prices.gold22k,
            '21K': prices.gold21k,
            '18K': prices.gold18k,
            '14K': prices.gold24k * 0.583 // 14K is 58.3% gold
        };
        
        // Update karats grid if it exists
        const karatItems = document.querySelectorAll('.karat-price');
        if (karatItems.length > 0) {
            const karats = ['22K', '21K', '18K', '14K'];
            karatItems.forEach((item, index) => {
                if (karatPrices[karats[index]]) {
                    item.textContent = `$${karatPrices[karats[index]].toFixed(2)}`;
                }
            });
        }
    }

    async convertCurrency() {
        const amountInput = document.getElementById('amount');
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        const convertBtn = document.getElementById('convertBtn');
        const resultElement = document.getElementById('toAmount');
        const rateElement = document.getElementById('exchangeRate');
        
        if (!amountInput || !fromSelect || !toSelect) return;
        
        const amount = parseFloat(amountInput.value);
        const from = fromSelect.value;
        const to = toSelect.value;
        
        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }
        
        // Show loading state
        if (convertBtn) {
            convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
            convertBtn.disabled = true;
        }
        
        try {
            let result;
            
            if (this.api) {
                result = await this.api.convertCurrency(amount, from, to);
            }
            
            if (result && result.convertedAmount) {
                // Update result
                resultElement.textContent = result.convertedAmount.toFixed(2);
                rateElement.textContent = `1 ${from} = ${result.rate.toFixed(4)} ${to}`;
                
                // Update rate update time
                this.updateElementText('rateUpdateTime', new Date().toLocaleTimeString('en-US', {
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit'
                }));
                
                this.showNotification('Conversion successful', 'success');
            } else {
                // Fallback to sample calculation
                this.useSampleConversion(amount, from, to, resultElement, rateElement);
                this.showNotification('Using sample conversion rates', 'warning');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            this.useSampleConversion(amount, from, to, resultElement, rateElement);
            this.showNotification('Conversion failed, using sample data', 'error');
        } finally {
            // Reset button state
            if (convertBtn) {
                convertBtn.innerHTML = '<i class="fas fa-calculator"></i> Convert Now';
                convertBtn.disabled = false;
            }
        }
    }

    useSampleConversion(amount, from, to, resultElement, rateElement) {
        // Sample conversion rates (for demo purposes)
        const sampleRates = {
            'USD': { 'SAR': 3.75, 'EUR': 0.92, 'GBP': 0.79, 'AED': 3.67, 'EGP': 30.89 },
            'EUR': { 'USD': 1.09, 'SAR': 4.08, 'GBP': 0.86, 'AED': 4.00, 'EGP': 33.68 },
            'GBP': { 'USD': 1.27, 'EUR': 1.16, 'SAR': 4.76, 'AED': 4.66, 'EGP': 39.25 },
            'SAR': { 'USD': 0.27, 'EUR': 0.25, 'GBP': 0.21, 'AED': 0.98, 'EGP': 8.24 }
        };
        
        const rate = sampleRates[from]?.[to] || 1;
        const convertedAmount = amount * rate;
        
        resultElement.textContent = convertedAmount.toFixed(2);
        rateElement.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    }

    swapCurrencies() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        
        if (!fromSelect || !toSelect) return;
        
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        
        // Convert immediately if there's an amount
        const amount = document.getElementById('amount').value;
        if (amount && amount > 0) {
            this.convertCurrency();
        }
    }

    calculateGoldValue() {
        const gramsInput = document.getElementById('goldGrams');
        const karatSelect = document.getElementById('goldKarat');
        const valueElement = document.getElementById('goldValue');
        
        if (!gramsInput || !karatSelect || !valueElement) return;
        
        const grams = parseFloat(gramsInput.value) || 0;
        const karat = parseInt(karatSelect.value);
        
        // Get current gold price
        const goldPriceElement = document.getElementById('goldPriceLive');
        let goldPrice = 2150.45; // Default fallback
        
        if (goldPriceElement) {
            const priceText = goldPriceElement.textContent.replace('$', '').replace(',', '');
            goldPrice = parseFloat(priceText) || 2150.45;
        }
        
        // Karat multipliers (purity)
        const karatMultipliers = {
            24: 1.000, // 99.9%
            22: 0.9167, // 91.67%
            21: 0.875,  // 87.5%
            18: 0.750   // 75.0%
        };
        
        const multiplier = karatMultipliers[karat] || 1.0;
        
        // Calculate: price per gram = (price per ounce * multiplier) / 31.1035
        // 1 troy ounce = 31.1035 grams
        const pricePerGram = (goldPrice * multiplier) / 31.1035;
        const totalValue = pricePerGram * grams;
        
        valueElement.textContent = `$${totalValue.toFixed(2)}`;
    }

    async refreshData() {
        console.log('🔄 Manual refresh requested');
        
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.classList.add('refreshing');
        }
        
        try {
            await this.loadDashboardData();
            this.showNotification('Data refreshed successfully', 'success');
        } catch (error) {
            this.showNotification('Refresh failed', 'error');
        } finally {
            if (refreshBtn) {
                setTimeout(() => {
                    refreshBtn.classList.remove('refreshing');
                }, 1000);
            }
        }
    }

    startAutoRefresh() {
        // Refresh every 5 minutes (300000 ms)
        setInterval(() => {
            console.log('🔄 Auto-refreshing data...');
            this.loadDashboardData();
        }, 5 * 60 * 1000);
        
        console.log('⏰ Auto-refresh scheduled every 5 minutes');
    }

    updateLastUpdateTime() {
        const now = new Date();
        this.lastUpdate = now;
        
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit'
        });
        
        this.updateElementText('lastUpdate', timeString);
        this.updateElementText('rateUpdateTime', timeString);
    }

    updateRequestCount() {
        // Simulate request count (in a real app, this would come from API)
        const requestCount = Math.floor(Math.random() * 500) + 1000;
        this.updateElementText('requestCount', requestCount.toLocaleString());
    }

    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    showNotification(message, type = 'info') {
        // Check if notification system exists
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type.toUpperCase()}: ${message}`);
            
            // Create simple notification
            const notification = document.createElement('div');
            notification.className = `simple-notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    debouncedConvert = this.debounce(() => {
        this.convertCurrency();
    }, 500);

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    loadSampleData() {
        console.log('📋 Loading sample data for demo...');
        this.loadSampleMetalsData();
        this.loadSampleRatesData();
    }

    loadSampleMetalsData() {
        // Sample metals data
        const sampleMetals = {
            gold24k: 2150.45,
            gold22k: 1970.25,
            gold21k: 1880.15,
            gold18k: 1612.84,
            silver: 24.85
        };
        
        this.updateElementText('goldPrice', `$${sampleMetals.gold24k.toFixed(2)}`);
        this.updateElementText('goldPriceLive', `$${sampleMetals.gold24k.toFixed(2)}`);
        this.updateElementText('silverPrice', `$${sampleMetals.silver.toFixed(2)}`);
        this.updateElementText('silverPriceLive', `$${sampleMetals.silver.toFixed(2)}`);
        
        // Update karats
        const karatPrices = {
            '22K': sampleMetals.gold22k,
            '21K': sampleMetals.gold21k,
            '18K': sampleMetals.gold18k,
            '14K': sampleMetals.gold24k * 0.583
        };
        
        const karatItems = document.querySelectorAll('.karat-price');
        if (karatItems.length > 0) {
            const karats = ['22K', '21K', '18K', '14K'];
            karatItems.forEach((item, index) => {
                item.textContent = `$${karatPrices[karats[index]].toFixed(2)}`;
            });
        }
    }

    loadSampleRatesData() {
        // Sample rates data
        this.updateElementText('usdSarRate', '3.7500');
        this.updateElementText('usdEurRate', '0.9200');
        
        // Trigger conversion with sample data
        const amount = document.getElementById('amount').value;
        if (amount && amount > 0) {
            setTimeout(() => this.convertCurrency(), 1000);
        }
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.DashboardApp = new DashboardApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardApp;
}
