var express = require('express'); 
var router = express.Router(); 
var db = require('../db.js'); 
const multer = require('multer');
const path = require('path');
router.use(express.json());
const { v4: uuidv4 } = require('uuid');

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

// 회원정보수정
router.post('/modify_info', upload.single('profileImage'), function (request, response) {    
    const { id, pw, pw2, username, email, phone_num, birth, gender } = request.body;
    const profileImagePath = request.file ? `/uploads//${request.file.filename}` : null;

    if (username && pw && pw2 && id && email && phone_num && gender && birth) {
        db.query('SELECT * FROM user_info WHERE id != ? and phone_number = ?', [id, phone_num], function (error, results) {
            if (error) {
                response.status(500).json({ success: false, message: 'Internal server error' });
                throw error;
            }
            if (results.length <= 0 && pw === pw2) {
                db.query(
                    'UPDATE user_info SET pw = ?, name = ?, phone_number = ?, gender = ?, birth = ?, image_path = ? , email = ? where id = ?', 
                    [pw, username, phone_num, gender, birth, profileImagePath, email, id], 
                    function (error, data) {
                        if (error) {
                            response.status(500).json({ success: false, message: 'Internal server error' });
                            throw error;
                        }
                        response.json({ success: true, message: '회원정보가 성공적으로 수정되었습니다!' });
                    }
                );
            } else if (pw !== pw2) {
                response.status(400).json({ success: false, message: '입력된 비밀번호가 서로 다릅니다.' });
            } else {
                response.status(400).json({ success: false, message: '존재하는 회원의 휴대폰번호입니다' });
            }            
        });
    } else {
        response.status(400).json({ success: false, message: '입력되지 않은 정보가 있습니다.' });
    }
});

module.exports = router;