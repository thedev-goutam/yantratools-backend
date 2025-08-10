const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    ord_id:{
     type:Number,
    },
    user_id:{
        type:Number
    },
    guest_id:{
        type:Number
    },
    shipping_address:{
        type:String
    },
    cust_gst_num:{
        type:String
    },
    payment_type:{
        type:String
    },
    payment_status:{
        type:String
    },
    payment_details:{
        type:String
    },
    grand_total:{
        type:Number
    },
    full_with_discount:{
        type:Number
    },
    cod_charges:{
        type:Number
    },
    advance_payment:{
        type:Number
    },
    rest_payment:{
        type:Number
    },
    p_mode:{
        type:Number
    },
    coupon_discount:{
        type:Number
    },
    code:{
        type:String
    },
    date:{
        type:Number
    },
    viewed:{
        type:Number
    },
    delivery_viewed:{
        type:Number
    },
    payment_status_viewed:{
        type:Number
    },
    commission_calculated:{
        type:Number
    },
    shipping_order_id:{
        type:String
    },
    shipping_status:{
        type:String
    },
    awb:{
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

const Order = mongoose.model('order',orderSchema);

module.exports = Order;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
