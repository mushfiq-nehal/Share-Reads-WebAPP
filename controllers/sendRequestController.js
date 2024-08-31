const User = require('../models/user');

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
};

