const baseUrl = "/api/v1/withdrawal/";

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    createWithdrawalModalStructure(); // Initialize modal HTML structure
    loadWithdrawalHistory();
});

// Create modal HTML structure for withdrawals
function createWithdrawalModalStructure() {
    if (document.getElementById('withdrawalModal')) return;
    
    const modalHTML = `
    <div id="withdrawalModal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Withdrawal Details</h3>
            <div id="modalWithdrawalContent"></div>
            <div id="modalWithdrawalActions" class="modal-actions"></div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners for modal
    document.querySelector('#withdrawalModal .close-modal').addEventListener('click', closeWithdrawalModal);
    document.getElementById('withdrawalModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('withdrawalModal')) {
            closeWithdrawalModal();
        }
    });
}

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

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trxnId}</td>
            <td>${formattedDate}</td>
            <td>${method}</td>
            <td>${amount}</td>
            <td>${euAmount}</td>
            <td>${wallet}</td>
            <td class="status-${record.status}">${status}</td>
            <td><button class="btn btn-sm btn-primary view-btn">View</button></td>
        `;
        
        // Add click handler to show modal
        row.querySelector('.view-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showWithdrawalDetails(record);
        });
        
        // Also make entire row clickable
        row.addEventListener('click', () => showWithdrawalDetails(record));
        
        tableBody.appendChild(row);
    });
}

function showWithdrawalDetails(withdrawal) {
    const modal = document.getElementById('withdrawalModal');
    const modalContent = document.getElementById('modalWithdrawalContent');
    const modalActions = document.getElementById('modalWithdrawalActions');
    
    if (!modal || !modalContent) return;
    
    const formattedDate = new Date(withdrawal.date || withdrawal.createdAt).toLocaleString();
    const amount = withdrawal.amount ? parseFloat(withdrawal.amount).toFixed(2) : '-';
    const euAmount = withdrawal.euEquAmount ? `$${parseFloat(withdrawal.euEquAmount).toFixed(2)}` : '-';
    const status = withdrawal.status === 'approved' ? 'Approved' : 'Pending';
    
    modalContent.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">${withdrawal.trxnId || '-'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Method:</span>
            <span class="detail-value">${withdrawal.method || '-'}</span>
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
            <span class="detail-label">Wallet Address:</span>
            <span class="detail-value">${withdrawal.walletAdd || '-'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-${withdrawal.status}">${status}</span>
        </div>
        ${withdrawal.note ? `
        <div class="detail-row">
            <span class="detail-label">Note:</span>
            <span class="detail-value">${withdrawal.note}</span>
        </div>` : ''}
        ${withdrawal.processedAt ? `
        <div class="detail-row">
            <span class="detail-label">${withdrawal.status === 'approved' ? 'Approved At' : 'Processed At'}:</span>
            <span class="detail-value">${new Date(withdrawal.processedAt).toLocaleString()}</span>
        </div>` : ''}
    `;
    
    // Set up action buttons
    modalActions.innerHTML = '';
    if (withdrawal.trxnId) {
        const receiptBtn = document.createElement('button');
        receiptBtn.className = 'btn btn-primary';
        receiptBtn.textContent = 'View Receipt';
        receiptBtn.addEventListener('click', () => {
            window.location.href = `${baseUrl}withdrawal-receipt/${withdrawal.trxnId}`;
        });
        modalActions.appendChild(receiptBtn);
    }
    
    modal.style.display = 'block';
}

function closeWithdrawalModal() {
    const modal = document.getElementById('withdrawalModal');
    if (modal) modal.style.display = 'none';
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

// Utility functions
function isLoggedIn() {
    return localStorage.getItem("accessToken");
}

function redirectToLogin() {
    window.location.href = "/login";
}