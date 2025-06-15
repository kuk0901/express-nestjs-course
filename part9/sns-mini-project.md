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

- create-post.ejs, post-modal.ejs 작성 후 index.ejs에 include

- posts 라우터 연결시 모든 post데이터와 comments 필드를 가져옴 -> 각 post의 comments 필드에 들어있는 ObjectId들이 실제 Comment 문서(댓글 데이터)로 자동 변환

  ```js
  // posts.route.js
  const express = require("express");
  const postsRouter = express.Router();
  const { checkAuthenticated } = require("../middlewares/auth");
  const Post = require("../models/posts.model");
  const Comment = require("../models/comments.model");

  postsRouter.get("/", checkAuthenticated, async (req, res) => {
    try {
      const posts = await Post.find()
        .populate("comments")
        .sort({ createdAt: -1 });

      res.render("posts", {
        posts,
        currentUser: req.user
      });
    } catch (error) {
      console.log(error);
    }
  });

  module.exports = postsRouter;
  ```

<br />

## 이미지 업로드 및 포스트 생성

- 파일 업로드를 위한 모듈 설치

  - multer: multipart/form-data 핸들링을 위한 미들웨어

  ```shell
  $ npm i multer
  ```

- 이미지 로컬에 저장 -> diskStorage() 매서드 사용

  > import문 생략

  ```js
  // multer의 diskStorage 엔진을 사용해 파일 저장 방식 설정
  const storageEngine = multer.diskStorage({
    // 파일이 저장될 폴더 지정
    destination: (req, file, callback) => {
      // __dirname: 현재 파일의 디렉터리
      // "../public/assets/images" 폴더에 이미지를 저장
      callback(null, path.join(__dirname, "../public/assets/images"));
    },
    // 저장될 파일의 이름 지정
    filename: (req, file, cb) => {
      // 업로드된 파일의 원래 이름으로 저장
      cb(null, file.originalname);
    }
  });

  // multer 미들웨어 생성
  // storageEngine을 사용하고, 단일 파일 업로드("image" 필드)
  const upload = multer({ storage: storageEngine }).single("image");

  postsRouter.post("/", checkAuthenticated, upload, async (req, res, next) => {
    let desc = req.body.desc;
    let image = req.file ? req.file.filename : "";

    try {
      const post = await Post.create({
        image: image,
        description: desc,
        author: {
          id: req.user._id,
          username: req.user.username
        }
      });

      res.redirect("posts");
    } catch (error) {
      next(error);
    }
  });
  ```

<br />

## 에러 처리기 생성

- server.js

  ```js
  // 에러 처리기
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message || "Error Occurred");
  });
  ```

<br />

## 포트스 리스트 나열

```js
<%- include('../partials/header') %>
<div class="container">
  <div style="max-width: 600px; margin: 1rem auto">
    <%- include('../partials/create-post.ejs') %>
  </div>

  <% posts.forEach((post) => { %>
  <!-- 나의 포스트인지 -->
  <% if ( post.author.id.equals(currentUser._id) || // 나의 친구의 포스트인지
  currentUser.friends.find(friend => friend === post.author.id.toString()) ) {
  %>
  <div style="max-width: 600px; margin: 1rem auto">
    <%- include('../partials/post-item.ejs', { post: post }) %>
  </div>
  <% } %> <% }) %>
</div>

<%- include('../partials/post-modal.ejs') %> <%- include('../partials/footer')
%>
```

<br />

### 포스트 리스트 UI 생성하기

- post-item.ejs

  - form 태그 안에서 delete method 사용하기 위해 method-override 설치 및 form 태그의 action 부분에 해당 메서드 작성

  ```js
  <form
    action="/posts/<%= post._id %>?_method=DELETE"
    class="dropdown-item text-center"
    method="post"
  >
    <button type="submit" class="no-outline">
      Delete
    </button>
  </form>
  ```

<br />

## Connect-Flash

- Node.js와 Express에서 사용하는 “일회성(1회성) 메시지”를 저장하고 전달하는 미들웨어 -> 한 번 실행되면 세션에서 저장값이 사라짐

- 정보를 유지해줘야 하기 때문에 세션 사용

- connect-flash 설치 및 미들웨어 등록

  ```shell
  npm i connect-flash
  ```

<br />

## Connect-Flash를 앱에서 이용

