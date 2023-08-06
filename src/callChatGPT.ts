import { Response as ExpressResponse } from 'express';
import fetch from 'node-fetch';
import { Logger } from 'winston';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface IOpenAIError {
  error: {
    message: string;
    code: string;
  }
}

interface IChatParams {
  content: IContent[],
  temperature: number,
  key?: string;
}

interface IContent {
  role: 'user' | 'assistant';
  content: string;
}

const systemPrompt = {
  role: 'system',
  content: '你是 ChatGPT，一个由 OpenAI 训练的大型语言模型。请仔细遵循用户的指示。使用 Markdown 格式进行回应。',
};

export async function getChatComplition(
  { content, temperature = 1, key }: IChatParams,
  res: ExpressResponse,
  logger: Logger,
  isProxy: boolean,
) {
  try {
    const agent: any = isProxy ? new HttpsProxyAgent('http://127.0.0.1:1087') : null;
    // console.log([systemPrompt, ...content], 'msg');
    // console.log(temperature, 'temperature');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: key ? `Bearer ${key}` : `Bearer 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`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-16k-0613',
        messages: [systemPrompt, ...content],
        max_tokens: 3000, // 设为4000 openai的返回有时候会有问题，即使很简单的问题也会提示回答超过限制，不知道为什么
        temperature: temperature,
        stream: true,
      }),
      agent,
    });

    if (response.ok) {
      logger.info('success.')
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.flushHeaders();

      for await (const chunk of response.body as any) {
        res.write(chunk.toString());
      }
      res.end();
    } else {
      const error: IOpenAIError = (await response.json()) as any;
      logger.error('chatGPT API returns an error', {error})
      // eslint-disable-next-line no-console
      console.log(error, 'res');
      res.status(500).json({ message: 'OpenAI返回错误，请稍后再试' });
    }
  } catch (error: any) {
    logger.error('Fail calling chatGPT API', {error})
    // eslint-disable-next-line no-console
    console.error('Fail calling ChatGPT API:', error.message);
    throw error;
  }
}