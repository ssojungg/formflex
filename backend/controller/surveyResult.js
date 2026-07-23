const { User, Survey, Question, Choice, Answer } = require('../models');

const surveyResult = async (req, res) => {
  try {
    const surveyId = req.params.id;

    const survey = await Survey.findOne({
      where: { id: surveyId },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['name'], // 필요한 속성만 선택적으로 가져올 수 있습니다.
        },
        {
          model: Question,
          as: 'Questions',
          separate: true, // include에 order를 걸기 위해 별도 쿼리로 조회
          // 이슈 4: 결과 화면도 작성자 배치 순서대로. 기존 설문은 id 순으로 폴백
          order: [['orderIndex', 'ASC'], ['id', 'ASC']],
          include: [
            {
              model: Choice,
              as: 'Choices',
            },
            {
              model: Answer,
              as: 'Answers',
            },
          ],
        },
      ],
    });

    if (!survey) {
      return res.status(404).json({ message: '작성된 설문지가 없습니다.' });
    }

    const response = {
      surveyId: survey.id,
      userName: survey.User.name,
      title: survey.title,
      open: survey.open,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
      deadline: survey.deadline,
      questions: survey.Questions.map((question) => {
        if (question.type === 'CHECKBOX') {
          return {
            questionId: question.id,
            type: question.type,
            content: question.content,
            imageUrl: question.imageUrl || null, // 이미지 URL이 null 또는 빈 문자열인 경우 빈 문자열로 처리
            choices: question.Choices.sort((a, b) => a.id - b.id).map(
              (choice) => ({
                choiceId: choice.id,
                option: choice.option,
                count: choice.count,
              }),
            ),
          };
        } else if (question.type === 'SUBJECTIVE_QUESTION') {
          return {
            questionId: question.id,
            type: question.type,
            content: question.content,
            imageUrl: question.imageUrl || null, // 이미지 URL이 null 또는 빈 문자열인 경우 빈 문자열로 처리
            answers: question.Answers.map((answer) => ({
              answerId: answer.id,
              content: answer.subContent,
            })),
          };
        } else if (
          question.type === 'MULTIPLE_CHOICE' ||
          question.type === 'DROPDOWN'
        ) {
          return {
            questionId: question.id,
            type: question.type,
            content: question.content,
            imageUrl: question.imageUrl || null, // 이미지 URL이 null 또는 빈 문자열인 경우 빈 문자열로 처리
            choices: question.Choices.sort((a, b) => a.id - b.id).map(
              (choice) => ({
                choiceId: choice.id,
                option: choice.option,
                count: choice.count,
              }),
            ),
          };
        }
      }),
    };

    return res.status(200).json(response);
  } catch (error) {
    if (error.name === 'TimeoutError') {
      return res.status(408).json({
        message: '요청 시간이 초과되었습니다.',
      });
    }
    console.error(error);
    return res.status(500).json({ message: '데이터 로드에 실패하였습니다.' });
  }
};

module.exports = { surveyResult };
