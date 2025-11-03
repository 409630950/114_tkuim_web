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

const resetAppBtn = document.getElementById("resetApp");

const USERS_KEY = "mypetUsers";
const CURRENT_USER_KEY = "mypetCurrent";

let lastVaccineCalc = null;
let lastFeedingCalc = null;
let lastHealthData = null;

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

  const savedData = JSON.parse(localStorage.getItem("petData") || "null");
  if (savedData) {
    document.getElementById("petName").value = savedData.name || "";
    document.getElementById("petBreed").value = savedData.breed || "";
    document.getElementById("petAge").value = savedData.age ?? "";
    document.getElementById("petWeight").value = savedData.weight ?? "";
    if (savedData.gender) document.getElementById("petGender").value = savedData.gender;
    showHealthResult(savedData);
  }

  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "日間模式";
  }

  renderHistory();

  document.querySelector("#saveVaccineBtn") && (document.querySelector("#saveVaccineBtn").disabled = true);
  document.querySelector("#saveFeedingBtn") && (document.querySelector("#saveFeedingBtn").disabled = true);

  const saveBundleBtn = document.querySelector("#saveBundleBtn");
  if (saveBundleBtn) {
    saveBundleBtn.disabled = true;
    saveBundleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      saveBundleHistory();
    });
  }

  const clearBtn = document.querySelector("#clearHistoryBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("確定清空歷史紀錄？")) {
        localStorage.removeItem("petHistory");
        renderHistory();
      }
    });
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
  saveHealthHistory(petData);
  lastHealthData = { ...petData, status: getHealthStatus(breed, weight) };
  updateBundleButtonState();
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
  if (status === "under") { message = `${pet.name}（${genderText}）太瘦囉，要多吃點喔～`; colorClass = "text-primary"; }
  else if (status === "over") { message = `${pet.name}（${genderText}）有點胖胖的，要少吃零食喔～`; colorClass = "text-danger"; }
  else { message = `${pet.name}（${genderText}）體態剛剛好，健康又可愛 `; colorClass = "text-success"; }
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
  if (!name || !email || !password) return setAuthMsg("請完整填寫欄位", "danger");
  if (!/^\S+@\S+\.\S+$/.test(email)) return setAuthMsg("Email 格式不正確", "danger");
  if (password.length < 6) return setAuthMsg("密碼至少 6 碼", "danger");
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  if (users[email]) return setAuthMsg("此 Email 已註冊，請直接登入", "warning");
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
  if (!email || !password) return setAuthMsg("請輸入 Email 與密碼", "danger");
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  const user = users[email];
  if (!user || user.password !== password) return setAuthMsg("帳號或密碼錯誤", "danger");
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
    let level = "未輸入", color = "text-muted";
    if (value.length === 0) { level = "未輸入"; color = "text-muted"; }
    else if (value.length < 6) { level = "弱（太短）"; color = "text-danger"; }
    else {
      const hasLetters = /[a-zA-Z]/.test(value);
      const hasNumbers = /[0-9]/.test(value);
      const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const score = [hasLetters, hasNumbers, hasSymbols].filter(Boolean).length;
      if (score === 1) { level = "弱"; color = "text-danger"; }
      else if (score === 2) { level = "中"; color = "text-warning"; }
      else { level = "強"; color = "text-success"; }
    }
    strengthHint.textContent = `強度：${level}`;
    strengthHint.className = `form-text ${color}`;
  });
}

if (resetAppBtn) {
  resetAppBtn.addEventListener("click", () => {
    if (confirm("確定要清除所有系統資料嗎？（帳號、登入與寵物資料都會消失）")) {
      localStorage.clear();
      location.reload();
    }
  });
}

function saveHealthHistory(pet) {
  const status = getHealthStatus(pet.breed, pet.weight);
  const record = {
    type: "health",
    time: new Date().toISOString(),
    name: pet.name,
    breed: pet.breed,
    payload: { weight: pet.weight, status }
  };
  pushHistory(record);
}

function saveVaccineHistory({ fvrcpNext, rabiesNext }) {
  const pet = JSON.parse(localStorage.getItem("petData") || "null");
  if (!pet) return;
  const record = {
    type: "vaccine",
    time: new Date().toISOString(),
    name: pet.name || "",
    breed: pet.breed || "",
    payload: {
      fvrcpNext: fvrcpNext ? fmt(fvrcpNext) : null,
      rabiesNext: rabiesNext ? fmt(rabiesNext) : null
    }
  };
  pushHistory(record);
}

