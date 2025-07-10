let isRefreshing = false;
let refreshQueue = [];

async function apiFetch(url, options = {}) {
  
  const accessToken = getAccessToken();
  
  // Set auth header
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  // First attempt
  let response = await fetch(url, options);
  
  // Token expired? Try to refresh
  if (response.status === 401 && !options._retry) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        // Refresh tokens
        const refreshResponse = await fetch('/api/v1/auth/refresh-token', {
          method: 'POST',
          body: JSON.stringify({ token: getRefreshToken() })
        });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshResponse.json();
        
        saveTokens(newAccessToken, newRefreshToken)
        // Retry queued requests
        refreshQueue.forEach(cb => cb(newAccessToken));
        refreshQueue = [];
        
        // Retry original request
        options.headers.Authorization = `Bearer ${newAccessToken}`;
        options._retry = true;
        return apiFetch(url, options);
      } catch (error) {
        Auth.logout();
        throw error;
      } finally {
        isRefreshing = false;
      }
    } else {
      // Queue request while refreshing
      return new Promise(resolve => {
        refreshQueue.push((newToken) => {
          options.headers.Authorization = `Bearer ${newToken}`;
          options._retry = true;
          resolve(apiFetch(url, options));
        });
      });
    }
  }
  
  return response;
}

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