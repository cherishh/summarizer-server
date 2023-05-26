import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const systemPrompt = {
  role: 'system',
  content: '你是一个有好且出色的人工智能模型。请尽可能帮助用户，恰当地回复用户提出的问题。',
};

export async function callChatGPTAPI(content, useProxy, res) {
  try {
    const agent = useProxy ? new HttpsProxyAgent('http://127.0.0.1:1087') : null;

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
        max_tokens: 2000,
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

      for await (const chunk of response.body) {
        res.write(chunk.toString());
      }
      res.end();
    } else {
      throw response;
    }
  } catch (error) {
    console.error('Error calling ChatGPT API:', JSON.stringify(error));
    throw error;
  }
}

