const User = require("../models/user");
const passport = require("passport");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

exports.getUser = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/");
    }

    User.findById(req.user._id).then(function (foundUser) {
        if (foundUser) {
            res.render("profile", { 
                userName: foundUser.name, 
                userImage: foundUser.profileImage, 
                userDivision: foundUser.division, 
                userAddress: foundUser.address, 
                userPhone: foundUser.phone, 
                userGender: foundUser.gender
            });
        } else {
            res.status(404).send("User not found");
        }
    }).catch(function (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    });
};

exports.postUser = [
    upload.single('profileImage'),
    (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect("/");
        }

        const { address, phone, division, gender } = req.body;
        let profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

        User.findById(req.user._id).then((user) => {
            if (user) {
                user.address = address;
                user.phone = phone;
                user.division = division;
                user.gender = gender;
                if (profileImage) {
                    user.profileImage = profileImage;
                }
                user.profileComplete = true;
                return user.save();
            }
        }).then(() => {
            res.redirect("/profileInfo");
        }).catch((err) => {
            console.log(err);
            res.redirect("/profile");
        });
    }
];

exports.getProfileInfo = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/");
    }

    User.findById(req.user._id).then((user) => {
        if (user) {
            res.render("profileInfo", {
                userName: user.name,
                userGender: user.gender,
                userEmail: user.username,
                userDivision: user.division,
                userAddress: user.address,
                userPhone: user.phone,
                userImage: user.profileImage
            });
        }
    }).catch((err) => {
        console.log(err);
        res.redirect("/");
    });
};

exports.deletePhoto = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect('/');
        }

        const user = await User.findById(req.user._id);
        if (user) {
            user.profileImage = undefined;
            await user.save();
            res.redirect('/profile');
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};