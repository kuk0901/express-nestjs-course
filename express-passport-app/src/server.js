const express = require("express");
const path = require("path");
const { default: mongoose } = require("mongoose");
const passport = require("passport");
const app = express();

const cookieSession = require("cookie-session");
const config = require("config");
const mainRouter = require("./routes/main.route");
const usersRouter = require("./routes/users.route");
const serverConfig = config.get("server");

require("dotenv").config();

app.use(
  cookieSession({
    name: "cookie-session-name",
    keys: [process.env.COOKIE_ENCRYPTION_KEY]
  })
);

app.use(function (req, res, next) {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb) => {
      cb();
    };
  }

  if (req.session && !req.session.save) {
    req.session.save = (cb) => {
      cb();
    };
  }

  next();
});

// 정적 파일(이미지, CSS, JS 등)을 제공하는 미들웨어
app.use("/static", express.static(path.join(__dirname, "public")));
// JSON 형식의 요청 본문(body)을 파싱하는 미들웨어
app.use(express.json());
// URL-encoded 형식의 요청 본문을 파싱하는 미들웨어 (form 데이터 처리)
app.use(express.urlencoded({ extended: false }));
// Passport 초기화 미들웨어 (로그인 등 인증 기능 활성화)
app.use(passport.initialize());
// 로그인 세션을 관리하는 미들웨어 (로그인 상태 유지)
app.use(passport.session());
require("./config/passport");

// 뷰 엔진을 EJS로 설정
app.set("view engine", "ejs");
// EJS 템플릿 파일들이 위치한 디렉토리 지정
app.set("views", path.join(__dirname, "views"));

// mongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

// 라우터 설정
app.use("/", mainRouter);
app.use("/auth", usersRouter);

const port = serverConfig.port;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
