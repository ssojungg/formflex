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
const {
  sendSurveyEmailWithSurveyId,
  sendReportEmail,
} = require('./controller/urlShare');
const { getAnswerByuserId } = require('./controller/answerReadByuserId');
const { getResultsByResponses } = require('./controller/getResultsByRes');
const {
  generatePresignedUploadUrl,
  getFileFromS3,
  deleteFileFromS3,
} = require('./controller/imageUpload');
const { generateChoices, generateSummary } = require('./controller/gemini');

const { Question, Answer, Choice } = require('./models');
const { sequelize } = require('./models');
const Excel = require('exceljs');
//const { Models } = require('openai/resources/models.mjs');

let isDbConnected = false;

function getCorsHeaders(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type,Accept,X-Requested-With,remember-me,Authorization',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

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
function callController(controllerFn, req, corsHeaders) {
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
async function handleExcelDownload(req, corsHeaders) {
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

    const questionIds = questions.map((q) => q.id);

    const answers = await Answer.findAll({
      where: { questionId: questionIds },
    });

    const choiceIds = [
      ...new Set(answers.filter((a) => a.objContent).map((a) => a.objContent)),
    ];
    const choices = choiceIds.length
      ? await Choice.findAll({ where: { id: choiceIds } })
      : [];
    const choiceMap = new Map(choices.map((c) => [c.id, c.option]));

    const userData = {};
    for (const answer of answers) {
      const uid = answer.userId;
      if (!userData[uid]) userData[uid] = {};
      if (!userData[uid][answer.questionId])
        userData[uid][answer.questionId] = [];

      if (answer.objContent) {
        userData[uid][answer.questionId].push(
          choiceMap.get(answer.objContent) || 'N/A',
        );
      } else {
        userData[uid][answer.questionId].push(answer.subContent || 'N/A');
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
  { method: 'POST', path: '/api/users/login', handler: login },
  {
    method: 'POST',
    path: '/api/users/:email/check-email',
    handler: isEmailRepeated,
  },
  { method: 'PATCH', path: '/api/users/:id', handler: modifyPassword },
  { method: 'GET', path: '/api/users/:id', handler: getMyInfo },

  // Gemini
  {
    method: 'POST',
    path: '/api/surveys/gemini/choices',
    handler: generateChoices,
  },
  {
    method: 'POST',
    path: '/api/surveys/gemini/summary',
    handler: generateSummary,
  },

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
    method: 'GET',
    path: '/api/surveys/:id/report-upload-url',
    handler: async (req, res) => {
      try {
        const s3Key = `tmp/reports/${Date.now()}_survey${req.params.id}.pdf`;
        const uploadUrl = await generatePresignedUploadUrl(s3Key);
        res.status(200).json({ uploadUrl, s3Key });
      } catch (error) {
        res.status(500).json({ message: error.message || '서버 오류 발생' });
      }
    },
  },
  {
    method: 'POST',
    path: '/api/surveys/:id/report-email',
    handler: async (req, res) => {
      const { email, surveyTitle, s3Key } = req.body;
      if (!email)
        return res.status(400).json({ message: 'email 필드가 필요합니다' });
      if (!s3Key)
        return res.status(400).json({ message: 's3Key 필드가 필요합니다' });
      try {
        const pdfBuffer = await getFileFromS3(s3Key);
        const result = await sendReportEmail(email, pdfBuffer, surveyTitle);
        deleteFileFromS3(
          `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Key}`,
        ).catch(() => {});
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: error.message || '서버 오류 발생' });
      }
    },
  },
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
  const method = event.requestContext?.http?.method || event.httpMethod;
  const rawPath = event.rawPath || event.path;
  const path = rawPath.replace(/^\/formflex-[^/]+/, '');
  const corsHeaders = getCorsHeaders(event);
  //CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  //DB 연결 (clod start시 한번만)
  if (!isDbConnected) {
    await sequelize.authenticate();
    isDbConnected = true;
  }

  //엑셀 다운로드 (별도 처리)
  const excelParams = matchPath('/api/surveys/:surveyId/download', path);
  if (method === 'GET' && excelParams) {
    return handleExcelDownload(createReq(event, excelParams), corsHeaders);
  }

  //라우트 매칭
  for (const route of routes) {
    if (route.method !== method) continue;
    const params = matchPath(route.path, path);
    if (params) {
      const req = createReq(event, params);
      return callController(route.handler, req, corsHeaders);
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
