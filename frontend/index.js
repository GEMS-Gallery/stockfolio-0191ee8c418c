import { backend } from 'declarations/backend';

let holdings = [];

async function refreshHoldings() {
    holdings = await backend.getAllHoldings();
    renderHoldings();
    updateSummary();
}

function renderHoldings() {
    const tbody = document.querySelector('#holdingsTable tbody');
    tbody.innerHTML = '';
    
    holdings.forEach(holding => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${holding.name}</td>
            <td>${holding.quantity}</td>
            <td>$${holding.marketValue.toFixed(2)}</td>
            <td>${holding.performance.toFixed(2)}%</td>
            <td>
                <button onclick="editHolding(${holding.id})">Edit</button>
                <button onclick="deleteHolding(${holding.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function updateSummary() {
    const totalValue = await backend.getTotalPortfolioValue();
    const averagePerformance = await backend.getAveragePerformance();
    
    document.getElementById('totalValue').textContent = totalValue.toFixed(2);
    document.getElementById('averagePerformance').textContent = averagePerformance.toFixed(2);
}

document.getElementById('addHoldingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const marketValue = parseFloat(document.getElementById('marketValue').value);
    const performance = parseFloat(document.getElementById('performance').value);

    await backend.addHolding(name, quantity, marketValue, performance);
    e.target.reset();
    refreshHoldings();
});

window.editHolding = async (id) => {
    const holding = holdings.find(h => h.id === id);
    if (!holding) return;

    const name = prompt('Enter new name', holding.name);
    const quantity = parseInt(prompt('Enter new quantity', holding.quantity));
    const marketValue = parseFloat(prompt('Enter new market value', holding.marketValue));
    const performance = parseFloat(prompt('Enter new performance', holding.performance));

    if (name && !isNaN(quantity) && !isNaN(marketValue) && !isNaN(performance)) {
        await backend.updateHolding(id, name, quantity, marketValue, performance);
        refreshHoldings();
    }
};

window.deleteHolding = async (id) => {
    if (confirm('Are you sure you want to delete this holding?')) {
        await backend.deleteHolding(id);
        refreshHoldings();
    }
};

// Initial load
refreshHoldings();