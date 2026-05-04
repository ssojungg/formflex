/**
 * surveyRouter.js
 *
 * [라우트 선언 순서 규칙]
 * Express는 라우트를 선언된 순서대로 매칭합니다.
 * 아래 순서를 반드시 지켜야 라우팅 충돌이 발생하지 않습니다:
 *
 *  1. POST /           - 설문 생성 (고정 경로)
 *  2. GET  /:id/xxx    - 하위 경로가 있는 고정 패턴 (forms, join, results 등)
 *  3. POST /:id/share  - 공유 이메일 발송
 *  4. PUT/DELETE/POST /:id - 설문 수정·삭제·응답 저장
 *  5. GET  /:id        - 가장 범용적인 단일 ID 조회 (반드시 마지막)
 *
 * /:id 경로를 먼저 두면 'forms', 'all' 같은 하위 경로가 ID로 잘못 매칭됩니다.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const surveyController = require('../controller/surveyCreate');
const surveyModifyController = require('../controller/surveyModify');
const surveyAllUserController = require('../controller/formAllUser');
const surveyGetController = require('../controller/surveyContentRead');
const surveyAnsweredController = require('../controller/surveyAnswered');
const showAllSurveysController = require('../controller/showAllSurveys');
const surveyDeleteController = require('../controller/surveyDelete');
const surveyAnswerController = require('../controller/answerSave');
const getSurveyUrlController = require('../controller/getSurveyUrl');
const surveyResultController = require('../controller/surveyResult');
const getAnswerController = require('../controller/answerReadByuserId');
const { sendSurveyEmailWithSurveyId } = require('../controller/urlShare');
const getResultController = require('../controller/getResultsByRes');

// 1. POST / (생성)
router.post(
  '/',
  upload.fields([{ name: 'mainImageUrl' }, { name: 'imageUrl' }]),
  surveyController.createSurveyWithQuestionsAndChoices,
);

// 2. 구체적인 경로들 (고정된 경로들부터 먼저 선언)
router.get('/:userId/answers/:surveyId', getAnswerController.getAnswerByuserId);
router.get('/:id/forms', surveyAllUserController.getUserSurveys);
router.get('/:id/join', surveyAnsweredController.surveyAnswered);
router.get('/:id/results', surveyResultController.surveyResult);
router.get('/:id/all', showAllSurveysController.showAllSurveys);
router.get('/:id/urls', getSurveyUrlController.getUrl);
router.get('/:id/list', getResultController.getResultsByResponses);

// 3. POST /:id/share (순서 중요: 고정 경로 'share'를 :id 뒤에 선언)
router.post('/:id/share', async (req, res) => {
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
    console.error(error);
    res.status(500).json({ message: error.message || '서버 오류 발생' });
  }
});

// 4. 동작 경로 (PUT, DELETE, POST)
router.put(
  '/:id',
  upload.fields([{ name: 'mainImageUrl' }, { name: 'imageUrl' }]),
  surveyModifyController.ModifySurveyWithQuestionsAndChoices,
);
router.delete('/:id', surveyDeleteController.deleteSurveyAndRelatedData);
router.post('/:id', surveyAnswerController.createAnswer);

// 5. 가장 범용적인 GET /:id (맨 마지막에 위치해야 함)
router.get('/:id', surveyGetController.getSurveyById);

module.exports = router;
