// verify.js
window.onload = async () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");
  const token = params.get("token");

  const statusTitle = document.getElementById("statusTitle");
  const statusMessage = document.getElementById("statusMessage");
  const closeButton = document.getElementById("closeButton");

  const payload = {
    email,
    verificationToken: token
  };

  try {
    const response = await fetch(`api/v1/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    const result = await response.json();

    if (response.ok) {
      statusTitle.textContent = "Congratulations!";
      statusMessage.textContent = "Your account has been verified successfully.";
      closeButton.style.display = "inline-block";
    } else {
      statusTitle.textContent = "Verification Failed";
      statusMessage.textContent = result.error || "Invalid or expired verification link.";
    }
  } catch (error) {
    console.error(error);
    statusTitle.textContent = "Error";
    statusMessage.textContent = "Unable to connect to server. Please try again later.";
  }
};

function redirect() {
  window.location.href = "../pages/login.html"; // Update if needed
}
