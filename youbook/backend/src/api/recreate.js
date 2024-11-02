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

const fineTunedModelId = 'ft:gpt-4o-mini-2024-07-18:personal:autobiography:AG1hlRpE';

// OpenAI 모델 응답을 받는 함수 - 동일한 정보를 가진 한 개의 문단으로 재구성
async function recreateContentAsSingleParagraph(content) {
    const response = await client.chat.completions.create({
        model: fineTunedModelId,
        messages: [
            {
                role: 'system',
                content: `당신은 한국인의 자서전을 돕는 도우미입니다. 주어진 콘텐츠와 동일한 정보를 전달하는 한 개의 문단으로 재구성해 주세요. 새 문단의 길이는 원래 콘텐츠와 최대 ±20바이트 차이 내로 유지해 주세요.`
            },
            { role: 'user', content: content }
        ]
    });

    return response.choices[0].message.content.trim();
}

// 라우터: /recreate
router.post('/recreate', async function (req, res) {
    var content = req.body.content;
    var user_id = req.session ? req.session.nickname : 'test_user';
    var book_id = req.body.book_id || uuidv4(); // Location에 book_id가 있으면 사용하고, 없으면 새로 생성
    var content_order = req.body.order;

    try {
        // OpenAI를 사용하여 콘텐츠를 한 개의 문단으로 재구성
        const recreatedContent = await recreateContentAsSingleParagraph(content);

        // final_input에서 book_id, user_id, content_order가 일치하는 레코드를 업데이트 (category는 유지)
        db.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query(
                'UPDATE final_input SET content = ? WHERE user_id = ? AND book_id = ? AND content_order = ?',
                [recreatedContent, user_id, book_id, content_order],
                function (error, results) {
                    connection.release();
                    if (error) {
                        console.error('Update error:', error);
                        return res.status(500).json({ status: 500, error: 'Error updating final content' });
                    }

                    if (results.affectedRows > 0) {
                        res.status(200).json({ status: 200, message: 'Content recreated and updated successfully.' });
                    } else {
                        res.status(404).json({ status: 404, error: 'Matching content not found.' });
                    }
                }
            );
        });
    } catch (error) {
        console.error('Error recreating content:', error);
        res.status(500).json({ status: 500, error: 'Error recreating content' });
    }
});

module.exports = router;
