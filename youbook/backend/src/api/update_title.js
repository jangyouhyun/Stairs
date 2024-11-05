var express = require('express');
var router = express.Router();
var db = require('../db.js');

/**
 * @swagger
 * tags:
 *   name: Title
 *   description: 문단의 타이틀 업데이트 API
 */

/**
 * @swagger
 * /update_title:
 *   post:
 *     summary: 문단의 big_title과 small_title을 업데이트
 *     tags: [Title]
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
 *                 description: 입력 횟수
 *               content_order:
 *                 type: integer
 *                 description: 현재 content_order 값
 *               stitle:
 *                 type: string
 *                 description: 업데이트할 small_title
 *               big_title:
 *                 type: string
 *                 description: 업데이트할 big_title
 *     responses:
 *       200:
 *         description: 타이틀이 성공적으로 업데이트됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *       400:
 *         description: 요청 데이터가 잘못됨
 *       404:
 *         description: 해당하는 레코드가 없음
 *       500:
 *         description: 서버 오류
 */
// 문단 타이틀 업데이트 API
router.post('/update_title', function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;
    const input_count = req.body.inputCount;
    const order = req.body.content_order;   // 현재 content_order 값
    const small_title = req.body.stitle;    // 업데이트할 small_title
    const big_title = req.body.big_title;   // 업데이트할 big_title

    // 필수 값들이 있는지 확인
    if (!book_id || !user_id || !input_count || !order) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    // 데이터베이스 트랜잭션을 사용하여 업데이트 처리
    db.getConnection(function (err, connection) {
        if (err) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        connection.beginTransaction(function (err) {
            if (err) {
                connection.release();
                return res.status(500).json({ error: 'Failed to start transaction' });
            }

            // big_title과 small_title을 업데이트하는 쿼리
            const updateTitleQuery = `
                UPDATE final_input
                SET big_title = ?, small_title = ?
                WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order = ?
            `;

            connection.query(updateTitleQuery, [big_title, small_title, user_id, book_id, input_count, order], function (err, result) {
                if (err) {
                    connection.rollback(function () {
                        connection.release();
                        return res.status(500).json({ error: 'Failed to update titles' });
                    });
                }

                // 성공적으로 업데이트가 완료되면 커밋
                connection.commit(function (err) {
                    if (err) {
                        connection.rollback(function () {
                            connection.release();
                            return res.status(500).json({ error: 'Failed to commit transaction' });
                        });
                    }

                    connection.release();
                    return res.status(200).json({ message: 'Titles updated successfully' });
                });
            });
        });
    });
});

module.exports = router;
