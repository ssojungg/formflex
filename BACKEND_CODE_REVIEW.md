# Backend Code Review — FormFlex

## 1. 보안 (Security) — 심각도: Critical

### 1-1. 비밀번호 평문 저장 및 비교
- **위치**: `controller/UserController.js:20-24, :52`
- 비밀번호를 해싱(bcrypt 등) 없이 평문으로 DB에 저장하고, 로그인 시에도 평문 비교
- DB 유출 시 모든 사용자 비밀번호 노출

### 1-2. 비밀번호를 API 응답에 포함
- **위치**: `controller/UserController.js:113`
- `getMyInfo` API가 비밀번호를 그대로 클라이언트에 반환
- 절대로 비밀번호를 응답에 포함하면 안 됨

### 1-3. 인증/인가(Authentication/Authorization) 미구현
- JWT, 세션 등의 인증 미들웨어가 전혀 없음
- 모든 API가 인증 없이 접근 가능
- 누구나 설문 삭제/수정, 타인 정보 조회 가능

### 1-4. S3 ACL `public-read-write`
- **위치**: `controller/imageUpload.js:28, :100`
- 누구나 S3 버킷의 파일을 읽고 쓸 수 있음
- `public-read` 또는 signed URL 방식 사용 필요

### 1-5. 이메일 URL 삽입 피싱 가능
- **위치**: `controller/urlShare.js:93`
- `survey.url`이 DB에서 직접 가져와 HTML 이메일에 삽입됨
- URL 조작 시 피싱 링크 이메일 전송 가능

---

## 2. 버그 (Bugs) — 심각도: High

### 2-1. 라우트 매칭 충돌
- **위치**: `server/index.js:59-69`
- `app.use('/api/surveys', surveyRouters)` 이후에 `app.get('/api/surveys/downloadExcel/:surveyId', ...)` 등록
- surveyRouter의 `/:id` 패턴에 `downloadExcel`이 먼저 매칭될 수 있음

### 2-2. 트랜잭션 옵션 오류
- **위치**: `controller/answerSave.js:15`
- `{ t }` 대신 `{ transaction: t }` 사용 필요
- 현재 트랜잭션 밖에서 읽기 수행

### 2-3. 주관식 답변 트랜잭션 누락
- **위치**: `controller/answerSave.js:123-128`
- `Answer.create()`에 `{ transaction: t }` 누락
- 롤백 시에도 데이터가 남음

### 2-4. early return 시 트랜잭션 미롤백
- **위치**: `controller/answerSave.js` 전반
- `return res.status(400)` 등 early return 시 `t.rollback()` 미호출
- DB 커넥션 풀 고갈 가능

### 2-5. raw query 트랜잭션 미사용
- **위치**: `controller/surveyDelete.js:24-29`
- `sequelize.query()`에 `transaction: t` 누락

### 2-6. Redis 하드코딩 IP
- **위치**: `controller/showAllSurveys.js:4-7`
- Redis 호스트 `172.31.20.50` 하드코딩
- 환경변수 사용 필요

### 2-7. Redis 클라이언트 미사용
- **위치**: `server/index.js:8`
- `redis` 패키지로 클라이언트 생성하나 미사용, `connect()` 미호출
- `showAllSurveys.js`에서는 `ioredis`로 별도 클라이언트 생성

### 2-8. 전역 변수 누출
- **위치**: `gpt/gptAPI.js:74`
- `for (i = 0; ...)` — `let`/`const` 없이 전역 변수 생성
- 동시 요청 시 예측 불가 버그

### 2-9. 포트/secure 설정 불일치
- **위치**: `controller/urlShare.js:63`
- 포트 587에 `secure: true` 설정 (465에서만 사용)
- 포트 587은 `secure: false` + STARTTLS 사용 필요

---

## 3. 설계 문제 (Design Issues) — 심각도: Medium

### 3-1. N+1 쿼리 문제
- **위치**: `controller/showAllSurveys.js`, `controller/formAllUser.js`
- 모든 설문 조회 후 각각 `Answer.findOne`, `Answer.count` 개별 호출
- 설문 1000개 = 2000개 이상 쿼리 실행

### 3-2. Redis 캐시 무효화 없음
- **위치**: `controller/showAllSurveys.js`
- TTL 미설정, 설문 CUD 시 캐시 무효화 없음
- 항상 오래된 데이터 반환 가능

### 3-3. 코드 중복
- **위치**: `controller/showAllSurveys.js` (300줄)
- 동일 패턴이 title 유무에 따라 복사-붙여넣기

### 3-4. 에러 시 부적절한 상태 코드
- **위치**: `controller/surveyModify.js:120`
- 모든 예외에 404 반환 (500이어야 할 DB 에러 포함)

### 3-5. `open` 값 검증 로직 모순
- **위치**: `controller/surveyModify.js:37-41`
- `open === true`일 때 "잠겨있어" 메시지 — 변수명과 의미 불일치

### 3-6. DELETE body 사용
- **위치**: `controller/surveyDelete.js:7`
- HTTP DELETE의 body는 프록시/클라이언트에서 무시될 수 있음

### 3-7. 하드코딩된 경로 + 오타
- **위치**: `excel/excelGengerate.js:5`
- `/path/to/excel` 하드코딩, 파일명 `Gengerate` 오타

### 3-8. RabbitMQ 연결 비효율
- **위치**: `gpt/rabbitmq.js`
- 매 메시지마다 새 연결 생성/닫기 — 커넥션 풀 패턴 필요

---

## 4. 기타 (Minor Issues)

| 위치 | 문제 |
|------|------|
| `gptAPI.js:6` | 미사용 import (`choice`, `question` 모델) |
| `gptAPI.js:33-35` | `console.assert`로 입력값 검증 — production에서 동작 불확실 |
| `gptAPI.js:110` | 중복 키 `{ option: ..., option: ... }` |
| `getImageBySearch.js:11` | 사용자 입력 URL 인코딩 미적용 |
| `formAllUser.js:7` | `pageLimit` parseInt 누락 |
| `server/index.js` | 주석 처리된 코드 다량 존재 |
| 전반 | `error.message` 클라이언트 직접 반환 — 내부 구현 노출 |

---

## 수정 우선순위

1. 비밀번호 해싱 도입 (bcrypt)
2. 인증 미들웨어 추가 (JWT 등)
3. 비밀번호 API 응답 노출 제거
4. 트랜잭션 누락 수정 (answerSave.js, surveyDelete.js)
5. S3 ACL 변경
6. N+1 쿼리 최적화
7. Redis 캐시 무효화 전략 수립
8. 코드 중복 제거
