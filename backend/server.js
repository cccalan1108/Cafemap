require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./api/auth');//引入 API 路由
const cafeRoutes = require('./api/cafes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('後端伺服器已成功運行');
});

app.use('/api/auth', authRoutes);//掛載 API 路由
app.use('/api/cafes', cafeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`伺服器正在 http://localhost:${PORT} 運行`);
});