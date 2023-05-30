import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { getSummary, getChatComplition } from './callChatGPT';
import { getMessages } from './utils';

interface IArticle {
  content: string;
}

const app = express();
const port = 3000;

app.use(express.json());

const useProxy = process.env.NODE_ENV === 'dev';

const article: string[] = [];

app.post('/summarize', async (req: ExpressRequest, res: ExpressResponse) => {
  article.push(req.body.content);
  try {
    await getSummary(article[0], res, useProxy);
  } catch(error: any) {
    res.status(500).json({ error: 'Failed to generate summary', reason: error.message });
  }
});

app.post('/chat', async (req: ExpressRequest, res: ExpressResponse) => {
  const messages = getMessages(req.body.content);
  try {
    await getChatComplition(messages, res, useProxy);
  } catch(error: any) {
    res.status(500).json({ error: 'Failed to generate summary', reason: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});