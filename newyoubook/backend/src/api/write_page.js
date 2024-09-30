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

const fineTunedModelId = 'ft:gpt-4o-mini-2024-07-18:personal:autobigraphy:A3locWYR';

// OpenAI 모델 응답을 받는 함수
async function getModelResponse(userInput) {
    const response = await client.chat.completions.create({
        model: fineTunedModelId,
        messages: [
            { role: 'system', content: '당신은 한국인의 자서전을 쓰는 것을 돕는 도우미입니다. 입력된 내용만을 사용하여 작성해주세요.' },
            { role: 'user', content: userInput }
        ]
    });

    return response.choices[0].message.content.trim();
}

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

// 라우터: /book-reading
router.post('/write_process/book_reading', async function (req, res) {
    const content = req.body.content;
    const user_id = req.session ? req.session.nickname : 'test_user';
    const book_id = uuidv4();

    if (content) {
        try {
            const modelResponse = await getModelResponse(content);

            db.getConnection(function (err, connection) {
                if (err) throw err;
                connection.beginTransaction(function (err) {
                    if (err) {
                        connection.release();
                        throw err;
                    }

                    connection.query('INSERT INTO init_user_input (user_id, book_id, input_count, content) VALUES (?, ?, ?, ?)', [user_id, book_id, 1, content], function (error, results) {
                        if (error) {
                            return connection.rollback(function () {
                                connection.release();
                                throw error;
                            });
                        }

                        connection.query('INSERT INTO middle_user_output (user_id, book_id, input_count, content) VALUES (?, ?, ?, ?)', [user_id, book_id, 1, modelResponse], function (error, results) {
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
                                res.status(200).json({ status: 200 });
                            });
                        });
                    });
                });
            });
        } catch (error) {
            console.error('Error processing the request:', error);
            res.status(500).json({ status: 500, error: 'Error processing the request' });
        }
    } else {
        res.status(400).json({ status: 400, error: '내용이 기입되지 않았습니다!' });
    }
});

module.exports = router;
