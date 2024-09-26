const express = require('express');
const openai = require('openai');
var router = express.Router();
var db = require('../db.js');

// OpenAI API 키 설정
const api_key = "YOUR_API_KEY"; // 여기에 자신의 OpenAI API 키를 입력하세요.
openai.apiKey = api_key;


// 수집된 데이터를 저장할 배열
let collectedData = [];

// 사용자가 입력한 정보를 기반으로 추가 질문을 생성하는 API
router.post('/ask', async (req, res) => {
    const userInput = req.body.input;

    // 입력된 정보를 수집합니다.
    collectedData.push(userInput);

    // 추가 질문 생성
    const additionalQuestionPrompt = `다음 정보를 기반으로 추가 질문을 생성하세요: ${collectedData.join(" ")}`;
    try {
        const response = await openai.chat.completions.create({
            model: 'ft:gpt-4o-mini-2024-07-18:personal:autobigraphy:A3locWYR',
            messages: [{ role: 'user', content: additionalQuestionPrompt }]
        });

        const additionalQuestion = response.choices[0].message.content;
        
        res.json({ question: additionalQuestion });
    } catch (error) {
        console.error('Error generating question:', error);
        res.status(500).json({ error: 'Error generating question' });
    }
});

// 정보를 반환하는 API (종료 요청)
router.get('/data', (req, res) => {
    res.json({ data: collectedData });
});

module.exports = router;
