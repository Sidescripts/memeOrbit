const baseUrl = "/api/v1/withdrawal/";

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

async function witHistory(){
    const tableBody = document.querySelector("#witHistory tbody");
    tableBody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

     if (await isAuthenticated()) {
        const accessToken = getCookie("accessToken");

        try {
            const response = await fetch(baseUrl + "withdrawal-history",{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'AccessToken': accessToken
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log(data)
            const { deposit } = data;
            

            tableBody.innerHTML = ''; // clear loading text

            if (!deposit || deposit.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6">No withdrawal  records found.</td></tr>`;
                return;
            }

            deposit.forEach(record => {
                const formattedDate = new Date(record.createdAt).toLocaleDateString();

                const row = `
                    <tr>
                        <td>${formattedDate}</td>
                        <td>${record.trxnId || '-'}</td>
                        <td>${record.method || '-'}</td>
                        <td>${record.amount ? `${parseFloat(record.amount).toFixed(2)}` : '-'}</td>
                        <td>${record.euEquAmount ? `$${parseFloat(record.euEquAmount).toFixed(2)}` : '-'}</td>
                        <td>${record.status === 'approved' ? 'Approved' : 'Pending'}</td>
                    </tr>
                `;

                tableBody.insertAdjacentHTML('beforeend', row);
            });

        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="6">Error loading deposit history.</td></tr>`;
        }
    } else {
        redirectToLogin();
    }
}

window.onload = witHistory;