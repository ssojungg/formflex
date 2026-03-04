'use strict'

require('dotenv').config();

const { singup, login, isEmailRepeated, modifyPassword, getMyInfo } = require('./controller/UserController');
const {createSurveyWithQuestionsAndChoices } = require('./controller/surveyCreate');
const {ModifySurveyWithQuestionAndChoices} = require ('./controller/surveyModify');
const {getUserSurveys} = require('./controller/formAllUser');
const {getSurveyById} = require ('./controller/surveyContentRead');
const {surveyAnswered} = require('./controller/surveyAnswered');
const {surveyResult} = require ('./controller/surveyResult');
const {showAllSurvey} = require ('./controller/showAllSurveys');
const {deleteSurveyAndRelatedDate} = require('./controller/surveyDelete');
const {createAnswer} = require('./controller/answerSave');
const {getUrl} = require('./controller/getSurveyUrl');
const {sendSurveyEmailWithSurveyId} =require('./controller/urlShare');
const {getAnswerByuserId} = require('./controller/getResultsByRes');
const {Question,Answer,Choice} = require('./models');
const {sequelize} = require('./models');
const Excel = require('exceljs');
const choice = require('./models/choice');
const { json } = require('body-parser');

let isDbConnected = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Accept,X-Request-With,remember-me',
  'Access-Control-Allow-Credentials': 'true',
};

function mathPath(pattern,path) {
    const paramNames = [];
    const regexStr = 
    '^' +
    pattern.replace(/:(\w+)/g, (_,name)=> {
        paramNames.push(name);
        return '([^/]+)';
    }) +
    '$';
    const params = {};
    paramNames.forEach((name,i) => {
        params[name] = decodeURIComponent(match[i+1]);

    });
    return params;
}

function createReq(event,pathParams) {
    let body = {};
    if(event.body) {
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            body = event.body;
        }
    }
    return {
        body,
        params : pathParams || {},
        query: event.queryStringParameters || {},
        headers: event.headers || {},
    };

}

function callController(controllerFn,req) {
    return new Promise((resolve) => {
        const res = {
            _statusCode: 200,
            status(code) {
                this._statusCode = code;
                return this;
            },
            json(data) {
                resolve({
                    statusCode : this._statusCode,
                    headers: corsHeaders,
                    body: typeof data === 'string'? data : JSON.stringify(data),
                });
            },
            download() {
                resolve({
                    statusCode: 501,
                    headers: corsHeaders,
                    body: JSON.stringify({message: '파일 다운로드가 안됩니다'}),
                });
            },
        };

        Promise.resolve(controllerFn(req,res)).catch((err)=> {
            resolve({
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({message: '인터넷 서버 오류',error: err.message}),
            });
        });
    });
}

async function handleExcelDownload(req) {
    const surveyId = req.params.surveyId;
    const workbook= new Excel.workbook();
    const worksheet = workbook.addWorksheet('설문 응답');
    try {
        const questions = await Question.findAll({where: {surveyId}});
        if (!questions.length) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body : JSON.stringify({message: '설문지를 찾을 수 없거나 설문지가 없습니다'}),
            };
        }
        const header = ['익명 ID', ...questions.map((q) => q.content)];
        worksheet.addRow(header);
        worksheet.columns = [
            {width: 10},
            ...header.slice(1).map(() => ({width: 45})),
        ];

        const userData = {};
        for (const question of questions) {
            const answer = await Answer.findAll({where: {questionId: question.id}});
            for (const answer of answers) {
                const userId = answer.userId;
                if(!userData[userId]) userData[userId] = {};
                if(!userData[userId][question.id]) userData[userId][question.id]=[];
                
                if (answer.objContent) {
                    const choice = await Choice.findByPk(answer.objContent);
                    userData[userId][question.id].push(choice ? choice.option: 'N/A');

                } else {
                    userData[userId][question.id].push(answer.subCotent || 'N/A');

                }
            }
        }

        Object.keys(userData).forEach((userId) => {
            const userRow = 
        })
    }

}