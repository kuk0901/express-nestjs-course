# Express Socket IO

## Express Socket IO 이용한 채팅 앱 구현

- 디레토리 및 파일 생성

- 모듈 설치

  ```shell
  $npm i express socket.io
  ```

  ```shell
  $npm i -D nodemon
  ```

- 기본 코드 작성

  - index.html / chat.html / index.css

  ```js
  // src/index.js
  const express = require("express");
  const path = require("path");

  const app = express();
  const publicDirectoryPath = path.join(__dirname, "../public");
  app.use(express.static(publicDirectoryPath));

  const port = 4000;
  app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });
  ```

<br />

## Socket IO 연동하기

- Express App에 Socket IO 연동

  ```js
  const express = require("express");
  const path = require("path");

  const app = express();

  const http = require("http");
  const server = http.createServer(app);
  const { Server } = require("socket.io");
  const io = new Server(server);

  const publicDirectoryPath = path.join(__dirname, "../public");
  app.use(express.static(publicDirectoryPath));

  const port = 4000;
  server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });
  ```

<br />

- socket 이벤트에 따른 이벤트 리스너 추가

  ```js
  io.on("connection", (socket) => {
    console.log("socket", socket.id);

    socket.on("join", () => {});

    socket.on("message", () => {});

    socket.on("disconnect", () => {
      console.log("socket disconnect", socket.id);
    });
  });
  ```

<br />

## 유저가 방에 들어왔을 때 유저 추가하기

```js
// public/js/chat.js
const socket = io();

const query = new URLSearchParams(location.search);
const username = query.get("username");
const room = query.get("room");

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
```

```js
// src/utils/users.js
const users = [];

const addUser = (id, username, room) => {
  // 공백 제거
  username = username.trim();
  room = room.trim();

  if (!username || !room) {
    return {
      error: "사용자 이름과 방이 필요합니다."
    };
  }

  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  if (existingUser) {
    return {
      error: "이미 사용 중인 사용자 이름입니다.."
    };
  }

  // 유저 저장
  const user = { id, username, room };
  users.push(user);

  return {
    user
  };
};

module.exports = {
  addUser
};
```

```js
// src/index.js
io.on("connection", (socket) => {
  console.log("socket", socket.id);

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) return callback(error);

    socket.join(user.room);
  });

  socket.on("message", () => {});

  socket.on("disconnect", () => {
    console.log("socket disconnect", socket.id);
  });
});
```

<br />

## 유저가 방에 들어왔을 때 환영 메시지 추가하기

- 새로운 유저가 방에 들어왔을 때 해당 유저, 기존 유저들에게 메시지 전송

  ```js
  // src/utils/messages.js
  const generateMessage = (username, text) => {
    return {
      username,
      text,
      createdAt: new Date().getTime()
    };
  };

  module.exports = {
    generateMessage
  };
  ```

  ```js
  // src/index.js
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
          generateMessage("", `${user.username} 님이 방에 참여했습니다.`)
        );
    });

    socket.on("message", () => {});

    socket.on("disconnect", () => {
      console.log("socket disconnect", socket.id);
    });
  });
  ```

<br />

- 방 정보 클라이언트에 보내기(방 이름, 유저들 정보)

  ```js
  // src/utils/users.js
  const getUsersInRoom = (room) => {
    room = room.trim();

    return users.filter((user) => user.room === room);
  };
  ```

  ```js
  // src/index.js
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
        generateMessage("", `${user.username} 님이 방에 참여했습니다.`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
  });
  ```

## 채팅방 입장시 화면 구현하기

- Mustache를 사용해 채팅방 입장 화면 구현

  > 아래 코드 추가

```html
<!-- public/chat.html -->
<script id="sidebarTemplate" type="text/html">
  <h2 class="room-title">방 이름: {{room}}</h2>
  <p class="list-title">유저들</p>
  <ul class="users">
    {{#users}}
    <li>{{username}}</li>
    {{/users}}
  </ul>
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/3.0.1/mustache.min.js"></script>
```

```js
// public/js/chat.js
const sidebarTemplate = document.querySelector("#sidebarTemplate").innerHTML;

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });

  document.querySelector("#sidebar").innerHTML = html;
});
```

<br />

## Mustache 사용해서 메시지 보여주기

- 채팅방 입장시 안내 메시지 부분 보여주기

```html
<!-- public/chat.html -->
<script id="messageTemplate" type="text/html">
  <div class="message">
    <p>
      <span class="message__name">{{username}}</span>
      <span class="message__meta">{{createdAt}}</span>
    </p>
    <p>{{message}}</p>
  </div>
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/3.0.1/mustache.min.js"></script>
```

```js
// public/js/chat.js
const messages = document.getElementById("messages");
const messageTemplate = document.querySelector("#messageTemplate").innerHTML;
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  });
  messages.insertAdjacentHTML("beforeend", html);
  scrollToBottom();
});

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}
```

<br />

## 채팅 페이지 스타일 적용하기

- index.css 파일의 Chat Page 주석 아래 부분

<br />

## 채팅방에서 메시지 보내기

1. 메시지 입력 후 전송 버튼 클릭

2. 전송 버튼 쿨러서 submit 이벤트 발생 시 socket emit으로 서버에 메시지 전달

   ```js
   const messageForm = document.getElementById("message-form");
   const messageFormInput = messageForm.querySelector("input");
   const messageFormBtn = messageForm.querySelector("button");

   messageForm.addEventListener("submit", (e) => {
     e.preventDefault();

     messageFormBtn.setAttribute("disabled", "disabled");

     const message = e.target.elements.message.value;

     socket.emit("sendMessage", message, (err) => {
       messageFormBtn.removeAttribute("disabled");
       messageFormInput.value = "";
       messageFormInput.focus();

       if (err) {
         return console.log(err);
       }
     });
   });
   ```

3. 서버에서 메시지 받아서 해당 방에 있는 사람들에게 전송

   ```js
   socket.on("sendMessage", (message, callback) => {
     const user = getUser(socket.id);

     io.to(user.room).emit("message", generateMessage(user.username, message));

     callback();
   });
   ```

<br />

## 채팅방에서 나가기

1. disconnect 이벤트가 발생했을 때 이벤트 리스너 호출 및 공지

```js
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
```

2. 해당 유저를 users 배열에서 제거

```js
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    // 해당 인덱스의 사용자를 배열에서 제거하고, 제거된 사용자 객체를 반환
    return users.splice(index, 1)[0];
  }
};
```
