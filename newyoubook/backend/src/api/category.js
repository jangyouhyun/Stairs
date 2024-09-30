const express = require('express');
const router = express.Router();
var db = require('../db.js');

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

// 카테고리 이름 업데이트
router.post('/update_category', (req, res) => {
  const { name, new_name } = req.body;
  const userId = req.session.nickname;

  if (!name || !new_name) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }
  if (!userId) {
    console.error('User not logged in');
    return res.status(401).json({ success: false, message: 'User not logged in' });
  }

  const query = 'UPDATE category SET name = ? WHERE name = ? AND user_id = ?';
  db.query(query, [new_name, name, userId], (error, results) => {
    if (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    return res.json({ success: true, message: 'Category updated successfully' });
  });
});

// 카테고리 삭제
router.post('/delete_category', (req, res) => {
  const { name } = req.body;
  const userId = req.session.nickname;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }

  const query = 'DELETE FROM category WHERE name = ? AND user_id = ?';
  db.query(query, [name, userId], (error, results) => {
    if (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    return res.json({ success: true, message: 'Category deleted successfully' });
  });
});

router.post('/add_category', (req, res) => {
	const { name } = req.body;
	const userId = req.session.nickname;
  
	if (!name) {
	  return res.status(400).json({ success: false, message: 'Category name is required' });
	}
	if (!userId) {
	  console.error('User not logged in');
	  return res.status(401).json({ success: false, message: 'User not logged in' });
	}
  
	// 기존 카테고리 중 중복된 이름이 있는지 확인
	const checkDuplicateQuery = 'SELECT * FROM category WHERE name = ? AND user_id = ?';
	db.query(checkDuplicateQuery, [name, userId], (error, results) => {
	  if (error) {
		console.error('Error checking for duplicate category:', error);
		return res.status(500).json({ success: false, message: 'Internal server error' });
	  }
  
	  if (results.length > 0) {
		// 중복된 카테고리가 있는 경우, 사용자에게 명확한 메시지를 전달
		return res.json({ success: false, message: 'The category name already exists.' });
	  }
  
	  // 중복된 카테고리가 없을 경우, 새로운 카테고리 추가
	  const insertCategoryQuery = 'INSERT INTO category (name, user_id) VALUES (?, ?)';
	  db.query(insertCategoryQuery, [name, userId], (error, results) => {
		if (error) {
		  console.error('Error adding category:', error);
		  return res.status(500).json({ success: false, message: 'Internal server error' });
		}
  
		return res.json({ success: true, message: 'Category added successfully' });
	  });
	});
  });
  

module.exports = router;
