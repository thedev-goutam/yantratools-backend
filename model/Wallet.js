const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user_id:{
        type:String
    },
    amount:{
        type:String
    },
    payment_method:{
        type:String
    },
    payment_details:{
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

const Wallet = mongoose.model('wallet',walletSchema);

module.exports = Wallet;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
