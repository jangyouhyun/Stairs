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
      prompt: "다음은 내 삶의 자서전의 한 문단입니다. 이를 보고, 이 경험과 관련된 이미지를 생성해 주세요. :" + prompt,
      size: '1024x1024',
      n: 1,
    });

    const imageUrl = response.data[0].url;  // Get the image URL

    // Download the image using Axios
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    // Generate unique filename with UUID
    const imageFilename = `${uuidv4()}.png`;

    // Path to save the image in the root directory's /uploads folder
    const uploadsFolderPath = path.join(__dirname, '../../../uploads');
    const imagePath = path.join(uploadsFolderPath, imageFilename);

    // Ensure the /uploads directory exists
    if (!fs.existsSync(uploadsFolderPath)) {
      fs.mkdirSync(uploadsFolderPath);  // Create the folder if it doesn't exist
    }

    // Save the image to /uploads folder
    fs.writeFileSync(imagePath, imageResponse.data);

    // Respond with the file path of the saved image
    res.json({ message: 'Image generated successfully', path: imagePath });

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Error generating image' });
  }
});

module.exports = router;
