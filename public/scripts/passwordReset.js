const baseUrl = "/api/v1/auth/";

function clearErrors(){
    const errMsg = document.getElementById('error-message');
    console.log(errMsg)
    errMsg.textContent = ''
}
function displayError(msg){
    const errMsg = document.getElementById("error-message");
    errMsg.innerHTML += `<p class="text-center lead mb-4" >${msg}</p>`
    setTimeout(clearErrors, 7000)
}
function displaysuccess(msg){
    const errMsg = document.getElementById("successMsg");
    errMsg.innerHTML += `<p class="text-center lead mb-4" >${msg}</p>`
    setTimeout(clearErrors, 7000)
}

async function resetFunc() {
    const emaili = document.getElementById("emailInput");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const btn = document.getElementById("buttonBtn");

    let emailVal = emaili.value;
    
    clearErrors();

    // validate inputs
    if(!emailVal){
        displayError('Please provide the needed value(s)')
        return;
    }

    if(!emailRegex.test(emailVal)){
        displayError('Email is not valid!')
        return;
    }
    
    const data = {
        email: emailVal
    }
    btn.textContent = 'Please wait.....';
    btn.disabled = true;
    
    try {
        const response = await fetch(baseUrl+'forgot-password',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if(!response.ok){
            const resp = await response.json(); 
            btn.textContent = 'Reset Password';
            btn.disabled = false;
            displayError(resp.msg);
            return;
        }
        if(response.ok){
            const resp = await response.json();
            displaysuccess("Reset password link have been sent to your email")
            btn.textContent = 'Reset Password';
            btn.disabled = false;
            //testing purpose
            window.location.href = '../pages/new-password.html'
            return;
        }   
        emailVal = ''
    } catch (error) {
        console.log(error)
        btn.textContent = 'Reset Password';
        btn.disabled = false;
        displayError("Something went wrong!")
    }
    
};


async function resetPassword(){
    clearErrors();
    let passwordi = document.getElementById("passwordInput");
    let confirmPasswordi = document.getElementById("confirmPasswordInput");
    const urlParams = new URLSearchParams(window.location.search);

    let password = passwordi.value;
    let confirmPassword = confirmPasswordi.value;

    const email = urlParams.get("email");
    const token = urlParams.get("token");

    if(!password || !confirmPassword){
        displayError("Please provide the needed credential(s)")
        return;
    }
    if(password.length < 8){
        displayError('Password should be at least 8 characters')
        return;
        // throw new Error("Password should be at least 8 character")
    }
    if(password !== confirmPassword){
        displayError("Password must match confirm password")
        return;
    }
    const data = {email,token,password}
    try{
        const response = await fetch(baseUrl+'reset-password',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if(!response.ok){
            const resp = await response.json(); 
            displayError(resp.msg || 'Something went wrong!');
            return;
        }
        if(response.ok){
            const resp = await response.json();
            displaysuccess(resp.msg || "You have successfully changed your password!! Proceed to login to your account");
            password = "",
            confirmPassword = ""
        }
    }catch(err){
        displayError("Something went wrong. Try again!!")
        // console.log(err)
    }
}
