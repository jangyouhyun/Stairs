const express = require('express');
const { OpenAI } = require('openai');  // OpenAI 클라이언트 임포트
var router = express.Router();
const { v4: uuidv4 } = require('uuid');  // UUID generation
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// OpenAI API 키 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // 환경변수에 API 키를 저장하고 불러옴
});

/**
 * @swagger
 * tags:
 *   name: DALL-E
 *   description: DALL-E 이미지 생성 API
 */

/**
 * @swagger
 * /create-image:
 *   post:
 *     summary: DALL-E 모델을 이용해 이미지 생성
 *     tags: [DALL-E]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: 이미지 생성을 위한 텍스트 프롬프트
 *     responses:
 *       200:
 *         description: 이미지가 성공적으로 생성되어 저장됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *                 path:
 *                   type: string
 *                   description: 생성된 이미지의 파일 경로
 *       400:
 *         description: 요청 프롬프트가 없을 경우 발생
 *       500:
 *         description: 이미지 생성 중 서버 오류 발생
 */

// DALL-E image generation endpoint
router.post('/create-image', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate image with OpenAI's DALL-E model
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      n: 1,
    });

    const imageUrl = response.data[0].url;  // Get the image URL

    // Download the image using Axios
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    // Generate unique filename with UUID
    const imageFilename = `${uuidv4()}.png`;

    // Path to save the image in the root directory's /uploads folder
    const uploadsFolderPath = path.join(__dirname, '../../../uploads');  // 절대 경로로 설정

    // 디렉토리가 없으면 생성
    if (!fs.existsSync(uploadsFolderPath)) {
      fs.mkdirSync(uploadsFolderPath, { recursive: true });
    }

    const imagePath = path.join(uploadsFolderPath, imageFilename);

    // Save the image to /uploads folder
    fs.writeFileSync(imagePath, imageResponse.data);

    // Respond with the file path of the saved image
    res.json({ message: 'Image generated successfully', path: `/uploads/${imageFilename}` });

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Error generating image' });
  }
});

module.exports = router;
