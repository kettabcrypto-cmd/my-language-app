// Professional Forex API Service
class ForexAPIService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.apiKey = CONFIG.API_KEY;
        this.isFetching = false;
        this.requestQueue = [];
    }

    // Fetch all forex data in one batch request
    async fetchAllForexData() {
        const cacheKey = CONFIG.STORAGE_KEYS.FOREX_DATA;
        
        // Check cache first
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData && this.isCacheValid(cachedData.timestamp)) {
            console.log('Using cached forex data');
            return cachedData.data;
        }
        
        // Show loading state
        this.showLoadingState();
        
        try {
            const symbols = CONFIG.FOREX_PAIRS.join(',');
            const url = `${this.baseURL}/exchange_rate?symbol=${symbols}&apikey=${this.apiKey}&format=JSON`;
            
            console.log('Fetching forex data from API...');
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update API counter
            this.updateAPICounter();
            
            // Cache the data
            this.cacheData(cacheKey, data);
            
            // Cache individual pairs
            CONFIG.FOREX_PAIRS.forEach(pair => {
                if (data[pair]) {
                    this.cacheData(`pair_${pair}`, data[pair]);
                }
            });
            
            console.log('Forex data fetched successfully');
            this.hideLoadingState();
            
            return data;
            
        } catch (error) {
            console.error('Error fetching forex data:', error);
            this.hideLoadingState();
            
            // Return default data if API fails
            return this.getDefaultForexData();
        }
    }
    
    // Fetch single exchange rate
    async fetchExchangeRate(from, to) {
        if (from === to) {
            return { rate: 1 };
        }
        
        const cacheKey = `rate_${from}_${to}`;
        const cached = this.getCachedData(cacheKey);
        
        if (cached && this.isCacheValid(cached.timestamp, 5)) {
            return cached.data;
        }
        
        try {
            const url = `${this.baseURL}/exchange_rate?symbol=${from}/${to}&apikey=${this.apiKey}&format=JSON`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Network error');
            
            const data = await response.json();
            
            this.updateAPICounter();
            this.cacheData(cacheKey, data);
            
            return data;
            
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            return null;
        }
    }
    
    // Cache management
    getCachedData(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading cache:', error);
            return null;
        }
    }
    
    cacheData(key, data) {
        try {
            const cacheItem = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
            console.error('Error caching data:', error);
        }
    }
    
    isCacheValid(timestamp, minutes = 60) {
        const now = Date.now();
        const cacheAge = now - timestamp;
        const maxAge = minutes * 60 * 1000;
        return cacheAge < maxAge;
    }
    
    // Default forex data (fallback)
    getDefaultForexData() {
        console.log('Using default forex data');
        
        const defaultData = {};
        const baseTime = Date.now();
        
        const defaultRates = {
            'EUR/USD': { rate: 1.0824, high: 1.0850, low: 1.0800 },
            'GBP/USD': { rate: 1.2618, high: 1.2650, low: 1.2580 },
            'USD/JPY': { rate: 148.52, high: 149.00, low: 148.00 },
            'USD/CHF': { rate: 0.8847, high: 0.8860, low: 0.8830 },
            'USD/CAD': { rate: 1.3541, high: 1.3560, low: 1.3520 },
            'AUD/USD': { rate: 0.6583, high: 0.6600, low: 0.6560 },
            'NZD/USD': { rate: 0.6124, high: 0.6140, low: 0.6100 },
            'USD/CNY': { rate: 7.185, high: 7.190, low: 7.180 },
            'USD/AED': { rate: 3.6725, high: 3.6730, low: 3.6720 },
            'USD/SAR': { rate: 3.75, high: 3.751, low: 3.749 },
            'USD/KWD': { rate: 0.3075, high: 0.3078, low: 0.3072 },
            'USD/BHD': { rate: 0.376, high: 0.3765, low: 0.3755 },
            'USD/OMR': { rate: 0.3845, high: 0.3850, low: 0.3840 },
            'USD/QAR': { rate: 3.64, high: 3.642, low: 3.638 },
            'USD/JOD': { rate: 0.709, high: 0.710, low: 0.708 },
            'USD/EGP': { rate: 30.85, high: 31.00, low: 30.70 },
            'USD/TRY': { rate: 32.15, high: 32.30, low: 32.00 },
            'USD/RUB': { rate: 92.48, high: 93.00, low: 92.00 },
            'USD/INR': { rate: 83.18, high: 83.30, low: 83.00 },
            'USD/ZAR': { rate: 18.92, high: 19.00, low: 18.80 }
        };
        
        CONFIG.FOREX_PAIRS.forEach(pair => {
            const [from] = pair.split('/');
            const rateData = defaultRates[pair] || { rate: 1.0000, high: 1.0010, low: 0.9990 };
            
            defaultData[pair] = {
                symbol: pair,
                rate: rateData.rate,
                high: rateData.high,
                low: rateData.low,
                timestamp: baseTime - Math.random() * 3600000
            };
        });
        
        return defaultData;
    }
    
    // API counter management
    updateAPICounter() {
        const today = new Date().toDateString();
        let requests = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.API_REQUESTS) || '{}');
        
        if (requests.date !== today) {
            requests = { date: today, count: 0 };
        }
        
        requests.count++;
        localStorage.setItem(CONFIG.STORAGE_KEYS.API_REQUESTS, JSON.stringify(requests));
        
        // Update UI counter
        const counter = document.getElementById('apiCount');
        if (counter) {
            counter.textContent = requests.count;
        }
    }
    
    // Loading states
    showLoadingState() {
        const tableBody = document.getElementById('marketTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-cell">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Loading market data...</span>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    hideLoadingState() {
        // Loading state will be replaced by actual data
    }
}

// Create global API service instance
const forexAPI = new ForexAPIService();
