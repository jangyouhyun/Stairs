const express = require('express');
const router = express.Router();
var db = require('../db.js'); 
const path = require('path');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 사용자 정보 API
 */

/**
 * @swagger
 * /get_user_info:
 *   get:
 *     summary: 사용자 정보 가져오기
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 사용자의 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: string
 *                   description: 사용자 ID
 *                 nickname:
 *                   type: string
 *                   description: 사용자 이름
 *                 email:
 *                   type: string
 *                   description: 사용자 이메일
 *                 phone_number:
 *                   type: string
 *                   description: 사용자 전화번호
 *                 birth:
 *                   type: string
 *                   format: date
 *                   description: 사용자 생년월일
 *                 gender:
 *                   type: string
 *                   description: 사용자 성별
 *                 imagePath:
 *                   type: string
 *                   description: 사용자 이미지 경로
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
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


  /**
 * @swagger
 * /get-initial-input/{bookId}/{userId}:
 *   get:
 *     summary: 특정 책과 사용자에 대한 초기 입력 가져오기
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: 책 ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 초기 입력 내용을 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 content:
 *                   type: string
 *                   description: 초기 입력 내용
 *       404:
 *         description: 초기 입력을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
  router.get('/get-initial-input/:bookId/:userId', function (req, res) {
    const { bookId, userId } = req.params;

    // 데이터베이스에서 bookId와 userId에 맞는, input_count가 최대인 content 조회
    const query = `
        SELECT content 
        FROM init_input 
        WHERE book_id = ? AND user_id = ? 
        ORDER BY input_count DESC 
        LIMIT 1;
    `;

    db.query(query, [bookId, userId], function (error, results) {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }

        if (results.length > 0) {
            // 데이터가 존재하면 content 반환
            const initialInput = results[0].content;
            res.json({ success: true, content: initialInput });
        } else {
            // 데이터가 없을 경우
            res.status(404).json({ success: false, message: '해당 초기 입력을 찾을 수 없습니다.' });
        }
    });
});


module.exports = router;
