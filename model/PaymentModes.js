const mongoose = require('mongoose');

const paymentModeSchema = new mongoose.Schema({
    amount:{
        type:Number
    },
    discount:{
        type:String
    },
    part_percentage:{
        type:String
    },
    cod_charges:{
        type:String
    },
    status:{
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

const PaymentMode = mongoose.model('payment_mode',paymentModeSchema);

module.exports = PaymentMode;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
