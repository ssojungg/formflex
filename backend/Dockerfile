#이미지를 어셈블하기 위해 호출할 수 있는 명령이 포함된 간단한 텍스트 파일
#이미지 빌드
FROM node:18.19.0-alpine
# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 파일을 /app 디렉토리로 복사
COPY package*.json /app/

# npm 패키지 설치
RUN npm install
RUN npm install -g nodemon

# package.json과 package-lock.json 파일을 /usr/src/app 디렉토리로 복사
COPY . /app

#CMD ["npm", "start"]
CMD ["nodemon", "index.js", "-L"]

