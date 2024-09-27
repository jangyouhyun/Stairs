const express = require('express');
const router = express.Router();
var db = require('../db.js'); 

// 사용자 책 정보 가져오기
router.get('/get_books', (req, res) => {
	const userId = req.session.nickname;
	if (!userId) {
	  return res.status(401).json({ success: false, message: 'User not logged in' });
	}
	db.query('SELECT book_id, title, create_date, image_path, category FROM book_list WHERE user_id = ? ORDER BY create_date DESC', [userId], (error, results) => {
	  if (error) {
		console.error('Database query error:', error);
		return res.status(500).json({ success: false, message: 'Internal server error' });
	  }
	  res.json({ success: true, books: results });
	});
  });

// 사용자 책 카테고리 가져오기
router.get('/get_category', (req, res) => {
	const userId = req.session.nickname;
	if (!userId) {
	  return res.status(401).json({ success: false, message: 'User not logged in' });
	}
	db.query('SELECT name FROM category WHERE user_id = ?', [userId], (error, results) => {
	  if (error) {
		console.error('Database query error:', error);
		return res.status(500).json({ success: false, message: 'Internal server error' });
	  }
	  res.json({ success: true, categorys: results });
	});
  });

module.exports = router;
