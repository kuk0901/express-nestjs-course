const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,   
    minLength: 5
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // googleId가 있는 경우에만 unique 제약 적용
  },
  kakaoId: {
    type: String,
    unique: true,
    sparse: true // kakaoId가 있는 경우에만 unique 제약 적용
  }
});

const SALT_ROUNDS = 10;
userSchema.pre("save", function (next) {
  let user = this;

  // 비밀번호가 수정되었을 때만 해싱
  if (user.isModified("password")) {
    // salt 생성
    bcrypt.genSalt(SALT_ROUNDS, function (err, salt) {
      if (err) {
        return next(err);
      }

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }

        user.password = hash; // 해싱된 비밀번호로 업데이트
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  // bcrypt compare 비교
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch); // 비밀번호가 일치하면 true, 아니면 false
  });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
