const form = document.getElementById('signup-form');
const submitBtn = document.getElementById('submitBtn');
const btnSpinner = document.getElementById('btnSpinner');
const resetBtn = document.getElementById('resetBtn');
const toastBox = document.getElementById('toast');

const fullName = document.getElementById('fullName');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const password = document.getElementById('password');
const confirmPwd = document.getElementById('confirm');
const interestsWrap = document.getElementById('interests');
const interestCount = document.getElementById('interest-count');
const agree = document.getElementById('agree');

const STORAGE_KEY = 'week07.signup';


function setError(input, message) {
  const err = document.getElementById(`${input.id}-error`);
  input.setCustomValidity(message);
  if (err) err.textContent = message || '';
  input.classList.toggle('is-invalid', Boolean(message));
}
function clearError(input) { setError(input, ''); }


function validateName() {
  const v = fullName.value.trim();
  if (!v) return setError(fullName, '請輸入姓名'), false;
  clearError(fullName); return true;
}
function validateEmail() {
  const v = email.value.trim();
  if (!v) return setError(email, '請輸入 Email'), false;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(v)) return setError(email, 'Email 格式不正確'), false;
  clearError(email); return true;
}
function validatePhone() {
  const v = phone.value.trim();
  if (!v) return setError(phone, '請輸入手機號碼'), false;
  if (!/^[0-9]{10}$/.test(v)) return setError(phone, '手機需為 10 碼數字'), false;
  clearError(phone); return true;
}
function hasLetter(s){ return /[A-Za-z]/.test(s); }
function hasDigit(s){ return /[0-9]/.test(s); }
function hasSymbol(s){ return /[^A-Za-z0-9]/.test(s); }
function validatePassword() {
  const v = password.value;
  if (!v) return setError(password, '請輸入密碼'), false;
  if (v.length < 8) return setError(password, '至少 8 碼'), false;
  if (!(hasLetter(v) && hasDigit(v))) return setError(password, '需包含英文字母與數字'), false;
  clearError(password); return true;
}
function validateConfirm() {
  const v1 = password.value;
  const v2 = confirmPwd.value;
  if (!v2) return setError(confirmPwd, '請再次輸入密碼'), false;
  if (v1 !== v2) return setError(confirmPwd, '兩次密碼不一致'), false;
  clearError(confirmPwd); return true;
}
function validateInterests() {
  const boxes = interestsWrap.querySelectorAll('input[type="checkbox"]');
  const oneChecked = Array.from(boxes).some(b => b.checked);
  const err = document.getElementById('interests-error');
  if (err) err.textContent = oneChecked ? '' : '請至少選擇 1 個興趣';
  return oneChecked;
}
function validateAgree() {
  const ok = agree.checked;
  const err = document.getElementById('agree-error');
  if (err) err.textContent = ok ? '' : '須勾選同意服務條款';
  return ok;
}


const meter = document.getElementById('password-meter');
const bar = meter.querySelector('.bar');
const meterText = document.getElementById('password-meter-text');
function computeStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 25;
  if (pw.length >= 12) score += 10;
  if (hasLetter(pw)) score += 20;
  if (hasDigit(pw)) score += 20;
  if (hasSymbol(pw)) score += 25;
  return Math.min(score, 100);
}
function renderStrength(pw) {
  const s = computeStrength(pw);
  bar.style.width = s + '%';
  meter.setAttribute('aria-valuenow', s);
  let label = '弱', color = '#dc3545';
  if (s >= 70) { label = '強'; color = '#198754'; }
  else if (s >= 40) { label = '中'; color = '#fd7e14'; }
  bar.style.backgroundColor = color;
  meterText.textContent = pw ? `強度：${label}` : '強度：尚未輸入';
}


function updateInterestCount() {
  const n = interestsWrap.querySelectorAll('input[type="checkbox"]:checked').length;
  interestCount.textContent = n;
}
interestsWrap.addEventListener('click', (e) => {
  const tag = e.target.closest('.tag');
  if (!tag) return;
  const checkbox = tag.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  tag.classList.toggle('active', checkbox.checked);
  updateInterestCount();
  validateInterests();
  saveToStorage();
});

interestsWrap.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('tag')) {
    e.preventDefault(); e.target.click();
  }
});


