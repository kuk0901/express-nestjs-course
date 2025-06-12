const passport = require("passport");
const User = require("../models/users.model");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;

// req.login(user)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// client -> session -> request
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

const LocalStrategyConfig = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password"
  },
  async (email, password, done) => {
    console.log("LocalStrategy called");
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return done(null, false, { msg: `Email: ${email} not found` });
      }

      user.comparePassword(password, (err, isMatch) => {
        if (err) return done(err);

        if (isMatch) return done(null, user);

        return done(null, false, { msg: `Invalid email or password.` });
      });
    } catch (error) {
      return done(error);
    }
  }
);

passport.use("local", LocalStrategyConfig);

// Google OAuth Strategy
const googleStrategyConfig = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_ID_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ["profile", "email"]
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log("GoogleStrategy called");

    try {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      }

      const user = new User({
        email: profile.emails[0].value,
        googleId: profile.id,
        username: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName
      });

      await user.save();

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

// Kakao OAuth Strategy
const kakaoStrategyConfig = new KakaoStrategy(
  {
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: "/auth/kakao/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log("KakaoStrategy called");

    try {
      const existingUser = await User.findOne({ kakaoId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      }

      const user = new User({
        email: profile._json.kakao_account.email,
        kakaoId: profile.id
      });

      await user.save();

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

// Register the strategies with Passport
passport.use("google", googleStrategyConfig);
passport.use("kakao", kakaoStrategyConfig);
