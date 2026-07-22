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
const { sendSurveyEmailWithSurveyId, sendReportEmail } = require('../controller/urlShare');
const { generatePresignedUploadUrl, getFileFromS3, deleteFileFromS3 } = require('../controller/imageUpload');
const getResultController = require('../controller/getResultsByRes');
const { generateChoices, generateSummary } = require('../controller/gemini');


// 1. POST / (생성)
router.post(
  '/',
  upload.fields([{ name: 'mainImageUrl' }, { name: 'imageUrl' }]),
  surveyController.createSurveyWithQuestionsAndChoices,
);

// 제미나이 
router.post('/gemini/choices',generateChoices);
router.post('/gemini/summary',generateSummary);

// 2. 구체적인 경로들 (고정된 경로들부터 먼저 선언)
router.get('/:userId/answers/:surveyId', getAnswerController.getAnswerByuserId);
router.get('/:id/forms', surveyAllUserController.getUserSurveys);
router.get('/:id/join', surveyAnsweredController.surveyAnswered);
router.get('/:id/results', surveyResultController.surveyResult);
router.get('/:id/all', showAllSurveysController.showAllSurveys);
router.get('/:id/urls', getSurveyUrlController.getUrl);
router.get('/:id/list', getResultController.getResultsByResponses);

// 3-a. GET /:id/report-upload-url (S3 presigned upload URL 발급)
router.get('/:id/report-upload-url', async (req, res) => {
  try {
    const s3Key = `tmp/reports/${Date.now()}_survey${req.params.id}.pdf`;
    const uploadUrl = await generatePresignedUploadUrl(s3Key);
    res.status(200).json({ uploadUrl, s3Key });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || '서버 오류 발생' });
  }
});

// 3-b. POST /:id/report-email
// PDF를 multipart('pdf')로 직접 받아 이메일 발송 (S3/버킷 CORS 불필요).
// 레거시 클라이언트가 s3Key(JSON)만 보내는 경우 S3에서 읽어오는 경로도 유지.
router.post('/:id/report-email', upload.single('pdf'), async (req, res) => {
  const { email, surveyTitle, s3Key } = req.body;

  if (!email) return res.status(400).json({ message: 'email 필드가 필요합니다' });

  try {
    let pdfBuffer;
    if (req.file) {
      pdfBuffer = req.file.buffer; // 직접 업로드된 PDF (권장 경로)
    } else if (s3Key) {
      pdfBuffer = await getFileFromS3(s3Key); // 레거시 S3 경로 (하위 호환)
    } else {
      return res.status(400).json({ message: 'pdf 파일 또는 s3Key가 필요합니다' });
    }

    const result = await sendReportEmail(email, pdfBuffer, surveyTitle);

    if (s3Key) {
      deleteFileFromS3(`https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Key}`).catch(() => {});
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || '서버 오류 발생' });
  }
});

// 3-b. POST /:id/share (순서 중요: 고정 경로 'share'를 :id 뒤에 선언)
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
