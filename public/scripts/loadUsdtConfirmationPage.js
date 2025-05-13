const baseUrl = "/api/v1/deposit/";


async function loadConfirmation() {
            let depositAmtI = document.getElementById("depositAmt");
            let equAmtI = document.getElementById("equAmt");
            const amt = localStorage.getItem("depositAmt");

            try {
                
                equAmtI.textContent = Number(amt);
                depositAmtI.textContent = Number(amt).toFixed(2);

            } catch (error) {
                console.log(error);
                return;
            }

}


async function usdtDeposit() {
    if (!(await isAuthenticated())) {
        return redirectToLogin();
    }

    const accessToken = getCookie("accessToken");
    const storedMethod = localStorage.getItem("paymentMethod");
    const amt = localStorage.getItem("depositAmt");

    const method = storedMethod?.toLowerCase() === "usdt" ? "usdt" : null;

    if (!method || !amt) {
        iziToast.error({
            title: "Error",
            message: "Invalid or missing payment method or amount.",
            position: "topRight",
        });
        return;
    }

    const data = {
        amount: Number(amt),
        method,
    };
    console.log(data)
    try {
        const response = await fetch(`${baseUrl}fund-wallet`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "AccessToken": accessToken,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            iziToast.error({
                title: "Error",
                message: `Error: ${response.status} - ${response.statusText}`,
                position: "topRight",
            });
            return;
        }

        const result = await response.json();
        localStorage.removeItem("paymentMethod");

        iziToast.success({
            title: "Success",
            message: result.message || "Deposit is now being processed!",
            position: "topRight",
        });

        window.location.href = "../components/deposit-log.html";

    } catch (error) {
        console.log(error)
        console.error(error);
        iziToast.error({
            title: "Error",
            message: "An unexpected error occurred. Please try again.",
            position: "topRight",
        });
    }
}