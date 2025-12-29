# PetCare 寵物掛號系統

## 一、專案簡介
本專題為「寵物掛號管理系統」，提供使用者透過前端介面進行寵物掛號資料的新增、查詢、修改與刪除。  
系統採用前後端分離架構，前端負責使用者操作與畫面呈現，後端提供 API 並將資料儲存於 MongoDB。

本專案主要展示 Web 前後端整合與 CRUD 功能實作。

---

## 二、系統功能說明
- 新增寵物掛號資料（Create）
- 查詢所有掛號資料（Read）
- 編輯既有掛號資料（Update）
- 刪除掛號資料（Delete）
- 前端表單操作即時反映資料庫內容

---

## 三、技術選型與使用工具

### 前端（Frontend）
- React
- Vite
- JavaScript
- CSS

### 後端（Backend）
- Node.js
- Express
- Mongoose

### 資料庫（Database）
- MongoDB（本機）

### 其他工具
- Git / GitHub（版本控制）
- MongoDB Compass（資料庫檢視）
- VS Code

---

## 四、系統架構說明
使用者透過前端操作表單，前端以 fetch 呼叫後端 API，  
後端接收請求後透過 Mongoose 與 MongoDB 溝通，  
最後將處理結果回傳給前端顯示。

Frontend (React)
↓
Backend API (Express)
↓
MongoDB


---

## 五、專案目錄結構

project-name/
│
├─ frontend/  前端 React 專案
│
├─ backend/  後端 Node.js 專案
│ ├─ models/
│ ├─ routes/
│ ├─ app.js
│
└─ README.md

複製程式碼

---

## 六、安裝與執行步驟（本機執行）

### 1 環境需求
請先確認已安裝：
- Node.js
- MongoDB（或 MongoDB Compass）
- Git

---

### 2 啟動 MongoDB
- 開啟 MongoDB Compass
- 連線至：
mongodb://127.0.0.1:27017

複製程式碼

---

###  3後端啟動方式
cd backend
npm install
node app.js
成功後會顯示：

arduino
複製程式碼
MongoDB connected
Backend running at http://127.0.0.1:5000
###  4前端啟動方式
cd frontend
npm install
npm run dev
瀏覽器開啟：
http://localhost:5173
七、API 規格說明
取得所有掛號資料
GET /api/appointments
新增掛號資料
bash
複製程式碼
POST /api/appointments
更新掛號資料
bash
複製程式碼
PUT /api/appointments/:id
刪除掛號資料
bash
複製程式碼
DELETE /api/appointments/:id
八、CRUD 操作流程說明
使用者於前端輸入掛號資料

前端送出請求至後端 API

後端透過 Mongoose 將資料寫入 MongoDB

MongoDB 回傳處理結果

前端即時更新畫面顯示最新資料

九、Demo 影片說明
Demo 影片展示內容包含：

系統畫面介紹

新增掛號

查詢掛號清單

編輯掛號資料

刪除掛號資料

MongoDB 資料庫即時變化

影片長度約 3~4 分鐘。

十、Git 紀錄
本專案使用 Git 進行版本控制，
Commit 紀錄超過 5 次，完整呈現開發流程。

十一、備註
本專案以前後端整合與 CRUD 功能實作為主要目標，
著重於系統穩定運作與基本功能完成。