form.addEventListener('blur', (e) => {
  const t = e.target;
  if (t === fullName) validateName();
  if (t === email) validateEmail();
  if (t === phone) validatePhone();
  if (t === password) { validatePassword(); renderStrength(password.value); }
  if (t === confirmPwd) validateConfirm();
}, true);
form.addEventListener('input', (e) => {
  const t = e.target;
  if (t === fullName && t.validationMessage) validateName();
  if (t === email && t.validationMessage) validateEmail();
  if (t === phone && t.validationMessage) validatePhone();
  if (t === password) { if (t.validationMessage) validatePassword(); renderStrength(password.value); }
  if (t === confirmPwd && t.validationMessage) validateConfirm();
  saveToStorage();
});


let agreeProgrammatic = false; 
agree.addEventListener('change', () => {
  if (agreeProgrammatic) { agreeProgrammatic = false; return; }
  if (agree.checked) {
    const ok = confirm('請確認您已詳細閱讀並同意「服務條款」。\n按「確定」即表示同意。');
    if (!ok) {
      agreeProgrammatic = true;
      agree.checked = false;
      agree.focus();
    }
  }
});


form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const checks = [
    validateName(),
    validateEmail(),
    validatePhone(),
    validatePassword(),
    validateConfirm(),
    validateInterests(),
    validateAgree(),
  ];
  if (checks.includes(false)) {
    const firstInvalid =
      [fullName, email, phone, password, confirmPwd].find(el => el.validationMessage) ||
      (!validateInterests() ? interestsWrap : null) ||
      (!validateAgree() ? agree : null);
    if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
    return;
  }


  submitBtn.disabled = true;
  btnSpinner.classList.remove('d-none');
  submitBtn.setAttribute('aria-busy', 'true');

  await new Promise(r => setTimeout(r, 1000)); 

  showToast('註冊成功！歡迎加入 🎉');
  form.reset();
 
  interestsWrap.querySelectorAll('.tag').forEach(tag => tag.classList.remove('active'));
  updateInterestCount();
  renderStrength('');

  [fullName,email,phone,password,confirmPwd].forEach(clearError);
  document.getElementById('interests-error').textContent = '';
  document.getElementById('agree-error').textContent = '';
  
  clearStorage();
  
  submitBtn.disabled = false;
  btnSpinner.classList.add('d-none');
  submitBtn.removeAttribute('aria-busy');
});


resetBtn.addEventListener('click', () => {
  form.reset();
  [fullName,email,phone,password,confirmPwd].forEach(clearError);
  interestsWrap.querySelectorAll('.tag').forEach(tag => tag.classList.remove('active'));
  updateInterestCount();
  renderStrength('');
  document.getElementById('interests-error').textContent = '';
  document.getElementById('agree-error').textContent = '';
  clearStorage();
});


function readInterests() {
  return Array.from(interestsWrap.querySelectorAll('input[type="checkbox"]'))
    .filter(b => b.checked).map(b => b.value);
}
function saveToStorage() {
  const data = {
    fullName: fullName.value,
    email: email.value,
    phone: phone.value,
    password: password.value,   
    confirm: confirmPwd.value,
    interests: readInterests()

  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function clearStorage() { localStorage.removeItem(STORAGE_KEY); }
function restoreFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { 
    updateInterestCount(); renderStrength(''); agree.checked = false; return;
  }
  try {
    const d = JSON.parse(raw);
    if (d.fullName) fullName.value = d.fullName;
    if (d.email) email.value = d.email;
    if (d.phone) phone.value = d.phone;
    if (d.password) password.value = d.password;
    if (d.confirm) confirmPwd.value = d.confirm;
    if (Array.isArray(d.interests)) {
      d.interests.forEach(val => {
        const tag = interestsWrap.querySelector(`.tag[data-value="${val}"]`);
        if (tag) {
          tag.classList.add('active');
          const cb = tag.querySelector('input[type="checkbox"]');
          cb.checked = true;
        }
      });
    }
  } catch {}
  updateInterestCount();
  renderStrength(password.value);
  agree.checked = false; 
}
restoreFromStorage();

function showToast(msg) {
  const div = document.createElement('div');
  div.className = 'toast-box mb-3';
  div.setAttribute('role','status');
  div.textContent = msg;
  toastBox.appendChild(div);
  setTimeout(() => { div.remove(); }, 2200);
}
