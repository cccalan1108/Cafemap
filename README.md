# CafeMap 全端地圖應用程式


## 專案特色

* **使用者驗證**: 完整的註冊、登入、登出流程，使用 JWT (JSON Web Token) 進行狀態管理。
* **地圖互動**: 整合 Google Maps JavaScript API，在地圖上顯示所有地點。
* **完整的 CRUD 功能**:
    * **Create**: 已登入使用者可在地圖上點擊任意位置以新增地點。
    * **Read**: 所有使用者都可以看到地圖上所有的地點標記與詳細資訊。
    * **Update**: (待實現)
    * **Delete**: 使用者只能刪除自己建立的地點，實現了權限控管。
* **RESTful API**: 後端使用 Node.js + Express 搭建，提供清晰的 API 接口。
* **資料庫**: 使用 SQLite 搭配 Prisma ORM，方便資料管理與遷移。



## 技術棧

* **前端**: React, TypeScript, Vite, Axios, React Router DOM, @vis.gl/react-google-maps
* **後端**: Node.js, Express, Prisma, SQLite, bcryptjs, jsonwebtoken, cors
* **資料庫**: SQLite




### 環境變數設定

在開始前，您必須設定好環境變數。

1.  複製 `backend/.env.example` 為 `backend/.env`。
2.  複製 `frontend/.env.example` 為 `frontend/.env`。
3.  請填入您自己的 Google Maps API 金鑰和 JWT 密鑰至對應的 `.env` 檔案中。

### 後端啟動

```bash
# 進入後端資料夾
cd backend

# 安裝依賴
npm install

# 執行資料庫遷移 (僅第一次需要)
npx prisma migrate dev

# 啟動後端開發伺服器 (運行在 http://localhost:3000)
npm run dev


### 前端啟動
```bash
# (在另一個終端機中) 進入前端資料夾
cd frontend

# 安裝依賴
npm install

# 啟動前端開發伺服器 (運行在 http://localhost:5173)
npm run dev


### API 端點
### 註冊新使用者
```bash
curl -X POST -H "Content-Type: application/json" -d "{\"email\":\"newuser@example.com\", \"password\":\"password123\"}" http://localhost:3000/api/auth/register


### 登入並取得 Token
```bash
curl -X POST -H "Content-Type: application/json" -d "{\"email\":\"newuser@example.com\", \"password\":\"password123\"}" http://localhost:3000/api/auth/login

### 新增一個地點
```bash
# 將 YOUR_TOKEN_HERE 換成從登入 API 取得的 token
TOKEN="YOUR_TOKEN_HERE"
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"title\":\"CURL 測試咖啡廳\", \"address\":\"測試地址 123 號\", \"latitude\":25.04, \"longitude\":121.55}" http://localhost:3000/api/cafes

### 取得所有地點
```bash
curl http://localhost:3000/api/cafes

### 刪除一個地點 (需附帶 Token 且為本人)
```bash
# 請將 YOUR_TOKEN_HERE 換成您的 token，並將 1 換成您想刪除的地點 ID
TOKEN="YOUR_TOKEN_HERE"
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/cafes/1
