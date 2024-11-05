var express = require('express');
var router = express.Router();
var db = require('../db.js');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 프로젝트 루트 경로 기준으로 uploads 폴더 설정
        cb(null, path.join(__dirname, '../../../uploads/')); // youbook/uploads/ 경로에 저장
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // 파일 확장자 추출
        const filename = `${uuidv4()}${ext}`; // uuid로 고유한 파일명 생성
        cb(null, filename); // 파일명 설정
    }
});


const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: Image
 *   description: 문단의 이미지 업데이트 API
 */

/**
 * @swagger
 * /update_image:
 *   post:
 *     summary: 문단의 이미지를 업데이트
 *     tags: [Image]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 description: 업데이트할 레코드의 content_order
 *               whatData:
 *                 type: integer
 *                 description: 데이터 타입 (1 = 업로드된 파일, 2 = AI 생성 이미지 경로, 3 = URL 리다이렉트)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일 (whatData가 1일 때 필요)
 *               image_path:
 *                 type: string
 *                 description: AI로 생성된 이미지 경로 (whatData가 2일 때 필요)
 *     responses:
 *       200:
 *         description: 이미지가 성공적으로 업데이트됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 성공 여부
 *                 image_path:
 *                   type: string
 *                   description: 업데이트된 이미지 경로
 *       302:
 *         description: 업데이트된 이미지 경로로 리다이렉트됨 (whatData가 3일 때)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 성공 여부
 *                 image_path:
 *                   type: string
 *                   description: 업데이트된 이미지 경로
 *       400:
 *         description: 요청 데이터가 잘못됨
 *       404:
 *         description: 해당하는 레코드가 없음
 *       500:
 *         description: 서버 오류
 */
// 문단 내부 이미지 업데이트 API
router.post('/update_image', upload.single('image'), function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;  // 세션에서 사용자 아이디 가져옴
    const input_count = req.body.inputCount;
    const content_order = req.body.content_order; // 업데이트할 레코드의 content_order
    const data_type = req.body.whatData;

    // 디버깅용 콘솔 로그 추가
    console.log('book_id:', book_id);
    console.log('user_id:', user_id);
    console.log('input_count:', input_count);
    console.log('content_order:', content_order);
    console.log('data_type:', data_type);
    console.log('Uploaded file:', req.file);
    console.log('AI-generated image path:', req.body.image_path);

    let image = null; // 이미지 경로를 저장할 변수

    // 업로드된 파일이 있을 경우
    if (data_type == 1 && req.file) {
        console.log(req.file.filename);
        image = `/uploads/${req.file.filename}`; // 업로드된 이미지 경로
        console.log('Image from file:', image);
    } else if (data_type == 2 && req.body.image_path) {
        // AI로 생성된 이미지 경로가 있을 경우
        image = req.body.image_path;
        console.log('Image from AI:', image);
    }
    else if (data_type == 3 && req.body.image_path)
    {
        console.log(req.file.filename);
        image = `/uploads/${req.file.filename}`;
        return res.status(302).json({ success : true , image_path : image})
    }
    else if(!req.file && !req.body.image_path) {
        // 파일이나 경로가 없을 경우 에러 처리
        console.error('파일이나 이미지 경로가 없습니다.');
        return res.status(400).json({ error: '파일이나 이미지 경로가 없습니다.' });
    }

    // 필수 값들이 있는지 확인
    if (!book_id || !user_id) {
        console.error('필수 정보가 누락되었습니다.');
        return res.status(400).json({ error: '필수 정보가 없습니다.' });
    }

    // 이미지 경로 업데이트 쿼리
    const updateImageQuery = `
        UPDATE final_input
        SET image_path = ?
        WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order = ?
    `;

    // 데이터베이스에서 업데이트 수행
    db.query(updateImageQuery, [image, user_id, book_id, input_count, content_order], function (err, results) {
        if (err) {
            console.error('Failed to update image:', err);
            return res.status(500).json({ error: 'Failed to update image' });
        }

        // 업데이트가 성공적으로 이루어졌는지 확인
        if (results.affectedRows === 0) {
            console.warn('No matching record found');
            return res.status(404).json({ error: 'No matching record found' });
        }

        // 성공적으로 업데이트한 경우
        console.log('Image updated successfully:', image);
        return res.status(200).json({ success: true, image_path: image });
    });
});

module.exports = router;