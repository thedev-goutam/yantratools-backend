const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id:{
        type:String
    },
    product_id:{
        type:String
    },
    variation:{
        type:String
    },
    price:{
        type:String
    },
    tax:{
        type:String
    },
    shipping_cost:{
        type:String
    },
    quantity:{
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

const Cart = mongoose.model('cart',cartSchema);

module.exports = Cart;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
