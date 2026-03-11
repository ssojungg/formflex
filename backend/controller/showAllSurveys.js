const { performance } = require('perf_hooks');
const { Survey, Answer, Question } = require('../models');
const { surveyTitleSearch } = require('./surveyTitleSearch');
const { literal, col } = require('sequelize');

const showAllSurveys = async (req, res) => {
  const start = performance.now();
  let queryCount = 0;

  try {
    // Request로부터 Parameter 값들 가져오기
    const userId = req.params.id;
    const pageLimit = parseInt(req.query.limit);
    const page = req.query.page;
    const startIndex = (page - 1) * pageLimit;
    const title = req.query.title;

    if (!title) {
      const surveys = await Survey.findAll({
        where: { open: true },
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
      queryCount++; //1번: 전체 설문 조회

      if (!surveys.length) {
        return res.status(204).json({ message: '작성된 설문지가 없습니다' });
      }

      const surveyIds = surveys.map((s) => s.id);

      const answerCounts = await Answer.findAll({
        attributes: [[literal('COUNT(DISTINCT "Answer"."userId")'), 'count']],
        include: [
          {
            model: Question,
            attributes: ['surveyId'],
            where: { surveyId: surveyIds },
            required: true,
          },
        ],
        group: [col('Question.surveyId')],
        raw: true,
      });
      queryCount++; //침야지스 힌반에

      const countMap = {};
      for (const row of answerCounts) {
        countMap[row['Question.surveyId']] = parseInt(row.count);
      }

      const myAnswers = await Answer.findAll({
        where: { userId: userId },
        attributes: ['questionId'],
        include: [
          {
            model: Question,
            attributes: ['surveyId'],
            where: { surveyId: surveyIds },
            required: true,
          },
        ],
        raw: true,
      });
      queryCount++; //내 참여 여부 한번에

      const attendSet = new Set(myAnswers.map((a) => a['Question.surveyId']));

      const preResult = surveys.map((survey) => ({
        surveyId: survey.id,
        title: survey.title,
        open: survey.open,
        mainImageUrl: survey.mainImageUrl || null,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
        deadline: survey.deadline,
        isAttended: attendSet.has(survey.id),
        attendCount: countMap[survey.id] || 0,
      }));

      if ('attendCount' in req.query) {
        preResult.sort((a, b) => b.attendCount - a.attendCount);
      } else if ('deadline' in req.query) {
        preResult.sort((a, b) => a.deadline - b.deadline);
      } else {
        preResult.sort((a, b) => b.createdAt - a.createdAt);
      }

      const pagedSurveys = preResult.slice(startIndex, startIndex + pageLimit);

      const end = performance.now(); // ← 이거 추가!
      console.log(`============`);
      console.log(
        `[수정 후(전체 설문 조회)] 총 실행 시간: ${(end - start).toFixed(2)}ms`,
      );
      console.log(`[수정 후(전체 설문 조회)] 총 쿼리 횟수: ${queryCount}번`);
      console.log(`==============`);

      res.status(200).json({
        surveys: pagedSurveys,
        totalPages: Math.ceil(preResult.length / pageLimit),
      });
    } else {
      const selectSurveys = await Survey.findAll({
        where: { open: true },
        attributes: ['id', 'title'],
      });
      queryCount++; // 1번: 전체 설문 제목

      if (!selectSurveys.length) {
        return res.status(204).json({ message: '작성된 설문지가 없습니다' });
      }

      const titleList = selectSurveys.map((survey) => ({
        surveyId: survey.id,
        surveyTitle: survey.title,
      }));

      const searchList = { surveys: titleList, title: title };
      const resultList = surveyTitleSearch(searchList);
      const len = resultList.surveys.length;

      if (len === 0) {
        return res.status(208).json({ message: '검섹된 설문지 앖습니다' });
      }

      const searchedIds = resultList.surveys;

      const searchedSurveys = await Survey.findAll({
        where: { id: searchedIds },
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
      queryCount++; //설문 상세 한번에

      const answerCounts = await Answer.findAll({
        attributes: [[literal('COUNT(DISTINCT "Answer"."userId")'), 'count']],
        include: [
          {
            model: Question,
            attributes: ['surveyId'],
            where: { surveyId: searchedIds },
            required: true,
          },
        ],
        group: [col('Question.surveyId')],
        raw: true,
      });
      queryCount++; //참여자 수 한번에

      const countMap = {};
      for (const row of answerCounts) {
        countMap[row['Question.surveyId']] = parseInt(row.count);
      }

      const myAnswers = await Answer.findAll({
        where: { userId: userId },
        attributes: ['questionId'],
        include: [
          {
            model: Question,
            attributes: ['surveyId'],
            where: { surveyId: searchedIds },
            required: true,
          },
        ],
        raw: true,
      });
      queryCount++; //내 참여 여부 한번에

      const attendSet = new Set(myAnswers.map((a) => a['Question.surveyId']));

      const sortedList = searchedSurveys.map((survey) => ({
        surveyId: survey.id,
        title: survey.title,
        open: survey.open,
        mainImageUrl: survey.mainImageUrl || null,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
        deadline: survey.deadline,
        isAttended: attendSet.has(survey.id),
      }));

      if ('attendCount' in req.query) {
        sortedList.sort((a, b) => b.attendCount - a.attendCount);
      } else if ('deadline' in req.query) {
        sortedList.sort((a, b) => a.deadline - b.deadline);
      } else {
        sortedList.sort((a, b) => b.createdAt - a.createdAt);
      }

      const pagedSortedList = sortedList.slice(
        startIndex,
        startIndex + pageLimit,
      );

      const end = performance.now();
      console.log(`===============`);
      console.log(
        `[수정 후(전체 설문 - 검색)] 총 실행 시간: ${(end - start).toFixed(
          2,
        )}ms`,
      );
      console.log(`[수정 후(전체 설문 - 검색)] 총 쿼리 횟수: ${queryCount}번`);
      console.log(`==============`);

      res.status(200).json({
        sortedList: pagedSortedList,
        totalPages: Math.ceil(len / pageLimit),
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '데이터를 불러오는데 실패했습니다' });
  }
};

module.exports = { showAllSurveys };
