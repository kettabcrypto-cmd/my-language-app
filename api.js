// Add this to api.js - New function for dashboard
async function getLiveRates() {
    try {
        const [currencies, rates, metals] = await Promise.all([
            apiService.getAllCurrencies(),
            apiService.getAllRatesVsUSD(),
            apiService.getGoldAndSilverPrices()
        ]);
        
        return {
            currencies: Object.keys(currencies || {}).length,
            rates: rates || {},
            metals: metals || {},
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error getting live rates:', error);
        return null;
    }
}

// Add to exports
if (typeof window !== 'undefined') {
    window.ApiService.getLiveRates = getLiveRates;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports.getLiveRates = getLiveRates;
}
