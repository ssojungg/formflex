const { performance } = require('perf_hooks');
const { sequelize } = require('../models');
const { Survey, Question, Choice, Answer } = require('../models');

const ModifySurveyWithQuestionsAndChoices = async (req, res) => {
  const start = performance.now();
  let queryCount = 0;

  try {
    const surveyId = req.params.id;
    console.log('Request body:', req.body);
    const surveyData = JSON.parse(req.body.survey);
    const {
      userId,
      title,
      description,
      open,
      font,
      color,
      buttonStyle,
      mainImageUrl,
      deadline,
      questions,
    } = surveyData;

    console.log('Request body:', req.body); // 요청 본문 로그 찍기

    const survey = await Survey.findByPk(surveyId);
    queryCount++;

    if (!survey) {
      return res
        .status(404)
        .json({ message: '요청하신 설문이 존재하지 않습니다.' });
    }

    // userId가 작성한 사람의 것이 아닌 경우
    if (survey.userId !== userId) {
      return res
        .status(403)
        .json({ message: userId + '는 설문을 작성한 사람이 아닙니다.' });
    }

    // 설문의 열람이 false가 아닌 경우
    if (open) {
      return res
        .status(403)
        .json({ message: '설문이 잠겨있어 접근 및 수정 권한이 없습니다.' });
    }

    const questionIds = questions.map((q) => q.questionId);
    const answersCount = await Answer.count({
      where: {
        userId: userId,
        questionId: questionIds,
      },
    });
    queryCount++;

    if (answersCount > 0) {
      return res
        .status(403)
        .json({ message: '이미 답변이 있는 설문은 수정할 수 없습니다.' });
    }

    await sequelize.transaction(async (t) => {
      // 설문 정보 업데이트
      await survey.update(
        {
          title,
          description,
          open,
          font,
          color,
          buttonStyle,
          mainImageUrl,
          deadline,
        },
        { transaction: t },
      );
      queryCount++; //설문 업데이트

      // 기존 질문들을 삭제하고 새로운 질문들을 추가합니다.
      await Question.destroy({
        where: { surveyId: surveyId },
        transaction: t,
        force: true, // 하드 삭제를 적용
      });
      queryCount++; // 기존 설문 삭제

      for (const question of questions) {
        const newQuestion = await Question.create(
          {
            surveyId,
            type: question.type,
            content: question.content,
            imageUrl: question.imageUrl,
          },
          { transaction: t },
        );
        queryCount++;

        // 체크박스, 다중 선택, 드롭다운 질문의 경우 선택지 추가
        if (
          ['CHECKBOX', 'MULTIPLE_CHOICE', 'DROPDOWN'].includes(question.type)
        ) {
          for (const choice of question.choices) {
            await Choice.create(
              {
                questionId: newQuestion.id,
                option: choice.option,
              },
              { transaction: t },
            );
            queryCount++;
          }
        }
      }

      // 설문 업데이트 시간 기록
      await survey.update({ updatedAt: new Date() }, { transaction: t });
      queryCount++; //업데이트 시간 기록
    });

    const updatedSurvey = await Survey.findByPk(surveyId);
    queryCount++; //마지막: 수정된 설문 조회

    const end = performance.now();
    console.log(
      `[수정 후(설문 수정)] 총 실행 시간: ${(end - start).toFixed(2)}ms`,
    );
    console.log(`[수정 후(설문 수정)] 총 쿼리 횟수: ${queryCount}번`);
    console.log(`==============`);

    console.log('Survey Update Result:', updatedSurvey);

    res.status(200).json({ message: '설문 수정 완료', updatedSurvey });
  } catch (error) {
    console.error('설문 수정 오류:', error.message);
    res.status(404).json({ message: '설문 수정 오류', error: error.message });
  }
};

module.exports = { ModifySurveyWithQuestionsAndChoices };
