require('dotenv').config(); // 이 부분을 코드 맨 위로 옮기세요.
const express = require('express');
const app = express();
const port = process.env.NODE_DOCKER_PORT || 8000;
const YAML = require('js-yaml');
const fs = require('fs');
//const Redis = require('redis');
//const redisClient = new Redis.createClient();
const swaggerUi = require('swagger-ui-express');
const specs = YAML.load(
  fs.readFileSync('./swagger/swaggerconfig.yaml', 'utf8'),
);
// const http = require('http');
const { sequelize } = require('../models');
const { createAndDownloadExcel } = require('../excel/excelGengerate');
//const { getGptReponse } = require('../gpt/gptAPI');
const surveyRouters = require('../routers/surveyRouter');
const userRouters = require('../routers/UserRouter');
const { getImageByAPI } = require('../controller/getImageBySearch');
const cors = require('cors');

// let corsOptions = {
//   origin: '*', // 출처 허용 옵션
//   credential: true, // 사용자 인증이 필요한 리소스(쿠키 등) 접근
// };

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, X-Requested-With, remember-me',
  }),
);

//app.use(cors(corsOptions));

// app.all("/*", function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://formflex");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header("Access-Control-Allow-Methods", "OPTIONS,POST,GET,PUT,DELETE");
//   next();
// });
// app.use(
//   cors()
// );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('데이터베이스 테이블 생성 완료');

    app.use('/api/surveys', surveyRouters);

    app.use('/api/users', userRouters);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    app.get('/api/surveys/downloadExcel/:surveyId', createAndDownloadExcel);

    app.get('/api/images/search/:query', getImageByAPI);

    //app.post('/api/gpt-prompt', getGptReponse);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('데이터베이스 테이블 생성 실패:', err.stack);
  });
