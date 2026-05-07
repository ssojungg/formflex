const chromium = require('@sparticuz/chromium'); //chrome 오픈소스 브라우저 실행 엔진(람다 환경용)
const puppeteer = require('puppeteer-core'); //브라우저를 코드로 조종하는 도구 
const nodemailer = require('nodemailer');
const { Survey, User } = require('../models');

const FRONTEND_URL = process.env.FRONTEND_URL;

const generatePdfWithPuppeteer = async (surveyId, owner) => {
  let browser = null;
  try {
    const executablePath = await chromium.executablePath();
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--disable-dev-shm-usage',
        '--no-zygote',
      ],
      defaultViewport: { width: 1280, height: 900 },
      executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // 1. 인증 없는 페이지로 먼저 이동해서 sessionStorage 원본 도메인 확보
    await page.goto(`${FRONTEND_URL}/login`, {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });

    // 2. zustand persist 형식으로 sessionStorage에 auth 주입 (ProtectedRoute 우회)
    await page.evaluate(
      (authState) => {
        sessionStorage.setItem('auth', JSON.stringify({ state: authState, version: 0 }));
      },
      {
        userId: owner.id,
        isLoggedIn: true,
        userName: owner.name,
        userEmail: owner.email,
      },
    );

    // 3. 분석 결과 페이지로 이동
    await page.goto(`${FRONTEND_URL}/result?id=${surveyId}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // 4. ApexCharts 렌더링 대기 (주관식만 있으면 타임아웃 후 계속 진행)
    try {
      await page.waitForSelector('.apexcharts-canvas', { timeout: 12000 });
    } catch {
      // 차트 없는 설문(주관식 전용)이면 데이터 로딩만 기다림
      await new Promise((r) => setTimeout(r, 3000));
    }

    // 5. 차트 애니메이션 완료 대기
    await new Promise((r) => setTimeout(r, 2000));

    // 6. PDF 변환 (A4, 배경색 포함)
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
};

const sendPdfReportEmail = async (surveyId, toEmail) => {
  const survey = await Survey.findByPk(surveyId);
  if (!survey) throw new Error('설문을 찾을 수 없습니다.');

  const owner = await User.findByPk(survey.userId, {
    attributes: ['id', 'name', 'email'],
  });
  if (!owner) throw new Error('설문 소유자를 찾을 수 없습니다.');

  const pdfBuffer = await generatePdfWithPuppeteer(surveyId, owner);

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
                    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#918DCA;text-align:center;text-transform:uppercase;letter-spacing:1px;">GOAL ACHIEVED</p>
                    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1c1c2e;text-align:center;line-height:1.3;">응답 목표 달성!</h1>
                    <p style="margin:0 0 28px;font-size:14px;color:#999;text-align:center;">분석 리포트가 준비되었습니다</p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:linear-gradient(135deg,#f0effe,#eaf4ff);border-radius:10px;padding:22px 24px;text-align:center;">
                          <p style="margin:0 0 4px;font-size:13px;color:#999;">설문 제목</p>
                          <p style="margin:0;font-size:16px;font-weight:600;color:#1c1c2e;">${survey.title}</p>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                      <tr>
                        <td style="border-left:3px solid #918DCA;padding:4px 0 4px 16px;">
                          <p style="margin:0;font-size:14px;color:#666;line-height:1.7;">설정하신 응답자 목표에 도달했습니다. 첨부된 PDF에서 전체 응답 통계와 인사이트를 확인하세요.</p>
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
        filename: `report_${surveyId}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};

module.exports = { sendPdfReportEmail };
