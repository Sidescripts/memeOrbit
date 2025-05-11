// const baseUrl = "/api/v1/m/dashboard";

// async function dashboard(){
//     let walletBalI = document.getElementById("accBalance");
//     let currentInvestI = document.getElementById("currentInvest");
//     let totalWithI = document.getElementById("totalWith");
//     let totalDepoI = document.getElementById("totDeposit")
//     let totalInvestI = document.getElementById("totInvest");


//     if(await isAuthenticated()){
//         const accessToken = getCookie("accessToken")
        
        
//         try {
            
//             const response = await fetch(baseUrl, {
//                 method: 'GET',
//                 mode: 'cors',
//                 headers:{
//                     'Content-Type': 'application/json',
//                     'AccessToken': accessToken
//                 },
//                 credentials: 'include',
//             });
            

//             const data = await response.json();
//             // console.log(data)
            
//             if(!response.ok){
//                 throw new Error("Request Error!") 
//             }
            
//             const {
//                 walletBalance,
//                 totalInvestment,
//                 totalWithdrawal,
//                 totalDeposit,
//                 currentInvestment.amount
//             } = data.data;
 
//             console.log(currentInvestment.amount)
    
//             totalDepoI.textContent = totalDeposit,
//             totalInvestI.textContent = totalInvestment,
//             totalWithI.textContent = totalWithdrawal,
//             walletBalI.textContent = walletBalance,
//             currentInvestI.textContent = currentInvestment.amount
            
            

//         } catch (error) {
//             // console.log(error)
//             return error;
//         }
//     }else{
//         redirectToLogin();
//     }


// }

// window.onload = dashboard;


const baseUrl = "/api/v1/m/dashboard";

async function dashboard() {
  if (!isAuthenticated()) {
    redirectToLogin();
    return;
  }

  const accessToken = getCookie("accessToken");
  const headers = {
    'Content-Type': 'application/json',
    'AccessToken': accessToken
  };

  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) throw new Error("Failed to fetch dashboard data");

    const { data } = await response.json();
    const {
      walletBalance,
      totalInvestment,
      totalWithdrawal,
      totalDeposit,
      currentInvestment
    } = data;

    // Update DOM elements
    document.getElementById("accBalance").textContent = walletBalance;
    document.getElementById("totInvest").textContent = totalInvestment;
    document.getElementById("totalWith").textContent = totalWithdrawal;
    document.getElementById("totDeposit").textContent = totalDeposit;
    document.getElementById("currentInvest").textContent = currentInvestment?.amount || 0;

  } catch (error) {
    console.error("Dashboard error:", error.message);
  }
}

window.addEventListener("load", dashboard);
