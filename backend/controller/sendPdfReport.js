const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
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
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 20px; background: linear-gradient(to right, #918DCA, #99A8DB, #A3C9F0);">
            <table align="center" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
              <tr>
                <td style="background-color: #ffffff; padding: 30px; text-align: center; border-radius: 8px;">
                  <h2 style="color: #333333;">설문 응답 목표를 달성했습니다! 🎉</h2>
                  <p style="color: #555555; font-size: 16px;">
                    <strong>${survey.title}</strong> 설문의 응답자 수가 목표에 도달했습니다.
                  </p>
                  <p style="color: #888888; font-size: 13px;">
                    첨부된 PDF 파일에서 분석 결과를 확인하세요.
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
        filename: `report_${surveyId}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};

module.exports = { sendPdfReportEmail };
