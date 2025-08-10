const mongoose = require('mongoose');

const requestCallSchema = new mongoose.Schema({
    rc_id:{
      type:Number
    },
    name:{
        type:String
    },
    email:{
        type:String
    },
    phone:{
        type:String
    },
    message:{
        type:String
    },
    product_id:{
        type:Number
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

const RequestCallback = mongoose.model('request_callback',requestCallSchema);

module.exports = RequestCallback;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
