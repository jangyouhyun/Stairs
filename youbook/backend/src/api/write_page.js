var express = require('express');
var router = express.Router();
var db = require('../db.js');
const { OpenAI } = require('openai');
var bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config(); 

router.use(bodyParser.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const fineTunedModelId = 'ft:gpt-4o-mini-2024-07-18:personal:autobiography:AG1hlRpE'

// OpenAI 모델 응답을 받는 함수
async function getModelResponse(userInput) {
    const response = await client.chat.completions.create({
        model: fineTunedModelId,
        messages: [
            { role: 'system', content: "당신은 한국인의 자서전을 쓰는 것을 돕는 도우미입니다. 입력된 내용만을 사용하여 작성해주세요. 내용에 따라 적절히 문단을 나눠주세요."},
            { role: 'user', content: userInput }
        ]
    });

    return response.choices[0].message.content.trim();
}

// 사용자 정보 가져오기 함수
function getUserInfo(userId, callback) {
    db.query(
        'SELECT name, birth, gender FROM user_info WHERE id = ?',
        [userId],
        (error, results) => {
            if (error) {
                return callback(error, null);
            }
            if (results.length > 0) {
                const user = results[0];
                callback(null, user);
            } else {
                callback(new Error('User not found'), null);
            }
        }
    );
}


// 라우터: /book-content/:book_id
router.get('/book-content/:book_id', async function (req, res) {
    const book_id = req.params.book_id;

    try {
        db.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query('SELECT content FROM purified_input WHERE book_id = ?', [book_id], function (error, results) {
                connection.release();
                if (error) {
                    return res.status(500).json({ status: 500, error: 'Error retrieving book content' });
                }

                if (results.length > 0) {
                    res.status(200).json({ status: 200, content: results[0].content });
                } else {
                    res.status(404).json({ status: 404, error: 'No content found for this book' });
                }
            });
        });
    } catch (error) {
        console.error('Error retrieving book content:', error);
        res.status(500).json({ status: 500, error: 'Error retrieving book content' });
    }
});


function getFormatDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    return year + '-' + month + '-' + day;
}

router.post('/write_process/chatbot', function (request, response) {
    var content = request.body.content;
    var date = getFormatDate(new Date());
    var user_id = request.session ? request.session.nickname : 'test_user'; // 세션이 없는 경우 test_user 사용
    var book_id = uuidv4(); // UUID 생성
    const category = request.body.category;
    console.log("카테고리: ", category);

    if (!content) {
        return response.status(400).send('내용이 기입되지 않았습니다!');
    }

    // 사용자 정보 가져오기 함수
    getUserInfo(user_id, function (error, userInfo) {
        if (error) {
            return response.status(500).json({ status: 500, message: '사용자 정보를 불러오는 데 실패했습니다.' });
        }

        // 사용자 정보 포맷팅
        const formattedInput = `이름: ${userInfo.name}, 성별: ${userInfo.gender}, 생일: ${userInfo.birth}, 입력텍스트: ${content}`;

        db.getConnection(function (err, connection) {
            if (err) throw err;
            connection.beginTransaction(function (err) {
                if (err) {
                    connection.release();
                    throw err;
                }
                // init_input에 삽입
                connection.query(
                    'INSERT INTO init_input (user_id, book_id, input_count, content, category) VALUES (?, ?, ?, ?, ?)',
                    [user_id, book_id, 1, formattedInput, category],
                    function (error, results) {
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
                            // 여기서 response로 변경
                            response.status(200).json({ status: 200, bookId: book_id });
                        });
                    }
                );
            });
        });
    });
});

