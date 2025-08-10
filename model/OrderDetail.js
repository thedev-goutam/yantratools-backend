const mongoose = require('mongoose');

const orderDSchema = new mongoose.Schema({
    ordd_id:{
   type:Number
    },
    order_id:{
        type:Number
    },
    seller_id:{
        type:Number
    },
    product_id:{
        type:Number
    },
    variation:{
        type:String
    },
    price:{
        type:Number
    },
    tax:{
        type:Number
    },
    shipping_cost:{
        type:Number
    },
    quantity:{
        type:Number
    },
    payment_status:{
        type:String
    },
    delivery_status:{
        type:String
    },
    shipping_type:{
        type:String
    },
    pickup_point_id:{
        type:String
    },
    product_referral_code:{
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

const OrderDetail = mongoose.model('order_detail',orderDSchema);

module.exports = OrderDetail;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
