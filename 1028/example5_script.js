const form = document.getElementById('full-form');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const agreeBox = document.getElementById('agree');

function validateAllInputs(formElement) {
  let firstInvalid = null;
  const controls = Array.from(formElement.querySelectorAll('input, select, textarea'));
  controls.forEach((control) => {
    control.classList.remove('is-invalid');
    if (!control.checkValidity()) {
      control.classList.add('is-invalid');
      if (!firstInvalid) {
        firstInvalid = control;
      }
    }
  });
  return firstInvalid;
}

let programmaticToggle = false; 
agreeBox.addEventListener('change', () => {
  if (programmaticToggle) {
    programmaticToggle = false;
    return;
  }
  if (agreeBox.checked) {
    const ok = confirm('請確認：您已閱讀並同意〈隱私權條款〉。');
    if (!ok) {
      programmaticToggle = true;
      agreeBox.checked = false; 
      agreeBox.focus();         
    }
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';

  const firstInvalid = validateAllInputs(form);

  if (!firstInvalid && !agreeBox.checked) {
    submitBtn.disabled = false;
    submitBtn.textContent = '送出';
    alert('請先勾選並同意〈隱私權條款〉。');
    agreeBox.focus();
    return;
  }

  if (firstInvalid) {
    submitBtn.disabled = false;
    submitBtn.textContent = '送出';
    firstInvalid.focus();
    return;
  }


  await new Promise((resolve) => setTimeout(resolve, 1000));
  alert('資料已送出，感謝您的聯絡！');
  form.reset();
  submitBtn.disabled = false;
  submitBtn.textContent = '送出';
});

resetBtn.addEventListener('click', () => {
  form.reset();
  Array.from(form.elements).forEach((element) => {
    element.classList.remove('is-invalid');
  });
});

form.addEventListener('input', (event) => {
  const target = event.target;
  if (target.classList.contains('is-invalid') && target.checkValidity()) {
    target.classList.remove('is-invalid');
  }
});
