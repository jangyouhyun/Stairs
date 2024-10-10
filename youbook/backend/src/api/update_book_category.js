var express = require('express');
var router = express.Router();
var db = require('../db.js');

// 문단 내부 내용 변경 API 
router.post('/update_category', function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;  // 세션에서 사용자 아이디 가져옴
    const input_count = req.body.inputCount;
    const content_order = req.body.content_order;   // 업데이트할 레코드의 content_order
    const category = req.body.category;  // 새롭게 업데이트할 content 내용

    // 필수 값들이 있는지 확인
    if (!book_id || !user_id || !input_count || !content_order || !content) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    // content 업데이트 쿼리
    const updateContentQuery = `
        UPDATE final_input
        SET category = ?
        WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order = ?
    `;

    // 데이터베이스에서 업데이트 수행
    db.query(updateContentQuery, [content, user_id, book_id, input_count, content_order], function (err, results) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update content' });
        }

        // 업데이트가 성공적으로 이루어졌는지 확인
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'No matching record found' });
        }

        // 성공적으로 업데이트한 경우
        return res.status(200).json({ message: 'Content updated successfully' });
    });
});

module.exports = router;
