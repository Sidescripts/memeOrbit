const baseUrl = "/api/v1/m/dashboard";

async function dashboard(){
    let walletBalI = document.getElementById("accBalance");
    let currentInvestI = document.getElementById("currentInvest");
    let totalWithI = document.getElementById("totalWith");
    let totalDepoI = document.getElementById("totDeposit")
    let totalInvestI = document.getElementById("totInvest");


    if(await isAuthenticated()){
        const accessToken = getCookie("accessToken")
        
        
        try {
            
            const response = await fetch(baseUrl, {
                method: 'GET',
                mode: 'cors',
                headers:{
                    'Content-Type': 'application/json',
                    'AccessToken': accessToken
                },
                credentials: 'include',
            });
            

            const data = await response.json();
            // console.log(data)
            
            if(!response.ok){
                throw new Error("Request Error!") 
            }
            
            const {
                walletBalance,
                totalInvestment,
                totalWithdrawal,
                totalDeposit,
                currentInvestment
            } = data.data;
 
    
            totalDepoI.textContent = totalDeposit,
            totalInvestI.textContent = totalInvestment,
            totalWithI.textContent = totalWithdrawal,
            currentInvestI.textContent = currentInvestment.amount,
            walletBalI.textContent = walletBalance
            

        } catch (error) {
            // console.log(error)
            return error;
        }
    }else{
        redirectToLogin();
    }


}

window.onload = dashboard;