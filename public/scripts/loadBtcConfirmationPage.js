const baseUrl = "/api/v1/deposit/";
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    initBtcDepositPage();
});

async function initBtcDepositPage() {
    try {
        await loadBtcPrice();
    } catch (error) {
        console.error('BTC price loading error:', error);
        showBtcPriceError();
    }
}

async function loadBtcPrice() {
    const depositAmtElement = document.getElementById("depositAmt");
    const equAmtElement = document.getElementById("equAmt");
    const amt = localStorage.getItem("depositAmt");
    
    if (!depositAmtElement || !equAmtElement || !amt) {
        throw new Error('Missing required elements or deposit amount');
    }

    try {
        const response = await fetch(COINGECKO_API);
        if (!response.ok) {
            throw new Error(`Failed to fetch BTC price: ${response.status}`);
        }
        
        const data = await response.json();
        const btcPriceInUsd = data.bitcoin.usd;
        const amountInUsd = Number(amt) * btcPriceInUsd;
        
        equAmtElement.textContent = amountInUsd.toFixed(2);
        depositAmtElement.textContent = Number(amt);
        
    } catch (error) {
        console.error('BTC price calculation error:', error);
        throw error;
    }
}

function showBtcPriceError() {
    const equAmtElement = document.getElementById("equAmt");
    if (equAmtElement) {
        equAmtElement.textContent = "Price unavailable";
        equAmtElement.classList.add("error");
    }
}

async function btcDeposit() {
    if (!await isLoggedIn()) {
        redirectToLogin();
        return;
    }

    try {
        const result = await processBtcDeposit();
        handleDepositSuccess(result);
    } catch (error) {
        handleDepositError(error);
    }
}

async function processBtcDeposit() {
    const accessToken = getAccessToken();
    const storedMethod = localStorage.getItem("paymentMethod");
    const amt = localStorage.getItem("depositAmt");

    if (!storedMethod) {
        throw new Error('No payment method selected');
    }

    if (!amt) {
        throw new Error('No deposit amount specified');
    }

    const method = storedMethod === "Bitcoin" ? 'btc' : storedMethod;
    const data = {
        amount: Number(amt),
        method: method
    };

    const response = await fetch(baseUrl + "fund-wallet", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Deposit failed: ${response.status}`);
    }

    return await response.json();
}

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

// Reusable toast notification
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