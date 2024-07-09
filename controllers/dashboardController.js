const Book = require("../models/userBooklist");
const User = require("../models/user");

exports.getDashboard = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const page = parseInt(req.query.page) || 1; 
            const limit = 8; 
            const skip = (page - 1) * limit;

            const books = await Book.find({})
                                    .populate('userId')
                                    .skip(skip)
                                    .limit(limit);

            const count = await Book.countDocuments({});

            res.render('dashboard', {
                books,
                currentPage: page,
                totalPages: Math.ceil(count / limit)
            });
        } catch (err) {
            console.log(err);
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }
};
