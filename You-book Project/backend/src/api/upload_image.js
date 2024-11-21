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

/**
 * @swagger
 * tags:
 *   name: Image
 *   description: 이미지 업로드 관련 API
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: 이미지 파일을 업로드하고 경로를 DB에 저장
 *     tags: [Image]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일
 *     responses:
 *       200:
 *         description: 이미지가 성공적으로 업로드되고 경로가 DB에 저장됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 성공 여부
 *                 path:
 *                   type: string
 *                   description: 저장된 이미지의 경로
 *       500:
 *         description: DB 저장 오류 또는 서버 오류
 */
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

/**
 * @swagger
 * /upload_base64:
 *   post:
 *     summary: base64 인코딩된 이미지 데이터를 업로드하고 저장
 *     tags: [Image]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 description: base64로 인코딩된 이미지 데이터
 *     responses:
 *       200:
 *         description: base64 이미지가 성공적으로 저장됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 성공 여부
 *                 path:
 *                   type: string
 *                   description: 저장된 이미지의 경로
 *       500:
 *         description: 파일 저장 오류 또는 서버 오류
 */
// base64로 받은 이미지를 저장
router.post('/upload_base64', (req, res) => {
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