router.post('/write_process/book_reading', function (req, res) {
    console.log('1라우터 진입 시 세션 상태:', req.session); 
    const content = req.body.content;
    const book_id = req.body.bookId ? req.body.bookId : uuidv4();
    const user_id = req.body.userId ? req.body.userId : req.session.nickname;
    const category = req.body.category;

    if (!content) {
        console.log("내용이 기입되지 않았습니다");
        return res.status(400).json({ status: 400, error: '내용이 기입되지 않았습니다!' });
    }

    // 유저 정보 가져오기
    getUserInfo(user_id, function (error, userInfo) {
        if (error) {
            return res.status(500).json({ status: 500, message: '사용자 정보를 불러오는 데 실패했습니다.' });
        }

        // 사용자 정보 포맷팅
        const formattedUserInput = `이름: ${userInfo.name}, 성별: ${userInfo.gender}, 생일: ${userInfo.birth}, 입력텍스트: ${content}`;

        db.getConnection(function (err, connection) {
            if (err) {
                console.error('DB connection error:', err);
                return res.status(500).json({ status: 500, error: 'DB connection error' });
            }

            connection.beginTransaction(function (err) {
                if (err) {
                    connection.release();
                    console.error('Transaction error:', err);
                    return res.status(500).json({ status: 500, error: 'Transaction error' });
                }

                // 1. init_input 데이터 존재 여부 확인
                connection.query(
                    'SELECT content FROM init_input WHERE user_id = ? AND book_id = ? AND input_count = ?',
                    [user_id, book_id, 1],
                    function (error, initInputResult) {
                        if (error) {
                            return connection.rollback(function () {
                                connection.release();
                                console.error('Query error:', error);
                                return res.status(500).json({ status: 500, error: 'Query error' });
                            });
                        }

                        let openAIInput;
                        if (initInputResult.length > 0) {
                            // 이미 존재하면 기존 content로 openAI 적용
                            openAIInput = initInputResult[0].content;
                        } else {
                            // 존재하지 않으면 포맷된 데이터를 사용
                            openAIInput = formattedUserInput;
                        }

                        // OpenAI API 호출
                        getModelResponse(openAIInput).then(modelResponse => {
                            if (initInputResult.length > 0) {
                                // init_input에 이미 존재하는 경우 content 업데이트
                                connection.query(
                                    'UPDATE init_input SET content = ?, category = ? WHERE user_id = ? AND book_id = ? AND input_count = ?',
                                    [content, category, user_id, book_id, 1],
                                    function (error) {
                                        if (error) {
                                            return connection.rollback(function () {
                                                connection.release();
                                                console.error('Update error:', error);
                                                return res.status(500).json({ status: 500, error: 'Update error' });
                                            });
                                        }
                                    }
                                );
                            } else {
                                // 존재하지 않으면 init_input에 포맷된 데이터를 삽입
                                connection.query(
                                    'INSERT INTO init_input (user_id, book_id, input_count, content, category) VALUES (?, ?, ?, ?, ?)',
                                    [user_id, book_id, 1, formattedUserInput, category],
                                    function (error) {
                                        if (error) {
                                            return connection.rollback(function () {
                                                connection.release();
                                                console.error('Insert error:', error);
                                                return res.status(500).json({ status: 500, error: 'Insert error' });
                                            });
                                        }
                                    }
                                );
                            }

                            // purified_input에 모델의 응답 저장
                            connection.query(
                                'INSERT INTO purified_input (user_id, book_id, input_count, content, category) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = ?, category = ?',
                                [user_id, book_id, 1, modelResponse, category, modelResponse, category],
                                function (error) {
                                    if (error) {
                                        return connection.rollback(function () {
                                            connection.release();
                                            console.error('Insert/Update error:', error);
                                            return res.status(500).json({ status: 500, error: 'Insert/Update error' });
                                        });
                                    }

                                    connection.commit(function (err) {
                                        if (err) {
                                            return connection.rollback(function () {
                                                connection.release();
                                                console.error('Commit error:', err);
                                                return res.status(500).json({ status: 500, error: 'Commit error' });
                                            });
                                        }

                                        connection.release();
                                        return res.status(200).json({ status: 200, bookId: book_id });
                                    });
                                }
                            );
                        }).catch(error => {
                            console.error('Model response error:', error);
                            return res.status(500).json({ status: 500, error: 'Model response error' });
                        });
                    }
                );
            });
        });
    });
});

module.exports = router;
