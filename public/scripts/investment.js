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

  appendDataContainer.innerHTML = `
    <!-- Error message container at TOP of form -->
    <div id="formFeedback" class="mb-3"></div>
    
    ${getInvestmentFormFields()}
  `;
  
  setupInvestmentFormHandlers(selectedPlan);
}

// ====================== FORM TEMPLATE ======================
function getInvestmentFormFields() {
  return `
    <div class="col-md-12 mb-3 mt-3">
      <label for="amount">Amount <span class="sp_text_danger">*</span></label>
      <input type="number" name="amount" id="amount" class="form-control amount" required>
    </div>
    <div class="col-md-12 mb-3">
      <label for="duration">Duration (Hours) <span class="sp_text_danger">*</span></label>
      <input type="text" name="duration" id="duration" class="form-control final_amo" readonly required>
    </div>
    <div class="col-md-12">
      <button id="submitBtn" class="btn main-btn plan-btn w-100" type="button">Proceed</button>
    </div>
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

  // Form submission
  submitButton.addEventListener("click", async () => {
    clearFeedback();
    submitButton.disabled = true;
    submitButton.textContent = "Processing...";
    
    try {
      const amount = parseFloat(amountInput.value);
      await processInvestmentCreation(selectedPlan, amount);
    } catch (error) {
      showError(error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Proceed";
    }
  });
}

// ====================== INVESTMENT PROCESSING ======================
async function processInvestmentCreation(plan, amount) {
  validateInvestmentInput(plan, amount);
  
  try {
    const result = await createInvestment(plan, amount);
    showSuccessModal(result.message || "Investment created successfully!");
  } catch (error) {
    console.error(error);
    throw error;
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

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || responseData.error || "Failed to create investment");
  }

  return responseData;
}

// ====================== MODAL FEEDBACK SYSTEM ======================
function showErrorModal(message) {
  // Create modal if it doesn't exist
  if (!document.getElementById("errorModal")) {
    const modalHTML = `
      <div id="errorModal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close" onclick="closeModal('errorModal')">&times;</span>
          <h3 class="text-danger">Error</h3>
          <p>${message}</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  } else {
    document.querySelector("#errorModal p").textContent = message;
  }
  
  document.getElementById("errorModal").style.display = "block";
}

function showSuccessModal(message) {
  // Create modal if it doesn't exist
  if (!document.getElementById("successModal")) {
    const modalHTML = `
      <div id="successModal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close" onclick="closeModal('successModal')">&times;</span>
          <h3 class="text-success">Success</h3>
          <p>${message}</p>
          <button onclick="closeModal('successModal')" class="btn btn-primary">OK</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  } else {
    document.querySelector("#successModal p").textContent = message;
  }
  
  document.getElementById("successModal").style.display = "block";
  
  // Redirect after 2 seconds
  setTimeout(() => {
    closeModal('successModal');
    window.location.href = "../components/invest-log.html";
  }, 2000);
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

// ====================== INLINE FEEDBACK (Alternative) ======================
function showError(message) {
  const feedbackContainer = document.getElementById("formFeedback");
  if (!feedbackContainer) {
    showErrorModal(message); // Fallback to modal
    return;
  }
  
  feedbackContainer.innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    </div>
  `;
  
  // Scroll to top of form
  feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearFeedback() {
  const feedbackContainer = document.getElementById("formFeedback");
  if (feedbackContainer) feedbackContainer.innerHTML = "";
}

// ====================== UTILITY FUNCTIONS ======================
function isLoggedIn() {
  return localStorage.getItem("accessToken");
}

function redirectToLogin() {
  window.location.href = "/login";
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

// Make functions available globally for HTML onclick
window.closeModal = closeModal;