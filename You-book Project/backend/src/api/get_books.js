const express = require('express');
const router = express.Router();
var db = require('../db.js');

/**
 * @swagger
 * tags:
 *   name: Book
 *   description: 사용자 책 정보 API
 */

/**
 * @swagger
 * /get_books:
 *   get:
 *     summary: 사용자의 책 목록 가져오기
 *     tags: [Book]
 *     responses:
 *       200:
 *         description: 사용자의 책 목록을 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       book_id:
 *                         type: string
 *                         description: 책 ID
 *                       title:
 *                         type: string
 *                         description: 책 제목
 *                       create_date:
 *                         type: string
 *                         format: date
 *                         description: 책 생성 날짜
 *                       image_path:
 *                         type: string
 *                         description: 책 이미지 경로
 *                       category:
 *                         type: string
 *                         description: 책 카테고리
 *       401:
 *         description: 로그인되지 않은 사용자
 *       500:
 *         description: 데이터베이스 오류 또는 서버 오류
 */
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

// 서버 라우트 코드
router.post('/get_book_info', (req, res) => {
	const userId = req.session.nickname;
	const bookId = req.body.bookId;

	if (!userId) {
		return res.status(401).json({ success: false, message: 'User not logged in' });
	}

	db.query(
		'SELECT title, image_path, category FROM book_list WHERE user_id = ? and book_id = ?',
		[userId, bookId],
		(error, results) => {
			if (error) {
				console.error('Database query error:', error);
				return res.status(500).json({ success: false, message: 'Internal server error' });
			}
			if (results.length > 0) {
				res.json({ success: true, books: results });
			} else {
				res.json({ success: false, message: 'No book found' });
			}
		}
	);
});


module.exports = router;
