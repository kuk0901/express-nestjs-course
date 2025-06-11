# SNS 서비스 구축 프로젝트

## 앱 소개

- SNS에서 기본적으로 사용되는 기능들을 만들면서 Node.js 학습

- 게시판/댓글 생성, 좋아요 , 친구 추가/삭제, 이미지 업로드

<br />

## 앱 기본 구조 생성

- 미니 프로젝트 1을 사용 -> express-passport-app

- 패키지 설치

  - connect-flash: 플래시 메시지를 위한 메들웨어 모듈

  - method-override: HTML Form 태그에서 DELETE, PUT을 사용할 수 있게 지원해주는 모듈

  - multer: 파일 업로드를 위한 모듈

  ```shell
  npm i connect-flash method-override multer
  ```

<br />

- 각 페이지를 위한 템플릿 작성(기존 템플릿 제거)

- API 요청을 처리하기 위한 폴더와 파일 생성 -> routes 폴더 안의 파일 추가

  ```js
  const postsRouter = require("./routes/posts.route");
  const commentsRouter = require("./routes/comments.route");
  const profileRouter = require("./routes/profile.route");
  const likesRouter = require("./routes/likes.route");
  const friendsRouter = require("./routes/friends.route");

  app.use("/posts", postsRouter);
  app.use("/posts/:id/comments", commentsRouter);
  app.use("/profile/:id", profileRouter);
  app.use("friends", friendsRouter);
  app.use("/posts/:id/like", likesRouter);
  ```

  ```js
  // /posts로 경로 수정
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/posts");
    }

    next();
  }
  ```

- Model 관련 파일 생성

<br />

## 로그인, 회원가입 페이지 생성

<br />

## Header, Footer

<br />

## 모델 생성

<br />

## 포스트 UI 생성

<br />

## 이미지 업로드 및 포스트 생성

<br />

## 에러 처리기 생성

<br />

## 포트스 리스트 나열

<br />

## Connect-Flash

<br />

## Connect-Flash를 앱에서 이용

<br />

## 포스트 수정

<br />

## 포스트 수정 페이지 UI 생성

<br />

## 포스트 삭제

<br />

## 댓글 UI 생성

<br />

## 댓글 기능 생성

<br />

## 댓글 삭제

<br />

## 댓글 수정

<br />

## 좋아요 기능 생성

<br />

## Friends 페이지 생성

<br />

## Friends 페이지를 위한 UI 생성

<br />

## Friends 페이지 기능 생성

<br />

## 친구 요청 수락 기능 생성

<br />

## Header UI 생성

<br />

## Profile 페이지 데이터 생성

<br />

## Profile 페이지 UI 생성

<br />

## Profile 수정

<br />

## Profile 수정 페이지 UI 생성
