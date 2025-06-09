const express = require("express");
const path = require("path");
const usersRouter = require("./routes/users.route");
const postsRouter = require("./routes/posts.route");

const PORT = 4000;
const app = express();

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`start: ${req.method} ${req.url}`);
  next();
  const diffTime = Date.now() - start;
  console.log(`end: ${req.method} ${req.baseUrl} ${diffTime}ms`);
});

app.use("/users", usersRouter);
app.use("/posts", postsRouter);

app.get("/", (req, res) => {
  res.render("index", { imageTitle: "Express App" });
});

app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});
