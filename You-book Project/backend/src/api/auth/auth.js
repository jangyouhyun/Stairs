var express = require('express'); 
var router = express.Router(); 
var db = require('../../db.js'); 
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authCheck = require('./authCheck');


router.use(express.json());

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 사용자 인증 및 관리 API
 */

/**
 * @swagger
 * /check_id:
 *   post:
 *     summary: 아이디 중복 확인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 확인할 사용자 아이디
 *     responses:
 *       200:
 *         description: 아이디 중복 확인 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                 message:
 *                   type: string
 *                   description: 중복 확인 메시지
 *       400:
 *         description: 아이디 미입력
 *       500:
 *         description: 서버 오류
 */
// 아이디 중복 확인
router.post('/check_id', function (request, response) {
    var id = request.body.id;
    if (id) {
        db.query('SELECT * FROM user_info WHERE id = ?', [id], function (error, results, fields) {
            if (error) {
                console.error('Database error:', error);
                response.status(500).json({ success: false, message: 'Internal server error' });
                throw error;
            }
            if (results.length > 0) {
                response.json({ success: false, message: '이미 존재하는 아이디입니다' });
            } else {
                response.json({ success: true, message: '사용 가능한 아이디입니다' });
            }
        });
    } else {
        response.status(400).json({ success: false, message: '아이디를 입력하세요' });
    }
});

/**
 * @swagger
 * /login_process:
 *   post:
 *     summary: 사용자 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 사용자 아이디
 *               pw:
 *                 type: string
 *                 description: 사용자 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공 여부 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 로그인 성공 여부
 *                 message:
 *                   type: string
 *                   description: 로그인 메시지
 *       500:
 *         description: 서버 오류
 */
router.post('/login_process', function (request, response) {
    var id = request.body.id;
    var pw = request.body.pw;
    if (id && pw) {             
        db.query('SELECT * FROM user_info WHERE id = ? AND pw = ?', [id, pw], function(error, results, fields) {
            if (error) {
                response.status(500).json({ success: false, message: 'Internal server error' });
                throw error;
            }
            if (results.length > 0) {       
                request.session.is_logined = true;      
                request.session.nickname = id;
                request.session.save(function () {
                    response.json({ success: true });
                });
            } else {
                response.json({ success: false, message: '유효하지 않은 아이디 비밀번호 입니다' });
            }            
        });
    } else {
        response.json({ success: false, message: '아이디 비밀번호를 입력하세요!!' });
    }
});

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: 사용자 로그아웃
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 홈 화면으로 리다이렉트
 */
// 로그아웃
router.get('/logout', function (request, response) {
    request.session.destroy(function (err) {
        response.redirect('/');
    });
});


// 이미지 파일 저장 설정
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
 * /register_process:
 *   post:
 *     summary: 사용자 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 사용자 아이디
 *               pw:
 *                 type: string
 *                 description: 비밀번호
 *               pw2:
 *                 type: string
 *                 description: 비밀번호 확인
 *               username:
 *                 type: string
 *                 description: 사용자 이름
 *               email:
 *                 type: string
 *                 description: 이메일 주소
 *               phone_num:
 *                 type: string
 *                 description: 전화번호
 *               birth:
 *                 type: string
 *                 format: date
 *                 description: 생일
 *               gender:
 *                 type: string
 *                 description: 성별
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: 프로필 이미지 파일
 *     responses:
 *       200:
 *         description: 회원가입 성공 여부 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                 message:
 *                   type: string
 *                   description: 성공 또는 오류 메시지
 *       400:
 *         description: 잘못된 요청 데이터
 *       500:
 *         description: 서버 오류
 */
// 회원가입프로세스
router.post('/register_process', upload.single('profileImage'), function (request, response) {    
    const { id, pw, pw2, username, email, phone_num, birth, gender } = request.body;
    const profileImagePath = request.file ? `/uploads//${request.file.filename}` : null;

    if (username && pw && pw2 && id && email && phone_num && gender && birth) {
        db.query('SELECT * FROM user_info WHERE id = ? or phone_number = ?', [id, phone_num], function (error, results) {
            if (error) {
                response.status(500).json({ success: false, message: 'Internal server error' });
                throw error;
            }
            if (results.length <= 0 && pw === pw2) {
                db.query(
                    'INSERT INTO user_info (id, pw, name, email, phone_number, gender, birth, image_path) VALUES(?,?,?,?,?,?,?,?)', 
                    [id, pw, username, email, phone_num, gender, birth, profileImagePath], 
                    function (error, data) {
                        if (error) {
                            response.status(500).json({ success: false, message: 'Internal server error' });
                            throw error;
                        }
                        // 회원가입 성공 후 category 테이블에 기본 카테고리 추가
                        db.query(
                            'INSERT INTO category (user_id, name) VALUES (?, ?)',
                            [id, "기본카테고리"],
                            function (error, categoryData) {
                                if (error) {
                                    response.status(500).json({ success: false, message: '카테고리 추가 실패' });
                                    throw error;
                                }
                                response.json({ success: true, message: '회원가입이 완료되었습니다!' });
                            }
                        );
                    }
                );
            } else if (pw !== pw2) {
                response.status(400).json({ success: false, message: '입력된 비밀번호가 서로 다릅니다.' });
            } else {
                response.status(400).json({ success: false, message: '이미 존재하는 회원입니다.' });
            }            
        });
    } else {
        response.status(400).json({ success: false, message: '입력되지 않은 정보가 있습니다.' });
    }
});


/**
 * @swagger
 * /check_login:
 *   get:
 *     summary: 로그인 상태 확인
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그인 상태 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loggedIn:
 *                   type: boolean
 *                   description: 로그인 여부
 */
router.get('/check_login', (req, res) => {
  if (authCheck.isOwner(req, res)) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;