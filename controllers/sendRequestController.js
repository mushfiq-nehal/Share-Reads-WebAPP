const User = require('../models/user');
const nodemailer = require("nodemailer");

exports.sendRequest = async (req, res) => {
    const { toUserId, bookId } = req.body;
    const fromUserId = req.user._id; 

    try {
        const user = await User.findById(toUserId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const existingRequest = user.notifications.find(notification => 
            notification.fromUser.equals(fromUserId) && 
            notification.book.equals(bookId)
        );

        if (existingRequest) {
           
            user.notifications = user.notifications.filter(notification =>
                !(notification.fromUser.equals(fromUserId) && notification.book.equals(bookId))
            );
            await user.save();
        } else {
           
            user.notifications.push({
                fromUser: fromUserId,
                book: bookId,
                status: 'pending',
            });
            await user.save();
        }

        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
};



exports.gethandleRequest  = async (req, res) => {
    
    if (req.isAuthenticated()) {
        const user = await User.findById(req.user._id).populate("notifications.fromUser").populate("notifications.book");
        
        res.render('notifications', { notifications: user.notifications });
    } else {
        res.redirect('/');
    }

};

exports.posthandleRequest = async (req, res) => {
    const { notificationId, action } = req.body;

    try {
        const user = await User.findById(req.user._id).populate('notifications.fromUser');
        if (!user) {
            return res.status(404).send('User not found');
        }

        const notification = user.notifications.id(notificationId);
        if (!notification) {
            return res.status(404).send('Notification not found');
        }

        if (action === 'accept') {
            notification.status = 'accepted';
            await user.save();

            const requestingUser = await User.findById(notification.fromUser._id);
            if (!requestingUser) {
                return res.status(404).send('Requesting user not found');
            }

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
                to: requestingUser.username,
                subject: 'Your Request has been Accepted!',
                text: `Congratulations! Your book request has been accepted by ${user.name} (${user.username}). You can now coordinate for the book exchange.`,
            };

            await transporter.sendMail(mailOptions);

        } else if (action === 'cancel') {
            notification.status = 'ignored';
            await user.save();
        }

            await User.findByIdAndUpdate(
                req.user._id,
                { $pull: { notifications: { _id: notificationId } } }
            );

        res.redirect('/notifications');

    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
};