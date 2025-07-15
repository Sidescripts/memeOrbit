const baseUrl = "/api/v1/investment/";
const PLAN_DURATIONS = {
  "basic plan": 24,
  "moon plan": 48,
  "boom plan": 72
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }

  initInvestmentForm();
});

// ====================== FORM INITIALIZATION ======================
function initInvestmentForm() {
  const methodSelect = document.querySelector('select[name="method"]');
  if (!methodSelect) return;

  methodSelect.addEventListener("change", handlePlanSelection);
}

// ====================== PLAN SELECTION HANDLER ======================
function handlePlanSelection(event) {
  const appendDataContainer = document.querySelector(".appendData");
  const selectedPlan = event.target.value;

  if (!selectedPlan) {
    appendDataContainer.innerHTML = "";
    return;
  }

  appendDataContainer.innerHTML = getInvestmentFormFields();
  setupInvestmentFormHandlers(selectedPlan);
}

// ====================== FORM TEMPLATE ======================
function getInvestmentFormFields() {
  return `
    <div class="col-md-12 mb-3 mt-3">
      <label for="amount">Amount <span class="sp_text_danger">*</span></label>
      <input type="number" name="amount" id="amount" class="form-control amount" required>
      <p class="text-small color-change mb-0 mt-1"></p>
    </div>
    <div class="col-md-12 mb-3">
      <label for="duration">Duration (Hours) <span class="sp_text_danger">*</span></label>
      <input type="text" name="duration" id="duration" class="form-control final_amo" readonly required>
    </div>
    <div class="col-md-12">
      <button id="submitBtn" class="btn main-btn plan-btn w-100" type="button">Proceed</button>
    </div>
    <!-- Feedback containers -->
    <div id="errorContainer" class="alert alert-danger mt-3 d-none"></div>
    <div id="successContainer" class="alert alert-success mt-3 d-none"></div>
  `;
}

// ====================== FORM EVENT HANDLERS ======================
function setupInvestmentFormHandlers(selectedPlan) {
  const amountInput = document.getElementById("amount");
  const durationInput = document.getElementById("duration");
  const submitButton = document.getElementById("submitBtn");

  if (!amountInput || !durationInput || !submitButton) return;

  // Auto-fill duration based on plan
  durationInput.value = PLAN_DURATIONS[selectedPlan] || '';

  // Real-time amount validation
  amountInput.addEventListener("input", () => {
    clearFeedback();
    if (amountInput.value < 0) {
      showError("Amount cannot be negative");
    }
  });

  // Form submission
  submitButton.addEventListener("click", async () => {
    clearFeedback();
    try {
      const amount = parseFloat(amountInput.value);
      await processInvestmentCreation(selectedPlan, amount);
    } catch (error) {
      showError(error.message);
    }
  });
}

// ====================== INVESTMENT PROCESSING ======================
async function processInvestmentCreation(plan, amount) {
  validateInvestmentInput(plan, amount);
  
  try {
    const result = await createInvestment(plan, amount);
    handleInvestmentSuccess(result);
  } catch (error) {
    console.error("Investment Error:", error);
    throw error; // Re-throw for outer catch
  }
}

function validateInvestmentInput(plan, amount) {
  if (!plan) throw new Error("Please select an investment plan");
  if (!amount || isNaN(amount)) throw new Error("Please enter a valid amount");
  if (amount <= 0) throw new Error("Amount must be greater than zero");
  if (!PLAN_DURATIONS[plan]) throw new Error("Invalid investment plan selected");
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
    body: JSON.stringify({ plans: plan, amount })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create investment. Please try again.");
  }

  return await response.json();
}

// ====================== FEEDBACK HANDLERS ======================
function handleInvestmentSuccess(result) {
  showSuccess(result.message || "Investment created successfully!");
  
  // Redirect after 2 seconds
  setTimeout(() => {
    window.location.href = "../components/invest-log.html";
  }, 2000);
}

function showError(message) {
  const errorContainer = document.getElementById("errorContainer");
  if (!errorContainer) return;
  
  errorContainer.textContent = message;
  errorContainer.classList.remove("d-none");
}

function showSuccess(message) {
  const successContainer = document.getElementById("successContainer");
  if (!successContainer) return;
  
  successContainer.textContent = message;
  successContainer.classList.remove("d-none");
}

function clearFeedback() {
  const errorContainer = document.getElementById("errorContainer");
  const successContainer = document.getElementById("successContainer");
  
  if (errorContainer) errorContainer.classList.add("d-none");
  if (successContainer) successContainer.classList.add("d-none");
}

// ====================== UTILITY FUNCTIONS ======================
function isLoggedIn() {
  // Implement your auth check
  return localStorage.getItem("accessToken");
}

function redirectToLogin() {
  window.location.href = "/login";
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
}