function saveFeedingHistory(calc) {
  if (!calc) return;
  const pet = JSON.parse(localStorage.getItem("petData") || "null");
  if (!pet) return;
  const record = {
    type: "feeding",
    time: new Date().toISOString(),
    name: pet.name || "",
    breed: pet.breed || "",
    payload: {
      grams: calc.grams,
      kcal: calc.kcal,
      kcal100: calc.kcal100,
      activity: calc.activityLabel
    }
  };
  pushHistory(record);
}

function saveBundleHistory() {
  const pet = JSON.parse(localStorage.getItem("petData") || "null");
  if (!pet) { alert("請先填寫並儲存基本資料"); return; }
  if (!lastHealthData && !lastFeedingCalc && !lastVaccineCalc) { alert("目前沒有可整合的內容"); return; }

  const record = {
    type: "bundle",
    time: new Date().toISOString(),
    name: pet.name || "",
    breed: pet.breed || "",
    payload: {
      health: lastHealthData ? { weight: lastHealthData.weight, status: getHealthStatus(lastHealthData.breed, lastHealthData.weight) } : null,
      feeding: lastFeedingCalc ? { grams: lastFeedingCalc.grams, kcal: lastFeedingCalc.kcal, kcal100: lastFeedingCalc.kcal100, activity: lastFeedingCalc.activityLabel } : null,
      vaccine: lastVaccineCalc ? { fvrcpNext: lastVaccineCalc.fvrcpNext ? fmt(lastVaccineCalc.fvrcpNext) : null, rabiesNext: lastVaccineCalc.rabiesNext ? fmt(lastVaccineCalc.rabiesNext) : null } : null
    }
  };
  pushHistory(record);
  document.querySelector("#saveBundleBtn").disabled = true;
}

function pushHistory(record) {
  const list = JSON.parse(localStorage.getItem("petHistory") || "[]");
  const last = list[list.length - 1];
  if (last) {
    const lastT = new Date(last.time).getTime();
    const now = Date.now();
    const sameType = last.type === record.type;
    const sameName = (last.name || "") === (record.name || "");
    const sameBreed = (last.breed || "") === (record.breed || "");
    const samePayload = JSON.stringify(last.payload) === JSON.stringify(record.payload);
    if (sameType && sameName && sameBreed && samePayload && Math.abs(now - lastT) < 60 * 1000) {
      renderHistory();
      return;
    }
  }
  list.push(record);
  localStorage.setItem("petHistory", JSON.stringify(list));
  renderHistory();
}

function renderHistory() {
  const wrap = document.getElementById("historyAccordion");
  const card = document.getElementById("history-card");
  const history = JSON.parse(localStorage.getItem("petHistory") || "[]");
  if (!wrap || !card) return;

  if (history.length === 0) {
    card.classList.add("d-none");
    wrap.innerHTML = "";
    return;
  }
  card.classList.remove("d-none");

  const rows = history.slice().reverse().map((rec, idx) => {
    const id = `hitem-${idx}`;
    const title = historyTitle(rec);
    const body = historyBody(rec);
    return `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading-${id}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${id}" aria-expanded="false" aria-controls="collapse-${id}">
            ${title}
          </button>
        </h2>
        <div id="collapse-${id}" class="accordion-collapse collapse" aria-labelledby="heading-${id}" data-bs-parent="#historyAccordion">
          <div class="accordion-body">${body}</div>
        </div>
      </div>
    `;
  }).join("");
  wrap.innerHTML = rows;

  updateBundleButtonState();
}

function zhStatus(s) {
  if (s === "under") return "過輕";
  if (s === "over") return "過重";
  if (s === "normal") return "正常";
  return s || "";
}

function historyTitle(rec) {
  const when = new Date(rec.time).toLocaleString();
  const who = `${rec.name || ""}（${rec.breed || ""}）`;
  if (rec.type === "health") {
    const { weight, status } = rec.payload || {};
    return `${when}｜${who}｜健康：${zhStatus(status)}（${weight ?? "-"} kg）`;
  }
  if (rec.type === "feeding") {
    const p = rec.payload || {};
    return `${when}｜${who}｜飼料建議：${p.grams ?? "-"} g／日`;
  }
  if (rec.type === "vaccine") {
    const p = rec.payload || {};
    const pieces = [];
    if (p.fvrcpNext) pieces.push(`FVRCP 次日：${p.fvrcpNext}`);
    if (p.rabiesNext) pieces.push(`狂犬 次日：${p.rabiesNext}`);
    return `${when}｜${who}｜疫苗：${pieces.join("、") || "未填資料"}`;
  }
  if (rec.type === "bundle") {
    const h = rec.payload?.health, f = rec.payload?.feeding, v = rec.payload?.vaccine;
    const segs = [];
    if (h) segs.push(`健康：${zhStatus(h.status)}（${h.weight ?? "-"} kg）`);
    if (f) segs.push(`飼料：${f.grams} g/日`);
    if (v) {
      const vs = [];
      if (v.fvrcpNext) vs.push(`FVRCP ${v.fvrcpNext}`);
      if (v.rabiesNext) vs.push(`狂犬 ${v.rabiesNext}`);
      segs.push(`疫苗：${vs.join("、") || "未填"}`);
    }
    return `${when}｜${who}｜整合：${segs.join("；")}`;
  }
  return `${when}｜${who}`;
}

