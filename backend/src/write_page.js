var express = require('express'); 
var router = express.Router(); 
var template = require('./template.js'); 
var db = require('./db.js');

// 세션에서 아이디 가져오기 + 현재 시간 데이트에 넣기
// book_id로 input_count 되도록 설정 - if 존재할 때 현재 존재하는 것의 max + 1
// book_list, init_user_input table 참조 - book_list에 먼저 insert
// init_user_input 에 추가로 insert

function getFormatDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    return year + '-' + month + '-' + day;
}

let static_value  = (function static_func(value) {
	let i = value;
	return function() {
	   return ++i; 
	}
 })(0);

router.get('/', function(request, response) {
	var title = "글 작성";
	var html = template.HTML(title,`
		<h2>글 작성</h2>
		<form action="/write/write_process" method="post">
		<p><input class="login" type="text" name="content" placeholder="내용을 작성하세요.."></p>
		<p><input class="btn" type="submit" value="작성완료"></p>
		</form>            
	`, '');
    response.send(html);
});

router.post('/write_process', function (request, response) {
    var content = request.body.content;
    var date = getFormatDate(new Date());
    var user_id = request.session.nickname;

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
                                response.send(`<script type="text/javascript">document.location.href="/";</script>`);
                            });
                        });
                    });
                });
            });
        });
    } else {
        response.send(`<script type="text/javascript">alert("내용이 기입되지 않았습니다!"); window.location.href="/auth/login";</script>`);
    }
});



module.exports = router;
