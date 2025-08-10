const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    shop_id:{
        type:Number
    },
    user_id:{
        type:Number
    },
    name:{
        type:String
    },
    logo:{
        type:String
    },
    sliders:{
        type:String
    },
    address:{
        type:String
    },
    facebook:{
        type:String
    },
    google:{
        type:String
    },
    twitter:{
        type:String
    },
    youtube:{
        type:String
    },
    slug:{
        type:String
    },
    meta_title:{
        type:String
    },
    meta_description:{
        type:String
    },
    pick_up_point_id:{
        type:String
    },
    shipping_cost:{
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

const Shop = mongoose.model('shop',shopSchema);

module.exports = Shop;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
