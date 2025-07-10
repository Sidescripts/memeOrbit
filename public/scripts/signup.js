const BASE_URL = "/api/v1/auth/";
const ERROR_DISPLAY_DURATION = 7000;

// DOM Elements
const elements = {
    errorMessage: document.getElementById('error-message'),
    successModal: document.getElementById("success-modal"),
    modalOkButton: document.getElementById("modal-ok-btn"),
    form: document.getElementById("form"),
    signupButton: document.getElementById("sbtn"),
    inputs: {
        username: document.getElementById("usernameInput"),
        email: document.getElementById("emailInput"),
        password: document.getElementById("passwordInput"),
        confirmPassword: document.getElementById("confirmPasswordInput"),
        country: document.getElementById("countryInput")
    }
};

// Validation patterns
const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Utility functions
const clearErrors = () => {
    elements.errorMessage.textContent = '';
};

const displayError = (msg) => {
    elements.errorMessage.innerHTML += `<p class="text-center lead mb-4">${msg}</p>`;
    setTimeout(clearErrors, ERROR_DISPLAY_DURATION);
};

const showSuccessModal = () => {
    elements.successModal.style.display = "block";
    elements.modalOkButton.addEventListener("click", () => {
        elements.successModal.style.display = "none";
        window.location.href = "../dashboard/dashboard.html";
    }, { once: true });
};

const getFormData = () => {
    return {
        username: elements.inputs.username.value.trim(),
        email: elements.inputs.email.value.trim(),
        password: elements.inputs.password.value,
        confirmPassword: elements.inputs.confirmPassword.value,
        country: elements.inputs.country.value
    };
};

const validateFormData = ({ username, email, password, confirmPassword, country }) => {
    if (!username || !email || !password || !confirmPassword || !country) {
        displayError('Please provide all required fields');
        return false;
    }

    if (!patterns.email.test(email)) {
        displayError('Please enter a valid email address');
        return false;
    }

    if (password.length < 8) {
        displayError('Password must be at least 8 characters long');
        return false;
    }

    if (password !== confirmPassword) {
        displayError("Passwords do not match");
        return false;
    }

    return true;
};

const setLoadingState = (isLoading) => {
    elements.signupButton.textContent = isLoading ? 'Please wait...' : 'Sign up';
    elements.signupButton.disabled = isLoading;
    elements.form.disabled = isLoading;
};

const resetForm = () => {
    Object.values(elements.inputs).forEach(input => {
        if (input.type !== 'submit') input.value = '';
    });
};

const saveAuthDataToLocalStorage = (authData) => {
    localStorage.setItem('username', authData.username);
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
};

const handleSignupSuccess = (responseData) => {
    // Save auth data to localStorage
    saveAuthDataToLocalStorage({
        username: responseData.username || getFormData().username,
        accessToken: responseData.accessToken,
        refreshToken: responseData.refreshToken
    });
    
    showSuccessModal();
    resetForm();
};

const handleApiError = async (response) => {
    try {
        const errorData = await response.json();
        displayError(errorData.message || 'Something went wrong');
    } catch (e) {
        console.log(e)
        displayError('Failed to process error response');
    }
};

// Main signup function
const signup = async () => {
    clearErrors();
    const formData = getFormData();

    if (!validateFormData(formData)) return;

    setLoadingState(true);

    try {
        const response = await fetch(`${BASE_URL}signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });

        if (response.ok) {
            const responseData = await response.json();
            handleSignupSuccess(responseData);
        } else {
            await handleApiError(response);
        }
    } catch (error) {
        console.error('Signup error:', error);
        displayError(error.message || "Network error. Please try again.");
    } finally {
        setLoadingState(false);
    }
};

// Event listener assignment
elements.signupButton.addEventListener('click', signup);