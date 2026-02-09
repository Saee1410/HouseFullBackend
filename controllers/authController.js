const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    console.log("Frontend kadun ha data ala:", req.body);
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({email });
        if (user) return res.status(400).json({ message: "User already exist"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword});
        await user.save();

        res.status(201).json({ message: "USer register successfully!"});
    }catch (err) {
        res.status(500).json({message: "server Error"});
    }
};

//LOGIN

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email});
        if (!user) return res.status(400).json({ message: "user not found"});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalied User"});

        //JWT token
        const token = jwt.sign(
            { id: user._id},
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({
            token,
            user: {
                id: user._id, name: user.name, email: user.email
            }
        });
    }catch (err) {
        res.status(500).json({ message: "server Error"});
    }
}