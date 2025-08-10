const mongoose = require('mongoose');

const subsSchema = new mongoose.Schema({
    email:{
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

const Subscriber = mongoose.model('subscriber',subsSchema);

module.exports = Subscriber;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
