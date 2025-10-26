const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authenticateToken = require('../middleware/authenticateToken'); 
const axios = require('axios'); 

//取得所有咖啡廳地點
router.get('/', async (req, res) => {
  try {
    const cafes = await prisma.cafe.findMany({
      include: {
        author: {
          select: { id: true, name: true } 
        }
      }
    });
    res.json(cafes);
  } catch (error) {
    console.error('取得所有 cafes 時發生錯誤:', error);
    res.status(500).json({ message: '伺服器內部錯誤' });
  }
});

//新增咖啡廳地點
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, address, latitude, longitude, category } = req.body;
  const authorId = req.user.userId; 

  if (!title || !address || latitude == null || longitude == null) {
    return res.status(400).json({ message: '標題、地址、經緯度為必填' });
  }

  try {
    const newCafe = await prisma.cafe.create({
      data: {
        title, description, address, latitude, longitude, category,
        authorId: authorId, 
      },
      include: {
        author: {
          select: { id: true, name: true } 
        }
      }
    });
    res.status(201).json(newCafe);
  } catch (error) {
    console.error('新增 cafe 時發生錯誤:', error);
    res.status(500).json({ message: '伺服器內部錯誤' });
  }
});


router.put('/:id', authenticateToken, async (req, res) => {
  const cafeId = parseInt(req.params.id);
  const { title, description, address } = req.body; 
  const userId = req.user.userId;

  if (!title || !address) {
    return res.status(400).json({ message: '標題和地址為必填項' });
  }

  try {
  
    const cafe = await prisma.cafe.findUnique({
      where: { id: cafeId },
    });

    if (!cafe) {
      return res.status(404).json({ message: '找不到該地點' });
    }

    if (cafe.authorId !== userId) {
      return res.status(403).json({ message: '權限不足，無法修改此地點' });
    }

  
    let dataToUpdate = {
      title,
      description: description || null,
      address,
    };

    
    if (cafe.address !== address) {
      console.log('地址已變更，正在呼叫 Geocoding API...');
      
      //呼叫 Google Geocoding API
      const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_SERVER_KEY 
        }
      });

      const { data } = geocodeResponse;

      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const newLatitude = location.lat;
        const newLongitude = location.lng;
        
        console.log(`Geocoding 成功: ${newLatitude}, ${newLongitude}`);

        
        dataToUpdate.latitude = newLatitude;
        dataToUpdate.longitude = newLongitude;
      } else {
        console.warn(`Geocoding 失敗: ${data.status}`);
      }
    }

  
    const updatedCafe = await prisma.cafe.update({
      where: { id: cafeId },
      data: dataToUpdate,
      include: { 
        author: {
          select: { id: true, name: true } 
        }
      }
    });

    res.json(updatedCafe);
  } catch (error) {
    console.error(`更新 cafe (id: ${cafeId}) 時發生錯誤:`, error);
    res.status(500).json({ message: '伺服器內部錯誤' });
  }
});


//刪除指定咖啡廳地點
router.delete('/:id', authenticateToken, async (req, res) => {
  const cafeId = parseInt(req.params.id);
  const userId = req.user.userId;

  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id: cafeId },
    });

    if (!cafe) {
      return res.status(404).json({ message: '找不到該地點' });
    }

    if (cafe.authorId !== userId) {
      return res.status(403).json({ message: '權限不足，無法刪除此地點' });
    }

    await prisma.cafe.delete({
      where: { id: cafeId },
    });

    res.status(204).send(); 
  } catch (error) {
    console.error(`刪除 cafe (id: ${cafeId}) 時發生錯誤:`, error);
    res.status(500).json({ message: '伺服器內部錯誤' });
  }
});

module.exports = router;