const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
    currency_id:{
    type:Number
    },
    name:{
        type:String
    },
    symbol:{
        type:String
    },
    exchange_rate:{
        type:String
    },
    status:{
        type:String
    },
    code:{
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

const Currency = mongoose.model('currency',currencySchema);

module.exports = Currency;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
