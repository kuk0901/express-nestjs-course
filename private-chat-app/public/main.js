const socket = io("http://localhost:4000", {
  autoConnect: false
});

socket.onAny((e, ...arg) => {
  console.log(e, ...arg);
});

// Global Variables
const chatBody = document.querySelector(".chat-body");
const userTitle = document.querySelector(".user-title");
const loginContainer = document.querySelector(".login-container");
const userTable = document.querySelector(".users");
const userTagline = document.querySelector("#users-tagline");
const title = document.querySelector("#active-user");
const messages = document.querySelector(".messages");
const msgDiv = document.querySelector(".msg-form")
