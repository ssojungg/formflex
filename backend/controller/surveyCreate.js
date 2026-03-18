const { sequelize } = require('../models');
const { Survey, Question, Choice } = require('../models');

const createSurveyWithQuestionsAndChoices = async (req, res) => {
  const t = await sequelize.transaction();

  try {
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

    // surveyUrl을 미리 정의
    const surveyUrl = `https://www.formflex.site/surveys/placeholder`;

    const survey = await Survey.create(
      {
        userId,
        title,
        description,
        open,
        url: surveyUrl,
        font,
        color,
        buttonStyle,
        mainImageUrl,
        deadline,
      },
      { transaction: t },
    );

    const surveyId = survey.id;
    const updatedSurveyUrl = `https://www.formflex.site/responseform?id=${surveyId}`;

    await Survey.update(
      { url: updatedSurveyUrl },
      {
        where: { id: surveyId },
        transaction: t,
      },
    );

    for (const question of questions) {
      if (
        ![
          'MULTIPLE_CHOICE',
          'SUBJECTIVE_QUESTION',
          'CHECKBOX',
          'DROPDOWN',
        ].includes(question.type)
      ) {
        throw new Error('Invalid question type');
      }

      const newQuestion = await Question.create(
        {
          surveyId,
          type: question.type,
          content: question.content,
          imageUrl: question.imageUrl,
        },
        { transaction: t },
      );

      if (question.choices && question.choices.length > 0) {
        for (const choice of question.choices) {
          await Choice.create(
            {
              questionId: newQuestion.id,
              option: choice.option,
            },
            { transaction: t },
          );
        }
      }
    }

    await t.commit();
    res.status(201).json({ message: '설문 생성 완료', surveyId: surveyId });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: '설문 생성 오류', error: error.message });
  }
};

module.exports = { createSurveyWithQuestionsAndChoices };
