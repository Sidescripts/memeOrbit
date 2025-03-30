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
function setToken(val, expDur){
    localStorage.setItem('accessToken', val)
    localStorage.setItem('expires', expDur)
}

async function loginFuction(){
    const emaili = document.getElementById("emailInput");
    const passwordi = document.getElementById("passwordInput");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const btn = document.getElementById("lbtn");

    // console.log(usernamei)
    let emailVal = emaili.value;
    let passwordVal = passwordi.value;
    
    // clearErrors();

    // validate inputs
    if(!emailVal || !passwordVal){
        displayError('Please provide the needed value(s)')
        return;
    }

    if(!emailRegex.test(emailVal)){
        displayError('Email is not valid!')
        return;
    }

    if(passwordVal.length < 8){
        displayError('Password should be at least 8 characters')
        return;
    }

    const data = {
        email: emailVal,
        password: passwordVal,
    }

    btn.textContent = 'Please wait.....';
    btn.disabled = true;

    try {
        const response = await fetch(baseUrl+'login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if(!response.ok){
            const resp = await response.json(); 
            displayError(resp.msg);
            
            btn.textContent = 'Login';
            btn.disabled = false;
            return;
        }
    
        if(response.ok){
            const resp = await response.json();

            const accessToken = resp.accessToken;
            const refreshToken = resp.refreshToken;

            const expiraionTime = new Date();
            expiraionTime.setTime(expiraionTime.getTime() + (1 * 24 *60 * 60))

            
            document.cookie = `accessToken=${accessToken}; expires=${expiraionTime.toUTCString()}; path=/; `;
            document.cookie = `refreshToken=${refreshToken}; expires=${expiraionTime.toUTCString()}; path=/; `;
            
            // success modal
            window.location.href = "../dashboard/dashboard.html"
            
            emailVal = '',
            passwordVal = '',
        

            btn.textContent = 'Login';
            btn.disabled = false;
           
            return  true;
        }else{
            return false;
        }
    } catch (error) {
        console.log(error)    
        btn.textContent = 'Login';
        btn.disabled = false;
        displayError("Error occurred!!")
    }

}