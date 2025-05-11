const baseUrl = "/api/v1/deposit/";

async function confirmBtcPage() {
            let depositAmtI = document.getElementById("depositAmt"); 
            let equAmtI = document.getElementById("equAmt");
            const amt = localStorage.getItem("depositAmt");

            try {
                // fetch btc price            "https://pro-api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
                const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
                const data = await response.json();
                const btcPriceInUsd = data.bitcoin.usd;
                // calc amount
                const amountInUsd = Number(amt) * btcPriceInUsd;
                equAmtI.textContent = amountInUsd
                depositAmtI.textContent = Number(amt);
                
            } catch (error) {
                console.log(error);
                return;   
            }
}            

async function btcDeposit(){

    if(await isAuthenticated()){
        const accessToken = getCookie("accessToken")
                
        try {
            const storedMethod = localStorage.getItem("paymentMethod");
            const amt = localStorage.getItem("depositAmt");

            const method = storedMethod === "Bitcoin" ? 'btc' : storedMethod;

            if(!method){
                iziToast.error({
                    title: 'Error',
                    message: "No Valid Method",
                    position: 'topRight',
                });
                return;
            }

            const data = {
                amount: Number(amt),
                method: method
            }
            // console.log(data)

            const response = await fetch(baseUrl + "fund-wallet", {
                method: "POST",
                mode: 'cors',
                headers:{
                    'Content-Type': 'application/json',
                    'AccessToken': accessToken
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            
            if(!response.ok){
                iziToast.error({
                    title: 'Error',
                    message: `Error: ${response.status} - ${response.statusText}`,
                    position: 'topRight',
                });
                return;
            }
            
            const result = await response.json();
            localStorage.removeItem("paymentMethod")
            iziToast.success({
                title: 'Success',
                message: result.message || "Deposit is now being processed!!",
                position: 'topRight',
            });
            window.location.href = "../components/deposit-log.html"
            // return;

        } catch (error) {
            console.log(error)
            iziToast.error({
                title: 'Error',
                message: "An unexpected error occurred. Please try again.",
                position: 'topRight',
            });
        }
    }else{
        redirectToLogin();
    }
}