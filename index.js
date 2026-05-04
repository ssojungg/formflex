require('dotenv').config();
const express = require('express');
const app = express();
const serverless = require('serverless-http'); // npm install serverless-http 필요
const YAML = require('js-yaml');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const { sequelize } = require('./backend/models');
const { createAndDownloadExcel } = require('./backend/excel/excelGengerate');
const surveyRouters = require('./backend/routers/surveyRouter');
const userRouters = require('./backend/routers/UserRouter');
const { getImageByAPI } = require('./backend/controller/getImageBySearch');
const cors = require('cors');

// 로컬 환경인지 람다 환경인지 체크
const IS_LAMBDA = process.env.AWS_LAMBDA_FUNCTION_NAME;
const port = process.env.NODE_DOCKER_PORT || 8000;

// 1. CORS 설정
app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, X-Requested-With, remember-me',
  }),
);

// 2. 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. 라우터 설정 (로컬/람다 공통)
const specs = YAML.load(
  fs.readFileSync('./swagger/swaggerconfig.yaml', 'utf8'),
);

app.use('/api/surveys', surveyRouters);
app.use('/api/users', userRouters);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/api/surveys/downloadExcel/:surveyId', createAndDownloadExcel);
app.get('/api/images/search/:query', getImageByAPI);

// 4. 데이터베이스 연결 및 서버 실행
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('데이터베이스 테이블 생성 완료');

    // 로컬 환경일 때만 app.listen 실행
    if (!IS_LAMBDA) {
      app.listen(port, () => {
        console.log(`로컬 서버 실행 중: http://localhost:${port}`);
      });
    }
  })
  .catch((err) => {
    console.error('데이터베이스 테이블 생성 실패:', err.stack);
  });

// 5. 람다 환경용 핸들러 (람다일 때만 작동)
if (IS_LAMBDA) {
  module.exports.handler = serverless(app);
}
