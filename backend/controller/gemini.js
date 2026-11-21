const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 무료 티어: 1,000 req/day, 15 RPM. 구글이 이 모델을 중단하면 에러 메시지에 적힌
// 대체 모델("Please update your code to use models/X")로 자동 전환해서 계속 쓴다.
let currentModelName = 'gemini-3.5-flash-lite';

const generateContent = async (prompt, depth = 0) => {
  try {
    const model = genAI.getGenerativeModel({ model: currentModelName });
    return await model.generateContent(prompt);
  } catch (error) {
    const suggested = [...String(error.message).matchAll(/models\/([\w.-]+)/g)].pop()?.[1];
    if (error.status === 404 && suggested && suggested !== currentModelName && depth < 3) {
      console.warn(`모델 "${currentModelName}" 중단됨. "${suggested}"로 전환합니다.`);
      currentModelName = suggested;
      return generateContent(prompt, depth + 1);
    }
    throw error;
  }
};

// 일일 요청 횟수 제한 (무료 수준 유지)
const MAX_DAILY_REQUESTS = 50;
let dailyCount = 0;
let lastResetDate = new Date().toDateString();

const checkRateLimit = () => {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyCount = 0;
    lastResetDate = today;
  }
  if (dailyCount >= MAX_DAILY_REQUESTS) {
    return false;
  }
  dailyCount++;
  return true;
};

// 선택지 생성
const generateChoices = async (req, res) => {
  if (!checkRateLimit()) {
    return res.status(429).json({ message: '오늘 AI 사용 한도를 초과했습니다. 내일 다시 시도해주세요.' });
  }

  try {
    const { prompt } = req.body;
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'prompt는 비어있지 않은 문자열이어야 합니다.' });
    }

    const result = await generateContent(
      `당신은 설문 전문가입니다.
      사용자 요청: ${prompt}

      아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 출력하지 마세요.
      {
        "title": "설문 질문 1개",
        "options": ["선택지1", "선택지2", "선택지3", ...]
      }

      규칙:
      - title: 사용자 요청을 반영한 질문 1개
      - options: 해당 질문에 대한 선택지만 (질문 문장 절대 포함 금지)
      - 선택지는 짧고 명확하게
      - JSON 외 다른 텍스트 출력 금지`
    );

    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ message: 'AI 응답 파싱 실패' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.status(200).json({
      title: parsed.title || '',
      choices: Array.isArray(parsed.options) ? parsed.options : [],
    });
  } catch (error) {
    console.error(error);
    if (error.status === 429) {
      return res.status(429).json({ message: 'AI 사용 한도 초과. 잠시 후 다시 시도해주세요.' });
    }
    res.status(500).json({ message: '서버 오류' });
  }
};

// 자유 프롬프트
const generateSummary = async (req, res) => {
  if (!checkRateLimit()) {
    return res.status(429).json({ message: '오늘 AI 사용 한도를 초과했습니다. 내일 다시 시도해주세요.' });
  }

  try {
    const { prompt } = req.body;
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'prompt는 비어있지 않은 문자열이어야 합니다.' });
    }
    const result = await generateContent(prompt);
    const text = result.response.text();
    res.status(200).json({ result: text });
  } catch (error) {
    console.error(error);
    if (error.status === 429) {
      return res.status(429).json({ message: 'AI 사용 한도 초과. 잠시 후 다시 시도해주세요.' });
    }
    res.status(500).json({ message: '서버 오류' });
  }
};

module.exports = { generateChoices, generateSummary };
