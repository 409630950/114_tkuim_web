
const form = document.getElementById("pet-form");
const resultCard = document.getElementById("result-card");
const healthResult = document.getElementById("healthResult");
const themeToggle = document.getElementById("theme-toggle");
const weightInput = document.getElementById("petWeight");
const breedSelect = document.getElementById("petBreed");
const genderSelect = document.getElementById("petGender");
const weightHint = document.getElementById("weightHint");


const authForm = document.getElementById("auth-form");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authMsg = document.getElementById("authMsg");
const welcomeBar = document.getElementById("welcomeBar");
const currentUserName = document.getElementById("currentUserName");

const USERS_KEY = "mypetUsers";
const CURRENT_USER_KEY = "mypetCurrent";


const idealWeight = {
  "米克斯": [3, 6],
  "曼赤肯": [2, 4],
  "布偶貓": [4, 7],
  "英短貓": [3.5, 6.5],
  "緬因貓": [4.5, 9.5],
  "其他": [3, 6]
};


window.addEventListener("DOMContentLoaded", () => {
  const currentEmail = localStorage.getItem(CURRENT_USER_KEY);
  if (currentEmail) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    const user = users[currentEmail];
    if (user) {
      showLoggedIn(user.name);
      setAppEnabled(true);
    }
  } else {
    showLoggedOut();
    setAppEnabled(false);
  }


  const savedData = JSON.parse(localStorage.getItem("petData"));
  if (savedData) {
    document.getElementById("petName").value = savedData.name;
    document.getElementById("petBreed").value = savedData.breed;
    document.getElementById("petAge").value = savedData.age;
    document.getElementById("petWeight").value = savedData.weight;
    if (savedData.gender) document.getElementById("petGender").value = savedData.gender;
    showHealthResult(savedData);
  }


  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "日間模式";
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const name = document.getElementById("petName").value.trim();
  const breed = document.getElementById("petBreed").value;
  const age = parseFloat(document.getElementById("petAge").value);
  const gender = document.getElementById("petGender").value;
  const weight = parseFloat(document.getElementById("petWeight").value);

  const petData = { name, breed, age, gender, weight };
  localStorage.setItem("petData", JSON.stringify(petData));

  showHealthResult(petData);
});

function getHealthStatus(breed, weight) {
  const [min, max] = idealWeight[breed] || [3, 6];
  if (weight < min) return "under";
  if (weight > max) return "over";
  return "normal";
}

function showHealthResult(pet) {
  const status = getHealthStatus(pet.breed, pet.weight);
  const genderText = pet.gender === "母" ? "母貓" : pet.gender === "公" ? "公貓" : "貓咪";
  let message = "", colorClass = "";

  if (status === "under") {
    message = `${pet.name}（${genderText}）太瘦囉，要多吃點喔～`;
    colorClass = "text-primary";
  } else if (status === "over") {
    message = `${pet.name}（${genderText}）有點胖胖的，要少吃零食喔～`;
    colorClass = "text-danger";
  } else {
    message = `${pet.name}（${genderText}）體態剛剛好，健康又可愛 `;
    colorClass = "text-success";
  }

  healthResult.innerHTML = `<span class="${colorClass}">${message}</span>`;
  resultCard.classList.remove("d-none");
  resultCard.classList.add("fade-in");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDark ? "日間模式" : "夜間模式";
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
});

weightInput.addEventListener("input", updateWeightColor);
breedSelect.addEventListener("change", updateWeightColor);

function updateWeightColor() {
  const breed = breedSelect.value;
  const weight = parseFloat(weightInput.value);
  if (!breed || isNaN(weight)) {
    weightInput.style.border = "1px solid #ced4da";
    weightInput.style.backgroundColor = "#fff";
    weightHint.textContent = "狀態：尚未輸入";
    weightHint.className = "form-text text-muted";
    return;
  }

  const [min, max] = idealWeight[breed];
  if (weight < min) {
    weightInput.style.border = "2px solid #3498db";
    weightInput.style.backgroundColor = "#e6f3ff";
    weightHint.textContent = "狀態：過輕";
    weightHint.className = "form-text text-primary";
  } else if (weight > max) {
    weightInput.style.border = "2px solid #e74c3c";
    weightInput.style.backgroundColor = "#ffe6e6";
    weightHint.textContent = "狀態：過重";
    weightHint.className = "form-text text-danger";
  } else {
    weightInput.style.border = "2px solid #27ae60";
    weightInput.style.backgroundColor = "#eaffea";
    weightHint.textContent = "狀態：正常";
    weightHint.className = "form-text text-success";
  }
}

registerBtn.addEventListener("click", () => {
  const name = authName.value.trim();
  const email = authEmail.value.trim().toLowerCase();
  const password = authPassword.value;

  if (!name || !email || !password)
    return setAuthMsg("請完整填寫欄位", "danger");
  if (!/^\S+@\S+\.\S+$/.test(email))
    return setAuthMsg("Email 格式不正確", "danger");
  if (password.length < 6)
    return setAuthMsg("密碼至少 6 碼", "danger");

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  if (users[email])
    return setAuthMsg("此 Email 已註冊，請直接登入", "warning");

  users[email] = { name, password };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, email);

  showLoggedIn(name);
  setAppEnabled(true);
  setAuthMsg("註冊成功，已自動登入！", "success");
  authForm.reset();
});

