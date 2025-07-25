const baseUrl = "/api/v1/investment/";

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    // Inject the CSS styles
    injectStyles();
    
    initializePage();
});

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
    /* Main Table Styles */
    .investment-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 0.9em;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    
    .investment-table thead tr {
        background-color: #3f51b5;
        color: #ffffff;
        text-align: left;
    }
    
    .investment-table th,
    .investment-table td {
        padding: 12px 15px;
    }
    
    .investment-table tbody tr {
        border-bottom: 1px solid #dddddd;
        transition: all 0.2s ease;
    }
    
    .investment-table tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
    }
    
    .investment-table tbody tr:last-of-type {
        border-bottom: 2px solid #3f51b5;
    }
    
    .investment-table tbody tr:hover {
        background-color: #e3f2fd;
        cursor: pointer;
    }
    
    /* Status Badges */
    .status-completed {
        color: #2e7d32;
        background-color: #e8f5e9;
        padding: 5px 10px;
        border-radius: 20px;
        font-weight: 500;
    }
    
    .status-active {
        color: #1565c0;
        background-color: #e3f2fd;
        padding: 5px 10px;
        border-radius: 20px;
        font-weight: 500;
    }
    
    .status-pending {
        color: #f57f17;
        background-color: #fff8e1;
        padding: 5px 10px;
        border-radius: 20px;
        font-weight: 500;
    }
    
    .status-failed {
        color: #c62828;
        background-color: #ffebee;
        padding: 5px 10px;
        border-radius: 20px;
        font-weight: 500;
    }
    
    /* Button Styles */
    .btn {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 4px;
        border: none;
        font-size: 0.9em;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn-primary {
        background-color: #3f51b5;
        color: white;
    }
    
    .btn-primary:hover {
        background-color: #303f9f;
    }
    
    .btn-secondary {
        background-color: #607d8b;
        color: white;
    }
    
    .btn-secondary:hover {
        background-color: #455a64;
    }
    
    .btn-outline {
        background-color: transparent;
        border: 1px solid #3f51b5;
        color: #3f51b5;
    }
    
    .btn-outline:hover {
        background-color: #e3f2fd;
    }
    
    .btn-sm {
        padding: 5px 10px;
        font-size: 0.8em;
    }
    
    /* Modal Styles */
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        overflow: auto;
    }
    
    .modal-content {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        width: 80%;
        max-width: 700px;
        position: relative;
    }
    
    .close-modal {
        position: absolute;
        top: 15px;
        right: 25px;
        font-size: 28px;
        font-weight: bold;
        color: #aaa;
        cursor: pointer;
    }
    
    .close-modal:hover {
        color: #333;
    }
    
    /* Detail View Styles */
    .detail-row {
        display: flex;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eee;
    }
    
    .detail-label {
        font-weight: 600;
        color: #555;
        min-width: 150px;
    }
    
    .detail-value {
        color: #333;
    }
    
    /* Modal Actions */
    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 25px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }
    
    /* Loading and Error States */
    .loading {
        text-align: center;
        padding: 30px;
        color: #555;
    }
    
    .error {
        text-align: center;
        padding: 30px;
        color: #c62828;
    }
    
    .error-icon {
        display: inline-block;
        width: 24px;
        height: 24px;
        background-color: #c62828;
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 24px;
        margin-right: 10px;
    }
    
    .retry-btn {
        background-color: #3f51b5;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        margin-left: 15px;
        cursor: pointer;
    }
    
    .retry-btn:hover {
        background-color: #303f9f;
    }
    
    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top: 4px solid #3f51b5;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Utility Classes */
    .hidden {
        display: none !important;
    }
    
    .text-center {
        text-align: center;
    }
    
    /* Responsive Table */
    @media screen and (max-width: 768px) {
        .investment-table {
            border: 0;
        }
        
        .investment-table thead {
            display: none;
        }
        
        .investment-table tr {
            margin-bottom: 15px;
            display: block;
            border-bottom: 2px solid #ddd;
        }
        
        .investment-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-align: right;
            padding-left: 50%;
            position: relative;
            border-bottom: 1px dotted #ccc;
        }
        
        .investment-table td::before {
            content: attr(data-label);
            position: absolute;
            left: 15px;
            width: calc(50% - 15px);
            padding-right: 10px;
            font-weight: bold;
            text-align: left;
        }
        
        .modal-content {
            width: 95%;
            margin: 10% auto;
        }
    }
    `;
    document.head.appendChild(style);
}

// Rest of your JavaScript code remains the same from the previous implementation
// [Previous JavaScript implementation goes here...]

// const baseUrl = "/api/v1/investment/";

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    initializePage();
});

function initializePage() {
    createInvestmentModalStructure();
    loadInvestmentHistory();
    setupEventListeners();
}

// Create modal HTML structure for investments
function createInvestmentModalStructure() {
    if (document.getElementById('investmentModal')) return;
    
    const modalHTML = `
    <div id="investmentModal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Investment Details</h3>
            <div id="modalInvestmentContent"></div>
            <div id="modalInvestmentActions" class="modal-actions">
                <button id="printReceiptBtn" class="btn btn-primary hidden">Print Receipt</button>
                <button id="downloadReceiptBtn" class="btn btn-secondary hidden">Download Receipt</button>
                <button id="closeModalBtn" class="btn btn-outline">Close</button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function setupEventListeners() {
    // Modal close handlers
    document.querySelector('#investmentModal .close-modal').addEventListener('click', closeInvestmentModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeInvestmentModal);
    document.getElementById('investmentModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('investmentModal')) {
            closeInvestmentModal();
        }
    });
    
    // Print receipt button
    document.getElementById('printReceiptBtn')?.addEventListener('click', printReceipt);
    
    // Download receipt button
    document.getElementById('downloadReceiptBtn')?.addEventListener('click', downloadReceipt);
}

