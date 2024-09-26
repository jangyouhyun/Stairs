const express = require('express');
const OpenAI = require('openai'); // Import the OpenAI package
const db = require('../db.js'); // Import your database connection
require('dotenv').config(); // Load environment variables

const router = express.Router();
let userData = {}; // 각 사용자의 누적 데이터를 저장할 객체

// 파인튜닝된 모델 ID
const fineTunedModelId = 'ft:gpt-4o-mini-2024-07-18:personal:autobigraphy:A3locWYR';

// OpenAI instance
const openaiInstance = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env file
});

// 데이터베이스에 질문과 응답을 저장하는 함수
const saveChatbotData = (userId, bookId, question, response) => {
    const query = `
        INSERT INTO chatbot_data (user_id, book_id, input_count, question, response)
        VALUES (?, ?, ?, ?, ?);
    `;
    db.query(query, [userId, bookId, 1, question, response], (error, results) => {
        if (error) {
            console.error('Error saving chatbot data:', error);
        } else {
            console.log('Chatbot data saved successfully.');
        }
    });
    console.log('Saving chatbot data:', { bookId, question, response });
};

// 초기 사용자 입력을 받아서 첫 질문 생성
router.post('/chatbot/initiate', async (req, res) => {
    const { userId, initialInput } = req.body;

    try {
        // 사용자 데이터를 초기화
        userData[userId] = initialInput;

        // 초기 프롬프트 입력
        await openaiInstance.chat.completions.create({
            model: fineTunedModelId,
            messages: [{ role: 'user', content: "당신은 한국인의 자서전을 쓰는 것을 돕는 도우미 입니다. 미사여구를 최소화하여 작성해주세요" }],
            max_tokens: 150
        });

        const questionPrompt = `${initialInput}`;
        const response = await openaiInstance.chat.completions.create({
            model: fineTunedModelId,
            messages: [{ role: 'user', content: questionPrompt }],
            max_tokens: 150
        });

        const firstQuestion = response.choices[0].message.content;
        res.json({ question: firstQuestion });

    } catch (error) {
        console.error('Error generating question:', error);
        res.status(500).json({ error: 'Error generating first question' });
    }
});

// 사용자 응답을 받고 다음 질문 생성
router.post('/chatbot/ask', async (req, res) => {
    const { userId, userInput, previousQuestion } = req.body;

    const exitKeywords = ['종료', '끝', '그만'];
    if (exitKeywords.includes(userInput.trim().toLowerCase())) {
        return res.json({ message: '대화가 종료되었습니다. 감사합니다!' });
    }
    try {
        // 기존 사용자 데이터에 새로운 질문과 응답을 누적
        userData[userId] += ` ${previousQuestion}: ${userInput}`;

        // Save the previous question and user response
        saveChatbotData(userId, 'some_book_id', previousQuestion, userInput);

        // 새로운 질문 생성
        const questionPrompt = `${userData[userId]}.`;
        const response = await openaiInstance.chat.completions.create({
            model: fineTunedModelId,
            messages: [{ role: 'user', content: questionPrompt }],
            max_tokens: 150
        });

        const nextQuestion = response.choices[0].message.content;
        res.json({ question: nextQuestion });

    } catch (error) {
        console.error('Error generating question:', error);
        res.status(500).json({ error: 'Error generating next question' });
    }
});

// 사용자의 최종 데이터를 확인
router.get('/get-final-data', (req, res) => {
    const { userId } = req.query;
    res.json({ finalData: userData[userId] });
});

module.exports = router; // Use module.exports for CommonJS
