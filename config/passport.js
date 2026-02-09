const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/users/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile Received:", profile); 

        // Email kadhnyacha safe marg
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

        if (!email) {
          console.error("email not found in Google profile !");
          return done(null, false, { message: 'Email missing' });
        }

        // 1. Database madhe user shodha
        let user = await User.findOne({ email: email });

        if (!user) {
          // 2. Jar user nasel tar nava banva
          user = await User.create({
            name: profile.displayName,
            email: email,
            googleId: profile.id,
            password: "google-auth-dummy-password" // Jar schema madhe password required asel tar
          });
          console.log(" create new user:", email);
        } else {

          user.googleId = profile.id;
          await user.save();
          console.log("login old user:", email);
        }

        return done(null, user); 
      } catch (err) {
        console.error("Passport Strategy Error:", err);
        return done(err, null);
      }
    }
  )
);

// to serialize and deserialize user for session management
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});