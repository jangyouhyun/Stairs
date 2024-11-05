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
async function getModelResponse(userInfo, previousContent, userInput) {
    const response = await client.chat.completions.create({
        model: fineTunedModelId,
        messages: [
            {
                role: 'system',
                content: `당신은 한국인의 자서전 작성을 돕는 도우미입니다. 다음은 사용자의 기본 정보입니다:\n\n이름: ${userInfo.name}\n성별: ${userInfo.gender}\n생일: ${userInfo.birth}\n\n다음은 이미 알고 있는 입력 내용입니다. 이 내용은 새로 생성할 필요가 없습니다:\n\n${previousContent || '이전 입력 없음'}\n\n위 정보를 제외한 새로운 입력만을 사용하여 내용을 작성해 주세요. 적절히 문단을 나눠 작성해 주세요.`
            },
            { role: 'user', content: userInput }
        ]
    });

    return response.choices[0].message.content.trim();
}

// 사용자 기본 정보 가져오기 함수 (사전 데이터 없음 처리)
function getUserInfoWithOptionalPreviousContent(userId, bookId, callback) {
    db.query(
        'SELECT name, birth, gender FROM user_info WHERE id = ?',
        [userId],
        (error, userResults) => {
            if (error) {
                return callback(error, null);
            }
            if (userResults.length > 0) {
                const userInfo = userResults[0];
                
                // 이전 입력 내용 조건적으로 가져오기
                if (bookId) {
                    db.query(
                        'SELECT content FROM init_input WHERE user_id = ? AND book_id = ?',
                        [userId, bookId],
                        (error, initResults) => {
                            if (error) {
                                return callback(error, null);
                            }
                            const previousContent = initResults.map(result => result.content).join('\n');
                            callback(null, { userInfo, previousContent });
                        }
                    );
                } else {
                    callback(null, { userInfo, previousContent: null }); // 사전 데이터 없음 처리
                }
            } else {
                callback(new Error('User not found'), null);
            }
        }
    );
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

function getFormatDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    return year + '-' + month + '-' + day;
}

/**
 * @swagger
 * tags:
 *   name: Autobiography
 *   description: 자서전 작성 및 내용 관리 API
 */

/**
 * @swagger
 * /write_process/chatbot:
 *   post:
 *     summary: 초기 자서전 작성 내용을 저장합니다.
 *     tags: [Autobiography]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 작성할 자서전 내용
 *               category:
 *                 type: string
 *                 description: 자서전 카테고리
 *     responses:
 *       200:
 *         description: 자서전이 성공적으로 저장됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: 응답 상태 코드
 *                 bookId:
 *                   type: string
 *                   description: 저장된 자서전의 고유 ID
 *       400:
 *         description: 잘못된 요청 데이터
 *       500:
 *         description: 서버 오류
 */
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


/**
 * @swagger
 * /write_process/book_reading:
 *   post:
 *     summary: 자서전 내용을 읽고 요약을 포함하여 저장
 *     tags: [Autobiography]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 사용자가 입력한 자서전 내용
 *               bookId:
 *                 type: string
 *                 description: 자서전의 ID, 없을 경우 새로 생성됨
 *               category:
 *                 type: string
 *                 description: 자서전의 카테고리
 *               isChatbot:
 *                 type: boolean
 *                 description: 챗봇이 생성한 응답 여부
 *     responses:
 *       200:
 *         description: 자서전 내용이 성공적으로 저장됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: 응답 상태 코드
 *                 bookId:
 *                   type: string
 *                   description: 저장된 자서전의 ID
 *                 inputCount:
 *                   type: integer
 *                   description: 저장된 내용의 input count
 *       400:
 *         description: 잘못된 요청 데이터
 *       500:
 *         description: 서버 오류
 */
router.post('/write_process/book_reading', function (req, res) {
    console.log('1라우터 진입 시 세션 상태:', req.session); 
    const content = req.body.content;
    const book_id = req.body.bookId ? req.body.bookId : uuidv4();
    const user_id = req.session.nickname;
    const category = req.body.category;
    const isChatbot = req.body.isChatbot;

    if (!content) {
        console.log("내용이 기입되지 않았습니다");
        return res.status(400).json({ status: 400, error: '내용이 기입되지 않았습니다!' });
    }

    // input_count를 설정하기 위한 로직 추가
    function determineInputCount(callback) {
        if (req.body.bookId) {
            db.getConnection(function (err, connection) {
                if (err) {
                    console.error('DB connection error:', err);
                    return res.status(500).json({ status: 500, error: 'DB connection error' });
                }

                const query = 'SELECT MAX(input_count) AS max_input_count FROM init_input WHERE user_id = ? AND book_id = ?';
                connection.query(query, [user_id, book_id], function (error, results) {
                    connection.release();
                    if (error) {
                        console.error('Error selecting max input_count:', error);
                        return res.status(500).json({ status: 500, error: 'Error selecting max input_count' });
                    }

                    const maxInputCount = results[0].max_input_count || 0;
                    callback(maxInputCount + 1, maxInputCount); // max input_count + 1 반환 및 max input_count 반환
                });
            });
        } else {
            callback(1, 0); // bookId가 없을 경우 기본값 1 반환
        }
    }

    // 유저 정보 가져오기 및 모델 응답 처리
    getUserInfoWithOptionalPreviousContent(user_id, book_id, function (error, { userInfo, previousContent }) {
        if (error) {
            return res.status(500).json({ status: 500, message: '사용자 정보를 불러오는 데 실패했습니다.' });
        }

        // input_count 결정 후 진행
        determineInputCount((newInputCount, maxInputCount) => {
            // OpenAI API 호출
            getModelResponse(userInfo, previousContent, content).then(modelResponse => {
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

                        // init_input에 포맷된 데이터를 업데이트 또는 삽입
                        const formattedUserInput = `${content}`;
                        const query = isChatbot 
                            ? 'UPDATE init_input SET content = ?, category = ? WHERE user_id = ? AND book_id = ? AND input_count = ?' 
                            : 'INSERT INTO init_input (user_id, book_id, input_count, content, category) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = ?';

                        const params = isChatbot 
                            ? [formattedUserInput, category, user_id, book_id, maxInputCount] 
                            : [user_id, book_id, newInputCount, formattedUserInput, category, formattedUserInput];

                        connection.query(query, params, function (error) {
                            if (error) {
                                return connection.rollback(function () {
                                    connection.release();
                                    console.error('Insert/Update error in init_input:', error);
                                    return res.status(500).json({ status: 500, error: 'Insert/Update error in init_input' });
                                });
                            }

                            // purified_input에 모델의 응답 저장
                            const purifiedInputCount = isChatbot ? maxInputCount : newInputCount;
                            connection.query(
                                'INSERT INTO purified_input (user_id, book_id, input_count, content, category) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = ?, category = ?',
                                [user_id, book_id, purifiedInputCount, modelResponse, category, modelResponse, category],
                                function (error) {
                                    if (error) {
                                        return connection.rollback(function () {
                                            connection.release();
                                            console.error('Insert/Update error in purified_input:', error);
                                            return res.status(500).json({ status: 500, error: 'Insert/Update error in purified_input' });
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
                                        return res.status(200).json({ status: 200, bookId: book_id, inputCount: newInputCount });
                                    });
                                }
                            );
                        });
                    });
                });
            }).catch(error => {
                console.error('Model response error:', error);
                return res.status(500).json({ status: 500, error: 'Model response error' });
            });
        });
    });
});

module.exports = router;