loginBtn.addEventListener("click", () => {
  const email = authEmail.value.trim().toLowerCase();
  const password = authPassword.value;

  if (!email || !password)
    return setAuthMsg("請輸入 Email 與密碼", "danger");

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  const user = users[email];
  if (!user || user.password !== password)
    return setAuthMsg("帳號或密碼錯誤", "danger");

  localStorage.setItem(CURRENT_USER_KEY, email);
  showLoggedIn(user.name);
  setAppEnabled(true);
  setAuthMsg("登入成功！", "success");
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  showLoggedOut();
  setAppEnabled(false);
  setAuthMsg("已登出", "secondary");
});

function showLoggedIn(name) {
  welcomeBar.classList.remove("d-none");
  authForm.classList.add("d-none");
  currentUserName.textContent = name;
}
function showLoggedOut() {
  welcomeBar.classList.add("d-none");
  authForm.classList.remove("d-none");
  currentUserName.textContent = "";
}
function setAuthMsg(text, type = "muted") {
  authMsg.textContent = text;
  authMsg.className = `text-${type}`;
}
function setAppEnabled(enabled) {
  const inputs = [
    document.getElementById("petName"),
    document.getElementById("petBreed"),
    document.getElementById("petAge"),
    document.getElementById("petGender"),
    document.getElementById("petWeight"),
    document.querySelector("#pet-form button[type=submit]")
  ];
  inputs.forEach(el => el && (el.disabled = !enabled));
}

const passwordInput = document.getElementById("authPassword");
const strengthHint = document.getElementById("passwordStrength");

if (passwordInput && strengthHint) {
  passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;
    let level = "未輸入";
    let color = "text-muted";

    if (value.length === 0) {
      level = "未輸入";
      color = "text-muted";
    } else if (value.length < 6) {
      level = "弱（太短）";
      color = "text-danger";
    } else {
      const hasLetters = /[a-zA-Z]/.test(value);
      const hasNumbers = /[0-9]/.test(value);
      const hasSymbols = /[!@#$%^&*(),.?\":{}|<>]/.test(value);
      const score = [hasLetters, hasNumbers, hasSymbols].filter(Boolean).length;

      if (score === 1) {
        level = "弱";
        color = "text-danger";
      } else if (score === 2) {
        level = "中";
        color = "text-warning";
      } else {
        level = "強";
        color = "text-success";
      }
    }

    strengthHint.textContent = `強度：${level}`;
    strengthHint.className = `form-text ${color}`;
  });
}
const resetAppBtn = document.getElementById("resetApp");
if (resetAppBtn) {
  resetAppBtn.addEventListener("click", () => {
    if (confirm("確定要清除所有系統資料嗎？（帳號、登入與寵物資料都會消失）")) {
      localStorage.clear();
      location.reload();
    }
  });
}
function saveHistory(pet) {
  const history = JSON.parse(localStorage.getItem("petHistory") || "[]");
  const status = getHealthStatus(pet.breed, pet.weight);
  const record = {
    time: new Date().toLocaleString(),
    name: pet.name,
    breed: pet.breed,
    weight: pet.weight,
    status: status,
  };
  history.push(record);
  localStorage.setItem("petHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const tableBody = document.getElementById("historyTableBody");
  const card = document.getElementById("history-card");
  const history = JSON.parse(localStorage.getItem("petHistory") || "[]");

  if (history.length === 0) {
    card.classList.add("d-none");
    return;
  }

  card.classList.remove("d-none");
  tableBody.innerHTML = history.map(h => `
    <tr>
      <td>${h.time}</td>
      <td>${h.name}</td>
      <td>${h.breed}</td>
      <td>${h.weight}</td>
      <td>${h.status === "under" ? "過輕" : h.status === "over" ? "過重" : "正常"}</td>
    </tr>
  `).join("");
}

function showHealthResult(pet) {
  const status = getHealthStatus(pet.breed, pet.weight);
  const genderText = pet.gender === "母" ? "母貓" : pet.gender === "公" ? "公貓" : "貓咪";
  let message = "", colorClass = "";

  if (status === "under") {
    message = `${pet.name}（${genderText}）太瘦囉，要多吃點喔～`;
    colorClass = "text-primary";
  } else if (status === "over") {
    message = `${pet.name}（${genderText}）有點胖胖的，要少吃零食喔～`;
    colorClass = "text-danger";
  } else {
    message = `${pet.name}（${genderText}）體態剛剛好，健康又可愛 `;
    colorClass = "text-success";
  }

  healthResult.innerHTML = `<span class="${colorClass}">${message}</span>`;
  resultCard.classList.remove("d-none");
  resultCard.classList.add("fade-in");

  saveHistory(pet);
}

window.addEventListener("DOMContentLoaded", renderHistory);

document.getElementById("resetApp").addEventListener("click", () => {
  if (confirm("確定要清除所有登入與寵物資料、歷史紀錄嗎？")) {
    localStorage.clear();
    location.reload();
  }
});
