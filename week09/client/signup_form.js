const form = document.querySelector('#signup-form');
const fullNameInput = document.querySelector('#fullName');
const emailInput = document.querySelector('#email');
const phoneInput = document.querySelector('#phone');
const passwordInput = document.querySelector('#password');
const confirmInput = document.querySelector('#confirm');
const interestsWrap = document.querySelector('#interests');
const agreeInput = document.querySelector('#agree');
const submitBtn = document.querySelector('#submitBtn');
const resetBtn = document.querySelector('#resetBtn');
const btnSpinner = document.querySelector('#btnSpinner');
const listBtn = document.querySelector('#listBtn');
const interestCountEl = document.querySelector('#interest-count');
const toastContainer = document.querySelector('#toast');
const passwordMeter = document.querySelector('#password-meter');
const passwordBar = passwordMeter.querySelector('.bar');
const passwordMeterText = document.querySelector('#password-meter-text');
const resultEl = document.querySelector('#result');

const toast = {
  show(message) {
    const wrapper = document.createElement('div');
    wrapper.className = 'toast align-items-center text-bg-dark border-0 show mb-2';
    wrapper.setAttribute('role', 'status');
    wrapper.setAttribute('aria-live', 'polite');
    wrapper.innerHTML = '<div class="d-flex"><div class="toast-body">' + message + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button></div>';
    wrapper.querySelector('button').addEventListener('click', function () {
      wrapper.remove();
    });
    toastContainer.appendChild(wrapper);
    setTimeout(function () {
      wrapper.remove();
    }, 4000);
  }
};

function setError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message || '';
}

function updatePasswordStrength(value) {
  let score = 0;
  if (value.length >= 8) score += 30;
  if (/[A-Z]/.test(value)) score += 20;
  if (/[a-z]/.test(value)) score += 20;
  if (/[0-9]/.test(value)) score += 15;
  if (/[^A-Za-z0-9]/.test(value)) score += 15;
  if (score > 100) score = 100;
  passwordBar.style.width = score + '%';
  passwordMeter.setAttribute('aria-valuenow', String(score));
  let text = '尚未輸入';
  if (value.length === 0) {
    text = '尚未輸入';
  } else if (score < 40) {
    text = '弱（建議再加強）';
  } else if (score < 70) {
    text = '中（可以再複雜一些）';
  } else {
    text = '強（符合建議）';
  }
  passwordMeterText.textContent = '強度：' + text;
}

passwordInput.addEventListener('input', function (e) {
  updatePasswordStrength(e.target.value);
});

function getInterestCheckboxes() {
  return interestsWrap.querySelectorAll('input[type="checkbox"]');
}

function getSelectedInterests() {
  const selected = [];
  getInterestCheckboxes().forEach(function (checkbox) {
    if (checkbox.checked) {
      const label = checkbox.closest('.tag');
      const value = (label && label.dataset.value) || checkbox.value;
      selected.push(value);
    }
  });
  return selected;
}

function updateInterestCount() {
  interestCountEl.textContent = String(getSelectedInterests().length);
}

interestsWrap.addEventListener('click', function (event) {
  const label = event.target.closest('.tag');
  if (!label) return;
  const checkbox = label.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  label.classList.toggle('active', checkbox.checked);
  updateInterestCount();
  if (getSelectedInterests().length > 0) {
    setError('interests-error', '');
  }
});

interestsWrap.addEventListener('keydown', function (event) {
  if (event.key !== ' ' && event.key !== 'Enter') return;
  const label = event.target.closest('.tag');
  if (!label) return;
  event.preventDefault();
  const checkbox = label.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  label.classList.toggle('active', checkbox.checked);
  updateInterestCount();
});

