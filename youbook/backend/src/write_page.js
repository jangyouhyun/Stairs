var express = require('express');
var router = express.Router();
var template = require('./template.js');
var db = require('./db.js');
var bodyParser = require('body-parser');

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

    if (content) {
        db.getConnection(function (err, connection) {
            if (err) throw err;

            connection.beginTransaction(function (err) {
                if (err) {
                    connection.release();
                    throw err;
                }

                // 새로운 book_id 계산
                connection.query('SELECT COALESCE(MAX(book_id), 0) + 1 AS new_book_id FROM book_list', function (error, results) {
                    if (error) {
                        return connection.rollback(function () {
                            connection.release();
                            throw error;
                        });
                    }

                    var book_id = results[0].new_book_id;

                    // 새로운 book_id로 book_list에 삽입
                    connection.query('INSERT INTO book_list (book_id, user_id, create_date) VALUES (?, ?, ?)', [book_id, user_id, date], function (error, results) {
                        if (error) {
                            return connection.rollback(function () {
                                connection.release();
                                throw error;
                            });
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
            });
        });
    } else {
        response.status(400).send('내용이 기입되지 않았습니다!');
    }
});

module.exports = router;
