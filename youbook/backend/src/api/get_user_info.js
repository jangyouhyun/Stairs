const express = require('express');
const router = express.Router();
var db = require('../db.js'); 
const path = require('path');

// 사용자 이름+프로필 사진 가져오기
router.get('/get_user_info', (req, res) => {
	const userId = req.session.nickname;

	db.query('SELECT name, image_path FROM user_info WHERE id = ?', [userId], (error, results) => {
	  if (error) {
		return res.status(500).json({ success: false, message: 'Internal server error' });
	  }
	  if (results.length > 0) {
		const user = results[0];
		res.json({
		  success: true,
		  nickname: user.name,
		  imagePath: user.image_path 
		});
	  } else {
		res.json({ success: false, message: 'User not found' });
	  }
	});
  });

module.exports = router;
