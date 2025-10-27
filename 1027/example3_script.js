const form = document.getElementById('signup-form');
const password = document.getElementById('password');
const confirm = document.getElementById('confirm');
const passwordError = document.getElementById('password-error');
const confirmError = document.getElementById('confirm-error');

function checkPasswordStrength() {
  const value = password.value.trim();

  if (value.length < 8) {
    password.classList.add('is-invalid');
    password.classList.remove('is-valid');
    passwordError.textContent = '密碼至少需 8 碼。';
    return false;
  } 

  else if (
    !/[A-Za-z]/.test(value) ||
    !/[0-9]/.test(value) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(value)
  ) {
    password.classList.add('is-invalid');
    password.classList.remove('is-valid');
    passwordError.textContent = '密碼需包含英文字母、數字與特殊符號。';
    return false;
  } 
  else {
    password.classList.add('is-valid');
    password.classList.remove('is-invalid');
    passwordError.textContent = '';
    return true;
  }
}


function checkConfirmMatch() {
  if (confirm.value === '') {
    confirm.classList.remove('is-valid', 'is-invalid');
    confirmError.textContent = '';
    return false;
  }

  if (confirm.value === password.value) {
    confirm.classList.add('is-valid');
    confirm.classList.remove('is-invalid');
    confirmError.textContent = '';
    return true;
  } else {
    confirm.classList.add('is-invalid');
    confirm.classList.remove('is-valid');
    confirmError.textContent = '兩次輸入的密碼不一致。';
    return false;
  }
}

password.addEventListener('input', () => {
  checkPasswordStrength();
  checkConfirmMatch();
});

confirm.addEventListener('input', checkConfirmMatch);

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const pwOk = checkPasswordStrength();
  const matchOk = checkConfirmMatch();

  if (pwOk && matchOk) {
    alert(' 密碼設定成功！');
    form.reset();
    password.classList.remove('is-valid', 'is-invalid');
    confirm.classList.remove('is-valid', 'is-invalid');
  }
});
