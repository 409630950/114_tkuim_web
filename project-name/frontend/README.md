# 114（上）網路程式設計 期末專題  
## PetCare 寵物掛號系統（前後端 CRUD）

---

## 一、專案簡介
本專題為「網路程式設計」課程之個人期末專題，主題為 **寵物掛號系統**。  
系統提供使用者一個視覺化的前端介面，可進行掛號資料的新增、查詢、修改與刪除（CRUD），並採用前後端分離的架構設計，後端以 RESTful API 為目標進行規劃。

本專案目前已完成前端完整 CRUD 操作流程，後端 API 與 MongoDB 資料庫結構已完成設計，具備後續串接能力。

---

## 二、技術選型與使用原因

### 前端
- **React（Vite）**
  - 採用元件化開發方式，方便管理表單與清單畫面
  - Vite 啟動速度快，適合課程專題開發
- **CSS（自訂樣式）**
  - 手刻版面配置與表單樣式，確保畫面一致性與可讀性

### 後端（規劃）
- **Node.js + Express**
  - 建立 RESTful API，負責資料驗證與 CRUD 操作
- **MongoDB + Mongoose**
  - 使用文件型資料庫儲存掛號資料，結構彈性高

---

## 三、系統功能說明（CRUD）

系統以「掛號（appointment）」作為主要資源，功能如下：

- **Create（新增）**
  - 使用者可填寫飼主姓名、寵物資料、掛號時間與看診原因，建立一筆掛號
- **Read（查詢）**
  - 顯示所有掛號清單
  - 可查看單筆掛號詳細資訊
- **Update（修改）**
  - 使用者可編輯既有掛號資料（時間、原因、狀態等）
- **Delete（刪除）**
  - 使用者可取消或刪除掛號資料

目前資料暫存在前端記憶體中（重新整理會清空），後續可直接串接後端 API 與 MongoDB。

---

## 四、資料結構設計（MongoDB 規劃）

appointments collection（範例欄位）：

- ownerName：String（必填）
- petName：String（必填）
- petType：String（cat / dog）
- appointmentDate：Date（必填）
- timeSlot：String（morning / afternoon / evening）
- reason：String（可選）
- status：String（booked / cancelled）
- createdAt / updatedAt：Date