- header.ejs에 코드 추가

  ```js
  <div class="container">
    <% if (error && error.length > 0) { %>
    <div class="alert alert-danger" role="alert"><%= error %></div>
    <% } %> <% if (success && success.length > 0) { %>
    <div class="alert alert-success" role="alert"><%= success %></div>
    <% } %>
  </div>
  ```

- post.route.js에 코드 추가

  ```js
  postsRouter.get("/", checkAuthenticated, async (req, res) => {
    try {
      const posts = await Post.find()
        .populate("comments")
        .sort({ createdAt: -1 });

      res.render("posts", {
        posts,
        currentUser: req.user,
        success: req.flash("success"),
        error: req.flash("error")
      });
    } catch (error) {
      console.log(error);
    }
  });

  postsRouter.post("/", checkAuthenticated, upload, async (req, res, next) => {
    let desc = req.body.desc;
    let image = req.file ? req.file.filename : "";

    try {
      const post = await Post.create({
        image: image,
        description: desc,
        author: {
          id: req.user._id,
          username: req.user.username
        }
      });

      req.flash("success", "포스트 생성 성공");
      res.redirect("posts");
    } catch (error) {
      req.flash("error", "포스트 생성 실패");
      res.redirect("posts");
    }
  });
  ```

- `res.locals 객체를 사용해 처리`

  - res.locals는 Express에서 응답(response) 객체에 붙어 있는 객체로 routes(라우터), views(템플릿) 등에서 사용할 "로컬 변수"를 저장할 수 있음

  - 현재 요청(request)에만 유효하며, 요청이 끝나면(응답이 완료되면) 자동으로 사라짐

  - 뷰 엔진(EJS, Pug 등)에서 바로 사용할 수 있음

  ```js
  // res.locals 사용해 flash 처리
  app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
    next();
  });
  ```

  - res.locals 사용을 위해 불필요 코드 제거

  ```js
  postsRouter.get("/", checkAuthenticated, async (req, res) => {
    try {
      const posts = await Post.find()
        .populate("comments")
        .sort({ createdAt: -1 });

      res.render("posts", {
        posts
      });
    } catch (error) {
      console.log(error);
    }
  });
  ```

<br />

## 포스트 수정

- 포스트 수정 전 유효성 검사를 위한 checkPostOwnerShip 함수 생성

  ```js
  async function checkPostOwnerShip(req, res, next) {
    if (req.isAuthenticated()) {
      // id에 맞는 포스트가 존재하는지 체크
      try {
        const post = await postsModel.findById(req.params.id);

        if (!post) {
          req.flash("error", "포스트가 없습니다.");
          res.redirect("posts");
          return;
        }

        // 나의 포스트인지 확인
        if (post.author.id.equals(req.user._id)) {
          req.post = post;
          next();
        } else {
          req.flash("error", "권한이 없습니다.");
          res.redirect("posts");
        }
      } catch (error) {
        req.flash("error", "에러가 발생했습니다.");
        res.redirect("posts");
      }
    } else {
      req.flash("error", "로그인을 먼저 해주세요.");
      res.redirect("posts");
    }
  }
  ```

- route 작성

  ```js
  postsRouter.get("/:id/edit", checkPostOwnerShip, (req, res) => {
    res.render("posts/edit", {
      post: req.post
    });
  });
  ```

<br />

## 포스트 수정 페이지 UI 생성

- posts/edit.ejs

  ```js
  <%- include('../partials/header.ejs') %>
  <div class="container col-lg-8">
    <div class="card">
      <h5 class="card-header">포스트 수정하기</h5>
      <div class="card-body">
        <form action="/posts/<%= post._id %>?_method=PUT" method="post">
          <div class="form-group">
            <textarea name="description" id="desc" class="form-control">
  <%= post.description %></textarea
            >
          </div>
          <button type="submit" class="btn btn-primary mt-3">수정하기</button>
        </form>
      </div>
    </div>
  </div>
  <%- include('../partials/footer.ejs') %>
  ```

- 포스트 수정 핸들러 생성

  ```js
  postsRouter.put("/:id", checkPostOwnerShip, async (req, res) => {
    try {
      const post = await Post.findByIdAndUpdate(req.params.id, req.body);

      if (!post) {
        throw new Error("Post not found");
      }

      req.flash("success", "게시물 수정을 완료했습니다.");
      res.redirect("/posts");
    } catch (error) {
      req.flash("error", "게시물을 수정하는데 오류가 발생했습니다.");
      res.redirect("/posts");
    }
  });
  ```

> method-override 미들웨어 등록 주의

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

```

```
