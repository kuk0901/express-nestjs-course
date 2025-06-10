const WebSocket = require("ws");
const wss = new WebSocket.Server({port: 7071});

// 클라이언트가 서버에 연결될 때마다 실행되는 이벤트 핸들러 등록
wss.on("connection", (ws) => {
  
  // 클라이언트에게 "connected" 메시지 전송
  ws.send("connected");

  // 클라이언트로부터 메시지를 받을 때마다 실행되는 이벤트 핸들러 등록
  ws.on("message", (messageFromClient) => {
    const message = JSON.parse(messageFromClient);
    console.log(message);
  })
})