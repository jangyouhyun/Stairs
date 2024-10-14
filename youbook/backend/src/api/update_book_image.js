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

// book_list 이미지 업데이트 API
router.post('/update_image', upload.single('image'), function (req, res) {
    const book_id = req.body.bookId;
    const image_path = req.file ? `/uploads/${req.file.filename}` : req.body.image_path; // 업로드된 이미지 경로

    // 필수 값들이 있는지 확인
    if (!book_id || !image_path) {
        console.error('Invalid request data:', { book_id, user_id, image_path });
        return res.status(400).json({ error: 'Invalid request data' });
    }

    // 이미지 경로 업데이트 쿼리 (book_list 테이블)
    const updateImageQuery = `
        UPDATE book_list
        SET image_path = ?
        WHERE book_id = ?
    `;
    
    // 데이터베이스에서 업데이트 수행
    db.query(updateImageQuery, [image_path, book_id], function (err, results) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update image' });
        }

        // 업데이트가 성공적으로 이루어졌는지 확인
        if (results.affectedRows === 0) {
            console.warn('No matching record found:', { book_id });
            return res.status(404).json({ error: 'No matching record found' });
        }

        console.log('Image path updated successfully:', image_path);
        // 성공적으로 업데이트한 경우
        return res.status(200).json({ success: true, image_path });
    });
});

module.exports = router;