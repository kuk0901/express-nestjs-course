## passport를 이용한 인증 앱 생성하기

express-passport-app

## 설치 및 세팅

```shell
$npm init
```

- src 디렉토리 생성

- 필요 모듈 설치

  ```shell
  $npm i dotenv express nodemon body-parser cookie-parser cors mongoose passport passport-local passport-google-oauth20
  ```

- 화면을 위한 템플릿 엔진 설치

  ```shell
  $npm i ejs
  ```

## passport를 사용한 login

- passport는 strategy를 사용함

  1. Normal login -> localStrategy

  2. Google login -> googleStrategy

  3. FaceBook login -> facebookStrategy

- 각 로그인에 맞춰 strategy 사용

<br />

## passport를 이용한 세션 생성

- cookie session: 클라이언트에 세션 보관

  ```
  1. request

  2. cookie-session -> cookie data 추출

  3. passport -> 쿠키 데이터에서 사용자 id를 가져옴

  4. deserialize user -> 사용자 id를 사용자로 전환하기 위해 작성하는 함수

  5. 유저 model 인스턴스가 'req.user' 프로퍼티에 추가됨

  6. 요청이 route handler로 이동
  ```

  ```js
  // req.login(user)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // client -> session -> request
  passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
      done(null, user);
    });
  });
  ```

<br />

- cookie session 사용을 위한 모듈 설치

  ```shell
  $npm i cookie-session
  ```

<br />

- mongoose 버전 차이로 인해 기존 코드를 async-await로 변경

<br />

- passport & cookie-session 버전 차이로 발생하는 에러 해결

  - req session regenerate is not a function passport

  ```js
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
  ```

<br />

- express-session: 데이터베이스에 보관하며 클라이언트에서는 session 식별자만 보관

<br />

## 인증을 위한 미들웨어 생성

- middlewares 디렉토리 생성 및 auth.js 파일 생성

- 권한에 따른 페이지 접근 처리

  ```js
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    res.redirect("/login");
  }

  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }

    next();
  }

  module.exports = {
    checkAuthenticated,
    checkNotAuthenticated
  };
  ```

  - index, login, signup의 get 요청에 미들웨어 등록

<br />

## 로그아웃 기능 만들기

- passport가 제공하는 req.logout() 활용

  - POST, DELETE 요청 사용 지향

  ```js
  app.post("/logout", (req, res, next) => {
    req.logOut(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/login");
    });
  });
  ```

<br />

## 비밀번호 암호화 처리

- bcryptjs 설치 및 사용

  ```js
  $npm i bcryptjs -D
  ```

  ```js
  import * as bcrypt from "bcryptjs";
  ```

<br />

- 데이터베이스 저장 전 암호화 처리

  - mongoose에서 제공하는 pre() 미들웨어를 사용 -> 특정 동작 전/후에 자동으로 실행되는 함수를 등록

  ```js
  const SALT_ROUNDS = 10;
  userSchema.pre("save", function (next) {
    let user = this;

    // 비밀번호가 수정되었을 때만 해싱
    if (user.isModified("password")) {
      // salt 생성
      bcrypt.genSalt(SALT_ROUNDS, function (err, salt) {
        if (err) {
          return next(err);
        }

        bcrypt.hash(user.password, salt, function (err, hash) {
          if (err) {
            return next(err);
          }

          user.password = hash; // 해싱된 비밀번호로 업데이트
          next();
        });
      });
    }
  });
  ```

<br />

- 로그인에서의 비밀번호 비교

  ```js
  userSchema.methods.comparePassword = function (plainPassword, cb) {
    // bcrypt compare 비교
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
      if (err) {
        return cb(err);
      }

      cb(null, isMatch); // 비밀번호가 일치하면 true, 아니면 false
    });
  };
  ```

<br />

## Google OAuth API 생성

- https://console.colud.google.com/apis/dashboard

  - Google Cloud를 사용한 OAuth 사용

- OAuth 흐름

  ```
  1. 로그인 버튼 클릭(클라이언트 -> 서버)

  2. 유저의 요청을 구글에 보냄(서버 -> Provider)

  3. 사용자의 액세스 권한을 부여하기 위해서 사용자의 권한을 요청(Provider)

  4. 권한 부여 후 엑세스 코드와 함께 콜백 주소로 리다이렉션(Provider -> 서버)

  5. 사용자는 권한을 부여받음(서버)

  6. 유저 정보를 위해서 "코드"가 포함된 요청을 Google에 보냄(서버 -> Provider)

  7. Google은 URL에서 "코드"를 확인하고 사용자에 대한 세부정보를 전달(Provider -> 서버)

  8. 사용자 세부정보를 데이터베이스에 저장(서버)

  9. 세션 토큰을 생성하고 쿠키에 보관(서버 -> 클라이언트)

  10. 세션 토큰을 이용해서 로그인 완성(클라이언트)

  * Provider? Google, FaceBook..
  ```

