import { backend } from './declarations/backend';

let holdings = [];

const API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with your actual API key
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const stockDataCache = new Map();

const commonStockSymbols = {
    'APPLE': 'AAPL',
    'GOOGLE': 'GOOGL',
    'AMAZON': 'AMZN',
    'MICROSOFT': 'MSFT',
    'FACEBOOK': 'FB',
    // Add more common stock names and their symbols
};

function correctStockSymbol(symbol) {
    return commonStockSymbols[symbol.toUpperCase()] || symbol.toUpperCase();
}

async function fetchStockData(symbol) {
    const correctedSymbol = correctStockSymbol(symbol);
    const cachedData = stockDataCache.get(correctedSymbol);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.data;
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${correctedSymbol}&apikey=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data['Global Quote'] && data['Global Quote']['05. price']) {
            const stockData = {
                symbol: data['Global Quote']['01. symbol'],
                price: parseFloat(data['Global Quote']['05. price']),
                name: correctedSymbol // Alpha Vantage doesn't provide company name in this API
            };
            stockDataCache.set(correctedSymbol, { data: stockData, timestamp: Date.now() });
            return stockData;
        } else if (data['Note']) {
            throw new Error(`API limit reached: ${data['Note']}`);
        } else {
            console.error('Unexpected API response:', data);
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw new Error(`Failed to fetch data for ${correctedSymbol}: ${error.message}`);
    }
}

async function refreshHoldings() {
    try {
        showLoading(true);
        holdings = await backend.getAllHoldings();
        await updateHoldingsWithLatestPrices();
        renderHoldings();
        updateSummary();
    } catch (error) {
        console.error("Error refreshing holdings:", error);
        showError("Failed to refresh holdings. Please try again later.");
    } finally {
        showLoading(false);
    }
}

async function updateHoldingsWithLatestPrices() {
    for (let holding of holdings) {
        try {
            const stockData = await fetchStockData(holding.symbol);
            await backend.updateHolding(holding.id, holding.quantity, stockData.price);
        } catch (error) {
            console.error(`Error updating holding ${holding.symbol}:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between API calls
    }
}

function renderHoldings() {
    const tbody = document.querySelector('#holdingsTable tbody');
    tbody.innerHTML = '';
    
    holdings.forEach(holding => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${holding.symbol}</td>
            <td>${holding.name}</td>
            <td>${holding.quantity}</td>
            <td>$${holding.acquisitionPrice.toFixed(2)}</td>
            <td>$${holding.currentPrice.toFixed(2)}</td>
            <td>${holding.performance.toFixed(2)}%</td>
            <td>
                <button onclick="updateHolding(${holding.id})">Update</button>
                <button onclick="deleteHolding(${holding.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function updateSummary() {
    try {
        const totalValue = await backend.getTotalPortfolioValue();
        const averagePerformance = await backend.getAveragePerformance();
        
        document.getElementById('totalValue').textContent = totalValue.toFixed(2);
        document.getElementById('averagePerformance').textContent = averagePerformance.toFixed(2);
    } catch (error) {
        console.error("Error updating summary:", error);
        showError("Failed to update summary. Please try again later.");
    }
}

document.getElementById('addHoldingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const symbol = document.getElementById('symbol').value.toUpperCase();
    const quantity = parseInt(document.getElementById('quantity').value);
    const acquisitionPrice = parseFloat(document.getElementById('acquisitionPrice').value);

    try {
        showLoading(true);
        const stockData = await fetchStockData(symbol);
        await backend.addHolding(stockData.symbol, stockData.name, quantity, acquisitionPrice, stockData.price);
        e.target.reset();
        refreshHoldings();
    } catch (error) {
        console.error("Error adding holding:", error);
        showError(`Failed to add holding: ${error.message}`);
    } finally {
        showLoading(false);
    }
});

window.updateHolding = async (id) => {
    const holding = holdings.find(h => h.id === id);
    if (!holding) return;

    const newQuantity = parseInt(prompt('Enter new quantity', holding.quantity));

    if (!isNaN(newQuantity)) {
        try {
            showLoading(true);
            const stockData = await fetchStockData(holding.symbol);
            await backend.updateHolding(id, newQuantity, stockData.price);
            refreshHoldings();
        } catch (error) {
            console.error("Error updating holding:", error);
            showError(`Failed to update holding: ${error.message}`);
        } finally {
            showLoading(false);
        }
    }
};

window.deleteHolding = async (id) => {
    if (confirm('Are you sure you want to delete this holding?')) {
        try {
            showLoading(true);
            await backend.deleteHolding(id);
            refreshHoldings();
        } catch (error) {
            console.error("Error deleting holding:", error);
            showError("Failed to delete holding. Please try again.");
        } finally {
            showLoading(false);
        }
    }
};

function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorElement = document.getElementById('addHoldingError');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Initial load
refreshHoldings();