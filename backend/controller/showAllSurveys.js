const { Survey, Answer, Question } = require('../models');
const { surveyTitleSearch } = require('./surveyTitleSearch');
const Redis = require('ioredis');
const redisClient = process.env.REDIS_HOST
  ? new Redis({
      host: process.env.REDIS_HOST,
      port: 6379,
    })
  : null;

const showAllSurveys = async (req, res) => {
  try {
    // Request로부터 Parameter 값들 가져오기
    const userId = req.params.id;
    const pageLimit = parseInt(req.query.limit);
    const page = req.query.page;
    const startIndex = (page - 1) * pageLimit;
    const title = req.query.title;

    if (!title) {
      const cachedSurveysAttendCount = await redisClient.get('cachedSurveysAttendCount');
      const cachedSurveysDeadline = await redisClient.get('cachedSurveysDeadline');
      const cachedSurveysCreatedAt = await redisClient.get('cachedSurveysCreatedAt');

      if (cachedSurveysAttendCount && 'attendCount' in req.query) {  
        const startTime = new Date();

        const surveys = JSON.parse(cachedSurveysAttendCount);
        const pagedSurveys = surveys.slice(startIndex, startIndex + pageLimit);

        const endTime = new Date();
        const elapsedTime = endTime - startTime;
        console.log(`Redis cache에 삽입된 후 코드 실행 시간[참여자]: ${elapsedTime} 밀리초`);

        res.status(200).json({
          surveys: pagedSurveys,
          totalPages: Math.ceil(surveys.length / pageLimit),
        });
      } else if(cachedSurveysDeadline && 'deadline' in req.query){
        const startTime = new Date();

        const surveys = JSON.parse(cachedSurveysDeadline);
        const pagedSurveys = surveys.slice(startIndex, startIndex + pageLimit);

        const endTime = new Date();
        const elapsedTime = endTime - startTime;
        console.log(`Redis cache에 삽입된 후 코드 실행 시간[데드라인]: ${elapsedTime} 밀리초`);

        res.status(200).json({
          surveys: pagedSurveys,
          totalPages: Math.ceil(surveys.length / pageLimit),
        });
      } else if (cachedSurveysCreatedAt && !('deadline' in req.query || 'attendCount' in req.query)){
        const startTime = new Date();

        const surveys = JSON.parse(cachedSurveysCreatedAt);
        
        const pagedSurveys = surveys.slice(startIndex, startIndex + pageLimit);
        console.log(pagedSurveys.length);
        const endTime = new Date();
        const elapsedTime = endTime - startTime;
        console.log(`Redis cache에 삽입된 후 코드 실행 시간[생성]: ${elapsedTime} 밀리초`);

        res.status(200).json({
          surveys: pagedSurveys,
          totalPages: Math.ceil(surveys.length / pageLimit),
        });
      } else {
      // 전체 설문에 대해 attended_count 계산
      const startTime = new Date();

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

      if (!surveys.length) {
        return res.status(204).json({ message: '작성된 설문지가 없습니다.' });
      }

      const preResult = [];
      for (const survey of surveys) {
        const answer = await Answer.findOne({
          where: { userId: userId },
          include: [
            {
              model: Question,
              where: { surveyId: survey.id },
            },
          ],
        });

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

      // 정렬
      if ('attendCount' in req.query) {
        preResult.sort((a, b) => b.attendCount - a.attendCount);
        await redisClient.set('cachedSurveysAttendCount', JSON.stringify(preResult));
      } else if ('deadline' in req.query) {
        preResult.sort((a, b) => a.deadline - b.deadline);
        await redisClient.set('cachedSurveysDeadline', JSON.stringify(preResult));
      } else {
        preResult.sort((a, b) => b.createdAt - a.createdAt);
        await redisClient.set('cachedSurveysCreatedAt', JSON.stringify(preResult));
      }

      // 페이지에 해당하는 데이터 추출
      const pagedSurveys = preResult.slice(startIndex, startIndex + pageLimit);

      const endTime = new Date();

      const elapsedTime = endTime - startTime;
      console.log(`Redis cache에 삽입되기 전 코드 실행 시간: ${elapsedTime} 밀리초`);
  
      res.status(200).json({
        surveys: pagedSurveys,
        totalPages: Math.ceil(preResult.length / pageLimit),
      });}
    } else { // 여기서 부터 제목이 있을 때

      const cachedSurveysAttendCountTitle = await redisClient.get('cachedSurveysAttendCountTitle');
      const cachedSurveysDeadlineTitle = await redisClient.get('cachedSurveysDeadlineTitle');
      const cachedSurveysCreatedAtTitle = await redisClient.get('cachedSurveysCreatedAtTitle');

      if (cachedSurveysAttendCountTitle && 'attendCount' in req.query) {  
        const startTime = new Date();

        const surveys = JSON.parse(cachedSurveysAttendCountTitle);
        const pagedSurveys = surveys.slice(startIndex, startIndex + pageLimit);

        const endTime = new Date();
        const elapsedTime = endTime - startTime;
        console.log(`Redis cache에 삽입된 후 코드 실행 시간: ${elapsedTime} 밀리초`);

        res.status(200).json({
          surveys: pagedSurveys,
          totalPages: Math.ceil(surveys.length / pageLimit),
        });
      } else if(cachedSurveysDeadlineTitle && 'deadline' in req.query){
        const startTime = new Date();

        const surveys = JSON.parse(cachedSurveysDeadlineTitle);
        const pagedSurveys = surveys.slice(startIndex, startIndex + pageLimit);

        const endTime = new Date();
        const elapsedTime = endTime - startTime;
        console.log(`Redis cache에 삽입된 후 코드 실행 시간: ${elapsedTime} 밀리초`);

        res.status(200).json({
          surveys: pagedSurveys,
          totalPages: Math.ceil(surveys.length / pageLimit),
        });
      } else if (cachedSurveysCreatedAtTitle && !('deadline' in req.query || 'attendCount' in req.query)){
        const startTime = new Date();

        const surveys = JSON.parse(cachedSurveysCreatedAtTitle);
        const pagedSurveys = surveys.slice(startIndex, startIndex + pageLimit);

        const endTime = new Date();
        const elapsedTime = endTime - startTime;
        console.log(`Redis cache에 삽입된 후 코드 실행 시간: ${elapsedTime} 밀리초`);

        res.status(200).json({
          surveys: pagedSurveys,
          totalPages: Math.ceil(surveys.length / pageLimit),
        });
      } else {
        const startTime = new Date();
        const selectSurveys = await Survey.findAll({
          where: { open: true },
          attributes: ['id', 'title'],
        });
  
        if (!selectSurveys.length) {
          return res.status(204).json({ message: '작성된 설문지가 없습니다.' });
        }
       
        const titleList = selectSurveys.map((survey) => ({
          surveyId: survey.id,
          surveyTitle: survey.title,
        }));
  
        const searchList = { surveys: titleList, title: title };
        const resultList = surveyTitleSearch(searchList);
        const len = resultList.surveys.length;
  
        if (len === 0) {
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
  
          const answer = await Answer.findOne({
            where: { userId: userId },
            include: [
              {
                model: Question,
                where: { surveyId: survey.id },
              },
            ],
          });
  
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
  
        // 정렬
        if ('attendCount' in req.query) {
          sortedList.sort((a, b) => b.attendCount - a.attendCount);
          await redisClient.set('cachedSurveysAttendCountTitle', JSON.stringify(sortedList));
        } else if ('deadline' in req.query) {
          sortedList.sort((a, b) => a.deadline - b.deadline);
          await redisClient.set('cachedSurveysDeadlineTitle', JSON.stringify(sortedList));
        } else {
          sortedList.sort((a, b) => b.createdAt - a.createdAt);
          await redisClient.set('cachedSurveysCreatedAtTitle', JSON.stringify(sortedList));
        }

        // 페이지에 해당하는 데이터 추출
        const startIndex = (page - 1) * pageLimit;
        const endIndex = startIndex + pageLimit;
        const pagedSortedList = sortedList.slice(startIndex, endIndex);
  
        const endTime = new Date();

        const elapsedTime = endTime - startTime;
        console.log(`Redis cache에 삽입되기 전 코드 실행 시간: ${elapsedTime} 밀리초`);
  
        res
          .status(200)
          .json({
            sortedList: pagedSortedList,
            totalPages: Math.ceil(len / pageLimit),
          });
      }
      }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '데이터를 불러오는데 실패했습니다.' });
  }
};

module.exports = { showAllSurveys };