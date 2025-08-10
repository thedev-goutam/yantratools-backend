const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    code:{
        type:String
    },
    user_id:{
        type:String
    },
    subject:{
        type:String
    },
    details:{
        type:Text
    },
    files:{
        type:Text
    },
    status:{
        type:String
    },
    viewed:{
        type:String
    },
    client_viewed:{
        type:String
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

const Ticket = mongoose.model('ticket',ticketSchema);

module.exports = Ticket;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
