const mongoose = require("mongoose");
const User = require("../models/user");
const Book = require("../models/userBooklist");

const userRequest = new mongoose.Schema({

    fromUser: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
     },

    toUser: {
         type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
         },

    status: { 
        type: String, enum: ['Pending', 'Accepted', 'Ignored'], default: 'Pending'
     },

    createdTime: {
         type: Date, default: Date.now 
    },
    
});

const UserRequest = mongoose.model("UserRequest", userRequest);

module.exports = UserRequest;
