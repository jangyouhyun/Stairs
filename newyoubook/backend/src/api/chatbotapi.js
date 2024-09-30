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
const saveChatbotData = (userId, bookId, question, response) => {
    // 첫 번째 쿼리: 현재 bookId와 userId에 해당하는 quest_num의 최대값을 가져옵니다.
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
        
        // 최대 quest_num을 가져옵니다.
        const maxQuestNum = results[0].max_quest_num;

        // 새로운 quest_num을 결정합니다.
        const newQuestNum = maxQuestNum ? maxQuestNum + 1 : 1;

        // 두 번째 쿼리: 새로운 질문과 응답을 데이터베이스에 저장합니다.
        const insertQuery = `
            INSERT INTO chatbot_data (user_id, book_id, input_count, quest_num, question, response) 
            VALUES (?, ?, ?, ?, ?, ?); 
        `;
        
        db.query(insertQuery, [userId, bookId, 1, newQuestNum, question, response], (error, results) => { 
            if (error) {
                console.error('Error saving chatbot data:', error);
            } else {
                console.log('Chatbot data saved successfully.');
            }
        });

        console.log('Saving chatbot data:', { bookId, question, response, quest_num: newQuestNum });
    });
};

// 초기 사용자 입력을 받아서 첫 질문 생성하는 라우트
router.post('/chatbot/initiate/:book_id', async (req, res) => {
    const userId = req.session.nickname;
    const { initialInput } = req.body;

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
        res.json({ question: firstQuestion });

    } catch (error) {
        console.error('Error generating question:', error);
        res.status(500).json({ error: 'Error generating first question' });
    }
});

// 사용자의 응답을 받아서 다음 질문을 생성하는 라우트
router.post('/chatbot/ask/:book_id', async (req, res) => {
    const userId = req.session.nickname;  // 세션에서 userId 가져옴
    const { userInput, previousQuestion } = req.body;  // 클라이언트에서 받은 요청
    const { book_id: bookId } = req.params;  // URL에서 book_id 추출

    const exitKeywords = ['종료', '끝', '그만'];
    if (exitKeywords.includes(userInput.trim().toLowerCase())) {
        return res.json({ message: '대화가 종료되었습니다. 감사합니다!' });
    }

    try {
        // 기존 사용자 데이터에 새로운 질문과 응답을 누적
        if (!userData[userId]) {
            userData[userId] = '';  // 사용자가 처음 대화하는 경우 빈 문자열로 초기화
        }
        userData[userId] += ` ${previousQuestion}: ${userInput}`;

        // 이전 질문과 사용자의 응답을 데이터베이스에 저장
        saveChatbotData(userId, bookId, previousQuestion, userInput);  // bookId를 매개변수로 전달

        // 새로운 질문을 생성
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


// 사용자의 최종 데이터를 확인하는 라우트
router.get('/get-final-data', (req, res) => {
    const { userId } = req.query;
    if (userData[userId]) {
        res.json({ finalData: userData[userId] });
    } else {
        res.status(404).json({ error: 'No data found for the given userId' });
    }
});

module.exports = router;
