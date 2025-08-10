const mongoose = require('mongoose');

const wishSchema = new mongoose.Schema({
    wish_id:{
     type:Number
    },
    user_id:{
        type:Number
    },
    product_id:{
        type:Number
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

const Wishlist = mongoose.model('wishlist',wishSchema);

module.exports = Wishlist;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
