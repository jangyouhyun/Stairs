const express = require('express');
const router = express.Router();
var db = require('../db.js'); 
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 업로드 디렉토리 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// 이미지 파일의 경로를 DB에 저장
router.post('/upload', upload.single('image'), (req, res) => {
    const imagePath = `/uploads/${req.file.filename}`;
    const query = 'INSERT INTO images (path) VALUES (?)';
    db.query(query, [imagePath], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'DB 저장 오류' });
        }
        res.json({ success: true, path: imagePath });
    });
});


module.exports = router;
