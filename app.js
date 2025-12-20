// Main Application Logic
class CurrencyProApp {
    constructor() {
        this.initializeApp();
    }
    
    initializeApp() {
        // Apply saved theme
        Utils.applyTheme(AppState.theme);
        
        // Load initial data
        this.loadInitialData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start auto-update
        Utils.startAutoUpdate();
        
        console.log('CurrencyPro App initialized');
    }
    
    async loadInitialData() {
        // Load exchange rates
        await window.updateRates();
        
        // Update displays
        this.updateRatesDisplay();
        this.updateConverterDisplay();
        Utils.updateLastUpdateDisplay();
    }
    
    // Update rates display
    updateRatesDisplay() {
        const ratesList = document.getElementById('ratesList');
        if (!ratesList) return;
        
        ratesList.innerHTML = '';
        
        if (!AppState.exchangeRates) {
            ratesList.innerHTML = `
                <div class="rate-item">
                    <div class="currency-name">Loading rates...</div>
                </div>
            `;
            return;
        }
        
        AppState.trackedCurrencies.forEach(currencyCode => {
            const rate = AppState.exchangeRates[currencyCode];
            if (!rate || currencyCode === 'USD') return;
            
            const item = this.createRateItem(currencyCode, rate);
            ratesList.appendChild(item);
        });
    }
    
    // Create rate item for display
    createRateItem(currencyCode, rate) {
        const item = document.createElement('div');
        item.className = 'rate-item';
        
        const imageUrl = currencyAPI.getImageUrl(currencyCode, 'rates');
        
        item.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${currencyCode}" 
                 class="currency-image"
                 onerror="this.src='${CONFIG.IMAGE_BASE_URL}101-currency-usd.png'">
            <div class="rate-info">
                <div class="rate-header">
                    <div class="currency-name">${currencyCode}</div>
                    <div class="rate-value">${Utils.formatNumber(rate)}</div>
                </div>
                <!-- Green rate display line as requested -->
                <div class="rate-display-line">1 USD = ${Utils.formatNumber(rate)} ${currencyCode}</div>
            </div>
            <div class="rate-actions">
                <button class="action-btn remove-btn" data-currency="${currencyCode}" title="Remove">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        return item;
    }
    
    // Update converter display
    updateConverterDisplay() {
        if (!AppState.exchangeRates) return;
        
        // Update images
        this.updateConverterImages();
        
        // Update currency codes
        document.getElementById('fromCurrencyCode').textContent = AppState.fromCurrency;
        document.getElementById('toCurrencyCode').textContent = AppState.toCurrency;
        
        // Calculate conversion
        const exchangeRate = currencyAPI.getExchangeRate(AppState.fromCurrency, AppState.toCurrency);
        const convertedAmount = currencyAPI.convertAmount(AppState.amount, AppState.fromCurrency, AppState.toCurrency);
        
        // Update amounts
        document.getElementById('fromAmount').value = AppState.amount;
        document.getElementById('toAmount').value = Utils.formatNumber(convertedAmount, 2);
        
        // Update rate display (green as requested)
        const rateText = `1 ${AppState.fromCurrency} = ${Utils.formatNumber(exchangeRate)} ${AppState.toCurrency}`;
        document.getElementById('rateText').textContent = rateText;
    }
    
    // Update converter images
    updateConverterImages() {
        const fromImage = document.getElementById('fromFlagImg');
        const toImage = document.getElementById('toFlagImg');
        
        if (fromImage) {
            fromImage.src = currencyAPI.getImageUrl(AppState.fromCurrency, 'converter');
            fromImage.alt = AppState.fromCurrency;
        }
        
        if (toImage) {
            toImage.src = currencyAPI.getImageUrl(AppState.toCurrency, 'converter');
            toImage.alt = AppState.toCurrency;
        }
    }
    
    // Show add currency modal
    showAddCurrencyModal() {
        const modal = document.getElementById('addCurrencyModal');
        const list = document.getElementById('availableCurrenciesList');
        
        if (!modal || !list) return;
        
        list.innerHTML = '';
        
        // Get currencies not already tracked
        const availableCurrencies = CONFIG.ALL_CURRENCIES.filter(currency => 
            !AppState.trackedCurrencies.includes(currency.code)
        );
        
        if (availableCurrencies.length === 0) {
            list.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">All currencies are already added</div>';
        } else {
            availableCurrencies.forEach(currency => {
                const option = this.createCurrencyOption(currency, false);
                list.appendChild(option);
            });
        }
        
        modal.classList.add('active');
    }
    
    // Show change currency modal
    showChangeCurrencyModal(type) {
        const modal = document.getElementById('changeCurrencyModal');
        const title = document.getElementById('changeCurrencyTitle');
        const list = document.getElementById('changeCurrencyList');
        
        if (!modal || !title || !list) return;
        
        AppState.changingCurrency = type;
        
        // Update title
        title.textContent = type === 'from' ? 'Select From Currency' : 'Select To Currency';
        
        // Clear list
        list.innerHTML = '';
        
        // Add all currencies
        CONFIG.ALL_CURRENCIES.forEach(currency => {
            const isSelected = (type === 'from' && currency.code === AppState.fromCurrency) ||
                              (type === 'to' && currency.code === AppState.toCurrency);
            
            const option = this.createCurrencyOption(currency, isSelected);
            list.appendChild(option);
        });
        
        modal.classList.add('active');
    }
    
