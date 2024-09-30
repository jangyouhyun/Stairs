const express = require('express');
const router = express.Router();
var db = require('../db.js'); 
const path = require('path');

// 사용자 정보 가져오기
router.get('/get_user_info', (req, res) => {
	const userId = req.session.nickname;
  
	db.query(
	  'SELECT id, name, email, phone_number, birth, gender, image_path FROM user_info WHERE id = ?',
	  [userId],
	  (error, results) => {
		if (error) {
		  return res.status(500).json({ success: false, message: 'Internal server error' });
		}
		if (results.length > 0) {
		  const user = results[0];
		  res.json({
			success: true,
			id: userId, // 사용자 ID 포함
			nickname: user.name,
			email: user.email,
			phone_number: user.phone_number,
			birth: user.birth,
			gender: user.gender,
			imagePath: user.image_path || null
		  });
		} else {
		  res.json({ success: false, message: 'User not found' });
		}
	  }
	);
  });
  

module.exports = router;
