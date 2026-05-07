const { GoogleGenerativeAi} = require('@google/generative-ai');

const getAI = new GoogleGenerativeAi(process.env.GEMINI_API_KEY);
const model = getAI.getGenerativeModel({model: 'gemini-1.5-flash'});

//설문지 생성
const generateChoices = async (req,res) => {
    try {
        const {prompt} = req.body;
        const result = await model.generateContext(
        `당신은 설문 전문가입니다.
        요창 : ${prompt}
        
        규칙: 
            - 질문은 명확하고 중립적으로 작성
            - 번호 없이 한줄에 하나씩만 출력
            - 질문 외 다른 텍스트 출력 금지
        `
        );
        const text = result.response.text();
        const choices = text.split('\n').map(c => c.trim()).filter(Boolean);
        res.status(200).json({choices});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: '서버 오류'});
    }
};

//자유 프롬프트
const generateSummary = async (req, res) => {
    try {
        const {prompt} = req.body;
        const result = await model.generateContext(prompt);
        const text = result.response.text();
        res.status(200).json({result: text});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: '서버 오류'});
    }
};

module.exports = {generateChoices,generateSummary}
