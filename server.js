import express from 'express';
import { callChatGPTAPI } from './callChatGPT.js';

const app = express();
const port = 3000;

app.use(express.json());

const useProxy = process.env.NODE_ENV === 'dev'; // 判断环境变量是否为dev

app.post('/summarize', async (req, res) => {
  const content = req.body.content;

  try {
    const summary = await callChatGPTAPI(content, useProxy, res);
    // res.json({ summary });
  } catch(error) {
    console.error('Error:', JSON.parse(error));
    res.status(500).json({ error: 'Failed to generate summary', reason: error });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});