import { Response as ExpressResponse } from 'express';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface IOpenAIError {
  error: {
    code: string;
  }
}

const systemPrompt = {
  role: 'system',
  content: '你是一个友好的阅读助手。请尽可能帮助用户，恰当地回复用户提出的问题。',
};

export async function callChatGPTAPI(content: string, res: ExpressResponse, useProxy: boolean) {
  try {
    const agent: any = useProxy ? new HttpsProxyAgent('http://127.0.0.1:1087') : null;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer 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`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          systemPrompt,
          {
            role: 'user',
            // content: `请帮助我总结下面包裹在'''内的这篇文章的主要内容。\n'''${content}'''\n`,
            content,
          },
        ],
        max_tokens: 1000,
        temperature: 1,
        stream: true,
      }),
      agent,
    });

    if (response.ok) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      for await (const chunk of response.body as any) {
        res.write(chunk.toString());
      }
      res.end();
    } else {
      const error: IOpenAIError = await response.json() as any;
      console.log(error, 'res');
      throw new Error(error.error.code);
    }
  } catch (error: any) {
    console.error('Error calling ChatGPT API:', error.message);
    throw error;
  }
}

