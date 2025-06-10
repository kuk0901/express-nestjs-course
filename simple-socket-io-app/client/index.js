const socket = io("ws://localhost:8080");

// 서버로부터 "message" 이벤트를 받으면 실행되는 핸들러
socket.on("message", (text) => {
  const el = document.createElement("li");

  el.innerHTML = text;

  document.querySelector("ul").appendChild(el);
});

// 버튼이 클릭되었을 때 실행되는 핸들러
document.querySelector("button").onclick = () => {
  const text = document.querySelector("input").value;
  // 입력값을 "message" 이벤트로 서버에 전송
  socket.emit("message", text);
};
