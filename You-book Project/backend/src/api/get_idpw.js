const express = require('express');
const router = express.Router();
var db = require('../db.js');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 유저 관련 API
 */

/**
 * @swagger
 * /get_id:
 *   post:
 *     summary: 사용자 ID 정보 가져오기
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *               phoneNum:
 *                 type: string
 *                 description: 사용자 전화번호
 *     responses:
 *       200:
 *         description: 사용자 ID 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 userId:
 *                   type: string
 *       401:
 *         description: 입력 값 누락
 *       500:
 *         description: 서버 오류
 */
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
			res.json({ success: true, userId: results[0].id });
		} else {
			res.json({ success: false, message: 'User not found' });
		}
	});
});

/**
 * @swagger
 * /confirm_user:
 *   post:
 *     summary: 사용자 존재 여부 확인
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 사용자 ID
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *               phoneNum:
 *                 type: string
 *                 description: 사용자 전화번호
 *     responses:
 *       200:
 *         description: 사용자 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       401:
 *         description: 입력 값 누락
 *       500:
 *         description: 서버 오류
 */
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

/**
 * @swagger
 * /reset_pw:
 *   post:
 *     summary: 사용자 비밀번호 재설정
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 사용자 ID
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *               phoneNum:
 *                 type: string
 *                 description: 사용자 전화번호
 *               newPW:
 *                 type: string
 *                 description: 새 비밀번호
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 성공 여부 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 userId:
 *                   type: string
 *       401:
 *         description: 입력 값 누락
 *       500:
 *         description: 서버 오류
 */
router.post('/reset_pw', (req, res) => {
	const userId = req.body.userId;
	const userName = req.body.name;
	const phoneNum = req.body.phoneNum;
	const newPW = req.body.newPW;

	if (!userName || !phoneNum) {
		return res.status(401).json({ success: false, message: 'noInput' });
	}
	db.query('UPDATE user_info SET pw = ? WHERE id = ? AND name = ? AND phone_number = ?', [newPW, userId, userName, phoneNum], (error, results) => {
		if (error) {
			console.error('Database query error:', error);
			return res.status(500).json({ success: false, message: 'Internal server error' });
		}
		res.json({ success: true, userId: userId });
	});
});

module.exports = router;
