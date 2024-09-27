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

// Update category name
router.post('/update_category', (req, res) => {
	const { name, new_name } = req.body;
	const userId = req.session.nickname;
  
	console.log('User session nickname:', userId);
	console.log('Request body:', req.body);
  
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
  
  
  
// Delete category
router.post('/delete_category', (req, res) => {
	const { name } = req.body;
	const userId = req.session.nickname;
  
	console.log('User session nickname:', userId);
	console.log('Request body:', req.body);
  
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
  
  
  module.exports = router;
  