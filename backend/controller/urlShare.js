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
      secure: false,
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
        <div style="margin:0;padding:0;background-color:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6fa;padding:48px 20px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

                  <tr>
                    <td style="background:linear-gradient(135deg,#918DCA 0%,#A3C9F0 100%);padding:28px 40px;border-radius:14px 14px 0 0;text-align:center;">
                      <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">FormFlex</span>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color:#ffffff;padding:44px 48px 36px;border-radius:0 0 14px 14px;">
                      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#918DCA;text-align:center;text-transform:uppercase;letter-spacing:1px;">SURVEY INVITATION</p>
                      <h1 style="margin:0 0 28px;font-size:24px;font-weight:700;color:#1c1c2e;text-align:center;line-height:1.3;">설문조사에 초대합니다</h1>

                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background-color:#f8f8fc;border-radius:10px;padding:20px 24px;">
                            <p style="margin:0;font-size:15px;color:#555;line-height:1.75;text-align:center;">
                              귀하의 소중한 의견을 듣고 싶습니다.<br>아래 버튼을 눌러 설문에 참여해주세요.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                        <tr>
                          <td align="center">
                            <a href="${survey.url}" style="display:inline-block;background:linear-gradient(135deg,#918DCA,#A3C9F0);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:15px 48px;border-radius:50px;letter-spacing:0.2px;">
                              설문 참여하기
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:28px 0 0;font-size:12px;color:#bbb;text-align:center;line-height:1.6;">
                        버튼이 작동하지 않으면 아래 링크를 복사해 브라우저에 붙여넣으세요.<br>
                        <a href="${survey.url}" style="color:#918DCA;word-break:break-all;">${survey.url}</a>
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:24px 0 8px;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#bbb;">© 2025 FormFlex · 본 메일은 발신 전용입니다.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </div>
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
      <div style="margin:0;padding:0;background-color:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6fa;padding:48px 20px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

                <tr>
                  <td style="background:linear-gradient(135deg,#918DCA 0%,#A3C9F0 100%);padding:28px 40px;border-radius:14px 14px 0 0;text-align:center;">
                    <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">FormFlex</span>
                  </td>
                </tr>

                <tr>
                  <td style="background-color:#ffffff;padding:44px 48px 36px;border-radius:0 0 14px 14px;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#918DCA;text-align:center;text-transform:uppercase;letter-spacing:1px;">SURVEY REPORT</p>
                    <h1 style="margin:0 0 28px;font-size:24px;font-weight:700;color:#1c1c2e;text-align:center;line-height:1.3;">설문 분석 리포트</h1>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color:#f8f8fc;border-radius:10px;padding:20px 24px;">
                          <p style="margin:0 0 6px;font-size:13px;color:#999;text-align:center;">분석 대상 설문</p>
                          <p style="margin:0;font-size:16px;font-weight:600;color:#1c1c2e;text-align:center;">${surveyTitle || '설문 결과'}</p>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                      <tr>
                        <td style="border-left:3px solid #A3C9F0;padding:4px 0 4px 16px;">
                          <p style="margin:0;font-size:14px;color:#666;line-height:1.7;">분석 리포트가 첨부 파일로 준비되었습니다. PDF를 열어 응답 통계와 인사이트를 확인하세요.</p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:32px 0 0;font-size:12px;color:#bbb;text-align:center;">© 2025 FormFlex · 본 메일은 발신 전용입니다.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
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
