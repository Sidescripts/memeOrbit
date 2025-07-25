const baseUrl = "/api/v1/deposit/";

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    loadDepositHistory();
    createModalStructure(); // Initialize modal HTML structure
});

// Create modal HTML structure
function createModalStructure() {
    if (document.getElementById('transactionModal')) return;
    
    const modalHTML = `
    <div id="transactionModal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Transaction Details</h3>
            <div id="modalContent"></div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners for modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('transactionModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('transactionModal')) {
            closeModal();
        }
    });
}

async function loadDepositHistory() {
    const tableBody = document.querySelector("#depositHistory tbody");
    if (!tableBody) return;

    // Show loading state
    showLoading(tableBody);
    
    try {
        const response = await authFetch(`${baseUrl}history`);
        
        if (!response) {
            // authFetch already handled redirect if needed
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load deposit history');
        }

        const { deposit } = await response.json();
        updateDepositHistory(deposit);

    } catch (error) {
        console.error('Deposit history error:', error);
        showError(tableBody, error.message || 'Failed to load deposit history');
    }
}

function updateDepositHistory(deposits) {
    const tableBody = document.querySelector("#depositHistory tbody");
    if (!tableBody) return;

    // Clear previous content
    tableBody.innerHTML = '';

    if (!deposits || deposits.length === 0) {
        tableBody.innerHTML = `
        <tr>
            <td colspan="6">No deposit records found.</td>
        </tr>
        `;
        return;
    }

    // Render each deposit record
    deposits.forEach(record => {
        const formattedDate = new Date(record.createdAt).toLocaleDateString();
        const amount = record.amount ? parseFloat(record.amount).toFixed(2) : '-';
        const euAmount = record.euEquAmount ? `$${parseFloat(record.euEquAmount).toFixed(2)}` : '-';
        const status = record.status === 'approved' ? 'Approved' : 'Pending';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${record.trxnId || '-'}</td>
            <td>${record.method || '-'}</td>
            <td>${amount}</td>
            <td>${euAmount}</td>
            <td class="status-${record.status}">${status}</td>
        `;
        
        // Add click handler to show modal
        row.addEventListener('click', () => showTransactionDetails(record));
        tableBody.appendChild(row);
    });
}

function showTransactionDetails(transaction) {
    const modal = document.getElementById('transactionModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) return;
    
    const formattedDate = new Date(transaction.createdAt).toLocaleString();
    const amount = transaction.amount ? parseFloat(transaction.amount).toFixed(2) : '-';
    const euAmount = transaction.euEquAmount ? `$${parseFloat(transaction.euEquAmount).toFixed(2)}` : '-';
    const status = transaction.status === 'approved' ? 'Approved' : 'Pending';
    
    modalContent.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">${transaction.trxnId || '-'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Method:</span>
            <span class="detail-value">${transaction.method || '-'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="detail-value">${amount}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Equivalent USD:</span>
            <span class="detail-value">${euAmount}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-${transaction.status}">${status}</span>
        </div>
        ${transaction.note ? `
        <div class="detail-row">
            <span class="detail-label">Note:</span>
            <span class="detail-value">${transaction.note}</span>
        </div>` : ''}
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('transactionModal');
    if (modal) modal.style.display = 'none';
}

function showLoading(tableBody) {
    tableBody.innerHTML = `
    <tr>
        <td colspan="6" class="loading">
        <div class="spinner"></div>
        Loading deposit history...
        </td>
    </tr>
    `;
}

function showError(tableBody, message) {
    tableBody.innerHTML = `
    <tr>
        <td colspan="6" class="error">
        ${message}
        <button onclick="loadDepositHistory()">Retry</button>
        </td>
    </tr>
    `;
}

// Utility functions
function isLoggedIn() {
    return localStorage.getItem("accessToken");
}

function redirectToLogin() {
    window.location.href = "/login";
}