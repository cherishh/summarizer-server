import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import winston from 'winston';
import { getChatComplition } from './callChatGPT';

const app = express();
const port = 3000;
app.use(express.json());
// 允许所有来源的跨域请求
app.use(cors());
// // 或者，你可以设置特定的来源
// app.use(cors({
//   origin: 'http://example.com' // 替换为你允许的来源
// }));
const checkApiKey = (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const apiKey = authHeader.split(' ')[1];
    // console.log(apiKey, 'apiKey');

    // 验证API密钥的逻辑
    if (apiKey === 'E-08Q~DfuzIqdTW4-spyUn3Rtum9fynNe18O0bID') {
      // 验证通过，继续处理请求
      next();
    } else {
      // 验证失败，返回未授权错误
      res.sendStatus(401);
    }
  } else {
    // Authorization头不存在，返回未授权错误
    res.sendStatus(401);
  }
};

// 应用中间件，用于验证API密钥
app.use(checkApiKey);

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

app.get('/', (req, res) => {
  res.send('hello world!')
})

app.post('/chat', async (req: ExpressRequest, res: ExpressResponse) => {
  const { content } = req.body;
  try {
    // console.log(req.body, 1);
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
    res.status(500).json({ message: '服务器开小差啦，请稍后再试', reason: error.message });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running at http://localhost:${port}`);
});