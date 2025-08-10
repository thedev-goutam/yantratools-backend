const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message_id:{
       type:Number
    },
    conversation_id:{
        type:Number
    },
    sender_id:{
        type:String
    },
    user_id:{
        type:String
    },
    message:{
        type:String
    },
    sender_viewed:{
        type:String
    },
    receiver_viewed:{
        type:String
    },
    created_at:{
        type: Date,
        default: function() {
            return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
          }
    },
    updated_at:{
        type: Date,
        default: function() {
            return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
          }
    }
})

const Message = mongoose.model('message',messageSchema);

module.exports = Message;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
