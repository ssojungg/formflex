'use strict';

require('dotenv').config();

const {
  signup,
  login,
  isEmailRepeated,
  modifyPassword,
  getMyInfo,
} = require('./controller/UserController');
const {
  createSurveyWithQuestionsAndChoices,
} = require('./controller/surveyCreate');
const {
  ModifySurveyWithQuestionsAndChoices,
} = require('./controller/surveyModify');
const { getUserSurveys } = require('./controller/formAllUser');
const { getSurveyById } = require('./controller/surveyContentRead');
const { surveyAnswered } = require('./controller/surveyAnswered');
const { surveyResult } = require('./controller/surveyResult');
const { showAllSurveys } = require('./controller/showAllSurveys');
const { deleteSurveyAndRelatedData } = require('./controller/surveyDelete');
const { createAnswer } = require('./controller/answerSave');
const { getUrl } = require('./controller/getSurveyUrl');
const { sendSurveyEmailWithSurveyId } = require('./controller/urlShare');
const { getAnswerByuserId } = require('./controller/answerReadByuserId');
const { getResultsByResponses } = require('./controller/getResultsByRes');

const { Question, Answer, Choice } = require('./models');
const { sequelize } = require('./models');
const Excel = require('exceljs');

let isDbConnected = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type,Accept,X-Requested-With,remember-me',
  'Access-Control-Allow-Credentials': 'true',
};

function matchPath(pattern, path) {
  const paramNames = [];
  const regexStr =
    '^' +
    pattern.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    }) +
    '$';
  const regex = new RegExp(regexStr);
  const match = regex.exec(path);

  if (!match) {
    return null;
  }

  const params = {};
  paramNames.forEach((name, i) => {
    params[name] = decodeURIComponent(match[i + 1]);
  });
  return params;
}

//Lambda event -> Express 스타일 req 변환
function createReq(event, pathParams) {
  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      body = event.body;
    }
  }
  return {
    body,
    params: pathParams || {},
    query: event.queryStringParameters || {},
    headers: event.headers || {},
  };
}
//컨트롤러 호출 -> lambda 응답 변환
function callController(controllerFn, req) {
  return new Promise((resolve) => {
    const res = {
      _statusCode: 200,
      status(code) {
        this._statusCode = code;
        return this;
      },
      json(data) {
        resolve({
          statusCode: this._statusCode,
          headers: corsHeaders,
          body: typeof data === 'string' ? data : JSON.stringify(data),
        });
      },
      download() {
        resolve({
          statusCode: 501,
          headers: corsHeaders,
          body: JSON.stringify({ message: '파일 다운로드가 안됩니다' }),
        });
      },
    };

    Promise.resolve(controllerFn(req, res)).catch((err) => {
      resolve({
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          message: '인터넷 서버 오류',
          error: err.message,
        }),
      });
    });
  });
}

// 엑셀 다운도르 헨들러
async function handleExcelDownload(req) {
  const surveyId = req.params.surveyId;
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('설문 응답');
  try {
    const questions = await Question.findAll({ where: { surveyId } });
    if (!questions.length) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          message: '설문지를 찾을 수 없거나 설문지가 없습니다',
        }),
      };
    }
    const header = ['익명 ID', ...questions.map((q) => q.content)];
    worksheet.addRow(header);
    worksheet.columns = [
      { width: 10 },
      ...header.slice(1).map(() => ({ width: 45 })),
    ];

    const userData = {};
    for (const question of questions) {
      const answers = await Answer.findAll({
        where: { questionId: question.id },
      });
      for (const answer of answers) {
        const userId = answer.userId;
        if (!userData[userId]) userData[userId] = {};
        if (!userData[userId][question.id]) userData[userId][question.id] = [];

        if (answer.objContent) {
          const choice = await Choice.findByPk(answer.objContent);
          userData[userId][question.id].push(choice ? choice.option : 'N/A');
        } else {
          userData[userId][question.id].push(answer.subContent || 'N/A');
        }
      }
    }

    Object.keys(userData).forEach((userId) => {
      const row = [userId];
      questions.forEach((q) => {
        const cellData = userData[userId][q.id];
        row.push(cellData ? cellData.join(', ') : 'N/A');
      });
      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=survey+${surveyId}.xlsx`,
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: '엑셀 생성 오류', error: err.message }),
    };
  }
}

//라우트 정의
const routes = [
  //User
  { method: 'POST', path: '/api/users/signup', handler: signup },
  { method: 'POST', path: 'a,pi/users/login', handler: login },
  {
    method: 'POST',
    path: ',api/users/:email/check-email',
    handler: isEmailRepeated,
  },
  { method: 'PATCH', path: '/api/users/:id', handler: modifyPassword },
  { method: 'GET', path: '/api/users/:id', handler: getMyInfo },

  //survey
  {
    method: 'POST',
    path: '/api/surveys',
    handler: createSurveyWithQuestionsAndChoices,
  },
  {
    method: 'PUT',
    path: '/api/surveys/:id',
    handler: ModifySurveyWithQuestionsAndChoices,
  },
  {
    method: 'DELETE',
    path: '/api/surveys/:id',
    handler: deleteSurveyAndRelatedData,
  },
  {
    method: 'GET',
    path: '/api/surveys/:userId/answers/:surveyId',
    handler: getAnswerByuserId,
  },
  { method: 'GET', path: '/api/surveys/:id/forms', handler: getUserSurveys },
  { method: 'GET', path: '/api/surveys/:id/join', handler: surveyAnswered },
  { method: 'GET', path: '/api/surveys/:id/results', handler: surveyResult },
  {
    method: 'GET',
    path: '/api/surveys/:id/all',
    handler: showAllSurveys,
  },
  {
    method: 'GET',
    path: '/api/surveys/:id/urls',
    handler: getUrl,
  },
  {
    method: 'GET',
    path: '/api/surveys/:id/list',
    handler: getResultsByResponses,
  },
  { method: 'GET', path: '/api/surveys/:id', handler: getSurveyById },
  { method: 'POST', path: '/api/surveys/:id', handler: createAnswer },
  {
    method: 'POST',
    path: '/api/surveys/:id/share',
    handler: async (req, res) => {
      const surveyId = req.params.id;
      const { emails } = req.body;
      if (!Array.isArray(emails)) {
        return res
          .status(400)
          .json({ message: 'emails 필드가 배열 형식이 아닙니다' });
      }
      try {
        const response = await sendSurveyEmailWithSurveyId(surveyId, emails);
        res.status(200).json(response);
      } catch (error) {
        res.status(500).json({ message: error.message || '서버 오류 발생' });
      }
    },
  },
];

//메인 lambda핸들러
exports.handler = async (event) => {
  //CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  //DB 연결 (clod start시 한번만)
  if (!isDbConnected) {
    await sequelize.authenticate();
    isDbConnected = true;
  }
  const method = event.httpMethod;
  const path = event.path;

  //엑셀 다운로드 (별도 처리)
  const excelParams = matchPath('/api/surveys/:surveyId/download', path);
  if (method === 'GET' && excelParams) {
    return handleExcelDownload(createReq(event, excelParams));
  }

  //라우트 매칭
  for (const route of routes) {
    if (route.method !== method) continue;
    const params = matchPath(route.path, path);
    if (params) {
      const req = createReq(event, params);
      return callController(route.handler, req);
    }
  }

  //매칭 안되면 404
  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({
      message: `${method} ${path} 라우트를 찾을 수 없습니다`,
    }),
  };
};
