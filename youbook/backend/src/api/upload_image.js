const express = require('express');
const router = express.Router();
var db = require('../db.js'); 
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');


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
    const imagePath = `/uploads//${req.file.filename}`;
    const query = 'INSERT INTO images (path) VALUES (?)';
    db.query(query, [imagePath], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'DB 저장 오류' });
        }
        res.json({ success: true, path: imagePath });
    });
});


// base64로 받은 이미지를 저장
router.post('/upload_good', (req, res) => {
    const { image } = req.body; // base64 인코딩된 이미지 데이터
    const buffer = Buffer.from(image, 'base64'); // base64 데이터를 버퍼로 변환
    const filename = `${uuidv4()}.png`; // 파일명 설정
    const filePath = path.join(__dirname, '../../../uploads/', filename); // 저장 경로 설정

    // 파일 저장
    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            console.error("파일 저장 오류:", err);
            return res.status(500).json({ success: false, message: '파일 저장 중 오류가 발생했습니다.' });
        }
        res.json({ success: true, path: `/uploads/${filename}` });
    });
});

module.exports = router;
