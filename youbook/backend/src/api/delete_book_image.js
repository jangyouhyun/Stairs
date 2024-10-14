var express = require('express');
var router = express.Router();
var db = require('../db.js');

// 문단 삭제 API
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
