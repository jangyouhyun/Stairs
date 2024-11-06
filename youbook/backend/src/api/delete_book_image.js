var express = require('express');
var router = express.Router();
var db = require('../db.js');

/**
 * @swagger
 * tags:
 *   name: Image
 *   description: 이미지 삭제 API
 */

/**
 * @swagger
 * /delete_image:
 *   post:
 *     summary: 특정 문단의 이미지 경로를 삭제 (NULL로 업데이트)
 *     tags: [Image]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: 책 ID
 *               inputCount:
 *                 type: integer
 *                 description: 문단의 입력 횟수
 *               content_order:
 *                 type: integer
 *                 description: 삭제할 이미지의 문단 순서
 *     responses:
 *       200:
 *         description: 이미지 경로가 성공적으로 삭제됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *       400:
 *         description: 요청 데이터가 유효하지 않음
 *       500:
 *         description: 데이터베이스 오류 또는 서버 오류
 */
// 이미지 삭제 API
router.post('/delete_image', function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;  // 세션에서 사용자 아이디 가져옴
    const input_count = req.body.inputCount;
    const content_order = req.body.content_order;   // 삭제할 레코드의 content_order

    // 필수 값들이 있는지 확인
    if (!book_id || !user_id || !input_count || !content_order) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    // 데이터베이스 트랜잭션을 시작하여 모든 작업을 처리
    db.getConnection(function (err, connection) {
        if (err) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        connection.beginTransaction(function (err) {
            if (err) {
                connection.release();
                return res.status(500).json({ error: 'Failed to start transaction' });
            }

            // 문단 삭제 쿼리를 실행
			const deleteImageQuery = `
			UPDATE final_input
			SET image_path = ?
			WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order = ?
		`;
			connection.query(deleteImageQuery, [user_id, book_id, input_count, content_order], function (err, deleteResult) {
			if (err) {
				connection.rollback(function () {
					connection.release();
					return res.status(500).json({ error: 'Failed to delete content' });
				});
			}});
		});
	});
});

module.exports = router;
