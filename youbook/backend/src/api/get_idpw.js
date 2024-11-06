const express = require('express');
const router = express.Router();
var db = require('../db.js');

// 사용자 id 정보 가져오기
router.post('/get_id', (req, res) => {
	const userName = req.body.name;
	const phoneNum = req.body.phoneNum;

	if (!userName || !phoneNum) {
		return res.status(401).json({ success: false, message: 'noInput' });
	}
	
	db.query('SELECT id FROM user_info WHERE name = ? AND phone_number = ?', [userName, phoneNum], (error, results) => {
		if (error) {
			console.error('Database query error:', error);
			return res.status(500).json({ success: false, message: 'Internal server error' });
		}

		if (results.length > 0) {
			// id만 추출하여 반환
			res.json({ success: true, userId: results[0].id });
		} else {
			res.json({ success: false, message: 'User not found' });
		}
	});
});

// 존재하는 사용자인지 확인
router.post('/confirm_user', (req, res) => {
	const userId = req.body.userId;
	const userName = req.body.name;
	const phoneNum = req.body.phoneNum;

	if (!userId || !userName || !phoneNum) {
		return res.status(401).json({ success: false, message: 'noInput' });
	}

	db.query('SELECT * FROM user_info WHERE id = ? AND name = ? AND phone_number = ?', [userId, userName, phoneNum], (error, results) => {
		if (error) {
			console.error('Database query error:', error);
			return res.status(500).json({ success: false, message: 'Internal server error' });
		}

		if (results.length > 0) {
			res.json({ success: true, user: results[0] });
		} else {
			res.json({ success: false, message: 'User not found' });
		}
	});
});

// 패스워드 재설정
router.post('/reset_pw', (req, res) => {
	const userId = req.body.userId;
	const userName = req.body.name;
	const phoneNum = req.body.phoneNum;
	const newPW = req.body.newPW;

	if (!userName || !phoneNum) {
		return res.status(401).json({ success: false, message: 'noInput' });
	}
	db.query('UPDATE user_info SET pw = ? WHERE id = ? AND name = ? AND phoneNum = ? AND name = ?', [newPW, userId, userName, phoneNum], (error, results) => {
		if (error) {
			console.error('Database query error:', error);
			return res.status(500).json({ success: false, message: 'Internal server error' });
		}
		res.json({ success: true, userId: results });
	});
	res.json({ success: true, userId: results });
});

module.exports = router;