const { sequelize } = require('../models');
const { Survey, Question, Answer, Choice } = require('../models');

const createAnswer = async (req, res) => {
  const t = await sequelize.transaction(); // 트랜잭션 시작
  const surveyId = req.params.id;
  try {
    const { userId, questions } = req.body;
    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      return res.status(400).json({ message: '설문이 존재하지 않습니다.' });
    }
    for (const question of questions) {
      // 질문의 타입을 확인
      const questionData = await Question.findByPk(question.questionId, {
        transaction: t,
      });
      if (!questionData) {
        return res.status(400).json({
          message: `Question with ID ${question.questionId} not found`,
        });
      }
      if (questionData.surveyId != surveyId) {
        return res
          .status(404)
          .json({ message: `설문에 해당 질문이 없습니다.` });
      }

      // 질문 타입에 따라 답변 저장

      // 객관식
      if (
        (questionData.type === 'CHECKBOX' &&
          Array.isArray(question.objContent)) ||
        questionData.type == 'DROPDOWN' ||
        questionData.type == 'MULTIPLE_CHOICE'
      ) {
        // objContent의 각 요소에 대한 별도의 Answer 레코드 생성
        for (const objContentItem of question.objContent) {
          // console.log(`question objContentItem : ${objContentItem}`);
          const option = await Choice.findByPk(objContentItem, {
            transaction: t,
          });
          if (!option) {
            return res
              .status(400)
              .json({ message: `Choice with ID ${objContentItem} not found` });
          }
          if (option.questionId != question.questionId) {
            return res
              .status(404)
              .json({ message: `질문에 해당 선택지가 없습니다.` });
          }
          // 같은 레코드 있는지 확인
          const existingAnswer = await Answer.findOne({
            where: {
              questionId: question.questionId,
              userId: userId,
              objContent: objContentItem,
            },
            transaction: t,
          });
          // 체크박스의 경우 중복 허용
          if (!existingAnswer && questionData.type === 'CHECKBOX') {
            await Answer.create(
              {
                questionId: question.questionId,
                userId: userId,
                objContent: objContentItem,
                subContent: null,
              },
              { transaction: t },
            );

            // Choice의 count 증가
            await Choice.increment('count', {
              by: 1,
              where: { id: objContentItem },
              transaction: t,
            });
          }
          // 체크박스 아닌 객관식은 답변 하나만 들어감
          // MULTIPLE_CHOICE || DROPDOWN
          if (
            questionData.type !== 'CHECKBOX' &&
            question.objContent.length > 1
          ) {
            return res.status(409).json({ message: `하나만 선택해주세요.` });
          }
          if (
            !existingAnswer &&
            questionData.type != 'CHECKBOX' &&
            question.objContent.length === 1
          ) {
            await Answer.create(
              {
                questionId: question.questionId,
                userId: userId,
                objContent: question.objContent[0], // 첫 번째 선택지만 사용
                subContent: null,
              },
              { transaction: t },
            );

            await Choice.increment('count', {
              by: 1,
              where: { id: question.objContent },
              transaction: t,
            });
          }
        }
      } else {
        // SUBJECTIVE_QUESTION
        const existingAnswer = await Answer.findOne({
          where: {
            questionId: question.questionId,
            userId: userId,
            subContent: question.subContent || null,
            objContent: null,
          },
          transaction: t,
        });

        if (!existingAnswer) {
          await Answer.create(
            {
              questionId: question.questionId,
              userId: userId,
              subContent: question.subContent || null,
              objContent: null,
            },
            { transaction: t },
          );
        }
      }
      console.log(`questionId : ${question.questionId}`);
      console.log(`question type :  ${questionData.type}`);
      console.log(`question content : ${question.content} `);
      console.log(`question objContent : ${question.objContent}`);
      console.log(`question subContent : ${question.subContent}`);
    }
    await t.commit();
    res.status(201).json({ message: '저장되었습니다.' });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({ message: '저장을 실패하였습니다. : ' + error.message });
  }
};

module.exports = { createAnswer };
