const socket = io("http://localhost:4000", {
  autoConnect: false
});

socket.onAny((e, ...arg) => {
  console.log(e, ...arg);
});

// Global Variables
const chatBody = document.querySelector(".chat-body");
const userTitle = document.querySelector("#user-title");
const loginContainer = document.querySelector(".login-container");
const userTable = document.querySelector(".users");
const userTagline = document.querySelector("#users-tagline");
const title = document.querySelector("#active-user");
const messages = document.querySelector(".messages");
const msgDiv = document.querySelector(".msg-form");

// login form handler
const loginForm = document.querySelector(".user-login");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username");
  createSession(username.value.toLowerCase());
  username.value = "";
});

socket.on("users-data", ({ users }) => {
  // 유저 목룍에서 현재 사용자 제외
  const index = users.findIndex((user) => user.userID === socket.id);

  if (index > -1) {
    users.splice(index, 1);
  }

  // user table list 생성
  let ul = `<table class="table table-hover">`;
  for (const user of users) {
    ul += `<tr class="socket-users" onclick="setActiveUser(this, '${user.username}', '${user.userID}')">
      <td>${user.username}<span class="text-danger ps-1 d-none" id='${user.userID}'>!</span></td>
    </tr>`;
  }
  ul += "</table>";

  // 사용자 목록에 따라 UI 설정
  if (users.length > 0) {
    userTable.innerHTML = ul;
    userTagline.innerHTML = "접속 중인 유저";
    userTagline.classList.remove("text-danger");
    userTagline.classList.add("text-success");
  } else {
    userTable.innerHTML = "";
    userTagline.innerHTML = "접속 중인 유저 없음";
    userTagline.classList.remove("text-success");
    userTagline.classList.add("text-danger");
  }
});

// 세션 스토리지를 활요해 자동 로그인 처리
const sessionUsername = sessionStorage.getItem("session-username");
const sessionUserID = sessionStorage.getItem("session-userID");

if (sessionUsername && sessionUserID) {
  socketConnect(sessionUsername, sessionUserID);

  loginContainer.classList.add("d-none");
  chatBody.classList.remove("d-none");
  userTitle.innerHTML = sessionUsername;
}

const msgForm = document.querySelector(".msgForm");
const message = document.getElementById("message");

msgForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const to = title.getAttribute("userID");
  const time = new Date().toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });

  // 메시지 페이로드
  const payload = {
    from: socket.id,
    to,
    message: message.value,
    time
  };

  socket.emit("message-to-server", payload);

  appendMessage({ ...payload, background: "bg-success", position: "right" });

  message.value = "";
  message.focus();
});

// 상대방의 메시지를 받음
socket.on("message-to-client", ({ from, message, time }) => {
  const receiver = title.getAttribute("userID");
  const notify = document.getElementById(from);

  if (receiver === null) {
    notify.classList.remove("d-none");
  } else if (receiver === from) {
    appendMessage({
      message,
      time,
      background: "bg-secondary",
      position: "left"
    });
  } else {
    notify.classList.remove("d-none");
  }
});

// 대화창을 떠난 경우
socket.on("user-away", (userID) => {
  const to = title.getAttribute("userID");

  if (to === userID) {
    title.innerHTML = "&nbsp;";
    msgDiv.classList.add("d-none");
    messages.classList.add("d-none");
  }
});

// 사용자의 세션을 생성하는 비동기 함수
async function createSession(username) {
  const option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username })
  };

  // /session 엔드포인트로 POST 요청을 보내 세션 생성
  await fetch("/session", option)
    .then((res) => res.json())
    .then((data) => {
      // 소켓 연결 함수 호출 (생성된 username, userID 전달)
      socketConnect(data.username, data.userID);

      // 세션 데이터를 스토리지에 저장
      sessionStorage.setItem("session-username", data.username);
      sessionStorage.setItem("session-userID", data.userID);

      loginContainer.classList.add("d-none");
      chatBody.classList.remove("d-none");
      userTitle.innerHTML = data.username;
    })
    .catch((err) => console.error(err));
}

// 소켓 서버에 연결하는 비동기 함수
async function socketConnect(username, userID) {
  // 소켓 인증 정보 설정
  socket.auth = { username, userID };

  await socket.connect();
}

// 사용자 목록에서 특정 사용자를 클릭했을 때 실행되는 함수
function setActiveUser(el, username, userID) {
  title.innerHTML = username;
  title.setAttribute("userID", userID);

  const lists = document.getElementsByClassName("socket-users");

  for (let i = 0; i < lists.length; i++) {
    lists[i].classList.remove("table-active");
  }

  el.classList.add("table-active");

  // 사용자 선택 후 메시지 영역 표시
  msgDiv.classList.remove("d-none");
  messages.classList.remove("d-none");
  messages.innerHTML = "";
  socket.emit("fetch-messages", { receiver: userID });
  const notify = document.getElementById(userID);
  notify.classList.add("d-none");
}

function appendMessage({ message, time, background, position }) {
  let div = document.createElement("div");
  div.classList.add(
    "message",
    "bg-opacity-25",
    "m-2",
    "px-2",
    "py-1",
    background,
    position
  );
  div.innerHTML = `<span class="msg-text">${message}</span> <span class="msg-time"> ${time}</span>`;
  messages.append(div);
  messages.scrollTo(0, messages.scrollHeight);
}

socket.on("stored-messages", ({ messages }) => {
  if (messages.length > 0) {
    messages.forEach((msg) => {
      const payload = {
        message: msg.message,
        time: msg.time
      };

      if (msg.from === socket.id) {
        appendMessage({
          ...payload,
          background: "bg-success",
          position: "right"
        });
      } else {
        appendMessage({
          ...payload,
          background: "bg-secondary",
          position: "left"
        });
      }
    });
  }
});
