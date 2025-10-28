// practice6_dynamic_fields.js
// 動態欄位 + 事件委派 + 即時驗證 + 送出攔截
// ① 匯出 JSON/文字 ② localStorage 暫存/復原 ③ .is-invalid 樣式已在 HTML 內

const form = document.getElementById('dynamic-form');
const list = document.getElementById('participant-list');
const addBtn = document.getElementById('add-participant');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const countLabel = document.getElementById('count');
const exportJsonBtn = document.getElementById('export-json');
const exportTextBtn = document.getElementById('export-text');

const maxParticipants = 5;
let participantIndex = 0;

const STORAGE_KEY = 'practice6.participants';

function createParticipantCard() {
  const index = participantIndex++;
  const wrapper = document.createElement('div');
  wrapper.className = 'participant card border-0 shadow-sm';
  wrapper.dataset.index = index;
  wrapper.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <h5 class="card-title mb-0">參與者 ${index + 1}</h5>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove">移除</button>
      </div>
      <div class="mb-3">
        <label class="form-label" for="name-${index}">姓名</label>
        <input id="name-${index}" name="name-${index}" class="form-control" type="text" required aria-describedby="name-${index}-error">
        <p id="name-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
      <div class="mb-0">
        <label class="form-label" for="email-${index}">Email</label>
        <input id="email-${index}" name="email-${index}" class="form-control" type="email" required aria-describedby="email-${index}-error" inputmode="email">
        <p id="email-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
    </div>
  `;
  return wrapper;
}

function updateCount() {
  countLabel.textContent = list.children.length;
  addBtn.disabled = list.children.length >= maxParticipants;
}

function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  input.setCustomValidity(message);
  if (error) error.textContent = message || '';
  if (message) input.classList.add('is-invalid');
  else input.classList.remove('is-invalid');
}

function validateInput(input) {
  const value = input.value.trim();
  if (!value) {
    setError(input, '此欄位必填');
    return false;
  }
  if (input.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      setError(input, 'Email 格式不正確');
      return false;
    }
  }
  setError(input, '');
  return true;
}

function handleAddParticipant(prefill) {
  if (list.children.length >= maxParticipants) return;
  const participant = createParticipantCard();
  list.appendChild(participant);
  if (prefill) {
    const nameInput = participant.querySelector(`#name-${participant.dataset.index}`);
    const emailInput = participant.querySelector(`#email-${participant.dataset.index}`);
    if (prefill.name) nameInput.value = prefill.name;
    if (prefill.email) emailInput.value = prefill.email;
  }
  updateCount();
  participant.querySelector('input').focus();
  saveToStorage(); // 新增就存
}

addBtn.addEventListener('click', () => handleAddParticipant());

list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="remove"]');
  if (!button) return;
  const participant = button.closest('.participant');
  participant?.remove();
  renumber();
  updateCount();
  saveToStorage();
});

function renumber() {
  Array.from(list.children).forEach((card, idx) => {
    const title = card.querySelector('.card-title');
    if (title) title.textContent = `參與者 ${idx + 1}`;
  });
}

list.addEventListener('blur', (event) => {
  if (event.target.matches('input')) {
    validateInput(event.target);
    saveToStorage();
  }
}, true);

list.addEventListener('input', (event) => {
  if (event.target.matches('input')) {
    if (event.target.validationMessage) validateInput(event.target);
    // 輕量儲存：每次輸入也存（資料量小，足夠）
    saveToStorage();
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (list.children.length === 0) {
    alert('請至少新增一位參與者');
    handleAddParticipant();
    return;
  }

  let firstInvalid = null;
  list.querySelectorAll('input').forEach((input) => {
    const valid = validateInput(input);
    if (!valid && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';
  await new Promise((r) => setTimeout(r, 1000));

  alert('表單已送出！');
  // 成功送出後清空＆清掉暫存
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  updateCount();
  clearStorage();

  submitBtn.disabled = false;
  submitBtn.textContent = '送出';
});

resetBtn.addEventListener('click', () => {
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  updateCount();
  clearStorage();
});

/* ---------- ① 匯出功能 ---------- */

function readParticipants() {
  const data = [];
  Array.from(list.children).forEach((card) => {
    const idx = card.dataset.index;
    const name = (card.querySelector(`#name-${idx}`)?.value || '').trim();
    const email = (card.querySelector(`#email-${idx}`)?.value || '').trim();
    data.push({ name, email });
  });
  return data;
}

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}

exportJsonBtn.addEventListener('click', () => {
  const data = readParticipants();
  if (data.length === 0) {
    alert('目前沒有參與者可以匯出。');
    return;
  }
  const pretty = JSON.stringify(data, null, 2);
  download('participants.json', pretty, 'application/json;charset=utf-8');
});

exportTextBtn.addEventListener('click', () => {
  const data = readParticipants();
  if (data.length === 0) {
    alert('目前沒有參與者可以匯出。');
    return;
  }
  const lines = data.map((p, i) => `${i + 1}. ${p.name || '(未填名)'} <${p.email || '未填 Email'}>`);
  download('participants.txt', lines.join('\n'));
});

/* ---------- ② localStorage 暫存/復原 ---------- */

function saveToStorage() {
  const data = readParticipants();
  // 只要清單是空就寫空陣列，避免殘留舊資料
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

function restoreFromStorage() {
  let raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // 沒有暫存，預設給一筆空白
    handleAddParticipant();
    return;
  }
  try {
    const arr = JSON.parse(raw);
    list.innerHTML = '';
    participantIndex = 0;
    if (Array.isArray(arr) && arr.length > 0) {
      arr.forEach((p) => handleAddParticipant({ name: p.name, email: p.email }));
    } else {
      handleAddParticipant();
    }
    updateCount();
  } catch (e) {
    console.warn('restoreFromStorage 解析失敗，改為預設一筆：', e);
    handleAddParticipant();
  }
}

// 初始化：從暫存復原
restoreFromStorage();
