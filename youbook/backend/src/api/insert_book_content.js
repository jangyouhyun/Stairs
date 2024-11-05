var express = require('express');
var router = express.Router();
var db = require('../db.js');

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: 문단 삽입 API
 */

/**
 * @swagger
 * /insert_content:
 *   post:
 *     summary: 특정 책에 새 문단 삽입
 *     tags: [Content]
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
 *               category:
 *                 type: string
 *                 description: 문단 카테고리
 *               content_order:
 *                 type: integer
 *                 description: 삽입할 문단의 순서
 *               content:
 *                 type: string
 *                 description: 새로 삽입할 문단 내용
 *     responses:
 *       200:
 *         description: 문단이 성공적으로 삽입됨
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
// 문단 삽입 API
router.post('/insert_content', function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;  // 세션에서 사용자 아이디 가져옴
    const input_count = req.body.inputCount;
    const category = req.body.category;
    const content_order = req.body.content_order;   // 삽입할 레코드의 content_order
    const content = req.body.content;  // 새롭게 삽입할 content 내용

    // 필수 값들이 있는지 확인
    if (!book_id || !user_id || !input_count || !content_order || !content) {
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

            // content_order가 같거나 큰 값에 대해 content_order를 +1 증가
            const updateOrderQuery = `
                UPDATE final_input
                SET content_order = content_order + 1
                WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order >= ?
            `;

            connection.query(updateOrderQuery, [user_id, book_id, input_count, content_order], function (err, updateResult) {
                if (err) {
                    connection.rollback(function () {
                        connection.release();
                        return res.status(500).json({ error: 'Failed to update existing content orders' });
                    });
                }

                // 새 content를 삽입
                const insertContentQuery = `
                    INSERT INTO final_input (user_id, book_id, input_count, big_title, small_title, content, content_order, category)
                    VALUES (?, ?, ?, NULL, NULL, ?, ?, ?)
                `;

                connection.query(insertContentQuery, [user_id, book_id, input_count, content, content_order, category], function (err, insertResult) {
                    if (err) {
                        connection.rollback(function () {
                            connection.release();
                            return res.status(500).json({ error: 'Failed to insert new content' });
                        });
                    }

                    // 성공적으로 삽입이 완료되면 커밋
                    connection.commit(function (err) {
                        if (err) {
                            connection.rollback(function () {
                                connection.release();
                                return res.status(500).json({ error: 'Failed to commit transaction' });
                            });
                        }

                        connection.release();
                        return res.status(200).json({ message: 'Content inserted successfully' });
                    });
                });
            });
        });
    });
});

module.exports = router;
