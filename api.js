// API Service for CurrencyPro
class CurrencyAPI {
    constructor() {
        this.baseURL = CONFIG.API_URL;
        this.apiKey = CONFIG.API_KEY;
    }
    
    // Get all exchange rates from USD
    async getAllExchangeRates() {
        try {
            console.log('Fetching exchange rates from API...');
            
            // Check cache first
            const cachedData = this.getCachedRates();
            if (cachedData && this.isCacheValid(cachedData.timestamp)) {
                console.log('Using cached rates');
                return cachedData.rates;
            }
            
            // Get currencies to fetch
            const currenciesToFetch = this.getCurrenciesToFetch();
            
            // Fetch all rates in parallel
            const ratePromises = currenciesToFetch.map(currency => 
                this.fetchExchangeRate('USD', currency)
            );
            
            const results = await Promise.allSettled(ratePromises);
            
            // Process results
            const rates = { USD: 1.0 };
            
            results.forEach((result, index) => {
                const currency = currenciesToFetch[index];
                if (result.status === 'fulfilled' && result.value) {
                    rates[currency] = result.value;
                } else {
                    // Use default rate if API fails
                    rates[currency] = this.getDefaultRate(currency);
                    console.warn(`Using default rate for ${currency}`);
                }
            });
            
            // Cache the results
            this.cacheRates(rates);
            
            // Update app state
            AppState.exchangeRates = rates;
            AppState.lastUpdate = new Date().toISOString();
            saveAppState();
            
            console.log('Exchange rates updated successfully');
            return rates;
            
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            
            // Try to use cached data
            const cachedData = this.getCachedRates();
            if (cachedData) {
                return cachedData.rates;
            }
            
            // Fall back to default rates
            return this.getDefaultRates();
        }
    }
    
    // Fetch single exchange rate
    async fetchExchangeRate(fromCurrency, toCurrency) {
        try {
            const response = await fetch(
                `${this.baseURL}?symbol=${fromCurrency}/${toCurrency}&apikey=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.rate) {
                return parseFloat(data.rate);
            } else {
                throw new Error('Invalid response format');
            }
            
        } catch (error) {
            console.error(`Error fetching ${fromCurrency}/${toCurrency}:`, error);
            return null;
        }
    }
    
    // Get currencies that need to be fetched
    getCurrenciesToFetch() {
        const allCurrencies = new Set();
        
        // Add tracked currencies
        AppState.trackedCurrencies.forEach(currency => {
            if (currency !== 'USD') allCurrencies.add(currency);
        });
        
        // Add converter currencies
        if (AppState.fromCurrency !== 'USD') allCurrencies.add(AppState.fromCurrency);
        if (AppState.toCurrency !== 'USD') allCurrencies.add(AppState.toCurrency);
        
        // Add some popular currencies
        ['EUR', 'GBP', 'JPY', 'AED', 'SAR'].forEach(currency => {
            allCurrencies.add(currency);
        });
        
        return Array.from(allCurrencies);
    }
    
    // Get cached rates
    getCachedRates() {
        try {
            const cached = localStorage.getItem('cachedRates');
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            console.error('Error reading cache:', error);
        }
        return null;
    }
    
    // Check if cache is valid
    isCacheValid(timestamp) {
        const now = Date.now();
        const cacheAge = now - timestamp;
        return cacheAge < CONFIG.CACHE_DURATION;
    }
    
    // Cache rates
    cacheRates(rates) {
        try {
            const cacheData = {
                rates: rates,
                timestamp: Date.now()
            };
            localStorage.setItem('cachedRates', JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error caching rates:', error);
        }
    }
    
    // Get default rates (fallback)
    getDefaultRates() {
        return {
            USD: 1.0,
            EUR: 0.93,
            GBP: 0.79,
            JPY: 148.0,
            CHF: 0.88,
            CAD: 1.35,
            AUD: 1.51,
            CNY: 7.18,
            AED: 3.67,
            SAR: 3.75,
            QAR: 3.64,
            EGP: 30.9,
            TRY: 28.5,
            INR: 83.0,
            RUB: 91.5,
            BRL: 4.95,
            ZAR: 18.7,
            MXN: 17.2,
            KRW: 1310.0,
            HKD: 7.82,
            MYR: 4.67,
            MAD: 10.1,
            TND: 3.11,
            ARS: 350.0
        };
    }
    
    // Get default rate for single currency
    getDefaultRate(currency) {
        const defaults = this.getDefaultRates();
        return defaults[currency] || 1.0;
    }
    
    // Get image URL for currency
    getImageUrl(currencyCode, type = 'converter') {
        const imageMap = type === 'converter' ? CONFIG.CONVERTER_IMAGES : CONFIG.RATES_IMAGES;
        const imageName = imageMap[currencyCode];
        
        if (imageName) {
            return CONFIG.IMAGE_BASE_URL + imageName;
        }
        
        // Fallback to USD image if not found
        return CONFIG.IMAGE_BASE_URL + CONFIG.CONVERTER_IMAGES.USD;
    }
    
    // Convert amount
    convertAmount(amount, fromCurrency, toCurrency) {
        if (!AppState.exchangeRates) return 0;
        
        const fromRate = AppState.exchangeRates[fromCurrency] || 1;
        const toRate = AppState.exchangeRates[toCurrency] || 1;
        
        // Convert via USD
        const amountInUSD = amount / fromRate;
        return amountInUSD * toRate;
    }
    
    // Get exchange rate between two currencies
    getExchangeRate(fromCurrency, toCurrency) {
        if (!AppState.exchangeRates) return 1;
        
        const fromRate = AppState.exchangeRates[fromCurrency] || 1;
        const toRate = AppState.exchangeRates[toCurrency] || 1;
        
        return toRate / fromRate;
    }
}

// Create API instance
const currencyAPI = new CurrencyAPI();
