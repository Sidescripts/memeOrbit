const BASE_URL = "/api/v1/auth/";
const ERROR_DISPLAY_DURATION = 7000;

// DOM Elements
const elements = {
    errorMessage: document.getElementById('error-message'),
    form: document.getElementById("form"),
    loginButton: document.getElementById("lbtn"),
    inputs: {
        email: document.getElementById("emailInput"),
        password: document.getElementById("passwordInput"),
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

const getFormData = () => {
    return {
        email: elements.inputs.email.value.trim(),
        password: elements.inputs.password.value
    };
};

const validateFormData = ({email, password }) => {
    if (!email || !password) {
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
    return true;
};

const setLoadingState = (isLoading) => {
    elements.loginButton.textContent = isLoading ? 'Please wait...' : 'Login';
    elements.loginButton.disabled = isLoading;
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
        username: responseData.username,
        accessToken: responseData.accessToken,
        refreshToken: responseData.refreshToken
    });
    
    window.location.href = "../dashboard/dashboard.html";
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

// Main login function
const login = async () => {
    clearErrors();
    const formData = getFormData();

    if (!validateFormData(formData)) return;

    setLoadingState(true);

    try {
        const response = await fetch(`${BASE_URL}login`, {
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
        console.error('Login error:', error);
        displayError(error.message || "Network error. Please try again.");
    } finally {
        setLoadingState(false);
    }
};

// Event listener assignment
elements.loginButton.addEventListener('click', login);
