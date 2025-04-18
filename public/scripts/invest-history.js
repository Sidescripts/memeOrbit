const baseUrl = "/api/v1/investment/";

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("investment-table-body");

    async function loadTableData() {
        if (await isAuthenticated()) {
            const accessToken = getCookie("accessToken");

            try {
                const response = await fetch(baseUrl + "history", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'AccessToken': accessToken
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data.investmentlength === 0) {
                    tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No investment history found.</td></tr>`;
                    return;
                }
                // console.log(data.investment)
                tableBody.innerHTML = data.investment.map(item => {
                    const investmentDate = new Date(item.createdAt).toLocaleDateString();
                    return `
                        <tr>
                            <td  data-label="Investment ID">${item.investmentId}</td>
                            <td  data-label="Duration">${item.duration} hours</td>
                            <td  data-label="Plan">${item.plan || item.plans || 'N/A'}</td>
                            <td  data-label="Amount">$${item.amount}</td>
                            <td  data-label="Investment Date">${investmentDate}</td>
                            <td  data-label="ROI">$${item.returnOnInvestment}</td>
                            <td  data-label="Status">${item.status}</td>
                        </tr>
                    `;
                }).join('');

            } catch (error) {
                // console.error("Error loading investments:", error);
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load data</td></tr>`;
            }
        } else {
            redirectToLogin();
        }
    }

    loadTableData();
});