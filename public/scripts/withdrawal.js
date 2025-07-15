const baseUrl = "/api/v1/withdrawal/";
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
const MIN_AMOUNT = 2000;
const MAX_AMOUNT = 100000;

document.addEventListener('DOMContentLoaded', function() {
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }

  loadWalletBalance();
  initWithdrawalForm();
});

async function loadWalletBalance(){
  try {
    const response = await authFetch('/api/v1/user/dashboard');
    if(!response) return;
    if(!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to load wallet balance`)
    }
    const {data} = await response.json();
    console.log(data)
    document.getElementById("walletBal").textContent = data.walletBalance

  } catch (error) {
    console.log(error)
  }
}


function initWithdrawalForm() {
  const methodSelect = document.querySelector('select[name="method"]');
  const appendDataContainer = document.querySelector('.appendData');

  if (!methodSelect || !appendDataContainer) return;

  methodSelect.addEventListener('change', handleWithdrawalMethodChange);
}

function handleWithdrawalMethodChange(event) {
  const appendDataContainer = document.querySelector('.appendData');
  const selectedMethod = event.target.value;

  appendDataContainer.innerHTML = selectedMethod ? getWithdrawalFormFields() : '';
  
  if (selectedMethod) {
    setupWithdrawalFormHandlers(selectedMethod);
  }
}

function getWithdrawalFormFields() {
  return `
    <div class="col-md-12 mb-3 mt-3">
      <label for="wthAmount">Withdraw amount <span class="sp_text_danger">*</span></label>
      <input type="text" name="amount" id="wthAmount" class="form-control amount" required>
    </div>
    <div class="col-md-12 mb-3">
      <label for="finalWthAmount">Final withdraw amount <span class="sp_text_danger">*</span></label>
      <input type="text" name="final_amo" id="finalWthAmount" class="form-control final_amo" required readonly>
      <p class="text-small color-change mb-0 mt-1">
        <span>Min amount ${MIN_AMOUNT.toFixed(2)} USD</span> 
        <span>Max amount ${MAX_AMOUNT.toFixed(2)} USD</span>
      </p>
    </div>
    <div class="col-md-12 mb-3">
      <label for="walletAdd">Wallet address <span class="sp_text_danger">*</span></label>
      <input type="text" name="wallet" id="walletAdd" class="form-control" required>
    </div>
    <div class="col-md-12">
      <button id="submitBtn" class="btn main-btn plan-btn w-100" type="button">Withdraw now</button>
    </div>
  `;
}

function setupWithdrawalFormHandlers(method) {
  const amountInput = document.getElementById("wthAmount");
  const finalAmountInput = document.getElementById("finalWthAmount");
  const walletInput = document.getElementById("walletAdd");
  const submitButton = document.getElementById("submitBtn");

  if (!amountInput || !finalAmountInput || !walletInput || !submitButton) return;

  amountInput.addEventListener("input", () => handleAmountInput(method, amountInput, finalAmountInput));
  submitButton.addEventListener("click", () => processWithdrawal(method));
}

async function handleAmountInput(method, amountInput, finalAmountInput) {
  const value = parseFloat(amountInput.value) || 0;
  
  if (method === 'btc') {
    try {
      const amountInUsd = await convertBtcToUsd(value);
      finalAmountInput.value = `$${amountInUsd.toFixed(2)}`;
    } catch (error) {
      console.error('BTC conversion error:', error);
      showModal("error", "Failed to fetch BTC price");
      finalAmountInput.value = '';
    }
  } else {
    finalAmountInput.value = `$${value.toFixed(2)}`;
  }
}

async function convertBtcToUsd(btcAmount) {
  const response = await fetch(COINGECKO_API);
  if (!response.ok) {
    throw new Error('Failed to fetch BTC price');
  }
  
  const data = await response.json();
  return btcAmount * data.bitcoin.usd;
}

async function processWithdrawal(method) {
  try {
    const { amount, wallet } = getWithdrawalInputs();
    validateWithdrawalInputs(method, amount, wallet);
    
    const result = await submitWithdrawalRequest(method, amount, wallet);
    handleWithdrawalSuccess(result);
  } catch (error) {
    handleWithdrawalError(error);
  }
}

function getWithdrawalInputs() {
  const amountInput = document.getElementById("wthAmount");
  const walletInput = document.getElementById("walletAdd");
  
  return {
    amount: parseFloat(amountInput?.value) || 0,
    wallet: walletInput?.value || ''
  };
}

function validateWithdrawalInputs(method, amount, wallet) {
  if (!method || !amount || !wallet) {
    throw new Error("All fields are required");
  }

  if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    throw new Error(`Amount must be between ${MIN_AMOUNT.toFixed(2)} USD and ${MAX_AMOUNT.toFixed(2)} USD`);
  }
}

async function submitWithdrawalRequest(method, amount, wallet) {
  const accessToken = getAccessToken();
  
  const response = await fetch(`${baseUrl}request-withdrawal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    credentials: "include",
    body: JSON.stringify({ method, amount, walletAdd: wallet })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Withdrawal request failed");
  }

  return await response.json();
}

function handleWithdrawalSuccess(result) {
  showModal("success", result.message || "Withdrawal request submitted successfully");
  
  // Optional: Clear form after successful submission
  setTimeout(() => {
    const methodSelect = document.querySelector('select[name="method"]');
    if (methodSelect) methodSelect.value = '';
  }, 2000);
}

function handleWithdrawalError(error) {
  console.error('Withdrawal error:', error);
  showModal("error", error.message || "Failed to process withdrawal");
}

// Modal functions (unchanged from original)
function showModal(type, message) {
  if (type === "success") {
    document.getElementById("successModalText").textContent = message;
    document.getElementById("successModal").style.display = "flex";
  } else {
    document.getElementById("errorModalText").textContent = message;
    document.getElementById("errorModal").style.display = "flex";
  }
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}