async function loadInvestmentHistory() {
    const tableBody = document.getElementById("investment-table-body");
    if (!tableBody) return;

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

    tableBody.innerHTML = '';

    if (!data?.investment?.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No investment history found.</td>
            </tr>
        `;
        return;
    }

    data.investment.forEach(item => {
        const row = createInvestmentRow(item);
        tableBody.appendChild(row);
    });
}

function createInvestmentRow(item) {
    const investmentDate = new Date(item.createdAt).toLocaleDateString();
    const plan = item.plan || item.plans || 'N/A';
    const amount = formatCurrency(item.amount);
    const roi = formatCurrency(item.returnOnInvestment);
    const status = item.status || 'N/A';

    const row = document.createElement('tr');
    row.innerHTML = `
        <td data-label="Investment ID">${item.investmentId}</td>
        <td data-label="Duration">${item.duration} hours</td>
        <td data-label="Plan">${plan}</td>
        <td data-label="Amount">${amount}</td>
        <td data-label="Investment Date">${investmentDate}</td>
        <td data-label="ROI">${roi}</td>
        <td data-label="Status" class="status-${status.toLowerCase()}">${status}</td>
        <td><button class="btn btn-sm btn-primary view-btn">View Details</button></td>
    `;
    
    row.querySelector('.view-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showInvestmentDetails(item);
    });
    
    row.addEventListener('click', () => showInvestmentDetails(item));
    
    return row;
}

function showInvestmentDetails(investment) {
    const modal = document.getElementById('investmentModal');
    const modalContent = document.getElementById('modalInvestmentContent');
    const printBtn = document.getElementById('printReceiptBtn');
    const downloadBtn = document.getElementById('downloadReceiptBtn');
    
    if (!modal || !modalContent) return;
    
    modalContent.innerHTML = generateInvestmentDetailsHTML(investment);
    
    // Show/hide receipt buttons based on investment status
    const showReceiptButtons = investment.status === 'completed';
    printBtn.classList.toggle('hidden', !showReceiptButtons);
    downloadBtn.classList.toggle('hidden', !showReceiptButtons);
    
    // Store current investment data for receipt generation
    modal.dataset.currentInvestment = JSON.stringify(investment);
    
    modal.style.display = 'block';
}

function generateInvestmentDetailsHTML(investment) {
    const investmentDate = new Date(investment.createdAt).toLocaleString();
    const completionDate = investment.completedAt ? new Date(investment.completedAt).toLocaleString() : 'N/A';
    const plan = investment.plan || investment.plans || 'N/A';
    const amount = formatCurrency(investment.amount);
    const roi = formatCurrency(investment.returnOnInvestment);
    const status = investment.status || 'N/A';
    
    return `
        <div class="detail-row">
            <span class="detail-label">Investment ID:</span>
            <span class="detail-value">${investment.investmentId}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Plan:</span>
            <span class="detail-value">${plan}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="detail-value">${amount}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${investment.duration} hours</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">ROI:</span>
            <span class="detail-value">${roi}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Investment Date:</span>
            <span class="detail-value">${investmentDate}</span>
        </div>
        ${investment.completedAt ? `
        <div class="detail-row">
            <span class="detail-label">Completion Date:</span>
            <span class="detail-value">${completionDate}</span>
        </div>` : ''}
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-${status.toLowerCase()}">${status}</span>
        </div>
        ${investment.note ? `
        <div class="detail-row">
            <span class="detail-label">Note:</span>
            <span class="detail-value">${investment.note}</span>
        </div>` : ''}
    `;
}

function printReceipt() {
    const modal = document.getElementById('investmentModal');
    if (!modal) return;
    
    const investmentData = JSON.parse(modal.dataset.currentInvestment || '{}');
    if (!investmentData.investmentId) return;
    
    // Create a printable receipt HTML
    const receiptHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="text-align: center; color: #2c3e50;">Investment Receipt</h2>
            <div style="border-bottom: 1px solid #eee; margin-bottom: 20px;"></div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Receipt ID:</span>
                <span>${generateReceiptId()}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Investment ID:</span>
                <span>${investmentData.investmentId}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Date:</span>
                <span>${new Date().toLocaleString()}</span>
            </div>
            
            <div style="margin: 20px 0; border-bottom: 1px dashed #eee;"></div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Plan:</span>
                <span>${investmentData.plan || investmentData.plans || 'N/A'}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Amount:</span>
                <span>${formatCurrency(investmentData.amount)}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">ROI:</span>
                <span>${formatCurrency(investmentData.returnOnInvestment)}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Duration:</span>
                <span>${investmentData.duration} hours</span>
            </div>
            
            <div style="margin: 20px 0; border-bottom: 1px dashed #eee;"></div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold;">
                <span>Status:</span>
                <span>${investmentData.status || 'N/A'}</span>
            </div>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #7f8c8d;">
                <p>Thank you for your investment!</p>
                <p>This is an automated receipt. No signature required.</p>
            </div>
        </div>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt for Investment ${investmentData.investmentId}</title>
                <style>
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                ${receiptHTML}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 100);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

function downloadReceipt() {
    const modal = document.getElementById('investmentModal');
    if (!modal) return;
    
    const investmentData = JSON.parse(modal.dataset.currentInvestment || '{}');
    if (!investmentData.investmentId) return;
    
    // Create receipt content (similar to print but simplified)
    const receiptContent = `
        Investment Receipt
        ----------------------------
        Receipt ID: ${generateReceiptId()}
        Investment ID: ${investmentData.investmentId}
        Date: ${new Date().toLocaleString()}
        
        Plan: ${investmentData.plan || investmentData.plans || 'N/A'}
        Amount: ${formatCurrency(investmentData.amount)}
        ROI: ${formatCurrency(investmentData.returnOnInvestment)}
        Duration: ${investmentData.duration} hours
        Status: ${investmentData.status || 'N/A'}
        
        Thank you for your investment!
    `;
    
    // Create download link
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investment_receipt_${investmentData.investmentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateReceiptId() {
    return 'RCPT-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function closeInvestmentModal() {
    const modal = document.getElementById('investmentModal');
    if (modal) {
        modal.style.display = 'none';
        modal.dataset.currentInvestment = '';
    }
}

// Utility functions
function formatCurrency(amount) {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function showLoading(container) {
    container.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                <div class="spinner"></div>
                Loading investment history...
            </td>
        </tr>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <tr>
            <td colspan="8" class="error">
                <i class="error-icon">!</i>
                ${message}
                <button class="retry-btn" onclick="loadInvestmentHistory()">Retry</button>
            </td>
        </tr>
    `;
}

function isLoggedIn() {
    return localStorage.getItem("accessToken");
}

function redirectToLogin() {
    window.location.href = "/login";
}

function getAccessToken() {
    return localStorage.getItem("accessToken");
}