const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Controllers 
const { signup, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); 


router.post('/signup', signup);
router.post('/login', login);




router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);



router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: 'https://housefull-frontend.vercel.app/login?error=auth_failed', 
        session: false 
    }),
    (req, res) => {
        if (!req.user) {
            return res.redirect('https://housefull-frontend.vercel.app/login?error=no_user');
        }
        
        const token = jwt.sign(
            { 
               id: req.user._id,
               name: req.user.name,
               email: req.user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.redirect(`https://housefull-frontend.vercel.app/google-success?token=${token}`);
    }
);


router.get('/protected', authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "You have accessed a protected route",
        user: req.user
    });
});

module.exports = router;