    // Create currency option for modal
    createCurrencyOption(currency, isSelected) {
        const option = document.createElement('div');
        option.className = `currency-option ${isSelected ? 'selected' : ''}`;
        option.dataset.currency = currency.code;
        
        const imageUrl = currencyAPI.getImageUrl(currency.code, 'rates');
        
        option.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <img src="${imageUrl}" 
                     alt="${currency.code}" 
                     style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
                     onerror="this.src='${CONFIG.IMAGE_BASE_URL}101-currency-usd.png'">
                <div>
                    <div style="font-weight: 600; font-size: 14px;">${currency.code}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${currency.name}</div>
                </div>
            </div>
            ${isSelected ? '<i class="fas fa-check" style="color: var(--primary-color);"></i>' : ''}
        `;
        
        return option;
    }
    
    // Add currency to tracked list
    addCurrency(currencyCode) {
        if (!AppState.trackedCurrencies.includes(currencyCode)) {
            AppState.trackedCurrencies.push(currencyCode);
            saveAppState();
            this.updateRatesDisplay();
            Utils.showNotification(`${currencyCode} added successfully`, 'success');
            
            // Refresh rates to include new currency
            window.updateRates();
        }
    }
    
    // Remove currency from tracked list
    removeCurrency(currencyCode) {
        const index = AppState.trackedCurrencies.indexOf(currencyCode);
        if (index > -1) {
            AppState.trackedCurrencies.splice(index, 1);
            saveAppState();
            this.updateRatesDisplay();
            Utils.showNotification(`${currencyCode} removed`, 'info');
        }
    }
    
    // Swap currencies in converter
    swapCurrencies() {
        [AppState.fromCurrency, AppState.toCurrency] = [AppState.toCurrency, AppState.fromCurrency];
        saveAppState();
        this.updateConverterDisplay();
    }
    
    // Handle currency selection from modal
    handleCurrencySelection(currencyCode) {
        if (AppState.changingCurrency === 'from') {
            AppState.fromCurrency = currencyCode;
            saveAppState();
            this.updateConverterDisplay();
        } else if (AppState.changingCurrency === 'to') {
            AppState.toCurrency = currencyCode;
            saveAppState();
            this.updateConverterDisplay();
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.closest('.nav-item'));
            });
        });
        
        // Add currency button
        document.getElementById('addCurrencyBtn').addEventListener('click', () => {
            this.showAddCurrencyModal();
        });
        
        // Change currency buttons
        document.getElementById('changeFromCurrencyBtn').addEventListener('click', () => {
            this.showChangeCurrencyModal('from');
        });
        
        document.getElementById('changeToCurrencyBtn').addEventListener('click', () => {
            this.showChangeCurrencyModal('to');
        });
        
        // Swap currencies
        document.getElementById('swapCurrencies').addEventListener('click', () => {
            this.swapCurrencies();
        });
        
        // Amount input
        document.getElementById('fromAmount').addEventListener('input', (e) => {
            const value = Utils.sanitizeAmountInput(e.target.value);
            const amount = parseFloat(value) || 0;
            
            AppState.amount = amount;
            saveAppState();
            this.updateConverterDisplay();
        });
        
        // Close modal buttons
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            document.getElementById('addCurrencyModal').classList.remove('active');
        });
        
        document.getElementById('closeChangeModalBtn').addEventListener('click', () => {
            document.getElementById('changeCurrencyModal').classList.remove('active');
        });
        
        // Modal background clicks
        document.getElementById('addCurrencyModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.classList.remove('active');
            }
        });
        
        document.getElementById('changeCurrencyModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.classList.remove('active');
            }
        });
        
        // Theme selector
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                Utils.applyTheme(theme);
            });
        });
        
        // Event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            // Remove currency button
            if (e.target.closest('.remove-btn')) {
                const button = e.target.closest('.remove-btn');
                const currencyCode = button.dataset.currency;
                this.removeCurrency(currencyCode);
            }
            
            // Add currency from modal
            if (e.target.closest('.currency-option') && e.target.closest('#availableCurrenciesList')) {
                const option = e.target.closest('.currency-option');
                const currencyCode = option.dataset.currency;
                
                this.addCurrency(currencyCode);
                document.getElementById('addCurrencyModal').classList.remove('active');
            }
            
            // Select currency in change modal
            if (e.target.closest('.currency-option') && e.target.closest('#changeCurrencyList')) {
                const option = e.target.closest('.currency-option');
                const currencyCode = option.dataset.currency;
                
                this.handleCurrencySelection(currencyCode);
                document.getElementById('changeCurrencyModal').classList.remove('active');
            }
        });
    }
    
    // Handle navigation
    handleNavigation(navItem) {
        if (!navItem) return;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');
        
        // Show selected page
        const pageId = navItem.dataset.page;
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }
}

// Global function to update rates
window.updateRates = async function() {
    try {
        const rates = await currencyAPI.getAllExchangeRates();
        
        if (rates) {
            // Update app displays
            if (window.currencyApp) {
                window.currencyApp.updateRatesDisplay();
                window.currencyApp.updateConverterDisplay();
            }
            
            Utils.updateLastUpdateDisplay();
            console.log('Rates updated successfully');
        }
        
        return rates;
    } catch (error) {
        console.error('Error updating rates:', error);
        Utils.showNotification('Failed to update rates', 'error');
        return null;
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.currencyApp = new CurrencyProApp();
});