function validateForm() {
  let valid = true;
  if (!fullNameInput.value.trim()) {
    setError('fullName-error', '請輸入姓名');
    valid = false;
  } else {
    setError('fullName-error', '');
  }
  if (!emailInput.value.trim()) {
    setError('email-error', '請輸入 Email');
    valid = false;
  } else if (!emailInput.checkValidity()) {
    setError('email-error', 'Email 格式不正確');
    valid = false;
  } else {
    setError('email-error', '');
  }
  if (!phoneInput.value.trim()) {
    setError('phone-error', '請輸入手機號碼');
    valid = false;
  } else if (!phoneInput.checkValidity()) {
    setError('phone-error', '手機需為 10 碼數字（例如：0912345678）');
    valid = false;
  } else {
    setError('phone-error', '');
  }
  if (!passwordInput.value) {
    setError('password-error', '請輸入密碼');
    valid = false;
  } else if (passwordInput.value.length < 8) {
    setError('password-error', '密碼至少需 8 碼');
    valid = false;
  } else {
    setError('password-error', '');
  }
  if (!confirmInput.value) {
    setError('confirm-error', '請再次輸入密碼');
    valid = false;
  } else if (confirmInput.value !== passwordInput.value) {
    setError('confirm-error', '兩次密碼輸入不一致');
    valid = false;
  } else {
    setError('confirm-error', '');
  }
  if (getSelectedInterests().length === 0) {
    setError('interests-error', '請至少選擇 1 個興趣');
    valid = false;
  } else {
    setError('interests-error', '');
  }
  if (!agreeInput.checked) {
    setError('agree-error', '請勾選同意服務條款');
    valid = false;
  } else {
    setError('agree-error', '');
  }
  return valid;
}

async function submitSignup(data) {
  const response = await fetch('http://localhost:3001/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const payload = await response.json().catch(function () {
    return {};
  });
  if (!response.ok) {
    throw new Error(payload.error || '報名失敗');
  }
  return payload;
}

async function fetchSignupList() {
  const response = await fetch('http://localhost:3001/api/signup');
  const payload = await response.json().catch(function () {
    return {};
  });
  if (!response.ok) {
    throw new Error(payload.error || '取得清單失敗');
  }
  return payload;
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const isValid = validateForm();
  if (!isValid) {
    toast.show('請先修正表單錯誤再送出');
    return;
  }
  const payload = {
    name: fullNameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    password: passwordInput.value,
    confirmPassword: confirmInput.value,
    interests: getSelectedInterests(),
    terms: agreeInput.checked
  };
  try {
    submitBtn.disabled = true;
    btnSpinner.classList.remove('d-none');
    submitBtn.lastChild.textContent = ' 送出中...';
    resultEl.textContent = '';
    const result = await submitSignup(payload);
    toast.show(result.message || '報名成功');
    form.reset();
    updateInterestCount();
    updatePasswordStrength('');
    setError('agree-error', '');
  } catch (error) {
    toast.show(error.message || '報名失敗');
  } finally {
    submitBtn.disabled = false;
    btnSpinner.classList.add('d-none');
    submitBtn.lastChild.textContent = ' 送出';
  }
});

resetBtn.addEventListener('click', function () {
  form.reset();
  setError('fullName-error', '');
  setError('email-error', '');
  setError('phone-error', '');
  setError('password-error', '');
  setError('confirm-error', '');
  setError('interests-error', '');
  setError('agree-error', '');
  getInterestCheckboxes().forEach(function (cb) {
    cb.checked = false;
    const label = cb.closest('.tag');
    if (label) label.classList.remove('active');
  });
  updateInterestCount();
  updatePasswordStrength('');
  resultEl.textContent = '';
});

listBtn.addEventListener('click', async function () {
  try {
    resultEl.textContent = '讀取中...';
    const list = await fetchSignupList();
    resultEl.textContent = JSON.stringify(list, null, 2);
  } catch (error) {
    resultEl.textContent = '錯誤：' + (error.message || '取得清單失敗');
  }
});

updateInterestCount();
updatePasswordStrength('');
