const ws = new WebSocket("ws://localhost:7071");

// 서버에서 보낸 메시지를 받을 때 실행되는 이벤트 핸들러
ws.onmessage = (webSocketMessage) => {
  console.log(webSocketMessage);
  console.log(webSocketMessage.data);
};

// 마우스가 움직일 때마다 실행되는 이벤트 핸들러
document.body.onmousemove = (e) => {
  const messageBody = {
    x: e.clientX,
    y: e.clientY
  };
  ws.send(JSON.stringify(messageBody));
};
