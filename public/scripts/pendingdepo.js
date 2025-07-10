const baseUrl = "/api/v1/deposit/";

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    loadPendingDeposits();
});

async function loadPendingDeposits() {
    const tableBody = document.querySelector("#depositHistory tbody");
    if (!tableBody) return;

    showLoading(tableBody);

    try {
        const response = await authFetch(`${baseUrl}history`);
        
        if (!response) return; // authFetch handled redirect if needed
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load deposit history');
        }

        const { deposit } = await response.json();
        updatePendingDepositsTable(deposit);

    } catch (error) {
        console.error('Pending deposits error:', error);
        showError(tableBody, error.message || 'Failed to load pending deposits');
    }
}

function updatePendingDepositsTable(deposits) {
    const tableBody = document.querySelector("#depositHistory tbody");
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!deposits || deposits.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">No deposit records found.</td>
            </tr>
        `;
        return;
    }

    const pendingDeposits = deposits.filter(record => record.status === 'pending');

    if (pendingDeposits.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">No pending deposits found.</td>
            </tr>
        `;
        return;
    }

    pendingDeposits.forEach(record => {
        const formattedDate = new Date(record.createdAt).toLocaleDateString();
        const amount = record.amount ? parseFloat(record.amount).toFixed(2) : '-';
        const euAmount = record.euEquAmount ? `$${parseFloat(record.euEquAmount).toFixed(2)}` : '-';
        const trxnId = record.trxnId || '-';
        const method = record.method || '-';

        tableBody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${formattedDate}</td>
                <td>${trxnId}</td>
                <td>${method}</td>
                <td>${amount}</td>
                <td>${euAmount}</td>
                <td class="status-pending">Pending</td>
            </tr>
        `);
    });
}

// Reusable UI functions (shared with other components)
function showLoading(container) {
    container.innerHTML = `
        <tr>
            <td colspan="6" class="loading">
                <div class="spinner"></div>
                Loading pending deposits...
            </td>
        </tr>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <tr>
            <td colspan="6" class="error">
                ${message}
                <button onclick="loadPendingDeposits()">Retry</button>
            </td>
        </tr>
    `;
}