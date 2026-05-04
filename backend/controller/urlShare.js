const nodemailer = require('nodemailer');
const path = require('path');
const { Survey } = require('../models');

// 이메일 전송 함수
const sendMail = (transporter, options) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(options, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

// 설문조사 이메일 전송 함수
const sendSurveyEmailWithSurveyId = async (surveyId, emails) => {
  try {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      throw new Error('설문조사를 찾을 수 없습니다');
    }

    // 이미지 경로 설정 (압축 과정 제거)
    const imagePath = path.join(
      process.cwd(),
      'image',
      'formflexlogo.png', // 실제 가지고 계신 이미지 파일명으로 확인해주세요
    );

    // 이메일 전송 설정 (OAuth2 인증 사용)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_OAUTH_USER,
        clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
        clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
      },
    });

    // 모든 이메일에 대한 프로미스 생성
    const emailPromises = emails.map((email) => {
      const mailOptions = {
        from: `"Survey Team" <${process.env.EMAIL}>`,
        to: email,
        subject: '설문조사 참여 요청',
        html: `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px; background: linear-gradient(to right, #918DCA, #99A8DB, #A3C9F0);">
              <table align="center" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
                <tr>
                  <td style="background-color: #ffffff; padding: 20px; text-align: center;">
                    <h1 style="color: #333333;">설문조사 참여 요청</h1>
                    <img src="cid:formLogo" alt="타이틀 이미지" loading="lazy" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
            
                    <p style="color: #555555; font-size: 16px;">
                      귀하를 설문조사에 초대합니다. 아래 링크를 클릭하여 참여해 주세요.
                    </p>
                    <a href="${survey.url}" style="background-color: #918DCA; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
                      설문조사 참여하기
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
        attachments: [
          {
            filename: 'formflexlogo.png',
            path: imagePath,
            cid: 'formLogo', // html 태그의 src="cid:formLogo"와 일치시켜야 함
          },
        ],
      };

      return sendMail(transporter, mailOptions);
    });

    // 모든 이메일 전송
    await Promise.all(emailPromises);

    console.log('All emails sent');
    return { message: '이메일 발송 요청 완료' };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// PDF 리포트 이메일 전송 (메모리 버퍼, 디스크 저장 없음)
const sendReportEmail = async (email, pdfBuffer, surveyTitle) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_OAUTH_USER,
      clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
      clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
    },
  });

  const mailOptions = {
    from: `"FormFlex" <${process.env.EMAIL}>`,
    to: email,
    subject: `[FormFlex] 설문 분석 리포트: ${surveyTitle || '설문 결과'}`,
    html: `
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 20px; background: linear-gradient(to right, #918DCA, #99A8DB, #A3C9F0);">
            <table align="center" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
              <tr>
                <td style="background-color: #ffffff; padding: 30px; text-align: center; border-radius: 8px;">
                  <h1 style="color: #333333; font-size: 22px;">설문 분석 리포트</h1>
                  <p style="color: #555555; font-size: 16px; margin-top: 16px;">
                    <strong>${surveyTitle || '설문'}</strong>의 분석 결과가 첨부되어 있습니다.
                  </p>
                  <p style="color: #888888; font-size: 13px; margin-top: 8px;">
                    첨부된 PDF 파일을 열어 분석 결과를 확인하세요.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
    attachments: [
      {
        filename: `${surveyTitle || 'report'}_분석결과.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  await sendMail(transporter, mailOptions);
  return { message: '리포트 이메일 발송 완료' };
};

module.exports = { sendSurveyEmailWithSurveyId, sendReportEmail };
