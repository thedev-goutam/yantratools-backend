const mongoose = require('mongoose');

const modelCallSchema = new mongoose.Schema({
    model_id:{
      type:Number
    },
    user_id:{
        type:Number
    },
    session_id:{
        type:String
    },
    name:{
        type:String
    },
    phone:{
        type:String
    },
    url:{
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

const ModelCallback = mongoose.model('model_data',modelCallSchema);

module.exports = ModelCallback;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
