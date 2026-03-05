const { performance } = require('perf_hooks');
const { Survey, User, Answer, Question } = require('../models');
const { surveyTitleSearch } = require('./surveyTitleSearch');

const surveyAnswered = async (req, res) => {
  const start = performance.now();
  let queryCount = 0;

  const userId = req.params.id;
  const pageLimit = req.query.limit;
  const page = req.query.page;
  const startIndex = (page - 1) * pageLimit;
  const endIndex = startIndex + pageLimit;
  const title = req.query.title;

  try {
    const user = await User.findByPk(userId);
    queryCount++; //1번 유저 조회

    if (!user) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }

    const answered = await Answer.findAll({
      where: { userId: userId },
      attributes: ['questionId'],
    });
    const questionIds = answered.map((answer) => answer.questionId);
    queryCount++; //2번 : 내가 답변한 것들

    const surveyed = await Question.findAll({
      where: { id: questionIds },
      attributes: ['surveyId'],
    });
    queryCount++; //3번: 질문에서 설문 ID 추출

    const surveyIds = Array.from(
      new Set(surveyed.map((survey) => survey.surveyId)),
    );
    if (!surveyIds || surveyIds.length === 0) {
      // 유저는 있지만 설문조사 게시글이 없는 경우
      return res.status(204).json({
        message: '작성한 설문지가 없습니다.',
      });
    }

    if (!title) {
      const surveys = await Survey.findAll({
        where: { id: surveyIds },
        attributes: [
          'id',
          'title',
          'open',
          'mainImageUrl',
          'createdAt',
          'updatedAt',
          'deadline',
        ],
      });
      queryCount++; //4번: 설문 정보

      const preResult = [];
      // 각 설문지에 대해 참여자 수 계산
      for (const survey of surveys) {
        const userCount = await Answer.count({
          distinct: true,
          col: 'userId',
          include: [
            {
              model: Question,
              where: { surveyId: survey.id },
            },
          ],
        });
        queryCount++; //N번: 설문마다 참여자 수

        const answer = await Answer.findOne({
          where: { userId: userId },
          include: [
            {
              model: Question,
              where: { surveyId: survey.id },
            },
          ],
        });
        queryCount++; //N번: 설문마다 내 참여 여부

        // attendCount 추가
        survey.dataValues.attendCount = userCount;

        preResult.push({
          surveyId: survey.id,
          title: survey.title,
          open: survey.open,
          mainImageUrl: survey.mainImageUrl || null,
          createdAt: survey.createdAt,
          updatedAt: survey.updatedAt,
          deadline: survey.deadline,
          isAttended: !!answer,
          attendCount: userCount,
        });
      }

      const total = await Survey.count({
        where: { id: surveyIds },
      });
      queryCount++; //총 개수

      // 총 페이지 수 계산
      const totalPages = Math.ceil(total / pageLimit);

      // 페이징
      // 정렬
      if ('attendCount' in req.query) {
        preResult.sort((a, b) => b.attendCount - a.attendCount);
      } else if ('deadline' in req.query) {
        preResult.sort((a, b) => a.deadline - b.deadline);
      } else {
        preResult.sort((a, b) => b.createdAt - a.createdAt); // 아무 것도 없다면 만들어진 날짜로 내림차순을 디폴트로
      }

      const paginatedSurveys = preResult.slice(startIndex, endIndex);

      const end = performance.now();
      console.log(`============`);
      console.log(
        `[수정 전(내 응답 조회)] 총 실행 시간: ${(end - start).toFixed(2)}ms`,
      );
      console.log(`[수정 전(낸 응답 조회)] 총 쿼리 횟수 : ${queryCount}번`);
      console.log(`==============`);

      res.json({ surveys: paginatedSurveys, totalPages });
    } else {
      const surveys = await Survey.findAll({
        where: {
          id: surveyIds,
        },
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title'],
      });
      queryCount++; //4번 : 설문 제목 목록

      const surveyed = surveys.map((survey) => ({
        surveyId: survey.id,
        surveyTitle: survey.title,
      }));

      if (!surveys.length) {
        return res.status(204).json({ message: '작성된 설문지가 없습니다.' });
      }

      const searchList = { surveys: surveyed, title };
      const resultList = surveyTitleSearch(searchList);
      const len = resultList.surveys.length;
      const tp = Math.ceil(len / pageLimit);

      if (len == 0) {
        return res.status(208).json({ message: '검색된 설문지가 없습니다.' });
      }

      const sortedList = [];
      for (const surveyId of resultList.surveys) {
        const survey = await Survey.findOne({
          where: { id: surveyId },
          attributes: [
            'id',
            'title',
            'open',
            'mainImageUrl',
            'createdAt',
            'updatedAt',
            'deadline',
          ],
        });
        queryCount++; //N번 : 설문마다 상세 조회

        const answer = await Answer.findOne({
          where: { userId: userId },
          include: [
            {
              model: Question,
              where: { surveyId: survey.id },
            },
          ],
        });
        queryCount++; //N번: 설문마다 참여자 수

        const userCount = await Answer.count({
          distinct: true,
          col: 'userId',
          include: [
            {
              model: Question,
              where: { surveyId: survey.id },
            },
          ],
        });

        sortedList.push({
          surveyId: survey.dataValues.id,
          title: survey.dataValues.title,
          open: survey.dataValues.open,
          mainImageUrl: survey.dataValues.mainImageUrl || null,
          createdAt: survey.dataValues.createdAt,
          updatedAt: survey.dataValues.updatedAt,
          deadline: survey.dataValues.deadline,
          isAttended: !!answer,
          attendCount: userCount,
        });
      }

      if ('attendCount' in req.query) {
        sortedList.sort((a, b) => b.attendCount - a.attendCount);
      } else if ('deadline' in req.query) {
        sortedList.sort((a, b) => a.deadline - b.deadline);
      } else {
        sortedList.sort((a, b) => b.createdAt - a.createdAt); // 아무 것도 없다면 만들어진 날짜로 내림차순을 디폴트로
      }
      const end = performance.now();
      console.log(`=============`);
      console.log(
        `[수정 전(내 응답 조회 - 검색)] 총 실행 시간: ${(end - start).toFixed(
          2,
        )}ms`,
      );
      console.log(
        `[수정 전(내 응답 조회 - 검색] 총 쿼리 횟수: ${queryCount}번`,
      );
      console.log(`==============`);
      res.status(200).json({ sortedList, totalPages: tp });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: '에러 발생',
    });
  }
};

module.exports = { surveyAnswered };
