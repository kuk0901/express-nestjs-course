const express = require("express");
const path = require("path");

const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const {
  addUser,
  getUsersInRoom,
  getUser,
  removeUser
} = require("./utils/users");
const { generateMessage } = require("./utils/messages");
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("socket", socket.id);

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) return callback(error);

    socket.join(user.room);

    // 입장한 유저에게 환영 메시지 전송
    socket.emit(
      "message",
      generateMessage("Admin", `${user.room} 방에 오신 걸 환영합니다.`)
    );

    // 기존 방에 있던 다른 유저들에게 새 유저 입장 알림 메시지 브로드캐스트
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} 님이 방에 참여했습니다.`)
      );

    // 해당 방(user.room)에 있는 모든 클라이언트에게 현재 방 정보와 유저 목록을 전송
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", generateMessage(user.username, message));

    callback();
  });

  socket.on("disconnect", () => {
    console.log("socket disconnect", socket.id);
    const user = removeUser(socket.id);

    if (user) {
      // 해당 사용자가 속해 있던 방(room)에 "Admin"이 보낸 퇴장 메시지를 브로드캐스트
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} 님이 방에서 퇴장하였습니다.`)
      );
      // 해당 방의 현재 사용자 목록(roomData)을 갱신하여 방에 있는 모든 클라이언트에게 전송
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

const port = 4000;
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
