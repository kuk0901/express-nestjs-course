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

- signup.ejs / login.ejs 파일 작성

<br />

## Header, Footer

- bootstrap5 / font-awesome cdn 사용

- ejs 언어를 사용해 header/footer include

- auth-wrapper 클래스의 css 작성

<br />

## 모델 생성

- User

  - 기존 모델에서 필드만 추가

  ```js
  const userSchema = mongoose.Schema(
    {
      email: {
        type: String,
        unique: true
      },
      password: {
        type: String,
        minLength: 5
      },
      googleId: {
        type: String,
        unique: true,
        sparse: true // googleId가 있는 경우에만 unique 제약 적용
      },
      kakaoId: {
        type: String,
        unique: true,
        sparse: true // kakaoId가 있는 경우에만 unique 제약 적용
      },
      username: {
        type: String,
        required: true,
        trim: true
      },
      firstName: {
        type: String,
        default: "First Name"
      },
      lastName: {
        type: String,
        default: "Last Name"
      },
      bio: {
        type: String,
        default: "데이터 없음"
      },
      hometown: {
        type: String,
        default: "데이터 없음"
      },
      workspace: {
        type: String,
        default: "데이터 없음"
      },
      education: {
        type: String,
        default: "데이터 없음"
      },
      contact: {
        type: String,
        default: "데이터 없음"
      },
      friends: [{ type: String }],
      friendsRequests: [{ type: String }]
    },
    { timestamps: true }
  );
  ```

<br />

- Post

  ```js
  const mongoose = require("mongoose");

  const postSchema = mongoose.Schema(
    {
      description: String,
      comments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment"
        }
      ],
      author: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        username: String
      },
      image: {
        type: String
      },
      likes: [{ type: String }]
    },
    {
      timestamps: true
    }
  );

  module.exports = mongoose.model("Post", postSchema);
  ```

<br />

- Comment

  ```js
  const mongoose = require("mongoose");

  const commentSchema = mongoose.Schema(
    {
      text: String,
      author: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        username: String
      }
    },
    {
      timestamps: true
    }
  );

  module.exports = mongoose.model("Comment", commentSchema);
  ```

<br />

- OAuth 로그인을 할 경우 username을 DB에 넣을 수 있도록 코드 수정

  ```js
  // Google OAuth Strategy
  const googleStrategyConfig = new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_ID_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"]
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("GoogleStrategy called");

      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        const user = new User({
          email: profile.emails[0].value,
          googleId: profile.id,
          username: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName
        });

        await user.save();

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  );
  ```

> DB 연결을 위해 MongoDB Atlas에 ip 주소 등록

<br />

- 로그인 성공 시 posts 경로로 이동 -> posts 경로에 왔을 때 posts/index.ejs 보여줌

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
