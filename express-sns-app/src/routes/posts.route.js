const express = require("express");
const postsRouter = express.Router();
const { checkAuthenticated } = require("../middlewares/auth");

postsRouter.get("/", checkAuthenticated, (req, res) => {
  res.render("posts");
});

module.exports = postsRouter;
