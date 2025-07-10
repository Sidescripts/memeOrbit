const baseUrl = "/api/v1/investment/";

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    loadInvestmentHistory();
});

async function loadInvestmentHistory() {
    const tableBody = document.getElementById("investment-table-body");
    if (!tableBody) return;

    // Show loading state
    showLoading(tableBody);

    try {
        const accessToken = getAccessToken();
        const response = await fetch(baseUrl + "history", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        updateInvestmentTable(data);

    } catch (error) {
        console.error('Investment history error:', error);
        showError(tableBody, error.message || 'Failed to load investment history');
    }
}

function updateInvestmentTable(data) {
    const tableBody = document.getElementById("investment-table-body");
    if (!tableBody) return;

    // Clear previous content
    tableBody.innerHTML = '';

    if (!data || !data.investment || data.investment.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No investment history found.</td>
            </tr>
        `;
        return;
    }

    // Render each investment record
    tableBody.innerHTML = data.investment.map(item => {
        const investmentDate = new Date(item.createdAt).toLocaleDateString();
        const plan = item.plan || item.plans || 'N/A';
        const amount = item.amount ? `$${item.amount}` : '-';
        const roi = item.returnOnInvestment ? `$${item.returnOnInvestment}` : '-';

        return `
            <tr>
                <td data-label="Investment ID">${item.investmentId}</td>
                <td data-label="Duration">${item.duration} hours</td>
                <td data-label="Plan">${plan}</td>
                <td data-label="Amount">${amount}</td>
                <td data-label="Investment Date">${investmentDate}</td>
                <td data-label="ROI">${roi}</td>
                <td data-label="Status" class="status-${item.status.toLowerCase()}">${item.status}</td>
            </tr>
        `;
    }).join('');
}

function showLoading(container) {
    container.innerHTML = `
        <tr>
            <td colspan="7" class="loading">
                <div class="spinner"></div>
                Loading investment history...
            </td>
        </tr>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <tr>
            <td colspan="7" class="error">
                ${message}
                <button onclick="loadInvestmentHistory()">Retry</button>
            </td>
        </tr>
    `;
}