const baseUrl = "/api/v1/investment/";
const PLAN_DURATIONS = {
  "basic plan": 24,
  "moon plan": 48,
  "boom plan": 72
};

document.addEventListener('DOMContentLoaded', function() {
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }

  initInvestmentForm();
});

function initInvestmentForm() {
  const appendDataContainer = document.querySelector(".appendData");
  const methodSelect = document.querySelector('select[name="method"]');

  if (!appendDataContainer || !methodSelect) return;

  methodSelect.addEventListener("change", handlePlanSelection);
}

function handlePlanSelection(event) {
  const appendDataContainer = document.querySelector(".appendData");
  const selectedPlan = event.target.value;

  if (!selectedPlan) {
    appendDataContainer.innerHTML = "";
    return;
  }

  appendDataContainer.innerHTML = getInvestmentFormFields();
  setupInvestmentFormHandlers();
}

function getInvestmentFormFields() {
  return `
    <div class="col-md-12 mb-3 mt-3">
      <label for="amount">Amount <span class="sp_text_danger">*</span></label>
      <input type="text" name="amount" id="amount" class="form-control amount" required>
      <p class="text-small color-change mb-0 mt-1"></p>
    </div>
    <div class="col-md-12 mb-3">
      <label for="duration">Duration <span class="sp_text_danger">*</span></label>
      <input type="text" name="duration" id="duration" class="form-control final_amo" readonly required>
    </div>
    <div class="col-md-12">
      <button id="submitBtn" class="btn main-btn plan-btn w-100" type="button">Proceed</button>
    </div>
    <div id="errorMsg" class="col-md-12 mt-2"></div>
    <div id="successMsg" class="col-md-12 mt-2"></div>
  `;
}

function setupInvestmentFormHandlers() {
  const amountInput = document.getElementById("amount");
  const durationInput = document.getElementById("duration");
  const submitButton = document.getElementById("submitBtn");
  const methodSelect = document.querySelector('select[name="method"]');

  if (!amountInput || !durationInput || !submitButton || !methodSelect) return;

  amountInput.addEventListener("input", () => {
    const plan = methodSelect.value;
    durationInput.value = PLAN_DURATIONS[plan] || '';
  });

  submitButton.addEventListener("click", () => {
    processInvestmentCreation();
  });
}

async function processInvestmentCreation() {
  const amountInput = document.getElementById("amount");
  const methodSelect = document.querySelector('select[name="method"]');
  
  if (!amountInput || !methodSelect) return;

  const amount = parseFloat(amountInput.value.trim()) || 0;
  const plan = methodSelect.value;

  try {
    validateInvestmentInput(plan, amount);
    const result = await createInvestment(plan, amount);
    handleInvestmentSuccess(result);
  } catch (error) {
    console.log(error)
    handleInvestmentError(error);
  }
}

function validateInvestmentInput(plan, amount) {
  if (!plan || !amount) {
    throw new Error("All fields are required");
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  if (!PLAN_DURATIONS[plan]) {
    throw new Error("Invalid investment plan selected");
  }
}

async function createInvestment(plan, amount) {
  const accessToken = getAccessToken();
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

  const response = await fetch(`${baseUrl}create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-CSRF-TOKEN': csrfToken
    },
    credentials: "include",
    body: JSON.stringify({ plans: plan, amount })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create investment");
  }

  return await response.json();
}

function handleInvestmentSuccess(result) {
  showToast({
    type: 'success',
    title: 'Success',
    message: result.message || "Investment created successfully"
  });
  
  setTimeout(() => {
    window.location.href = "../components/invest-log.html";
  }, 1500);
}

function handleInvestmentError(error) {
  console.error('Investment error:', error);
  showToast({
    type: 'error',
    title: 'Error',
    message:  error.message || "Failed to create investment"
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