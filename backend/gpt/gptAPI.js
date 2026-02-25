require('dotenv').config();
const rabbitmq = require('./rabbitmq'); // 경로는 필요에 따라 조정하세요.
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const choice = require('../models/choice');
const question = require('../models/question');

// 실제 gpt 호출할때는 초기화
let openai = null;
function getOpenAIClient() {
  if (!openai) {
    if (!process.env.OPEN_AI_KEY) {
      throw new Error('환경변수가 설정되지 않았습니다');
    }
    openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
  }
  return openai;
}

async function callChatGPT(prompt) {
  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are helpful assistant with a Informative and Evaluative tone and with a Formal and Narrative style.',
        },
        { role: 'user', content: prompt },
      ],
    });
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
}
const getGptReponse = async (req, res) => {
  try {
    console.assert(req.body.title != undefined, 'error: title is undefined.');
    console.assert(
      req.body.description != undefined,
      'error: description is undefined.',
    );
    console.assert(req.body.type != undefined, 'error: type is undefined.');
    //make prompt
    //문자열 합 연산을 여러번 하면 느리니까, 나중에 stringbuilder같은 걸로 해보기.
    let prompt = req.body.title + '라는 제목의 설문지를 만들려고 하는 데,';
    prompt +=
      req.body.description +
      '이건 어떤 내용의 설문지인지 알려주는 거야. 설명은 응답할 때는 넣지 마.';
    prompt += req.body.content + '라는 내용을 묻는';
    switch (req.body.type) {
      case 'MULTIPLE_CHOICE':
        prompt += '객관식 (선택지가 4개 있어) 문항을 딱 한 개만 만들어';
        break;
      case 'CHECKBOX':
        prompt +=
          '객관식(선택지가 4개 있어) 문항을 딱 한 개만 만들어. 그리고 이 문항은 여러개의 선지를 고를 수 있어.';
        break;
      case 'DROPDOWN':
        prompt +=
          '객관식 (선택지가 4개 있어) 문항을 딱 한 개만 만들어. 길이는 길어도 상관없어';
        break;
      default:
        console.assert(false, 'error: undefined type');
        break;
    }

    prompt +=
      '너의 답을 (문항: output\n선택지1: output\n선택지2: output\n선택지3: output\n선택지4: output) 이 양식에 맞추고, output 위치에 답을 넣어서 보내줘. 그리고 선지의 기호는 반드시 : 로 해줘. 마지막으로, 문항과 선지 외에는 응답에 넣지마.';
    prompt +=
      '예를 들어줄 게, 형식만 참고하고 내용은 참고하지 마, 예시1) 문항:어떤 음식을 주로 먹으시나요?\n선택지1:밥\n선택지2:스파게티\n선택지3:빵\n선택지4:죽,\n 예시2) 문항:그 언어를 사용하시는 이유가 무엇인가요?\n선택지1:설계가 좋아서\n선택지2:언어의 기본툴이 좋아서\n선택지3:대세언어라서\n선택지4:그 언어만 지원하는 기능이 있어서';

    const response = await callChatGPT(prompt);

    console.log(response.choices[0].message.content);
    console.assert(response != null, 'error: response is null');
    // GPT 모델로부터의 응답 처리 (일단 문항 + option으로)
    const lines = response.choices[0].message.content.split('\n');

    //string에서 한글도 문자 한개라 가정
    //첫째 줄은 무조건 제목인 듯?
    try {
      var questIndex = 0;
      for (i = 0; i < lines.length; ++i) {
        if (lines[i].indexOf('문항:') != -1) {
          break;
        }
        questIndex++;
      }
      const question = lines[questIndex]
        .substring(lines[questIndex].indexOf(' ') + 1, lines[questIndex].length)
        .trimStart();

      const choices = new Array(4);
      var zeroLengthCount = 0;
      var i = questIndex + 1;
      var count = 0;
      //느린 코드임 (조건문을 되도록이면 빼게 프롬포트를 바꿔보자)
      while (count < 4 && i < lines.length) {
        console.log(lines[i]);
        if (lines[i] != undefined && lines[i].length != 0) {
          var index = lines[i].indexOf(':');
          if (index != -1) {
            choices[count] = {
              option: lines[i]
                .substring(index + 1, lines[i].length)
                .trimStart(),
            };
            ++count;
          }
        }
        ++i;
      }

      res.status(200).json({ content: question, choices: choices });

      // GPT 응답을 RabbitMQ 큐에 보냅니다.
      const message = JSON.stringify({ content: question, choices: choices });
      await rabbitmq.sendMessageToQueue(message);
    } catch (error) {
      console.log('Invalid format\n', response);
      console.log(question);
      console.log(choices);
      res.status(202).json({
        content: question,
        choices: {
          option: 'GPT가 제대로 된 응답을 하지 않았습니다.',
          option: '다시 해주시길 바랍니다. -- _ _',
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getGptReponse };
