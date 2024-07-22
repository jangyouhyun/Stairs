var express = require('express'); 
var router = express.Router(); 
var db = require('../src/db.js'); 

router.use(express.json());

// 로그인 프로세스
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

// 회원가입 프로세스
router.post('/register_process', function(request, response) {    
    var id = request.body.id;
    var password = request.body.pw;    
    var password2 = request.body.pw2;
    var username = request.body.username;
    var email = request.body.email;
    var phone_num = request.body.phone_num;
    //var birth = request.body.birth;
    var gender = request.body.gender;

    if (username && password && password2 && id && email && phone_num && gender) {
        db.query('SELECT * FROM user_info WHERE id = ? or phone_number = ?', [id, phone_num], function(error, results, fields) {
            if (error) {
                response.status(500).json({ success: false, message: 'Internal server error' });
                throw error;
            }
            if (results.length <= 0 && password === password2) {
                db.query('INSERT INTO user_info (id, pw, name, email, phone_number, gender) VALUES(?,?,?,?,?,?)', 
                [id, password, username, email, phone_num, gender], function (error, data) {
                    if (error) {
                        response.status(500).json({ success: false, message: 'Internal server error' });
                        throw error;
                    }
                    response.json({ success: true, message: '회원가입이 완료되었습니다!' });
                });
            } else if (password !== password2) {
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
