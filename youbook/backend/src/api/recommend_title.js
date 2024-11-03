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

const fineTunedModelId = 'ft:gpt-4o-mini-2024-07-18:personal:ltitle:AGRchi0N';

// OpenAI 모델 응답을 받는 함수
async function getModelResponse(userInput) {
    const response = await client.chat.completions.create({
        model: fineTunedModelId,
        messages: [
            {
                role: 'system',
                content: `당신은 한국인이 작성한 자서전의 챕터별 소제목을 지어주는 도우미 입니다. 입력 받은 내용이 한 챕터입니다. 감성적으로 너무 짧지 않게 써주세요.`
            },
            { role: 'user', content: userInput }
        ]
    });

    return response.choices[0].message.content.trim();
}

router.post('/recommend-title', async function (request, response) { 
    const content = request.body.content;
    const index = request.body.index;
    const bookId = request.body.bookId;
    const isTitle = request.body.title;

    if (!content) {
        return response.status(400).json({ status: 400, message: 'content가 필요합니다.' });
    }

    try {
        // 모델 응답 받기
        const recommendedTitle = await getModelResponse(content);

        // 업데이트할 필드 결정
        const fieldToUpdate = isTitle ? 'big_title' : 'small_title';

        // final_input 테이블의 필드 업데이트
        db.getConnection(function (err, connection) {
            if (err) {
                console.error('DB connection error:', err);
                return response.status(500).json({ status: 500, message: 'DB connection error' });
            }

            connection.query(
                `UPDATE final_input SET ${fieldToUpdate} = ? WHERE book_id = ? AND content_order = ?`,
                [recommendedTitle, bookId, index],
                function (updateError, results) {
                    connection.release();
                    if (updateError) {
                        console.error('Error updating final_input table:', updateError);
                        return response.status(500).json({ status: 500, message: 'Error updating final_input table' });
                    }

                    if (results.affectedRows === 0) {
                        return response.status(404).json({ status: 404, message: '해당 book_id와 index에 해당하는 레코드를 찾을 수 없습니다.' });
                    }

                    return response.status(200).json({ status: 200, message: 'Title updated successfully', recommendedTitle });
                }
            );
        });
    } catch (error) {
        console.error('Error generating title:', error);
        response.status(500).json({ status: 500, message: '모델 응답 생성 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
