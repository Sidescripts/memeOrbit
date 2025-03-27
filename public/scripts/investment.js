// const baseUrl = "/api/v1/investment/";

// document.addEventListener("DOMContentLoaded", () => {
//     console.log("intoxicate")
//     const tableBody = document.querySelector("table .site-table tbody");

//     // Function to fetch and populate table data
//     async function loadTableData() {
//         if(await isAuthenticated()){
//             const accessToken = getCookie("accessToken")

//             try {
//                 const response = await fetch(baseUrl + "history", {
//                     method: 'GET',
//                     mode: 'cors',
//                     headers:{
//                         'Content-Type': 'application/json',
//                         'AccessToken': accessToken
//                     },
//                     credentials: 'include',
//                 });
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }

//                 const data = await response.json();

//                 // Clear existing rows
//                 tableBody.innerHTML = "";

//                 // Populate table with fetched data
//                 data.forEach(item => {
//                     console.log(item)
//                     const row = document.createElement("tr");

//                 row.innerHTML = `
//                     <td>${item.investmentId}</td>
//                     <td>${item.duration}</td>
//                     <td>${item.plan}</td>
//                     <td>${item.amount}</td>
//                     <td>${item.investmentDate}</td>
//                     <td>${item.returnOnInvestment}</td>
//                     <td>${item.status}</td>
//                 `;

//                 tableBody.appendChild(row);
//             });
//             } catch (error) {
//                 console.error("Error fetching or displaying data:", error);
//                 tableBody.innerHTML = `<tr><td colspan="7" class="text-center">Failed to load data</td></tr>`;    
//             }
//         }else{
//             redirectToLogin();
//         }
//     }

//     // Load data when page loads
//     loadTableData();
// });

const baseUrl = "/api/v1/investment/";

// document.addEventListener("DOMContentLoaded", () => {
//     const tableBody = document.getElementById("investment-table-body");

//     async function loadTableData() {
//         if (await isAuthenticated()) {
//             const accessToken = getCookie("accessToken");

//             try {
//                 const response = await fetch(baseUrl + "history", {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'AccessToken': accessToken
//                     },
//                     credentials: 'include',
//                 });

//                 if (!response.ok) {
//                     throw new Error(`HTTP error! Status: ${response.status}`);
//                 }

//                 const investments = await response.json();

//                 if (investments.length === 0) {
//                     tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No investment history found.</td></tr>`;
//                     return;
//                 }

//                 tableBody.innerHTML = investments.map(item => {
//                     const investmentDate = new Date(item.investmentDate).toLocaleDateString();
//                     return `
//                         <tr>
//                             <td>${item.investmentId}</td>
//                             <td>${item.duration} hours</td>
//                             <td>${item.plan || item.plans || 'N/A'}</td>
//                             <td>$${item.amount}</td>
//                             <td>${investmentDate}</td>
//                             <td>$${item.returnOnInvestment}</td>
//                             <td>${item.status}</td>
//                         </tr>
//                     `;
//                 }).join('');

//             } catch (error) {
//                 console.error("Error loading investments:", error);
//                 tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load data</td></tr>`;
//             }
//         } else {
//             redirectToLogin();
//         }
//     }

//     loadTableData();
// });


document.addEventListener("DOMContentLoaded", function () {
    const appendDataContainer = document.querySelector('.appendData');

    const additionalFields = `
        <div class="col-md-12 mb-3 mt-3">
            <label for="wthAmount">Amount <span class="sp_text_danger">*</span></label>
            <input type="text" name="amount" id="amount" class="form-control amount" required>
            <p class="text-small color-change mb-0 mt-1">
            </p>
        </div>
        <div class="col-md-12 mb-3">
            <label for="finalWthAmount">Duration<span class="sp_text_danger">*</span></label>
            <input type="text" name="final_amo" id="duration" class="form-control final_amo" required readonly>
        </div>
        <div class="col-md-12">
            <button id="submitBtn" class="btn main-btn plan-btn w-100" type="button">Proceed</button>
        </div>
    `;

    document.querySelector('select[name="method"]').addEventListener('change', function () {
        appendDataContainer.innerHTML = this.value ? additionalFields : '';
        if (this.value) attachDynamicHandlers();
    });

    function attachDynamicHandlers() {
        const amountInput = document.getElementById("amount");
        const duration = document.getElementById("duration");
        const submitButton = document.getElementById("submitBtn");

        amountInput.addEventListener("input", function () {
            const value = parseFloat(amountInput.value) || 0;
            // duration.value = `$${value.toFixed(2)}`;
            
            if (document.querySelector('select[name="method"]').value === 'basic plan') {
                duration.value = `24`;
            } else if (document.querySelector('select[name="method"]').value === 'moon plan') {
                duration.value = `48`;
            }else {
                duration.value = `72`;
            }
            
            // console.log(duration.value)
            // console.log(amountInput.value)
        });

        submitButton.addEventListener("click", async function () {
            const amount = parseFloat(amountInput.value) || 0;
            const plans = document.querySelector('select[name="method"]').value;
            // const wallet = document.getElementById("walletAdd").value;

            if (!plans || !amount) {
                displayMessage("errorMsg", "All fields are required!");
                return;
            }
            // console.log(amount, plans)

            if(await isAuthenticated()){
                const accessToken = getCookie("accessToken");
                

                try {
                    const response = await fetch(baseUrl+"create", {
                        method: 'POST',
                        mode: "cors",
                        headers: {
                            'Content-Type': 'application/json',
                            'AccessToken': accessToken,
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                        },
                        credentials: "include",
                        body: JSON.stringify({ plans, amount})
                    });
                    const result = await response.json();
                    if(!result.ok){
                        displayMessage("errorMsg", result.error || "An error occurred. Please try again.");
                        return;
                    }
                    displayMessage("successMsg", result.message || "Proud Investor ");
                    window.location.href = "../components/invest-log.html"
                    
                    // return result;
                } catch (error) {
                    console.log(error)
                    displayMessage("errorMsg","Unexpected Error!");
                    // return error;
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

