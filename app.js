// Main Forex Trading Application
class ForexTradingApp {
    constructor() {
        this.api = forexAPI;
        this.forexData = {};
        this.watchlist = new Set();
        this.updateInterval = null;
        this.countdownInterval = null;
        this.currentView = 'all';
        this.currentSort = { field: 'symbol', order: 'asc' };
        
        this.init();
    }
    
    async init() {
        console.log('Initializing Forex Trading App...');
        
        // Initialize all components
        this.setupEventListeners();
        this.setupNavigation();
        this.populateCurrencySelectors();
        this.loadWatchlist();
        this.updateDateTime();
        this.updateAPICounter();
        
        // Load initial data
        await this.loadMarketData();
        
        // Setup auto-update
        this.setupAutoUpdate();
        
        // Start countdown timer
        this.startCountdownTimer();
        
        console.log('App initialized successfully');
    }
    
    // Load market data
    async loadMarketData() {
        try {
            this.forexData = await this.api.fetchAllForexData();
            this.updateMarketTable();
            this.updateQuickPairs();
            this.updateStatsBar();
            this.updateLastUpdateTime();
            
            // Update converter if active
            if (document.getElementById('converter-section').classList.contains('active')) {
                this.updateCurrencyConversion();
            }
            
        } catch (error) {
            console.error('Failed to load market data:', error);
            this.showError('Failed to load market data. Using cached data.');
        }
    }
    
