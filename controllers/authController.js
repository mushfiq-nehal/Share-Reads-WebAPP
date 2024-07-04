const passport = require("passport");
const User = require("../models/user");

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
            if(!user.profileComplete){
                return res.redirect("/profile");
            } else {
                return res.redirect("/profileInfo");
            }
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
