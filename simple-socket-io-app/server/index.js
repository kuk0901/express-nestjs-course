// 내장 http 모듈로 HTTP 서버 인스턴스 생성
const http = require("http").createServer();

// Socket.IO 서버를 생성하고 CORS(모든 출처 허용) 옵션 설정
const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

// 클라이언트가 소켓 연결을 맺었을 때 실행되는 이벤트 핸들러
io.on("connection", (socket) => {
  console.log("a user connected");

  // 클라이언트로부터 "message" 이벤트를 받았을 때 실행
  socket.on("message", (msg) => {
    // 모든 클라이언트에게 메시지 브로드캐스트
    // (소켓 ID 앞 2자리 + 메시지 내용)
    io.emit("message", `${socket.id.substr(0, 2)} said ${msg}`);
  });
});

const port = 8080;
http.listen(port, () => {
  console.log(`${port} 포트에서 서버 실행`);
});
