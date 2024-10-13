var express = require('express');
var router = express.Router();
var db = require('../db.js');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 이미지 파일 저장 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 파일을 저장할 경로
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // 파일 확장자 추출
        const filename = `${uuidv4()}${ext}`; // uuid로 고유한 파일명 생성
        cb(null, filename); // 파일명 설정
    }
});

const upload = multer({ storage: storage });

// 문단 내부 이미지 업데이트 API 
router.post('/update_image', upload.single('image'), function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;  // 세션에서 사용자 아이디 가져옴
    const input_count = req.body.inputCount;
    const content_order = req.body.content_order; // 업데이트할 레코드의 content_order
    const image = req.image ? `/uploads/${req.file.filename}` : req.image_path; // 업로드된 이미지 경로

    // 필수 값들이 있는지 확인
    if (!book_id || !user_id || !input_count || !content_order || !image_path) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    // 이미지 경로 업데이트 쿼리
    const updateImageQuery = `
        UPDATE final_input
        SET image_path = ?
        WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order = ?
    `;

    // 데이터베이스에서 업데이트 수행
    db.query(updateImageQuery, [image_path, user_id, book_id, input_count, content_order], function (err, results) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update image' });
        }

        // 업데이트가 성공적으로 이루어졌는지 확인
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'No matching record found' });
        }

        // 성공적으로 업데이트한 경우
        return res.status(200).json({ success: true, image_path });
    });
});

module.exports = router;