<br />

## 환경변수 설정

```shell
$npm i config
```

- config 모듈을 이용한 설정 파일 생성

  - default.yml: 기본 설정(개발 환경이나 운영 환경 설정에도 적용됨)

  - development.yml: default.yml + 개발 환경에서 필요한 정보

  - production.yml: default.yml + 운영 환경에서 필요한 정보

  > json 파일을 사용해 설정

<br />

- yaml, yml

  ```shell
  $npm i js-yaml
  ```

<br />

- env 파일을 생성해 사용 -> 이전에 설치한 dotenv 모듈 사용

<br />

## Route를 이용한 구조 정리

- MVC 패턴을 사용해 server.js 정리

- routes 폴더 및 파일 생성(main.route.js / users.router.js)

<br />

## Email 기능 구현하기

- nodemailer 사용

  ```shell
  $npm i nodemailer
  ```

<br />

- 이메일 템플릿 생성

  - goodbye_template, mail, welcome_template

<br />

- 회원가입시에 nodemailer를 이용해 이메일 보내기

  1. Nodemailer transporter 생성

  ```js
  const mailer = require("nodemailer");

  const transporter = mailer.createTransport({
    service: "Gmail",
    auth: {
      user: "",
      pass: ""
    }
  });
  ```

  2. transporter를 이용해 메일 보내기

  ```js
  // transporter 객체의 sendMail 메서드를 사용해 메일 전송
  // 매개 변수: 메일을 보내기 위한 옵션, 보내고 난 이후의 콜백 함수
  const mailer = require("nodemailer");

  const sendMail = (to, name, type) => {
    const transporter = mailer.createTransport({
      service: "Gmail",
      auth: {
        user: "유저 이메일 아이디",
        pass: "구글에서 새로 생성한 비밀번호"
      }
    });

    const mail = getEmailData(to, name, type);

    transporter.sendMail(mail, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("email sent successfully");
      }

      transporter.close();
    });
  };

  module.exports = sendMail;
  ```

  3. sendMail 메서드 옵션 생성하기

  ```js
  const getEmailData = (to, name, template) => {
    let data = null;

    switch (template) {
      case "welcome":
        data = {
          from: "보내는 사람 이름 <userId@gmail.com>",
          to,
          subject: `Hello ${name}`,
          html: welcome()
        };
        break;
      case "goodbye":
        data = {
          from: "보내는 사람 이름 <userId@gmail.com>",
          to,
          subject: `Goodbye ${name}`,
          html: goodbye()
        };
        break;
      default:
        data;
        break;
    }

    return data;
  };
  ```

  4. sendEmail 함수로 메일 보내기 및 구글 비밀번호 생성

     - 구글 Security에서 2단계 인증 설정 및 앱 비밀번호 생성

<br />

## SMTP(Simple Mail Transfer Protocol)

- 간이 전자 우편 전송 프로토콜

- 인터넷에서 이메일을 보내기 위해 이용되는 프로토콜 -> 서로 다른 이메일 호스트 간에 사용되는 프로토콜

- 사용하는 TCP 포트 번호는 25번

```
1. 메일을 작성해서 보내면 그 메일은 SMTP 서버로 전송(SMTP 프로토콜 사용)
  - Gmail을 이용할 경우 Gmail SMTP 서버로 보내짐

2. Gmail SMTP 서버에 접근하기 위해서 구글 아이디와 새로 생성한 앱 비밀번호를 통해 인증

3. Gmail SMTP 서버는 해당 메일을 받는 사람의 메일 서버로 보내게 됨 -> Outgoing MailServer라고도 부름

3. 받는 사람의 이메일이 yahoo 라면 yahoo 메일 서버로 이메일이 전송됨(SMTP 프로토콜 사용)

4. 상대방이 yahoo 서버 메일 보관함에서 메일을 가져가게 됨(SMTP 아님)


* 메일을 가져갈 때의 프로토콜: POP(post office protocol), IMAP(internet message access protocol), HTTP 중 하나
```

<br />

## 카카오 OAuth Key 생성

- [kakao](https://developers.kakao.com/) 에서 로그인 및 애플리케이션 추가

<br />

## 카카오 OAuth 구현(소셜 로그인)

- 모듈 설치

  - kakao oauth2로 그인과 passport 모듈 연결

  ```shell
  $npm i passport-kakao
  ```

<br />

- 카카오 로그인 위한 화면 생성 및 route 생성(google 부분과 유사)

- kakao strategy 생성
