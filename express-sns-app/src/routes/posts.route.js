const express = require("express");
const postsRouter = express.Router();
const {
  checkAuthenticated,
  checkPostOwnerShip
} = require("../middlewares/auth");
const Post = require("../models/posts.model");
const Comment = require("../models/comments.model");
const multer = require("multer");
const path = require("path");

// multer의 diskStorage 엔진을 사용해 파일 저장 방식 설정
const storageEngine = multer.diskStorage({
  // 파일이 저장될 폴더 지정
  destination: (req, file, callback) => {
    // __dirname: 현재 파일의 디렉터리
    // "../public/assets/images" 폴더에 이미지를 저장
    callback(null, path.join(__dirname, "../public/assets/images"));
  },
  // 저장될 파일의 이름 지정
  filename: (req, file, cb) => {
    // 업로드된 파일의 원래 이름으로 저장
    cb(null, file.originalname);
  }
});

// multer 미들웨어 생성
// storageEngine을 사용하고, 단일 파일 업로드("image" 필드)
const upload = multer({ storage: storageEngine }).single("image");

postsRouter.get("/", checkAuthenticated, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("comments")
      .sort({ createdAt: -1 });

    res.render("/posts", {
      posts
    });
  } catch (error) {
    console.log(error);
  }
});

postsRouter.post("/", checkAuthenticated, upload, async (req, res, next) => {
  let desc = req.body.desc;
  let image = req.file ? req.file.filename : "";

  try {
    const post = await Post.create({
      image: image,
      description: desc,
      author: {
        id: req.user._id,
        username: req.user.username
      }
    });

    req.flash("success", "포스트 생성 성공");
    res.redirect("/posts");
  } catch (error) {
    req.flash("error", "포스트 생성 실패");
    res.redirect("/posts");
  }
});

postsRouter.get("/:id/edit", checkPostOwnerShip, (req, res) => {
  res.render("posts/edit", {
    post: req.post
  });
});

postsRouter.put("/:id", checkPostOwnerShip, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body);

    if (!post) {
      throw new Error("Post not found");
    }

    req.flash("success", "게시물 수정을 완료했습니다.");
    res.redirect("/posts");
  } catch (error) {
    req.flash("error", "게시물을 수정하는데 오류가 발생했습니다.");
    res.redirect("/posts");
  }
});

module.exports = postsRouter;
