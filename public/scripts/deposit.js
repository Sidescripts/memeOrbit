// "/deposit/fund-wallet"
// "/history"
// '/deposit/deposit-history/:id' 
document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    loadDepositHistory();
  });
  
  async function loadDepositHistory() {
    const tableBody = document.querySelector("#depositHistory tbody");
    if (!tableBody) return;
  
    // Show loading state
    showLoading(tableBody);
  
    try {
      const response = await authFetch("/api/v1/deposit/history");
      
      if (!response) {
        // authFetch already handled redirect if needed
        return;
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load deposit history');
      }
  
      const { data } = await response.json();
      console.log(data)
      updateDepositHistory(data);
  
    } catch (error) {
      console.error('Deposit history error:', error);
      showError(tableBody, error.message || 'Failed to load deposit history');
    }
  }
  
  function updateDepositHistory(data) {
    const tableBody = document.querySelector("#depositHistory tbody");
    if (!tableBody) return;
  
    // Clear previous content
    tableBody.innerHTML = '';
  
    if (!data || !data.deposit || data.deposit.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">No deposit records found.</td>
        </tr>
      `;
      return;
    }
  
    // Render each deposit record
    data.deposit.forEach(record => {
      const formattedDate = new Date(record.createdAt).toLocaleDateString();
      const amount = record.amount ? parseFloat(record.amount).toFixed(2) : '-';
      const euAmount = record.euEquAmount ? `$${parseFloat(record.euEquAmount).toFixed(2)}` : '-';
      const status = record.status === 'approved' ? 'Approved' : 'Pending';
  
      tableBody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${formattedDate}</td>
          <td>${record.trxnId || '-'}</td>
          <td>${record.method || '-'}</td>
          <td>${amount}</td>
          <td>${euAmount}</td>
          <td class="status-${record.status}">${status}</td>
        </tr>
      `);
    });
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
