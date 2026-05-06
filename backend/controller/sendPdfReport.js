const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { PassThrough } = require('stream');
const path = require('path');
const { Survey, Question, Choice } = require('../models');

const FONT_PATH = path.join(__dirname, '../assets/fonts/NanumGothic.ttf');

const sendPdfReportEmail = async (surveyId, toEmail) => {
  //DB에서 질문 + 설문 + 선택지 한번에 가져오기
  const survey = await Survey.findByPk(surveyId, {
    include: [
      {
        model: Question,
        include: [Choice],
      },
    ],
  });
  if (!survey) throw new Error('설문을 찾을 수 없습니다.');

  //pdf 문서 생성
  const pdfBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    doc.registerFont('NanumGothic', FONT_PATH);
    doc.font('NanumGothic');
    const stream = new PassThrough();
    const chunks = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
    doc.on('error', reject);

    doc.pipe(stream);

    doc.fontSize(22).text('설문 분석 보고서', { align: 'center' }).moveDown(0.5);
    doc.fontSize(16).text(survey.title, { align: 'center' }).moveDown(1.5);

    for (const question of survey.Questions) {
      doc.fontSize(13).text(question.contnet).moveDown(0.3);

      if (question.Choices && question.Choices.length > 0) {
        for (const choice of question.Choices) {
          doc.fontSize(11).text(`  • ${choice.option}: ${choice.count}표`);
        }
      } else {
        doc.fontSize(11).fillColor('gray').text('  (주관식 질문)').fillColor('black');
      }
      doc.moveDown(1);
    }

    doc.end();
  });

  //이메일 발송 설정(기존 urlShare.js 동일한 OAuth2 방식)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_OAUTH_USER,
      clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
      clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
    },
  });
  await transporter.sendMail({
    from: `"FormFlex" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: `[FormFlex] 설문 분석 리포트 - ${survey.title}`,
    html: `
            <h2>설문 응답 목표를 달성했습니다! 🎉</h2>
            <p><strong>${survey.title}</strong> 설문의 응답자 수가 목표에 도달했습니다.</p>
            <p>첨부된 PDF 파일에서 분석 결과를 확인하세요.</p>
        `,
    attachments: [
      {
        filename: `report_${surveyId}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};

module.exports = { sendPdfReportEmail };
