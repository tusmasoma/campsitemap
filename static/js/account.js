
function accountInit() {
    showPassword()
}

function showPassword() {
    const passwordInput = document.querySelector("input[type='password']");
    const passwordCheckbox = document.querySelector(".show-password");
    const icon = document.querySelector('.show-password > i');
    
    passwordCheckbox.addEventListener( 'click' , function () {
        if(passwordInput.type === 'password'){
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye')
        } else {
            passwordInput.type = 'password'
            icon.classList.remove('fa-eye')
            icon.classList.add('fa-eye-slash')
        }
    })
}

function checkEmail() {
    const emailError = document.getElementById('email-error');
    const email = document.querySelector("input[type='email']").value;
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;

    if (!emailRegex.test(email)) {
        // email アドレスが不正な場合
        emailError.textContent = 'Email is not valid.';
        emailError.style.marginTop = '0.5rem';
        return false
    } else {
        emailError.textContent = '';
        emailError.style.marginTop = '0'
        return true
    }
}

function checkPassword() {
    const passwordError = document.getElementById('password-error')
    const passwordInput = document.querySelector("input[type='password']");

    if(passwordInput.value !== ""){
        passwordError.textContent = '';
        passwordError.style.marginTop = '0'
        return true
    } else {
        // passwordが不正な場合
        passwordError.textContent = 'Password is required.';
        passwordError.style.marginTop = '0.5rem';
        return false
    }
}

function checkSubmit() {
    const form = document.querySelector(".login__form")
    const submitButton = document.getElementById("submitButton");

    submitButton.addEventListener('click',function(e){
        e.preventDefault();
        let passwordChecked = checkPassword();
        let emailChecked = checkEmail();
        if(passwordChecked&&emailChecked){
            form.submit();
        }
    })
}