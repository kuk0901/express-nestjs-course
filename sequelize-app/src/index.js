const express = require("express");
const app = express();
const db = require("./models");
const User = db.users;

// 데이터베이스 재설정
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("데이터베이스 drop 및 sync 다시 맞춤");
// });
app.use(express.json());

app.post("/users", (req, res) => {
  const { firstName, lastName, hasCar } = req.body;

  const user = {
    firstName,
    lastName,
    hasCar
  };

  User.create(user)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User."
      });
    });
});

app.get("/users", (req, res) => {
  User.findAll()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
});

app.get("/users/:id", (req, res) => {
  const id = req.params.id;
  User.findByPk(id)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.status(404).send({
          message: `Cannot find User with id=${id}.`
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving user."
      });
    });
});

app.put("/users/:id", (req, res) => {
  const id = req.params.id;
  User.update(req.body, {
    where: { id }
  })
    .then((result) => {
      if (result[0] === 1) {
        res.send("성공");
      } else {
        res.send(`${id}에 해당하는 User를 찾을 수 없습니다.`);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while updating the User."
      });
    });
});

app.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  User.destroy({
    where: { id }
  })
    .then((result) => {
      if (result == 1) {
        res.send({
          message: "성공적으로 삭제되었습니다."
        });
      } else {
        res.send({
          message: `${id}에 해당하는 User를 찾을 수 없습니다.`
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while deleting the User."
      });
    });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
