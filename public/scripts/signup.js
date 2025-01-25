const baseUrl = "/api/v1/auth/";

function clearErrors() {
    const errMsg = document.getElementById('error-message');
    errMsg.textContent = '';
}

function displayError(msg) {
    const errMsg = document.getElementById("error-message");
    errMsg.innerHTML += `<p class="text-center lead mb-4">${msg}</p>`;
    setTimeout(clearErrors, 7000);
}

function showSuccessModal() {
    const modal = document.getElementById("success-modal");
    modal.style.display = "block";

    const okayButton = document.getElementById("modal-ok-btn");
    okayButton.addEventListener("click", () => {
        modal.style.display = "none"; // Close the modal
        window.location.href = "../pages/login.html"; // Redirect to login page
    });
}

async function signupBtn() {
    const usernameInput = document.getElementById("usernameInput");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const confirmPasswordInput = document.getElementById("confirmPasswordInput");
    const countryInput = document.getElementById("countryInput");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const form = document.getElementById("form");
    const btn = document.getElementById("sbtn");

    let username = usernameInput.value.trim();
    let email = emailInput.value.trim();
    let password = passwordInput.value;
    let confirmPassword = confirmPasswordInput.value;
    let country = countryInput.value;

    clearErrors();

    if (!username || !email || !password || !confirmPassword || !country) {
        displayError('Please provide the needed value(s)');
        return;
    }

    if (!emailRegex.test(email)) {
        displayError('Email is not valid!');
        return;
    }

    if (password.length < 8) {
        displayError('Password should be at least 8 characters');
        return;
    }

    if (password !== confirmPassword) {
        displayError("Password and confirm password do not match");
        return;
    }

    const data = {
        username,
        email,
        password,
        confirmPassword,
        country
    };

    btn.textContent = 'Please wait...';
    btn.disabled = true;
    form.disabled = true;

    try {
        const response = await fetch(baseUrl + 'signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (!response.ok) {
            const resp = await response.json();
            // displayError(resp.msg || 'Something went wrong');
            displayError(resp.error);
            console.log(resp)
            btn.textContent = 'Sign up';
            btn.disabled = false;
            form.disabled = false;
            return;
        }

        const resp = await response.json();

        // Show success modal
        showSuccessModal();

        // Clear form inputs
        usernameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        countryInput.value = '';

        btn.textContent = 'Sign up';
        btn.disabled = false;
        form.disabled = false;

    } catch (error) {
        console.error(error);
        displayError("An error occurred!");
        btn.textContent = 'Sign up';
        btn.disabled = false;
        form.disabled = false;
    }
}
