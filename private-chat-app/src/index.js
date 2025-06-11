const express = require("express");
const path = require("path");
const app = express();
const { default: mongoose } = require("mongoose");
require("dotenv").config();
const crypto = require("crypto");

const http = require("http");
const { Server } = require("socket.io");
const { saveMessages, fetchMessages } = require("./utils/messages");
const server = http.createServer(app);
const io = new Server(server);

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB 연결 성공");
  })
  .catch((err) => console.error(err));

// crypto를 사용해 랜덤한 userID 생성 함수
const randomID = () => crypto.randomBytes(8).toString("hex");

// 클라이언트에서 /session으로 POST 요청 시 username과 생성된 userID를 반환
app.post("/session", (req, res) => {
  const data = {
    username: req.body.username,
    userID: randomID()
  };

  res.send(data);
});

// 소켓 연결 시 인증 미들웨어
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const userID = socket.handshake.auth.userID;

  if (!username) {
    return next(new Error("Invalid username"));
  }

  socket.username = username;
  socket.id = userID;

  next();
});

let users = [];
io.on("connection", async (socket) => {
  // 새로 접속한 유저 정보 객체 생성
  let userData = { username: socket.username, userID: socket.id };
  users.push(userData);

  // 모든 클라이언트에게 현재 사용자 목록 전송
  io.emit("users-data", { users });

  // client에서 보내온 메시지: A -> Server -> B
  socket.on("message-to-server", (payload) => {
    io.to(payload.to).emit("message-to-client", payload);
    saveMessages(payload);
  });

  // 데이터베이스에서 메시지 가져오기
  socket.on("fetch-messages", ({ receiver }) => {
    fetchMessages(io, socket.id, receiver);
  });

  // 유저가 방에서 나갔을 때
  socket.on("disconnect", () => {
    // 중복 데이터 제거
    users = users.filter((user) => user.userID !== socket.id);

    // 사이드바 리스트에서 유저 제거
    io.emit("users-data", { users });

    // 대화창 중인 경우 대화창 제거
    io.emit("user-away", socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
