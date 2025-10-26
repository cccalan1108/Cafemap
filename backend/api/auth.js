const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => { //註冊新使用者
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email和密碼必項' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });//檢查email是否已存在
    if (existingUser) {
      return res.status(400).json({ message: '此Email已註冊' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: '註冊成功', userId: user.id });

  } catch (error) {
    console.error('註冊時發生錯誤:', error);
    res.status(500).json({ message: '伺服器內部錯誤' });
  }
});

router.post('/login', async (req, res) => {//使用者登入
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email和密碼必填' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email或密碼錯誤' }); // 401 Unauthorized
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email或密碼錯誤' });
    }

    const token = jwt.sign( //密碼驗證成功
      { userId: user.id, email: user.email }, 
      process.env.JWT_SECRET,                  
      { expiresIn: '1d' }                       
    );
    
    res.json({ message: '登入成功', token });

  } catch (error) {
    console.error('登入時發生錯誤:', error);
    res.status(500).json({ message: '伺服器內部錯誤' });
  }
});


module.exports = router;