// Utility to get cookie by name
function getCookie(name) {
  const cookies = document.cookie.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

// Check authentication status
function isAuthenticated() {
  const accessToken = getCookie("accessToken");
  if (accessToken) return true;

  redirectToLogin();
  return false;
}

// Redirect to login page
function redirectToLogin() {
  window.location.href = '../pages/login.html';
}

// Clear stored token values
function clearToken() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('expires');
}

// Calculate token expiration time (24 hours)
function calcExpTime() {
  return Date.now() + 24 * 60 * 60 * 1000;
}

// Run auth check only after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  isAuthenticated();
});
