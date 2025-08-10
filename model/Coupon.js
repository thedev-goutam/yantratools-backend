const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    coupon_id:{
     type:Number
    },
    code:{
        type:String
    },
    details:{
        type:String
    },
    discount:{
        type:String
    },
    type:{
        type:String
    },
    status:{
        type:String
    },
    valid_from:{
        type:Date
    },
    valid_to:{
        type:Date
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

const Coupon = mongoose.model('coupon',couponSchema);

module.exports = Coupon;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
