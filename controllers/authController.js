const passport = require("passport");
const User = require("../models/user");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.getLogin = (req, res) => {
    res.render("login");
};

exports.postLogin = (req, res, next) => {
    passport.authenticate("local", function(err, user, info) {
        if (err) { 
            console.log(err); 
            return next(err); 
        }
        if (!user) { 
            return res.render("login", { errorMessage: "Invalid email or password" }); 
        }
        req.logIn(user, function(err) {
            if (err) { 
                console.log(err); 
                return res.render("login", { errorMessage: "Login failed. Please try again." });
            }

            res.render("welcome");
        });
    })(req, res, next);
};

exports.getSignup = (req, res) => {
    res.render("signup");
};

exports.postSignup = (req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if(password !== confirmPassword){
        return res.render("signup", { errorMessage: "Passwords doesn't match" });
    }

    const user = new User({ name: name, username: username });

    User.register(user, password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("signup", { errorMessage: "User registration failed. Please try again." });
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/");
        });
    });
};

exports.getforgotPassword = (req, res) => {
    res.render("forgotPassword");
};

exports.postforgotPassword = async (req, res) => {
    const email = req.body.email;

    try {
        const user = await User.findOne({username: email});

        if(!user) {
            return res.render("forgotPassword", { errorMessage: "User not found." });
        }

        const token = crypto.randomBytes(10).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;

        await user.save();

        const transporter = nodemailer.createTransport({
            host: "smtp.example.com",
            port: 587,
            secure: false,
            service: "gmail",
            auth: {
                user: process.env.GMAIL,
                pass: process.env.APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: {
                name: "Share Reads",
                address: process.env.GMAIL
            },
            to: user.username,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n
            Your password reset token is:\n\n
            ${token}\n\n
            This token is valid for 5 minutes. If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);

        res.redirect("/authCode");

    } catch (err) {
        console.log(err);
        res.redirect("/forgotPassword");
    }
};

exports.getauthCode = (req, res) => {
    res.render("authCode");
};

exports.postauthCode = async (req, res) => {
    const token = req.body.code;

    try {

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if(!user) {
            return res.render("authCode", { errorMessage: "Token is invalid or expired." });
        }

        res.render("resetPassword", {token});

    } catch (err) {
        console.log(err);
        res.redirect("/forgotPassword");
    }
};


exports.getresetPassword = (req, res) => {
    res.render("resetPassword");
};

exports.postresetPassword = async (req, res) => {
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const token = req.body.token;

    if(password !== confirmPassword){
        return res.render("resetPassword", { errorMessage: "Passwords doesn't match", token});
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render("resetPassword", { errorMessage: "Token is invalid or expired.", token});
        }

        user.setPassword(password, async (err) => {
            if (err) {
                console.log(err);
                return res.render("resetPassword", { errorMessage: "Failed to reset password", token});
            }

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            res.redirect("/");
        });

    } catch (err) {
            console.log(err);
            res.redirect("/forgotPassword");
        }
};
