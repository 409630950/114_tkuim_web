// 顯示初始化訊息
console.log("JavaScript 檔案已載入成功！");

// 取得按鈕元素
let button = document.getElementById("myButton");

// 加上點擊事件
button.addEventListener("click", function() {
  alert("你好，徐蔚杰！這是從外部 JS 顯示的訊息～");
  document.getElementById("result").textContent = "你剛剛點擊了按鈕！";
});
