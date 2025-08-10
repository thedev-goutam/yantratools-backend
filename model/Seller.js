const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    seller_id:{type:Number},
    user_id:{
        type:Number
    },
    verification_status:{
        type:Number
    },
    verification_info:{
        type:String
    },
    cash_on_delivery_status:{
        type:String
    },
    admin_to_pay:{
        type:String
    },
    bank_name:{
        type:String
    },
    bank_acc_name:{
        type:String
    },
    bank_acc_no:{
        type:String
    },
    bank_routing_no:{
        type:String
    },
    bank_payment_status:{
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

const Seller = mongoose.model('seller',sellerSchema);

module.exports = Seller;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
