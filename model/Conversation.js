const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    conv_id:{type:Number},
    sender_id:{
        type:Number
    },
    receiver_id:{
        type:Number
    },
    title:{
        type:String
    },
    sender_viewed:{
        type:Number
    },
    receiver_viewed:{
        type:Number
    },
    created:{
        type: Date,
        default: function() {
            return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
          }
    },
    updated:{
        type: Date,
        default: function() {
            return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
          }
    }
})

const Conversation = mongoose.model('conversation',conversationSchema);

module.exports = Conversation;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
