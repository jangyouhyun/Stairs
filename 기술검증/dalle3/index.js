const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static('public'));

app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt,
        n: 1,
        size: '1024x1024',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.data && response.data.data.length > 0) {
      const imageUrl = response.data.data[0].url;
      res.json({ imageUrl });
    } else {
      res.status(500).send('No image URL found in the response.');
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).send('Image generation failed.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
