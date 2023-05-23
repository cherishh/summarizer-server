const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/summarize', async (req, res) => {
  const content = req.body.content;
  // console.log(content, 'content');
  // if (!content || typeof content !== 'string') {
  //   res.status(400).json({ error: 'Invalid content' });
  //   return;
  // }
  try {
    const summary = await callChatGPTAPI(content);
    res.json({ summary });
  } catch(error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const systemPrompt = {
  role: 'system',
  content: '你是一个有好且出色的人工智能模型。请尽可能帮助用户，恰当地回复用户提出的问题。'
};

async function callChatGPTAPI(content) {
  try {
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer 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`
    //   },
    //   method: 'POST',
    //   body: JSON.stringify({
    //     model: 'gpt-3.5-turbo',
    //     messages: [
    //       {
    //         role: 'system',
    //         content: systemPrompt,
    //       },
    //       {
    //         role: 'user',
    //         content: `请帮助我总结下面包裹在'''内的这篇文章的主要内容。
    //         '''${content}'''
    //         `
    //       }
    //     ],
    //     max_tokens: 1000,
    //     temperature: 1,
    //     stream: false,
    //   }),
    // });
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        systemPrompt,
        {
          role: 'user',
          content: `请帮助我总结下面包裹在'''内的这篇文章的主要内容。
          '''${'there are many apps like Postman that you can use to test your API. Some popular alternatives include: Insomnia Paw Thunder Client SoapUI ReadyAPI Testsigma Katalon Studio SoapUI Pro These tools offer a variety of features, such as the ability to send and receive requests, view response headers and bodies, and create and manage collections of requests. They can be used to test APIs of all types, including RESTful APIs, SOAP APIs, and GraphQL APIs. When choosing an API testing tool, it is important to consider your specific needs and requirements. Some factors to consider include the features offered by the tool, the price, and the ease of use. If you are looking for a free and open-source API testing tool, Postman is a good option. It is easy to use and offers a variety of features, including the ability to send and receive requests, view response headers and bodies, and create and manage collections of requests. If you are looking for a more powerful API testing tool, there are a number of commercial options available. These tools offer a wider range of features and can be used to test more complex APIs. However, they can be more expensive than free and open-source tools. No matter which API testing tool you choose, it is important to test your APIs regularly to ensure that they are working properly. This will help to avoid problems and improve the quality of your API.'}'''
          `
        }
      ],
      max_tokens: 1000,
      temperature: 1,
      stream: false,
    }, {
      headers: {
        'Authorization': `Bearer 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`
      },
      proxy: {
        protocol: 'http',
        host: '127.0.0.1',
        port: 1087
      }
    });

    console.log(response, 11111);
    console.log(response.data, 'response');

    if (response.status === 200 && response.data && response.data.choices && response.data.choices.length > 0) {
      console.log(response.data.choices[0].message, 'msg');
      return response.data.choices[0].message.content.trim();
    } else {
      throw new Error('No summary generated');
    }
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    throw error;
  }
}
