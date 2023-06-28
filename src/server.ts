import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import express from 'express';
import winston from 'winston';
import { getChatComplition } from './callChatGPT';

interface IArticle {
  content: string;
}

const app = express();
const port = 3000;
app.use(express.json());

const isProxy = process.env.NODE_ENV === 'dev';
const logger = winston.createLogger({
  level: 'info', // 设置日志级别
  format: winston.format.json(), // 设置日志格式为 JSON
  transports: [
    // 添加一个 Console（控制台）传输器，用于将日志输出到控制台
    new winston.transports.Console(),
    // 添加一个 File（文件）传输器，用于将日志输出到文件
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});


app.post('/chat', async (req: ExpressRequest, res: ExpressResponse) => {
  console.log(req.body, 'req.body');
  const { content, temperature, key } = req.body;
  try {
    await getChatComplition(req.body, res, logger, isProxy);
  } catch(error: any) {
    logger.error(error.message, {
      // key,
      content,
      ip: req.ip,
      ua: req.headers['user-agent'],
      referrer: req.headers['referrer'],
      timestamp: Date.now(),
    });
    res.status(500).json({ error: '服务器开小差啦，请稍后再试', reason: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});