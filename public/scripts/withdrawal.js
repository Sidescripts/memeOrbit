const baseUrl = "/api/v1/withdrawal/";

// '/withdrawal-history'
// '/withdrawal-receipt/:id'

document.addEventListener("DOMContentLoaded", function () {
    const appendDataContainer = document.querySelector('.appendData');

    const additionalFields = `
        <div class="col-md-12 mb-3 mt-3">
            <label for="wthAmount">Withdraw amount <span class="sp_text_danger">*</span></label>
            <input type="text" name="amount" id="wthAmount" class="form-control amount" required>
        </div>
        <div class="col-md-12 mb-3">
            <label for="finalWthAmount">Final withdraw amount <span class="sp_text_danger">*</span></label>
            <input type="text" name="final_amo" id="finalWthAmount" class="form-control final_amo" required readonly>
            <p class="text-small color-change mb-0 mt-1">
                <span>Min amount 1000.00 USD</span> 
                <span>Max amount 100,000.00 USD</span>
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

    document.querySelector('select[name="method"]').addEventListener('change', function () {
        appendDataContainer.innerHTML = this.value ? additionalFields : '';
        if (this.value) attachDynamicHandlers();
    });

    function attachDynamicHandlers() {
        const amountInput = document.getElementById("wthAmount");
        const finalAmountInput = document.getElementById("finalWthAmount");
        const submitButton = document.getElementById("submitBtn");

        amountInput.addEventListener("input", async function () {
            const value = parseFloat(amountInput.value) || 0;
            if (document.querySelector('select[name="method"]') === 'btc') {
                try {
                    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
                    const data = await response.json();
                    const btcPriceInUsd = data.bitcoin.usd;
                    const amtInUsd = amountInput.value * btcPriceInUsd;
                    finalAmountInput.value = `$${amtInUsd.toFixed(2)}`;
                } catch (error) {
                    displayMessage("errorMsg", "Error occurred!");
                    return;
                }
            } else {
                finalAmountInput.value = `$${value.toFixed(2)}`;
                
            }
            // finalAmountInput.value = `$${value.toFixed(2)}`;
            // console.log(finalAmountInput.value)
            // console.log(amountInput.value)
        });

        submitButton.addEventListener("click", async function () {
            const amount = parseFloat(amountInput.value) || 0;
            const method = document.querySelector('select[name="method"]').value;
            const wallet = document.getElementById("walletAdd").value;

            if (!method || !amount || !wallet) {
                displayMessage("errorMsg", "All fields are required!");
                return;
            }
            // console.log(method)
            if (finalAmountInput.value < 1000 || finalAmountInput.value > 100000) {
                displayMessage("errorMsg", "Amount must be between 1000.00 USD and 100,000.00 USD.");
                return;
            }

            if(await isAuthenticated()){
                const accessToken = getCookie("accessToken");
                
                try {
                    const response = await fetch(baseUrl+"request-withdrawal", {
                        method: 'POST',
                        mode: "cors",
                        headers: {
                            'Content-Type': 'application/json',
                            'AccessToken': accessToken,
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                        },
                        credentials: "include",
                        body: JSON.stringify({ method, amount, wallet })
                    });
                    const result = await response.json();
                    if (response.ok) {
                        displayMessage("successMsg", result.message || "Withdrawal request submitted successfully.");
                    } else {
                        displayMessage("errorMsg", result.error || "An error occurred. Please try again.");
                    }
                    return result;
                } catch (error) {
                    console.log(error)
                    return error;
                }
            }else{
                redirectToLogin();
            }

            
        });
    }

    function displayMessage(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        setTimeout(() => { element.textContent = ''; }, 5000);
    }
});


// withdrawal history
document.addEventListener("DOMContentLoaded", () => {
        const tableBody = document.querySelector(".site-table tbody");

        // Function to fetch and populate withdrawal history
        const fetchWithdrawalHistory = async () => {
            
            if(await isAuthenticated()){
                const accessToken = getCookie("accessToken");
                
        
                try {
                    // Show loading state
                    tableBody.innerHTML = `<tr>
                        <td colspan="100%" class="text-center">Loading...</td>
                    </tr>`;

                    // Fetch data from the server
                    const response = await fetch(baseUrl + "withdrawal-history", {
                        method: 'GET',
                        mode: 'cors',
                        headers:{
                            'Content-Type': 'application/json',
                            'AccessToken': accessToken
                            
                        },
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error("Failed to fetch withdrawal history");

                    const data = await response.json();    
                    
                    const {
                        withdrawals
                    }   = data
                    // Check if there are records to display
                    if (withdrawals.length === 0) {
                        tableBody.innerHTML = `<tr>
                            <td colspan="100%" class="text-center">No data found</td>
                        </tr>`;
                        return;
                    }
                    
                    // Populate the table
                tableBody.innerHTML = withdrawals.map((entry) => `
                    
                    <tr>
                        <td>${entry.trxnId}</td>
                        <td>${new Date(entry.date).toLocaleDateString()}</td>
                        <td>${entry.method}</td>
                        <td>${entry.amount}</td>
                        <td>${entry.euEquAmount}</td>
                        <td>${entry.walletAdd}</td>
                        <td>${entry.status}</td>
                        <td>
                            <button class="btn btn-sm btn-primary">View</button>
                        </td>
                    </tr>
                `).join("");


                
                } catch (error) {
                    // Handle errors
                console.error(error);
                tableBody.innerHTML = `<tr>
                    <td colspan="100%" class="text-center">Failed to load data</td>
                </tr>`;    
                }

            }else{
                redirectToLogin()
            }
        };

        // Fetch the withdrawal history when the page loads
        fetchWithdrawalHistory();
});
