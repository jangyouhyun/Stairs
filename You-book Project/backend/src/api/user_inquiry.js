var express = require('express');
var router = express.Router();
var db = require('../db.js');
const { v4: uuidv4 } = require('uuid');
router.use(express.json());

// 문의 리스트업 (사용자가 문의를 볼 수 있도록 리스트업)
router.get('/inquiries', function (req, res) {
    const userId = req.session.nickname; // 요청자의 닉네임을 userId로 사용
    db.query('SELECT * FROM inquiries WHERE user_id = ? ORDER BY create_date DESC', [userId], function (error, results) {
        if (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
            throw error;
        }
        res.json({ success: true, inquiries: results });
    });
});


// 문의 저장하기 (사용자가 문의 저장)
router.post('/inquiries', function (req, res) {
    const userId = req.session.nickname; // 사용자 닉네임을 userId로 사용
    const { title, content } = req.body;
    const inquiryId = uuidv4(); // UUID 생성
    const createDate = new Date();

    db.query(
        'INSERT INTO inquiries (inquiry_id, user_id, title, content, create_date) VALUES (?, ?, ?, ?, ?)',
        [inquiryId, userId, title, content, createDate],
        function (error, results) {
            if (error) {
                res.status(500).json({ success: false, message: 'Internal server error' });
                throw error;
            }
            res.json({ success: true, message: '문의가 성공적으로 저장되었습니다!', inquiryId: inquiryId });
        }
    );
});

// 문의 확인하기 (리스트의 문의를 눌러 확인 -> 문의 번호와 작성자 확인 후 내용 전달)
router.get('/inquiries/:inquiryId', function (req, res) {
    const inquiryId = req.params.inquiryId;
    const userId = req.session.nickname;

    db.query(
        'SELECT * FROM inquiries WHERE inquiry_id = ? AND user_id = ?',
        [inquiryId, userId],
        function (error, results) {
            if (error) {
                res.status(500).json({ success: false, message: 'Internal server error' });
                throw error;
            }
            if (results.length > 0) {
                res.json({ success: true, inquiry: results[0] });
            } else {
                res.status(404).json({ success: false, message: '문의가 존재하지 않거나 접근 권한이 없습니다.' });
            }
        }
    );
});

// 문의 수정하기 (사용자가 자신의 문의 수정)
router.put('/inquiries/:inquiryId', function (req, res) {
    const inquiryId = req.params.inquiryId;
    const userId = req.session.nickname;
    const { title, content } = req.body;

    db.query(
        'UPDATE inquiries SET title = ?, content = ? WHERE inquiry_id = ? AND user_id = ?',
        [title, content, inquiryId, userId],
        function (error, results) {
            if (error) {
                res.status(500).json({ success: false, message: 'Internal server error' });
                throw error;
            }
            if (results.affectedRows > 0) {
                res.json({ success: true, message: '문의가 성공적으로 수정되었습니다!' });
            } else {
                res.status(404).json({ success: false, message: '문의가 존재하지 않거나 수정할 권한이 없습니다.' });
            }
        }
    );
});

// 문의 답변하기 (관리자가 문의에 답변 저장 -> 문의 번호(uuid)와 사용자)
router.post('/inquiries/:inquiryId/answer', function (req, res) {
    const inquiryId = req.params.inquiryId;
    const { answer } = req.body; // 답변 내용
    const answerDate = new Date();

    db.query(
        'UPDATE inquiries SET answer = ?, answer_date = ? WHERE inquiry_id = ?',
        [answer, answerDate, inquiryId],
        function (error, results) {
            if (error) {
                res.status(500).json({ success: false, message: 'Internal server error' });
                throw error;
            }
            if (results.affectedRows > 0) {
                res.json({ success: true, message: '문의에 대한 답변이 성공적으로 저장되었습니다!' });
            } else {
                res.status(404).json({ success: false, message: '문의가 존재하지 않습니다.' });
            }
        }
    );
});

module.exports = router;
