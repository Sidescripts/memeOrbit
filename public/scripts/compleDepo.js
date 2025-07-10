const baseUrl = "/api/v1/deposit/";

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    loadApprovedDeposits();
});

async function loadApprovedDeposits() {
    const tableBody = document.querySelector("#depositHistory tbody");
    if (!tableBody) return;

    showLoading(tableBody);

    try {
        const response = await authFetch(`${baseUrl}history`);
        
        if (!response) return; // authFetch handled redirect if needed
        
        if (!response.ok) {
            const errorData = await response.json();
            consoole.log(errorData.message)
            throw new Error(errorData.message || 'Failed to load deposit history');
        }

        const { deposit } = await response.json();
        console.log(deposit)
        updateApprovedDepositsTable(deposit);

    } catch (error) {
        console.error('Approved deposits error:', error);
        showError(tableBody, error.message || 'Failed to load approved deposits');
    }
}

function updateApprovedDepositsTable(deposits) {
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

    const approvedDeposits = deposits.filter(record => record.status === 'approved');

    if (approvedDeposits.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">No approved deposits found.</td>
            </tr>
        `;
        return;
    }

    approvedDeposits.forEach(record => {
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
                <td class="status-approved">Approved</td>
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
                Loading approved deposits...
            </td>
        </tr>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <tr>
            <td colspan="6" class="error">
                ${message}
                <button onclick="loadApprovedDeposits()">Retry</button>
            </td>
        </tr>
    `;
} 