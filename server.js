import express from 'express';
import { callChatGPTAPI } from './callChatGPT.js';

const app = express();
const port = 3000;

app.use(express.json());

const useProxy = process.env.NODE_ENV === 'dev';

app.post('/summarize', async (req, res) => {
  const content = req.body.content;

  try {
    await callChatGPTAPI(content, res, useProxy);
  } catch(error) {
    res.status(500).json({ error: 'Failed to generate summary', reason: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});