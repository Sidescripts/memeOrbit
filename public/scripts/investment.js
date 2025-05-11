const baseUrl = "/api/v1/investment/";

document.addEventListener("DOMContentLoaded", () => {
  const appendDataContainer = document.querySelector(".appendData");
  const methodSelect = document.querySelector('select[name="method"]');

  const additionalFields = `
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
  `;

  methodSelect.addEventListener("change", () => {
    const selectedPlan = methodSelect.value;
    appendDataContainer.innerHTML = selectedPlan ? additionalFields : "";
    if (selectedPlan) attachDynamicHandlers();
  });

  function attachDynamicHandlers() {
    const amountInput = document.getElementById("amount");
    const durationInput = document.getElementById("duration");
    const submitButton = document.getElementById("submitBtn");

    amountInput.addEventListener("input", () => {
      const plan = methodSelect.value;
      const durations = {
        "basic plan": 24,
        "moon plan": 48,
        "boom plan": 72
      };
      durationInput.value = durations[plan] || '';
    });

    submitButton.addEventListener("click", async () => {
      const amount = parseFloat(amountInput.value.trim()) || 0;
      const plan = methodSelect.value;

      if (!plan || !amount) {
        return displayMessage("errorMsg", "All fields are required!");
      }

      if (!(await isAuthenticated())) {
        return redirectToLogin();
      }

      const accessToken = getCookie("accessToken");

      try {
        const response = await fetch(`${baseUrl}create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'AccessToken': accessToken,
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
          },
          credentials: "include",
          body: JSON.stringify({ plans: plan, amount })
        });

        const result = await response.json();

        if (!response.ok) {
          return displayMessage("errorMsg", result.error || "An error occurred. Please try again.");
        }

        displayMessage("successMsg", result.message || "Proud Investor");
        window.location.href = "../components/invest-log.html";

      } catch (error) {
        console.error(error);
        displayMessage("errorMsg", "Unexpected error occurred!");
      }
    });
  }

  function displayMessage(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      setTimeout(() => { el.textContent = ""; }, 5000);
    }
  }
});
