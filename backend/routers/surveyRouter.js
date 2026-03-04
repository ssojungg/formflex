const express = require('express');
const router = express.Router();
const multer = require('multer'); // ← S3 대신 기본 multer 사용
const upload = multer(); // ← 로컬 테스트용
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

router.post(
  '/',
  upload.fields([{ name: 'mainImageUrl' }, { name: 'imageUrl' }]),
  surveyController.createSurveyWithQuestionsAndChoices,
);
//router.post('/', surveyController.createSurveyWithQuestionsAndChoices);
router.get('/:userId/answers/:surveyId', getAnswerController.getAnswerByuserId);
router.put('/:id', surveyModifyController.ModifySurveyWithQuestionsAndChoices);
router.get('/:id/forms', surveyAllUserController.getUserSurveys);
router.get('/:id/join', surveyAnsweredController.surveyAnswered);
router.get('/:id/results', surveyResultController.surveyResult);
router.get('/:id', surveyGetController.getSurveyById);
router.get('/:id/all', showAllSurveysController.showAllSurveys);
router.delete('/:id', surveyDeleteController.deleteSurveyAndRelatedData);
router.post('/:id', surveyAnswerController.createAnswer);
router.get('/:id/urls', getSurveyUrlController.getUrl);
router.post('/:id/share', async (req, res) => {
  console.log('Request body:', req.body);
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

router.get('/:id/list', getResultController.getResultsByResponses);

module.exports = router;
