const Excel = require('exceljs');
//const fs = require('fs');
const { Question, Answer, Choice } = require('../models');

//const dir = '/path/to/excel'; //엑셀 파일을 저장할 곳

// 'excel' 폴더가 없으면 생성
// if (!fs.existsSync(dir)) {
//   fs.mkdirSync(dir, { recursive: true });
// }

const createAndDownloadExcel = async (req, res) => {
  const surveyId = req.params.surveyId;
  let workbook = new Excel.Workbook();
  let worksheet = workbook.addWorksheet('Survey Answers');

  try {
    const questions = await Question.findAll({
      where: { surveyId: surveyId },
    });

    if (!questions.length) {
      return res
        .status(404)
        .send('Survey not found or no questions associated with it.');
    }

    // 헤더에 '익명UserID' 대신 'UserID'를 사용
    const header = ['익명ID', ...questions.map((q) => q.content)];
    worksheet.addRow(header);

    worksheet.columns = [
      { width: 10 }, // 1열의 너비를 10으로 설정
      ...header.slice(1).map(() => ({ width: 45 })), // 나머지 열의 너비를 80으로 설정
    ];

    let userData = {};

    for (const question of questions) {
      const answers = await Answer.findAll({
        where: { questionId: question.id },
      });

      for (const answer of answers) {
        const userId = answer.userId;
        if (!userData[userId]) {
          userData[userId] = {};
        }
        if (!userData[userId][question.id]) {
          userData[userId][question.id] = [];
        }

        if (answer.objContent) {
          const choice = await Choice.findByPk(answer.objContent);
          userData[userId][question.id].push(choice ? choice.option : 'N/A');
        } else {
          userData[userId][question.id].push(answer.subContent || 'N/A');
        }
      }
    }

    Object.keys(userData).forEach((userId) => {
      // 여기서 '익명'을 사용자 ID 앞에 추가합니다.
      const userRow = [`익명${userId}`];
      questions.forEach((question) => {
        const answers = userData[userId][question.id] || [];
        userRow.push(answers.join(', '));
      });
      worksheet.addRow(userRow);
    });

    const tempFilePath = `/path/to/excel/survey_answers_${surveyId}.xlsx`;
    await workbook.xlsx.writeFile(tempFilePath);
    res.download(tempFilePath, `survey_answers_${surveyId}.xlsx`);
  } catch (error) {
    console.error('Error creating Excel file', error);
    res.status(500).send('Error creating Excel file');
  }
};

module.exports = { createAndDownloadExcel };
