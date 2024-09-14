import { backend } from './declarations/backend';

let holdings = [];

async function refreshHoldings() {
    try {
        holdings = await backend.getAllHoldings();
        renderHoldings();
        updateSummary();
    } catch (error) {
        console.error("Error refreshing holdings:", error);
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
        await backend.addHolding(symbol, quantity, acquisitionPrice);
        e.target.reset();
        refreshHoldings();
    } catch (error) {
        console.error("Error adding holding:", error);
        alert("Failed to add holding. Please check the stock symbol and try again.");
    }
});

window.updateHolding = async (id) => {
    const holding = holdings.find(h => h.id === id);
    if (!holding) return;

    const newQuantity = parseInt(prompt('Enter new quantity', holding.quantity));

    if (!isNaN(newQuantity)) {
        try {
            await backend.updateHolding(id, newQuantity);
            refreshHoldings();
        } catch (error) {
            console.error("Error updating holding:", error);
            alert("Failed to update holding. Please try again.");
        }
    }
};

window.deleteHolding = async (id) => {
    if (confirm('Are you sure you want to delete this holding?')) {
        try {
            await backend.deleteHolding(id);
            refreshHoldings();
        } catch (error) {
            console.error("Error deleting holding:", error);
            alert("Failed to delete holding. Please try again.");
        }
    }
};

// Initial load
refreshHoldings();