    // Update market table
    updateMarketTable() {
        const tableBody = document.getElementById('marketTableBody');
        if (!tableBody) return;
        
        if (!this.forexData || Object.keys(this.forexData).length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-cell">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>No market data available</span>
                    </td>
                </tr>
            `;
            return;
        }
        
        let pairs = Object.keys(this.forexData);
        
        // Filter by view
        pairs = this.filterPairsByView(pairs);
        
        // Sort pairs
        pairs = this.sortPairs(pairs);
        
        // Generate table rows
        let html = '';
        pairs.forEach((pair, index) => {
            const data = this.forexData[pair];
            if (!data) return;
            
            const [from, to] = pair.split('/');
            const rate = parseFloat(data.rate) || 0;
            const high = parseFloat(data.high) || rate * 1.001;
            const low = parseFloat(data.low) || rate * 0.999;
            const bid = rate;
            const ask = rate * 1.0002;
            
            // Calculate change (simulated)
            const previousRate = this.getPreviousRate(pair);
            const change = previousRate ? rate - previousRate : (Math.random() - 0.5) * 0.01;
            const changePercent = previousRate ? (change / previousRate) * 100 : (Math.random() - 0.5) * 0.5;
            
            // Format time
            const time = data.timestamp ? this.formatTime(data.timestamp) : '--:--';
            
            // Check if in watchlist
            const isInWatchlist = this.watchlist.has(pair);
            
            html += `
                <tr class="market-row" data-pair="${pair}">
                    <td class="col-symbol">
                        <div class="symbol-cell">
                            <span class="currency-flag">${CONFIG.CURRENCY_FLAGS[from] || '🏳️'}</span>
                            <div class="currency-info">
                                <div class="currency-code">${pair}</div>
                                <div class="currency-name">${CONFIG.CURRENCY_NAMES[from] || from}</div>
                            </div>
                        </div>
                    </td>
                    <td class="col-bid">
                        <span class="price-cell bid-price">${this.formatPrice(bid, from)}</span>
                    </td>
                    <td class="col-ask">
                        <span class="price-cell ask-price">${this.formatPrice(ask, from)}</span>
                    </td>
                    <td class="col-change">
                        <span class="change-cell ${change >= 0 ? 'change-positive' : 'change-negative'}">
                            ${change >= 0 ? '+' : ''}${this.formatPrice(change, from)}
                            <br>
                            <small>(${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)</small>
                        </span>
                    </td>
                    <td class="col-high">
                        <span class="price-cell">${this.formatPrice(high, from)}</span>
                    </td>
                    <td class="col-low">
                        <span class="price-cell">${this.formatPrice(low, from)}</span>
                    </td>
                    <td class="col-time">
                        <span class="time-cell">${time}</span>
                    </td>
                    <td class="col-actions">
                        <div class="action-buttons">
                            <button class="btn-icon ${isInWatchlist ? 'active' : ''}" 
                                    data-action="watchlist" 
                                    data-pair="${pair}"
                                    title="${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}">
                                <i class="fas ${isInWatchlist ? 'fa-star' : 'fa-star'}"></i>
                            </button>
                            <button class="btn-icon" data-action="convert" data-pair="${pair}" title="Convert">
                                <i class="fas fa-exchange-alt"></i>
                            </button>
                            <button class="btn-icon" data-action="chart" data-pair="${pair}" title="View Chart">
                                <i class="fas fa-chart-line"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html || `
            <tr>
                <td colspan="8" class="empty-cell">
                    <i class="fas fa-search"></i>
                    <span>No matching pairs found</span>
                </td>
            </tr>
        `;
        
        // Add event listeners to action buttons
        this.setupTableActions();
        
        // Save current rates for next comparison
        this.saveCurrentRates();
    }
    
    // Update quick pairs grid
    updateQuickPairs() {
        const grid = document.getElementById('quickPairsGrid');
        if (!grid) return;
        
        let html = '';
        CONFIG.QUICK_PAIRS.forEach(pair => {
            const data = this.forexData[pair];
            if (!data) return;
            
            const rate = parseFloat(data.rate) || 0;
            const [from, to] = pair.split('/');
            const previousRate = this.getPreviousRate(pair);
            const change = previousRate ? rate - previousRate : 0;
            const changePercent = previousRate ? (change / previousRate) * 100 : 0;
            
            html += `
                <div class="pair-card" data-pair="${pair}">
                    <div class="pair-header">
                        <span class="pair-symbol">${pair}</span>
                        <span class="pair-price ${change >= 0 ? 'change-positive' : 'change-negative'}">
                            ${this.formatPrice(rate, from)}
                        </span>
                    </div>
                    <div class="pair-details">
                        <span>${CONFIG.CURRENCY_NAMES[from] || from}</span>
                        <span class="${change >= 0 ? 'change-positive' : 'change-negative'}">
                            ${change >= 0 ? '↗' : '↘'} ${changePercent.toFixed(2)}%
                        </span>
                    </div>
                </div>
            `;
        });
        
        grid.innerHTML = html || '<div class="pair-card">No data available</div>';
        
        // Add click events to quick pairs
        document.querySelectorAll('.pair-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const pair = card.getAttribute('data-pair');
                const [from, to] = pair.split('/');
                
                // Set converter values
                document.getElementById('fromCurrency').value = from;
                document.getElementById('toCurrency').value = to;
                document.getElementById('amount').value = '1000';
                
                // Update flags
                document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS[from] || '🏳️';
                document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS[to] || '🏳️';
                
                // Switch to converter tab
                document.querySelector('[data-tab="converter"]').click();
                
                // Update conversion
                setTimeout(() => this.updateCurrencyConversion(), 100);
            });
        });
    }
    
    // Update stats bar
    updateStatsBar() {
        if (!this.forexData || Object.keys(this.forexData).length === 0) return;
        
        let topGainer = { pair: '', change: -Infinity };
        let topLoser = { pair: '', change: Infinity };
        let totalPairs = 0;
        let spreadSum = 0;
        
        Object.keys(this.forexData).forEach(pair => {
            totalPairs++;
            
            const data = this.forexData[pair];
            if (!data) return;
            
            const rate = parseFloat(data.rate) || 0;
            const previousRate = this.getPreviousRate(pair);
            
            if (previousRate) {
                const changePercent = ((rate - previousRate) / previousRate) * 100;
                
                if (changePercent > topGainer.change) {
                    topGainer = { pair: pair, change: changePercent };
                }
                if (changePercent < topLoser.change) {
                    topLoser = { pair: pair, change: changePercent };
                }
            }
            
            // Calculate spread (simplified)
            const spread = rate * 0.0002; // 2 pips
            spreadSum += spread;
        });
        
        // Update DOM
        document.getElementById('totalPairs').textContent = totalPairs;
        document.getElementById('topGainer').textContent = topGainer.pair ? 
            `${topGainer.pair} +${topGainer.change.toFixed(2)}%` : '--';
        document.getElementById('topLoser').textContent = topLoser.pair ? 
            `${topLoser.pair} ${topLoser.change.toFixed(2)}%` : '--';
        document.getElementById('avgSpread').textContent = totalPairs > 0 ? 
            `${(spreadSum / totalPairs).toFixed(1)} pips` : '--';
        
        // Set volatility based on average change
        const volatility = Math.abs(topGainer.change) + Math.abs(topLoser.change);
        const volatilityText = volatility > 2 ? 'HIGH' : volatility > 1 ? 'MEDIUM' : 'LOW';
        document.getElementById('volatility').textContent = volatilityText;
    }
    
    // Currency converter
    async updateCurrencyConversion() {
        const from = document.getElementById('fromCurrency').value;
        const to = document.getElementById('toCurrency').value;
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        
        if (from === to) {
            document.getElementById('convertedAmount').textContent = amount.toFixed(2);
            document.getElementById('exchangeRate').textContent = `1 ${from} = 1 ${to}`;
            document.getElementById('inverseRate').textContent = `1 ${to} = 1 ${from}`;
            document.getElementById('rateSpread').textContent = '0.0000';
            return;
        }
        
        try {
            // Try to get rate from existing data first
            let rate = this.getRateFromData(from, to);
            
            // If not found, fetch from API
            if (!rate) {
                const rateData = await this.api.fetchExchangeRate(from, to);
                rate = rateData?.rate ? parseFloat(rateData.rate) : 0;
            }
            
            if (rate > 0) {
                const converted = amount * rate;
                document.getElementById('convertedAmount').textContent = converted.toFixed(2);
                document.getElementById('exchangeRate').textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
                document.getElementById('inverseRate').textContent = `1 ${to} = ${(1/rate).toFixed(4)} ${from}`;
                
                // Calculate spread (bid-ask)
                const spread = rate * 0.0002;
                document.getElementById('rateSpread').textContent = spread.toFixed(4);
            } else {
                document.getElementById('convertedAmount').textContent = '--';
                document.getElementById('exchangeRate').textContent = 'Rate not available';
            }
            
        } catch (error) {
            console.error('Conversion error:', error);
            document.getElementById('convertedAmount').textContent = 'ERROR';
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshData').addEventListener('click', () => {
            this.loadMarketData();
        });
        
        // Converter inputs
        document.getElementById('amount').addEventListener('input', () => {
            this.updateCurrencyConversion();
        });
        
        document.getElementById('fromCurrency').addEventListener('change', () => {
            const from = document.getElementById('fromCurrency').value;
            document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS[from] || '🏳️';
            this.updateCurrencyConversion();
        });
        
        document.getElementById('toCurrency').addEventListener('change', () => {
            const to = document.getElementById('toCurrency').value;
            document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS[to] || '🏳️';
            this.updateCurrencyConversion();
        });
        
        // Swap currencies
        document.getElementById('swapCurrencies').addEventListener('click', () => {
            const from = document.getElementById('fromCurrency').value;
            const to = document.getElementById('toCurrency').value;
            
            document.getElementById('fromCurrency').value = to;
            document.getElementById('toCurrency').value = from;
            
            document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS[to] || '🏳️';
            document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS[from] || '🏳️';
            
            this.updateCurrencyConversion();
        });
        
        // Global search
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.filterMarketTable(e.target.value.toLowerCase());
        });
        
        // View toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentView = e.currentTarget.getAttribute('data-view');
                this.updateMarketTable();
            });
        });
        
        // Sort controls
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort.field = e.target.value;
            this.updateMarketTable();
        });
        
        document.getElementById('sortOrder').addEventListener('change', (e) => {
            this.currentSort.order = e.target.value;
            this.updateMarketTable();
        });
        
        // Add to watchlist button
        document.getElementById('addToWatchlist')?.addEventListener('click', () => {
            this.promptAddToWatchlist();
        });
        
        // Browse pairs button
        document.getElementById('browsePairs')?.addEventListener('click', () => {
            document.querySelector('[data-tab="forex"]').click();
        });
    }
    
    // Setup table action buttons
    setupTableActions() {
        document.querySelectorAll('.btn-icon[data-action="watchlist"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pair = btn.getAttribute('data-pair');
                this.toggleWatchlist(pair);
                
                // Update button state
                const isInWatchlist = this.watchlist.has(pair);
                btn.classList.toggle('active', isInWatchlist);
                btn.innerHTML = `<i class="fas ${isInWatchlist ? 'fa-star' : 'fa-star'}"></i>`;
                btn.title = isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist';
            });
        });
        
        document.querySelectorAll('.btn-icon[data-action="convert"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pair = btn.getAttribute('data-pair');
                const [from, to] = pair.split('/');
                
                // Set converter values
                document.getElementById('fromCurrency').value = from;
                document.getElementById('toCurrency').value = to;
                document.getElementById('amount').value = '1000';
                
                // Update flags
                document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS[from] || '🏳️';
                document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS[to] || '🏳️';
                
                // Switch to converter tab
                document.querySelector('[data-tab="converter"]').click();
                
                // Update conversion
                setTimeout(() => this.updateCurrencyConversion(), 100);
            });
        });
        
        // Chart button (placeholder)
        document.querySelectorAll('.btn-icon[data-action="chart"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pair = btn.getAttribute('data-pair');
                alert(`Chart view for ${pair} would open here.`);
            });
        });
        
        // Row click
        document.querySelectorAll('.market-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-icon')) {
                    const pair = row.getAttribute('data-pair');
                    // Could show detailed view or chart
                }
            });
        });
    }
    
    // Setup navigation
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Show corresponding section
                const tab = item.getAttribute('data-tab');
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById(`${tab}-section`).classList.add('active');
                
                // Update converter if needed
                if (tab === 'converter') {
                    this.updateCurrencyConversion();
                }
                
                // Update watchlist if needed
                if (tab === 'watchlist') {
                    this.updateWatchlistDisplay();
                }
            });
        });
    }
    
    // Populate currency selectors
    populateCurrencySelectors() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        
        // Clear existing options
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        
        // Add currency options
        Object.keys(CONFIG.CURRENCY_NAMES).forEach(code => {
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            
            option1.value = option2.value = code;
            option1.textContent = option2.textContent = `${code} - ${CONFIG.CURRENCY_NAMES[code]}`;
            
            fromSelect.appendChild(option1);
            toSelect.appendChild(option2);
        });
        
        // Set default values
        fromSelect.value = 'USD';
        toSelect.value = 'EUR';
        document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS.USD;
        document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS.EUR;
        
        // Populate popular conversions
        this.populatePopularConversions();
    }
    
    // Populate popular conversions
    populatePopularConversions() {
        const grid = document.getElementById('popularConversions');
        if (!grid) return;
        
        let html = '';
        CONFIG.POPULAR_CONVERSIONS.forEach(conv => {
            html += `
                <button class="conversion-btn" 
                        data-from="${conv.from}" 
                        data-to="${conv.to}"
                        data-amount="${conv.amount}">
                    ${conv.label}
                </button>
            `;
        });
        
        grid.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.conversion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const from = btn.getAttribute('data-from');
                const to = btn.getAttribute('data-to');
                const amount = btn.getAttribute('data-amount');
                
                document.getElementById('fromCurrency').value = from;
                document.getElementById('toCurrency').value = to;
                document.getElementById('amount').value = amount;
                
                document.getElementById('fromFlag').textContent = CONFIG.CURRENCY_FLAGS[from] || '🏳️';
                document.getElementById('toFlag').textContent = CONFIG.CURRENCY_FLAGS[to] || '🏳️';
                
                this.updateCurrencyConversion();
            });
        });
    }
    
    // Watchlist management
    loadWatchlist() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.WATCHLIST);
            if (saved) {
                this.watchlist = new Set(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading watchlist:', error);
        }
    }
    
    saveWatchlist() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.WATCHLIST, 
                JSON.stringify(Array.from(this.watchlist)));
        } catch (error) {
            console.error('Error saving watchlist:', error);
        }
    }
    
    toggleWatchlist(pair) {
        if (this.watchlist.has(pair)) {
            this.watchlist.delete(pair);
        } else {
            this.watchlist.add(pair);
        }
        this.saveWatchlist();
        this.updateWatchlistDisplay();
    }
    
    updateWatchlistDisplay() {
        const emptyDiv = document.getElementById('emptyWatchlist');
        const tableDiv = document.getElementById('watchlistTable');
        
        if (this.watchlist.size === 0) {
            emptyDiv.style.display = 'flex';
            tableDiv.style.display = 'none';
            return;
        }
        
        emptyDiv.style.display = 'none';
        tableDiv.style.display = 'block';
        
        // Update watchlist table (simplified for now)
        tableDiv.innerHTML = `
            <div class="watchlist-info">
                <i class="fas fa-star"></i>
                <h3>${this.watchlist.size} pairs in watchlist</h3>
                <p>Click on any pair in the Forex tab to add more</p>
            </div>
        `;
    }
    
    promptAddToWatchlist() {
        // Simple prompt for demo
        const pair = prompt('Enter currency pair (e.g., EUR/USD):');
        if (pair && /^[A-Z]{3}\/[A-Z]{3}$/.test(pair)) {
            this.toggleWatchlist(pair.toUpperCase());
            alert(`${pair} added to watchlist`);
        } else if (pair) {
            alert('Invalid format. Use format like EUR/USD');
        }
    }
    
    // Filter and sort helpers
    filterPairsByView(pairs) {
        switch (this.currentView) {
            case 'majors':
                return pairs.filter(pair => 
                    ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'USD/CAD', 'AUD/USD', 'NZD/USD'].includes(pair));
            case 'minors':
                return pairs.filter(pair => 
                    pair.includes('USD') && !['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'USD/CAD', 'AUD/USD', 'NZD/USD'].includes(pair));
            case 'exotics':
                return pairs.filter(pair => 
                    !pair.includes('USD') || ['USD/TRY', 'USD/ZAR', 'USD/MXN'].includes(pair));
            default:
                return pairs;
        }
    }
    
    sortPairs(pairs) {
        return pairs.sort((a, b) => {
            const dataA = this.forexData[a];
            const dataB = this.forexData[b];
            
            if (!dataA || !dataB) return 0;
            
            let valueA, valueB;
            
            switch (this.currentSort.field) {
                case 'price':
                    valueA = parseFloat(dataA.rate) || 0;
                    valueB = parseFloat(dataB.rate) || 0;
                    break;
                case 'change':
                    const prevA = this.getPreviousRate(a);
                    const prevB = this.getPreviousRate(b);
                    valueA = prevA ? ((parseFloat(dataA.rate) - prevA) / prevA) : 0;
                    valueB = prevB ? ((parseFloat(dataB.rate) - prevB) / prevB) : 0;
                    break;
                case 'symbol':
                default:
                    valueA = a;
                    valueB = b;
            }
            
            if (this.currentSort.order === 'desc') {
                return valueB - valueA;
            } else {
                return valueA > valueB ? 1 : -1;
            }
        });
    }
    
    filterMarketTable(searchTerm) {
        const rows = document.querySelectorAll('.market-row');
        
        if (!searchTerm) {
            rows.forEach(row => row.style.display = '');
            return;
        }
        
        rows.forEach(row => {
            const pair = row.getAttribute('data-pair');
            const display = pair.toLowerCase().includes(searchTerm) ? '' : 'none';
            row.style.display = display;
        });
    }
    
    // Rate helpers
    getPreviousRate(pair) {
        const cached = localStorage.getItem(`prev_${pair}`);
        return cached ? parseFloat(cached) : null;
    }
    
    saveCurrentRates() {
        Object.keys(this.forexData).forEach(pair => {
            const data = this.forexData[pair];
            if (data && data.rate) {
                localStorage.setItem(`prev_${pair}`, data.rate);
            }
        });
    }
    
    getRateFromData(from, to) {
        if (from === to) return 1;
        
        // Direct pair
        const directPair = `${from}/${to}`;
        if (this.forexData[directPair] && this.forexData[directPair].rate) {
            return parseFloat(this.forexData[directPair].rate);
        }
        
        // Inverse pair
        const inversePair = `${to}/${from}`;
        if (this.forexData[inversePair] && this.forexData[inversePair].rate) {
            return 1 / parseFloat(this.forexData[inversePair].rate);
        }
        
        return null;
    }
    
    // Format helpers
    formatPrice(price, currency) {
        if (currency === 'JPY') {
            return price.toFixed(2);
        } else {
            return price.toFixed(4);
        }
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
    
    // Update time and counters
    updateDateTime() {
        const now = new Date();
        document.getElementById('serverTime').textContent = 
            now.toLocaleTimeString('en-US', { hour12: false });
        
        // Update every second
        setTimeout(() => this.updateDateTime(), 1000);
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        document.getElementById('lastUpdateTime').textContent = 
            now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        
        // Update storage
        localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_UPDATE, now.getTime());
    }
    
    updateAPICounter() {
        const requests = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.API_REQUESTS) || '{}');
        const today = new Date().toDateString();
        
        if (requests.date !== today) {
            requests.date = today;
            requests.count = 0;
            localStorage.setItem(CONFIG.STORAGE_KEYS.API_REQUESTS, JSON.stringify(requests));
        }
        
        document.getElementById('apiCount').textContent = requests.count || 0;
    }
    
    // Auto update system
    setupAutoUpdate() {
        // Clear existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Set new interval (1 hour)
        this.updateInterval = setInterval(() => {
            console.log('Auto-updating market data...');
            this.loadMarketData();
        }, CONFIG.UPDATE_INTERVAL);
    }
    
    startCountdownTimer() {
        let seconds = 60 * 60; // 1 hour in seconds
        
        const updateCountdown = () => {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            document.getElementById('nextUpdate').textContent = 
                `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            seconds--;
            
            if (seconds < 0) {
                seconds = 60 * 60; // Reset to 1 hour
            }
        };
        
        // Update immediately
        updateCountdown();
        
        // Update every second
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }
    
    // Error handling
    showError(message) {
        console.error(message);
        // Could show a toast notification here
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.forexApp = new ForexTradingApp();
});
