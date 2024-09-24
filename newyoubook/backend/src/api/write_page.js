var express = require('express');
var router = express.Router();
var db = require('../db.js');
var bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

router.use(bodyParser.json());

function getFormatDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    return year + '-' + month + '-' + day;
}

router.post('/write_process', function (request, response) {
    var content = request.body.content;
    var date = getFormatDate(new Date());
    var user_id = request.session ? request.session.nickname : 'test_user'; // 세션이 없는 경우 test_user 사용
    var book_id = uuidv4(); // UUID 생성

    if (content) {
        db.getConnection(function (err, connection) {
            if (err) throw err;
            connection.beginTransaction(function (err) {
                if (err) {
                    connection.release();
                    throw err;
                }
                // init_user_input에 삽입
                connection.query('INSERT INTO init_user_input (user_id, book_id, input_count, content) VALUES (?, ?, ?, ?)', [user_id, book_id, 1, content], function (error, results) {
                    if (error) {
                        return connection.rollback(function () {
                            connection.release();
                            throw error;
                        });
                    }
                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                connection.release();
                                throw err;
                            });
                        }
                        connection.release();
                        response.status(200).send('Success');
                    });
                });
            });
        });
    } else {
        response.status(400).send('내용이 기입되지 않았습니다!');
    }
});

module.exports = router;
