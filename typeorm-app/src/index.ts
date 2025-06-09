import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";

const app = express();

app.use(express.json());
app.use(morgan("dev")); // dev, short, common, combined 옵션

app.get("/", (req, res) => {
  res.send("running");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.post("/users", async (req, res) => {
  try {
    const user = await AppDataSource.getRepository(User).create(req.body);
    console.log(user);

    const result = await AppDataSource.getRepository(User).save(user);
    res.send(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await AppDataSource.getRepository(User).find();
    res.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const result = await AppDataSource.getRepository(User).findOneBy({
      id: Number(req.params.id)
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).send("Error fetching user by ID");
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const user = await AppDataSource.getRepository(User).findOneBy({
      id: Number(req.params.id)
    });

    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    AppDataSource.getRepository(User).merge(user, req.body);
    const result = await AppDataSource.getRepository(User).save(user);
    res.send(result);
  } catch (error) {
    console.error("Error fetching user for update:", error);
    res.status(500).send("Error fetching user for update");
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    // 자동으로 기본 키(id) 기준으로 삭제
    const result = await AppDataSource.getRepository(User).delete(
      Number(req.params.id)
    );
    res.json(result);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
});

const port = 4000;
app.listen(port, () => {
  console.log(`Sever Running at http://localhost: ${port}`);
});
