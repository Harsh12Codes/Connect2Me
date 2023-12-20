const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
    try {
        //encrypting password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //creating the user
        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        //saving the user and returning as a response
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
    }
});

//LOGIN
router.post("/login", async (req, res) => {
    try {
        //finding the same user in database
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(404).send("user not found!");

        //if user found then checking for the password
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password,
        );

        !validPassword && res.status(400).json("wrong password!");

        //if password correct then returning user as response
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
