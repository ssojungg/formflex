const { performance } = require('perf_hooks');
const { fn, col, literal, where } = require('sequelize');
const { Survey, Answer, Question } = require('../models');
const { surveyTitleSearch } = require('./surveyTitleSearch');
const { group } = require('console');

const getUserSurveys = async (req, res) => {
  const start = performance.now();
  let queryCount = 0;
  try {
    const userId = req.params.id;
    const pageLimit = req.query.limit;
    const page = req.query.page;
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    const title = req.query.title;

    if (!title) {
      const surveys = await Survey.findAll({
        where: { userId: userId },
        attributes: [
          'id',
          'title',
          'mainImageUrl',
          'createdAt',
          'deadline',
          'open',
          'emailReportThreshold',
        ],
      });
      queryCount++;
      const surveyIds = surveys.map((s) => s.id);
      //한번의 퀴리로 모든 설문의 참여자 수 계산
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
      queryCount++;
      const countMap = {};
      for (const row of answerCounts) {
        countMap[row['Question.surveyId']] = parseInt(row.count);
      }
      const preResult = surveys.map((survey) => ({
        surveyId: survey.id,
        title: survey.title,
        open: survey.open,
        mainImageUrl: survey.mainImageUrl || null,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
        deadline: survey.deadline,
        attendCount: countMap[survey.id] || 0,
        emailReportThreshold: survey.emailReportThreshold || null,
      }));
      queryCount++;
      if ('attendCount' in req.query) {
        preResult.sort((a, b) => b.attendCount - a.attendCount);
      } else if ('deadline' in req.query) {
        preResult.sort((a, b) => a.deadline - b.deadline);
      } else {
        preResult.sort((a, b) => b.createdAt - a.createdAt); // 아무 것도 없다면 만들어진 날짜로 내림차순을 디폴트로
      }

      const totalCount = await Survey.count({ where: { userId: userId } });
      queryCount++;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const currentPageData = preResult.slice(startIndex, endIndex);
      const end = performance.now();
      console.log(`=============`);
      console.log(
        `[수정 후(폼 모아보기)] 총 실행 시간: ${(end - start).toFixed(2)}ms`,
      );
      console.log(`[수정 후(폼 모아보기)] 총 쿼리 횟수: ${queryCount}번`);
      console.log(`==============`);
      res
        .status(200)
        .json({ surveys: currentPageData, totalPages: totalPages, totalCount: totalCount });
    } else {
      const selectSurveys = await Survey.findAll({
        where: { userId: userId },
        attributes: ['id', 'title'],
      });
      queryCount++; //내 설문 제목 목록

      if (!selectSurveys.length) {
        return res.status(204).json({ message: '작성된 설문지가 없습니다.' });
      }

      const titleList = [];
      for (const survey of selectSurveys) {
        titleList.push({
          surveyId: survey.id,
          surveyTitle: survey.title,
        });
      }

      const searchList = { surveys: titleList, title: title };
      const resultList = surveyTitleSearch(searchList);
      const len = resultList.surveys.length;
      const tp = Math.ceil(len / pageLimit);

      if (len == 0) {
        return res.status(208).json({ message: '검색된 설문지가 없습니다.' });
      }
      //검색된 설문 정보 한번에
      const surveys = await Survey.findAll({
        where: { id: resultList.surveys },
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
      queryCount++;
      //참여자 수
      const answerCounts = await Answer.findAll({
        attributes: [[literal('COUNT(DISTINCT "Answer"."userId")'), 'count']],
        include: [
          {
            model: Question,
            attributes: ['surveyId'],
            where: { surveyId: resultList.surveys },
            required: true,
          },
        ],
        group: [col('Question.surveyId')],
        raw: true,
      });
      queryCount++;
      //내가 참여했는지
      const myAnswers = await Answer.findAll({
        attributes: ['questionId'],
        where: { userId: userId },
        include: [
          {
            model: Question,
            attributes: ['surveyId'],
            where: { surveyId: resultList.surveys },
            required: true,
          },
        ],
        raw: true,
      });
      queryCount++;

      const countMap = {};
      for (const row of answerCounts) {
        countMap[row['Question.surveyId']] = parseInt(row.count);
      }
      const attendedSet = new Set(myAnswers.map((a) => a['Question.surveyId']));

      const sortedList = surveys.map((survey) => ({
        surveyId: survey.id,
        title: survey.title,
        mainImageUrl: survey.mainImageUrl || null,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
        deadline: survey.deadline,
        isAttended: attendedSet.has(survey.id),
        attendCount: countMap[survey.id] || 0,
      }));

      // 정렬된 결과와 전체 페이지 수를 반환합니다.
      if ('attendCount' in req.query) {
        sortedList.sort((a, b) => b.attendCount - a.attendCount);
      } else if ('deadline' in req.query) {
        sortedList.sort((a, b) => a.deadline - b.deadline);
      } else {
        sortedList.sort((a, b) => b.createdAt - a.createdAt);
      }

      const startIndex = (page - 1) * pageLimit;
      const endIndex = startIndex + pageLimit;
      const pagedSortedList = sortedList.slice(startIndex, endIndex);
      const end = performance.now();
      console.log(`=============`);
      console.log(
        `[수정 후(제목 검색)] 총 실행 시간: ${(end - start).toFixed(2)}ms`,
      );
      console.log(`[수정 후(제목검색)] 총 쿼리 횟수: ${queryCount}번`);
      console.log(`==============`);

      res.status(200).json({ sortedList: pagedSortedList, totalPages: tp });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '에러 발생', error: error.message });
  }
};

module.exports = { getUserSurveys };
