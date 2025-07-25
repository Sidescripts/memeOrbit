const baseUrl = "/api/v1/deposit/";

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    createModalStructure(); // Initialize modal HTML structure
    loadApprovedDeposits();
});

// Create modal HTML structure
function createModalStructure() {
    if (document.getElementById('depositModal')) return;
    
    const modalHTML = `
    <div id="depositModal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Deposit Details</h3>
            <div id="modalDepositContent"></div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners for modal
    document.querySelector('.close-modal').addEventListener('click', closeDepositModal);
    document.getElementById('depositModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('depositModal')) {
            closeDepositModal();
        }
    });
}

async function loadApprovedDeposits() {
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

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${trxnId}</td>
            <td>${method}</td>
            <td>${amount}</td>
            <td>${euAmount}</td>
            <td class="status-approved">Approved</td>
        `;
        
        // Add click handler to show modal
        row.addEventListener('click', () => showDepositDetails(record));
        tableBody.appendChild(row);
    });
}

function showDepositDetails(deposit) {
    const modal = document.getElementById('depositModal');
    const modalContent = document.getElementById('modalDepositContent');
    
    if (!modal || !modalContent) return;
    
    const formattedDate = new Date(deposit.createdAt).toLocaleString();
    const amount = deposit.amount ? parseFloat(deposit.amount).toFixed(2) : '-';
    const euAmount = deposit.euEquAmount ? `$${parseFloat(deposit.euEquAmount).toFixed(2)}` : '-';
    
    modalContent.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">${deposit.trxnId || '-'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Method:</span>
            <span class="detail-value">${deposit.method || '-'}</span>
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
            <span class="detail-value status-approved">Approved</span>
        </div>
        ${deposit.note ? `
        <div class="detail-row">
            <span class="detail-label">Note:</span>
            <span class="detail-value">${deposit.note}</span>
        </div>` : ''}
        ${deposit.approvedAt ? `
        <div class="detail-row">
            <span class="detail-label">Approved At:</span>
            <span class="detail-value">${new Date(deposit.approvedAt).toLocaleString()}</span>
        </div>` : ''}
    `;
    
    modal.style.display = 'block';
}

function closeDepositModal() {
    const modal = document.getElementById('depositModal');
    if (modal) modal.style.display = 'none';
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

// Utility functions
function isLoggedIn() {
    return localStorage.getItem("accessToken");
}

function redirectToLogin() {
    window.location.href = "/login";
}