var express = require('express'); 
var router = express.Router(); 
var db = require('../../db.js'); 
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

router.use(express.json());

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
                        response.json({ success: true, message: '회원가입이 완료되었습니다!' });
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

module.exports = router;