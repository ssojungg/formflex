const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

//람다 서버에 연결하는 클라이언트
const lambdaClient = new LambdaClient({
  region: process.env.AWS_LAMBDA_REGION,
  Credential: {
    aceessKeyId: process.env.AWS_ACCESS_KEY,
    secretAcessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

//람다 함수 실행하는 명령어
//payload = 람다에 보낼 데이터
async function invokeLambda(payload) {
  const command = new InvokeCommand({
    FunctionName: 'formflex',
    InvocationType: 'RequestResponse', //동기 호출(응답 올 때까지 기다림)
    Payload: JSON.stringify(payload),
  });

  //람다 실행 후 응답 받기
  const response = await lambdaClient.send(command);
  //응답 데이터 읽을 수 있는 형태로 변환
  const result = JSON.parse(Buffer.from(response.Payload).toString());
  return result;
}
module.exports = { invokeLambda };
