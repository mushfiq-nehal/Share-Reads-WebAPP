const Book = require("../models/userBooklist");

exports.getBooks = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const books = await Book.find({ userId: req.user._id });
            res.render("booklist", { books });
        } catch (err) {
            console.log(err);
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
};

exports.addBook = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const newBook = new Book({
                userId: req.user._id,
                title: req.body.title,
                author: req.body.author,
                review: req.body.review,
                rating: req.body.rating
            });

            await newBook.save();
            res.redirect("/booklist");
        } catch (err) {
            console.log(err);
            res.redirect("/booklist");
        }
    } else {
        res.redirect("/");
    }
};

exports.deleteBook = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const bookId = req.body.bookId;
            if (!bookId) {
                console.log("No book ID provided");
                return res.redirect("/booklist");
            }

            await Book.deleteOne({ _id: bookId, userId: req.user._id });
            res.redirect("/booklist");
        } catch (err) {
            console.log(err);
            res.redirect("/booklist");
        }
    } else {
        res.redirect("/");
    }
};