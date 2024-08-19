const express = require('express');
const router = express.Router();
var db = require('../src/db.js'); 


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
		  imagePath: user.image_path  // 기본 프로필 이미지 경로 설정
		});
	  } else {
		res.json({ success: false, message: 'User not found' });
	  }
	});
  });

// 사용자 책 정보 가져오기
router.get('/get_books', (req, res) => {
	const userId = req.session.nickname; // 세션에서 userId 가져오기
	
	if (!userId) {
	  return res.status(401).json({ success: false, message: 'User not logged in' });
	}
  
	db.query('SELECT book_id, title, create_date, image_path FROM book_list WHERE user_id = ? ORDER BY create_date DESC', [userId], (error, results) => {
	  if (error) {
		console.error('Database query error:', error);
		return res.status(500).json({ success: false, message: 'Internal server error' });
	  }
  
	  res.json({ success: true, books: results });
	});
  });
  

module.exports = router;
