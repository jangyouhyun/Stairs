// 필요한 모듈 로드
const express = require('express');
const OpenAI = require('openai'); // OpenAI 라이브러리 사용
const db = require('../db.js'); // 데이터베이스 연결 모듈 (경로는 환경에 맞게 수정)
require('dotenv').config(); // .env 파일에 있는 환경 변수를 불러옴

const router = express.Router();
let userData = {}; // 각 사용자의 누적 데이터를 저장하는 객체

// 파인튜닝된 모델 ID
const fineTunedModelId = 'ft:gpt-4o-mini-2024-07-18:personal:chat:A42aNRVr';

// OpenAI 인스턴스 생성 (API 키는 .env 파일에서 불러옴)
const openaiInstance = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // .env 파일에 설정된 OPENAI_API_KEY 사용
});

// 데이터베이스에 질문과 응답을 저장하는 함수
const saveChatbotData = (userId, bookId, inputCount, question, response) => {
    const getMaxQuestNumQuery = `
        SELECT MAX(quest_num) AS max_quest_num 
        FROM chatbot_data 
        WHERE user_id = ? AND book_id = ?;
    `;
    
    db.query(getMaxQuestNumQuery, [userId, bookId], (error, results) => {
        if (error) {
            console.error('Error fetching max quest_num:', error);
            return;
        }
        
        const maxQuestNum = results[0].max_quest_num;
        const newQuestNum = maxQuestNum ? maxQuestNum : 1;
        const insertQuery = `
            INSERT INTO chatbot_data (user_id, book_id, input_count, quest_num, question, response) 
            VALUES (?, ?, ?, ?, ?, ?); 
        `;
        
        db.query(insertQuery, [userId, bookId, inputCount, newQuestNum, question, response], (error, results) => { 
            if (error) {
                console.error('Error saving chatbot data:', error);
            } else {
                console.log('Chatbot data saved successfully.');
            }
        });

        console.log('Saving chatbot data:', { bookId, question, response, quest_num: newQuestNum });
    });
};

// input_count를 조회하는 함수 (콜백 방식)
const getInputCount = (bookId, callback) => {
    const getMaxInputCountQuery = `
        SELECT MAX(input_count) AS max_input_count 
        FROM init_input 
        WHERE book_id = ?;
    `;

    db.query(getMaxInputCountQuery, [bookId], (error, results) => {
        if (error) {
            console.error('Error fetching max input_count:', error);
            callback(error, null);
        } else {
            const maxInputCount = results[0].max_input_count;
            const inputCount = maxInputCount ? maxInputCount : 1;
            callback(null, inputCount);
        }
    });
};

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Chatbot과의 대화 관련 API
 */

/**
 * @swagger
 * /chatbot/initiate/{book_id}:
 *   post:
 *     summary: 사용자 초기 입력을 기반으로 첫 질문 생성
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: book_id
 *         schema:
 *           type: string
 *         required: true
 *         description: 책 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               initialInput:
 *                 type: string
 *                 description: 사용자 초기 입력
 *     responses:
 *       200:
 *         description: 첫 질문 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question:
 *                   type: string
 *                   description: 생성된 첫 질문
 *       500:
 *         description: 서버 오류
 */

// 초기 사용자 입력을 받아서 첫 질문 생성하는 라우트
router.post('/chatbot/initiate/:book_id', (req, res) => {
    const userId = req.session.nickname;
    const { initialInput } = req.body;
    const { book_id: bookId } = req.params;

    getInputCount(bookId, async (error, inputCount) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching input count' });
        }

        try {
            // 사용자 데이터를 초기화
            userData[userId] = initialInput;

            const questionPrompt = `${initialInput}`;
            const response = await openaiInstance.chat.completions.create({
                model: fineTunedModelId,
                messages: [{ role: 'user', content: questionPrompt }],
                max_tokens: 150
            });

            const firstQuestion = response.choices[0].message.content;

            // 첫 질문과 응답을 데이터베이스에 저장
            saveChatbotData(userId, bookId, inputCount, initialInput, firstQuestion);

            res.json({ question: firstQuestion });
        } catch (error) {
            console.error('Error generating question:', error);
            res.status(500).json({ error: 'Error generating first question' });
        }
    });
});

/**
 * @swagger
 * /chatbot/ask/{book_id}:
 *   post:
 *     summary: 이전 질문과 사용자 입력을 바탕으로 새로운 질문 생성
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: book_id
 *         schema:
 *           type: string
 *         required: true
 *         description: 책 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userInput:
 *                 type: string
 *                 description: 사용자의 입력
 *               previousQuestion:
 *                 type: string
 *                 description: 이전 질문
 *     responses:
 *       200:
 *         description: 새로운 질문 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question:
 *                   type: string
 *                   description: 생성된 새로운 질문
 *       500:
 *         description: 서버 오류
 */

router.post('/chatbot/ask/:book_id', (req, res) => {
    console.log('2라우터 진입 시 세션 상태:', req.session); 
    const userId = req.session.nickname;
    const { userInput, previousQuestion } = req.body;
    const { book_id: bookId } = req.params;

    const exitKeywords = ['종료', '끝', '그만'];
    if (exitKeywords.includes(userInput.trim().toLowerCase())) {
        try {
            return res.json({ message: '대화가 종료되었습니다. 감사합니다!', bookId });
        } catch (error) {
            console.error('Error during data saving:', error);
            return res.status(500).json({ error: '데이터 저장 중 오류가 발생했습니다.' });
        }
    }

    // 최대 input_count를 콜백 방식으로 가져옴
    getInputCount(bookId, async (error, inputCount) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching input count' });
        }

        try {
            // 기존 사용자 데이터에 새로운 질문과 응답을 누적
            if (!userData[userId]) {
                userData[userId] = '';
            }
            userData[userId] += ` ${previousQuestion}: ${userInput}`;

            // 새로운 질문 생성
            const questionPrompt = `${userData[userId]}.`;
            const response = await openaiInstance.chat.completions.create({
                model: fineTunedModelId,
                messages: [{ role: 'user', content: questionPrompt }],
                max_tokens: 150
            });

            const nextQuestion = response.choices[0].message.content;

            // 질문과 응답을 데이터베이스에 저장
            saveChatbotData(userId, bookId, inputCount, userInput, nextQuestion);

            res.json({ question: nextQuestion });
        } catch (error) {
            console.error('Error generating question:', error);
            res.status(500).json({ error: 'Error generating next question' });
        }
    });
});


module.exports = router;
