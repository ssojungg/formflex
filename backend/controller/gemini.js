const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// 선택지 생성
const generateChoices = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res
        .status(400)
        .json({ message: 'prompt는 비어있지 않은 문자열이어야 합니다.' });
    }
    const result = await model.generateContent(
      `당신은 설문 전문가입니다.
            요청 : ${prompt}

            규칙:
                - 선택지는 명확하고 중립적으로 작성
                - 번호 없이 한줄에 하나씩만 출력
                - 선택지 외 다른 텍스트 출력 금지
            `,
    );
    const text = result.response.text();
    const choices = text
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);
    res.status(200).json({ choices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 자유 프롬프트
const generateSummary = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res
        .status(400)
        .json({ message: 'prompt는 비어있지 않은 문자열이어야 합니다.' });
    }
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.status(200).json({ result: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
};

module.exports = { generateChoices, generateSummary };
