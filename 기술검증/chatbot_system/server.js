const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// 환경 변수 설정
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 기본 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'window.html'));
});

// API 키 전달 라우트
app.get('/api-key', (req, res) => {
  res.json({ apiKey: process.env.API_KEY });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
