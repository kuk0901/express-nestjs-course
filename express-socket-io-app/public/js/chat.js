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

const sidebarTemplate = document.querySelector("#sidebarTemplate").innerHTML;

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });

  document.querySelector("#sidebar").innerHTML = html;
});

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
