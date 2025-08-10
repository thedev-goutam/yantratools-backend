const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    address_id:{
     type:Number
    },
    user_id:{
        type:Number
    },
    address:{
        type:String
    },
    country:{
        type:String
    },
    city:{
        type:String
    },
    postal_code:{
        type:String
    },
    phone:{
        type:String
    },
    alt_phone:{
        type:String
    },
    set_default:{
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

const Address = mongoose.model('address',addressSchema);

module.exports = Address;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
