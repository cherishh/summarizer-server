const https = require('https');
const tunnel = require('tunnel');

const systemPrompt = {
  role: 'system',
  content: '你是一个有好且出色的人工智能模型。请尽可能帮助用户，恰当地回复用户提出的问题。',
};

module.exports = async function callChatGPTAPI(content, useProxy) {
  try {
    const agent = useProxy ? tunnel.httpsOverHttp({
      proxy: {
        host: '127.0.0.1',
        port: 1087,
      },
    }) : new https.Agent();

    const response = await new Promise((resolve, reject) => {
      const req = https.request('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer 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`,
        },
        agent,
      }, res => {
        const chunks = [];
        res.on('data', data => chunks.push(data));
        res.on('end', () => {
          const response = {
            statusCode: res.statusCode,
            body: Buffer.concat(chunks).toString(),
            headers: res.headers,
          };
          resolve(response);
        });
      });
      req.on('error', reject);
      req.write(JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          systemPrompt,
          {
            role: 'user',
            content: `请帮助我总结下面包裹在'''内的这篇文章的主要内容。\n'''${content}'''\n`,
          },
        ],
        max_tokens: 2000,
        temperature: 1,
        stream: false,
      }));
      req.end();
    });

    if (response.statusCode === 200 && response.body) {
      const responseBody = JSON.parse(response.body);
      return responseBody.choices[0].message.content.trim();
    } else {
      throw response;
    }
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    throw error.body;
  }
}