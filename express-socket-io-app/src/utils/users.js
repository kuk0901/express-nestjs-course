const users = [];

const addUser = ({ id, username, room }) => {
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

const getUsersInRoom = (room) => {
  room = room.trim();

  return users.filter((user) => user.room === room);
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    // 해당 인덱스의 사용자를 배열에서 제거하고, 제거된 사용자 객체를 반환
    return users.splice(index, 1)[0];
  }
};

module.exports = {
  addUser,
  getUsersInRoom,
  getUser,
  removeUser
};
