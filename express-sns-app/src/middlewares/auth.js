const postsModel = require("../models/posts.model");

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/posts");
  }

  next();
}

async function checkPostOwnerShip(req, res, next) {
  if (req.isAuthenticated()) {
    // id에 맞는 포스트가 존재하는지 체크
    try {
      const post = await postsModel.findById(req.params.id);

      if (!post) {
        req.flash("error", "포스트가 없습니다.");
        res.redirect("posts");
        return;
      }

      // 나의 포스트인지 확인
      if (post.author.id.equals(req.user._id)) {
        req.post = post;
        next();
      } else {
        req.flash("error", "권한이 없습니다.");
        res.redirect("posts");
      }
    } catch (error) {
      req.flash("error", "에러가 발생했습니다.");
      res.redirect("posts");
    }
  } else {
    req.flash("error", "로그인을 먼저 해주세요.");
    res.redirect("posts");
  }
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
  checkPostOwnerShip
};
