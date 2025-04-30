const baseUrl = "/api/v1/deposit/";


async function depositHistory() {
    const tableBody = document.querySelector("#depositHistory tbody");
    tableBody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

    if (await isAuthenticated()) {
        const accessToken = getCookie("accessToken");

        try {
            const response = await fetch(baseUrl + "history", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'AccessToken': accessToken
                },
                credentials: 'include'
            });

            const data = await response.json();
            const { deposit } = data;

            tableBody.innerHTML = ''; // clear loading text

            if (!deposit || deposit.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6">No deposit records found.</td></tr>`;
                return;
            }

            // 🛑 Filter only pending deposits
            const pendingDeposits = deposit.filter(record => record.status == 'approved');

            if (pendingDeposits.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6">No pending deposits found.</td></tr>`;
                return;
            }

            pendingDeposits.forEach(record => {
                const formattedDate = new Date(record.createdAt).toLocaleDateString();

                const row = `
                    <tr>
                        <td>${formattedDate}</td>
                        <td>${record.trxnId || '-'}</td>
                        <td>${record.method || '-'}</td>
                        <td>${record.amount ? `${parseFloat(record.amount).toFixed(2)}` : '-'}</td>
                        <td>${record.euEquAmount ? `$${parseFloat(record.euEquAmount).toFixed(2)}` : '-'}</td>
                        <td>Approved</td>
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


window.onload = depositHistory;