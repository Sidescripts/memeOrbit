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

async function usdtDeposit(){

    if(await isAuthenticated()){
        const accessToken = getCookie("accessToken")
        
        try {
            const storedMethod = localStorage.getItem("paymentMethod");
            const amt = localStorage.getItem("depositAmt");

            const method = storedMethod === "Usdt" ? 'usdt' : storedMethod;

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
            console.log(data)

            const response = await fetch(baseUrl + "fund-wallet", {
                method: "POST",
                mode: 'cors',
                headers:{
                    'Content-Type': 'application/json',
                    'AccessToken': accessToken,
                    
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
            localStorage.removeItem("paymentMethod");
            iziToast.success({
                title: 'Success',
                message: result.message || "Deposit is now being processed!!",
                position: 'topRight',
            });
            // displaysuccess("Deposit is now being processed!!" || result.message)
            // window.location.href = "../dashboard/dashboard.html"
            // return;
            

        } catch (error) {
            console.log(error)
            iziToast.error({
                title: 'Error',
                message: "An unexpected error occurred. Please try again.",
                position: 'topRight',
            });
            // return error;
        }
    }else{
        redirectToLogin();
    }
}