function historyBody(rec) {
  if (rec.type === "health") {
    const p = rec.payload || {};
    return `
      <ul class="mb-0">
        <li>體重：${p.weight ?? "-"} kg</li>
        <li>體態：${zhStatus(p.status)}</li>
      </ul>`;
  }
  if (rec.type === "feeding") {
    const p = rec.payload || {};
    return `
      <ul class="mb-0">
        <li>建議克數：${p.grams ?? "-"} g / 日</li>
        <li>估計熱量：${p.kcal ?? "-"} kcal / 日</li>
        <li>飼料熱量：${p.kcal100 ?? "-"} kcal / 100g</li>
        <li>活動量：${p.activity || "-"}</li>
      </ul>`;
  }
  if (rec.type === "vaccine") {
    const p = rec.payload || {};
    return `
      <ul class="mb-0">
        <li>FVRCP 下次：${p.fvrcpNext || "未填上次日期"}</li>
        <li>狂犬病 下次：${p.rabiesNext || "未填上次日期"}</li>
      </ul>`;
  }
  if (rec.type === "bundle") {
    const h = rec.payload?.health, f = rec.payload?.feeding, v = rec.payload?.vaccine;
    return `
      <div class="row">
        <div class="col-md-4">
          <h6>健康</h6>
          <ul class="mb-3">
            <li>體重：${h?.weight ?? "-" } kg</li>
            <li>體態：${h ? zhStatus(h.status) : "-"}</li>
          </ul>
        </div>
        <div class="col-md-4">
          <h6>飼料建議</h6>
          <ul class="mb-3">
            <li>克數：${f?.grams ?? "-"} g / 日</li>
            <li>熱量：${f?.kcal ?? "-"} kcal / 日</li>
            <li>飼料熱量：${f?.kcal100 ?? "-"} kcal / 100g</li>
            <li>活動量：${f?.activity ?? "-"}</li>
          </ul>
        </div>
        <div class="col-md-4">
          <h6>疫苗</h6>
          <ul class="mb-0">
            <li>FVRCP：${v?.fvrcpNext ?? "未填"}</li>
            <li>狂犬病：${v?.rabiesNext ?? "未填"}</li>
          </ul>
        </div>
      </div>`;
  }
  return "";
}

function feedingAdvice(kg, activity="indoor_neutered", kcalPerGram=4) {
  if (!kg || kg <= 0) return null;
  const RER = 70 * Math.pow(kg, 0.75);
  const factorMap = { indoor_neutered: 1.3, active: 1.6, weight_loss: 1.0 };
  const kcal = RER * (factorMap[activity] || 1.3);
  const grams = Math.round(kcal / kcalPerGram);
  return { kcal: Math.round(kcal), grams };
}

document.querySelector("#calcFeedingBtn")?.addEventListener("click", (e)=>{
  e.preventDefault();
  const kg = Number(document.querySelector("#petWeight")?.value || 0);
  const activity = document.querySelector("#activityLevel")?.value || "indoor_neutered";
  const kcal100 = Number(document.querySelector("#kcalPer100g")?.value || 400);
  const kcalPerGram = kcal100 > 0 ? (kcal100/100) : 4;

  const adviceP = document.querySelector("#feedingAdviceText");
  if (!kg) {
    if (adviceP) adviceP.textContent = "請先在基本資料輸入有效的體重（公斤）。";
    lastFeedingCalc = null;
    const saveBtn = document.querySelector("#saveFeedingBtn");
    if (saveBtn) saveBtn.disabled = true;
    updateBundleButtonState();
    return;
  }
  const r = feedingAdvice(kg, activity, kcalPerGram);
  const labelMap = {indoor_neutered:"室內/已結紮",active:"活躍",weight_loss:"減重中"};
  const label = labelMap[activity] || activity;
  if (adviceP) {
    adviceP.textContent = `估計每日 ${r.kcal} kcal，建議乾糧約 ${r.grams} g（活動量：${label}；飼料 ${kcal100||400} kcal/100g）。`;
  }
  lastFeedingCalc = { kcal: r.kcal, grams: r.grams, activityLabel: label, kcal100: (kcal100||400) };
  const saveBtn = document.querySelector("#saveFeedingBtn");
  if (saveBtn) saveBtn.disabled = false;
  updateBundleButtonState();
});

