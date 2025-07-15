// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }
  
  // Load dashboard data immediately
  loadDashboardData();
  
  // Refresh data every 5 minutes
  setInterval(loadDashboardData, 60 * 60 * 1000);
});

// Main dashboard data loader
async function loadDashboardData() {
  try {
    
    // Make authenticated request
    const response = await authFetch('/api/v1/user/dashboard');
    
    // Handle redirect if auth failed
    if (!response) return; 
    
    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to load dashboard data');
    }
    
    // Update UI with data
    const { data } = await response.json();
    // console.log(data)
    updateDashboardUI(data);
    
    
  } catch (error) {
    console.log(error)
    showError(error.message);
  }
}

// Update all dashboard elements
function updateDashboardUI(data) {
  // Format currency values
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  // Update balance displays
  document.getElementById("username").textContent = data.username;
  document.getElementById("accBalance").textContent = formatMoney(data.walletBalance);
  document.getElementById("totInvest").textContent = formatMoney(data.totalInvestment);
  document.getElementById("totalWith").textContent = formatMoney(data.totalWithdrawal);
  document.getElementById("totDeposit").textContent = formatMoney(data.totalDeposit);
  document.getElementById("currentInvest").textContent = formatMoney(data.currentInvestment?.amount || 0);
  
}

// Show error message to user
function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide error after 7 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 7000);
  }
}

