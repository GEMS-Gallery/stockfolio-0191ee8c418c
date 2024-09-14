import { backend } from './declarations/backend';

let holdings = [];

async function fetchStockData(symbol) {
    const apiKey = 'demo'; // Replace with your Alpha Vantage API key for production use
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data['Global Quote']) {
            const quote = data['Global Quote'];
            return {
                symbol: quote['01. symbol'],
                price: parseFloat(quote['05. price']),
                name: symbol // Alpha Vantage doesn't provide company name in this API, so we're using the symbol as a placeholder
            };
        } else {
            throw new Error('Stock data not found');
        }
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
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
        await backend.addHolding(symbol, stockData.name, quantity, acquisitionPrice, stockData.price);
        e.target.reset();
        refreshHoldings();
    } catch (error) {
        console.error("Error adding holding:", error);
        alert("Failed to add holding. Please check the stock symbol and try again.");
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
            alert("Failed to update holding. Please try again.");
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
            alert("Failed to delete holding. Please try again.");
        } finally {
            showLoading(false);
        }
    }
};

function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = show ? 'block' : 'none';
}

// Initial load
refreshHoldings();