document.querySelector("#saveFeedingBtn")?.addEventListener("click", (e)=>{
  e.preventDefault();
  if (!lastFeedingCalc) return alert("請先按「計算克數」。");
  saveFeedingHistory(lastFeedingCalc);
  e.currentTarget.disabled = true;
});

function addDays(date, days){ const d=new Date(date); d.setDate(d.getDate()+days); return d; }
function addYears(date, years){ const d=new Date(date); d.setFullYear(d.getFullYear()+years); return d; }
function fmt(d){ const pad=n=>String(n).padStart(2,"0"); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

function nextByInterval(lastStr, intervalKey, ageStage) {
  if (!lastStr) return null;
  const last = new Date(lastStr + "T00:00:00");
  if (isNaN(last)) return null;
  switch (intervalKey) {
    case "weeks_3": return addDays(last, 21);
    case "weeks_4": return addDays(last, 28);
    case "years_1": return addYears(last, 1);
    case "years_3": return addYears(last, 3);
    default: return ageStage === "kitten" ? addDays(last, 28) : addYears(last, 1);
  }
}

document.querySelector("#calcVaccineBtn")?.addEventListener("click",(e)=>{
  e.preventDefault();
  const ageStage = document.querySelector("#ageStage")?.value || "adult";
  const fvrcpLast = document.querySelector("#fvrcpLast")?.value || "";
  const fvrcpInterval = document.querySelector("#fvrcpInterval")?.value || (ageStage==="kitten"?"weeks_4":"years_1");
  const fvrcpNext = fvrcpLast ? nextByInterval(fvrcpLast, fvrcpInterval, ageStage) : null;
  const rabiesLast = document.querySelector("#rabiesLast")?.value || "";
  const rabiesInterval = document.querySelector("#rabiesInterval")?.value || "years_1";
  const rabiesNext = rabiesLast ? nextByInterval(rabiesLast, rabiesInterval, ageStage) : null;

  const ul = document.querySelector("#vaccineAdviceList");
  if (!ul) return;

  const tips = [];
  tips.push(`<li>年齡分類：<strong>${ageStage==="kitten"?"幼貓":"成貓"}</strong></li>`);
  if (fvrcpLast) {
    tips.push(`<li>FVRCP：上次 ${fvrcpLast} → 建議下次 <strong>${fmt(fvrcpNext)}</strong>（間隔：${{weeks_3:"3 週", weeks_4:"4 週", years_1:"1 年", years_3:"3 年"}[fvrcpInterval]}）</li>`);
  } else {
    tips.push(`<li>FVRCP：未填上次日期 → 無法計算（幼貓 3–4 週追加至約 16–20 週；成貓 1–3 年一次）。</li>`);
  }
  if (rabiesLast) {
    tips.push(`<li>狂犬病：上次 ${rabiesLast} → 建議下次 <strong>${fmt(rabiesNext)}</strong>（間隔：${{years_1:"1 年", years_3:"3 年"}[rabiesInterval]}）</li>`);
  } else {
    tips.push(`<li>狂犬病：未填上次日期 → 無法計算（多數地區 1–3 年一次）。</li>`);
  }
  ul.innerHTML = tips.join("");

  lastVaccineCalc = { fvrcpNext, rabiesNext };
  const saveBtn = document.querySelector("#saveVaccineBtn");
  if (saveBtn) saveBtn.disabled = false;
  updateBundleButtonState();
});

document.querySelector("#saveVaccineBtn")?.addEventListener("click", (e)=>{
  e.preventDefault();
  if (!lastVaccineCalc) { alert("請先按「計算下次時間」。"); return; }
  saveVaccineHistory(lastVaccineCalc);
  e.currentTarget.disabled = true;
});

function updateBundleButtonState() {
  const btn = document.querySelector("#saveBundleBtn");
  if (!btn) return;
  const hasAny = !!(lastHealthData || lastFeedingCalc || lastVaccineCalc);
  btn.disabled = !hasAny;
}
