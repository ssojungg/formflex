const {
  sequelize,
  User,
  Survey,
  Question,
  Choice,
  Answer,
} = require('./models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB 연결 성공');

    const users = [];
    for (let i = 3; i <= 7; i++) {
      const [user] = await User.findOrCreate({
        where: { email: `test${i}@gmail.com` },
        defaults: {
          name: `테스트유저${i}`,
          email: `test${i}@gmail.com`,
          password: `password${i}`,
        },
      });
      users.push(user);
    }
    console.log(`유저 ${users.length}명 준비 완료`);

    for (let i = 1; i <= 50; i++) {
      const owner = users[i % 5];
      const survey = await Survey.create({
        userId: owner.id,
        title: `더미 설문조사 ${i}`,
        description: `더미 설문 ${i}번입니다.`,
        open: true,
        url: 'https://formflex.site/placeholder',
        font: 'pretendard',
        color: '#918DCA',
        buttonStyle: 'round',
        deadline: new Date('2026-12-31'),
      });

      const q1 = await Question.create({
        surveyId: survey.id,
        type: 'MULTIPLE_CHOICE',
        content: `더미 질문 ${i}`,
      });

      const choices = [];
      for (let c = 1; c <= 3; c++) {
        const choice = await Choice.create({
          questionId: q1.id,
          option: `선택지 ${c}`,
        });
        choices.push(choice);
      }

      const answerCount = 3 + Math.floor(Math.random() * 3);
      for (let u = 0; u < answerCount && u < users.length; u++) {
        await Answer.create({
          questionId: q1.id,
          userId: users[u].id,
          objContent: choices[Math.floor(Math.random() * 3)].id,
        });
      }

      if (i % 10 === 0) console.log(`[${i}/100] 생성 완료`);
    }

    console.log('=== 100개 시드 데이터 삽입 완료! ===');
    process.exit(0);
  } catch (err) {
    console.error('시드 에러:', err);
    process.exit(1);
  }
};

seed();
