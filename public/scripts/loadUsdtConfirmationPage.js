const baseUrl = "/api/v1/deposit/";

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    initUsdtDepositPage();
});

function initUsdtDepositPage() {
    try {
        loadUsdtConfirmation();
    } catch (error) {
        console.error('USDT confirmation error:', error);
        showConfirmationError();
    }
}

function loadUsdtConfirmation() {
    const depositAmtElement = document.getElementById("depositAmt");
    const equAmtElement = document.getElementById("equAmt");
    const amt = localStorage.getItem("depositAmt");
    
    if (!depositAmtElement || !equAmtElement || !amt) {
        throw new Error('Missing required elements or deposit amount');
    }

    try {
        const amount = Number(amt).toFixed(2);
        equAmtElement.textContent = amount;
        depositAmtElement.textContent = amount;
    } catch (error) {
        console.error('Amount formatting error:', error);
        throw new Error('Failed to format deposit amount');
    }
}

function showConfirmationError() {
    const equAmtElement = document.getElementById("equAmt");
    if (equAmtElement) {
        equAmtElement.textContent = "Error loading amount";
        equAmtElement.classList.add("error");
    }
}

async function usdtDeposit() {
    if (!await isLoggedIn()) {
        redirectToLogin();
        return;
    }

    try {
        const result = await processUsdtDeposit();
        handleDepositSuccess(result);
    } catch (error) {
        handleDepositError(error);
    }
}

async function processUsdtDeposit() {
    const accessToken = getAccessToken();
    const storedMethod = localStorage.getItem("paymentMethod");
    const amt = localStorage.getItem("depositAmt");

    if (!storedMethod || storedMethod.toLowerCase() !== "usdt") {
        throw new Error('Invalid payment method - USDT required');
    }

    if (!amt) {
        throw new Error('No deposit amount specified');
    }

    const data = {
        amount: Number(amt),
        method: 'usdt'
    };

    const response = await fetch(`${baseUrl}fund-wallet`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
        credentials: "include"
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Deposit failed: ${response.status}`);
    }

    return await response.json();
}

// Reusing the same success/error handlers from previous implementations
function handleDepositSuccess(result) {
    localStorage.removeItem("paymentMethod");
    
    showToast({
        type: 'success',
        title: 'Success',
        message: result.message || "Deposit is now being processed!",
    });
    
    setTimeout(() => {
        window.location.href = "../components/deposit-log.html";
    }, 1500);
}

function handleDepositError(error) {
    console.error('Deposit error:', error);
    
    showToast({
        type: 'error',
        title: 'Error',
        message: error.message || "An unexpected error occurred. Please try again.",
    });
}

// Reusable toast notification (consistent with other components)
function showToast({ type, title, message }) {
    const toastOptions = {
        title: title,
        message: message,
        position: 'topRight'
    };
    
    if (type === 'success') {
        iziToast.success(toastOptions);
    } else {
        iziToast.error(toastOptions);
    }
}