// "/deposit/fund-wallet"
// "/history"
// '/deposit/deposit-history/:id' 

const baseUrl = "/api/v1/deposit/";

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
  
    const accessToken = getAccessToken();

    try {
      const redsponse = await authFetch("/api/v1/deposit/history");
      const response = await authFetch(`${baseUrl}history`);
      
      // const response = await fetch(`/api/v1/deposit/history`, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${accessToken}`
      //   },
      //   credentials: "include"
      // })
      
      if (!response) {
        // authFetch already handled redirect if needed
        return;
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData)
        throw new Error(errorData.message || 'Failed to load deposit history');
      }
  
      const  {deposit}  = await response.json();
      console.log(deposit)
      updateDepositHistory(deposit);
  
    } catch (error) {
      console.error('Deposit history error:', error);
      showError(tableBody, error.message || 'Failed to load deposit history');
    }
  }
  
  function updateDepositHistory(deposit) {
    const tableBody = document.querySelector("#depositHistory tbody");
    if (!tableBody) return;
  
    // Clear previous content
    tableBody.innerHTML = '';
  
    if (!deposit || deposit.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">No deposit records found.</td>
        </tr>
      `;
      return;
    }
  
    // Render each deposit record
    deposit.forEach(record => {
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
