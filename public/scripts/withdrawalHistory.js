const baseUrl = "/api/v1/withdrawal/";

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    loadWithdrawalHistory();
});

async function loadWithdrawalHistory() {
    const tableBody = document.querySelector("#witHistory tbody");
    if (!tableBody) return;

    showLoading(tableBody);

    try {
        const response = await authFetch(`${baseUrl}withdrawal-history`);
        
        if (!response) return; // authFetch handled redirect if needed
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load withdrawal history');
        }

        const { withdrawals } = await response.json();
        updateWithdrawalTable(withdrawals);

    } catch (error) {
        console.error('Withdrawal history error:', error);
        showError(tableBody, error.message || 'Failed to load withdrawal history');
    }
}

function updateWithdrawalTable(data) {
    const tableBody = document.querySelector("#witHistory tbody");
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">No withdrawal records found.</td>
            </tr>
        `;
        return;
    }

    data.forEach(record => {
        const formattedDate = new Date(record.date || record.createdAt).toLocaleDateString();
        const amount = record.amount ? parseFloat(record.amount).toFixed(2) : '-';
        const euAmount = record.euEquAmount ? `$${parseFloat(record.euEquAmount).toFixed(2)}` : '-';
        const status = record.status === 'approved' ? 'Approved' : 'Pending';
        const wallet = record.walletAdd || '-';
        const trxnId = record.trxnId || '-';
        const method = record.method || '-';

        const viewButton = record.trxnId ? `
            <button class="btn btn-sm btn-primary" onclick="viewReceipt('${record.trxnId}')">
                View
            </button>
        ` : '';

        tableBody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${trxnId}</td>
                <td>${formattedDate}</td>
                <td>${method}</td>
                <td>${amount}</td>
                <td>${euAmount}</td>
                <td>${wallet}</td>
                <td class="status-${record.status}">${status}</td>
                <td>${viewButton}</td>
            </tr>
        `);
    });
}

function viewReceipt(transactionId) {
    window.location.href = `${baseUrl}withdrawal-receipt/${transactionId}`;
}

// Reusable UI functions (can be shared across components)
function showLoading(container) {
    container.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                <div class="spinner"></div>
                Loading withdrawal history...
            </td>
        </tr>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <tr>
            <td colspan="8" class="error">
                ${message}
                <button onclick="loadWithdrawalHistory()">Retry</button>
            </td>
        </tr>
    `;
}