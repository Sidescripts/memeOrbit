// Token storage functions
function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

function saveTokens(accessToken, refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getAccessToken() && !!getRefreshToken();
}

// Redirect to login page
function redirectToLogin() {
  clearTokens();
  window.location.href = '../pages/login.html';
}

// Make authenticated API calls
async function authFetch(url, options = {}) {
  const accessToken = getAccessToken();
  
  // Add authorization header
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  
  let response = await fetch(url, options);
  
  // If token expired, try to refresh it
  if (response.status === 401) {
    const newToken = await refreshToken();
    if (!newToken) return null; // Redirect happened
    
    // Retry with new token
    options.headers.Authorization = `Bearer ${newToken}`;
    response = await fetch(url, options);
  }
  
  return response;
}

// Refresh expired access token
async function refreshToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    redirectToLogin();
    return null;
  }

  try {
    const response = await fetch('/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken })
    });
    
    if (!response.ok) throw new Error('Refresh failed');
    
    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    saveTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    redirectToLogin();
    return null;
  }
}