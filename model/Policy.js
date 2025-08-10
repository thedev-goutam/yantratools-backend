const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    policy_id:{type:Number},
    name:{
        type:String
    },
    content:{
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

const Policy = mongoose.model('policy',policySchema);

module.exports = Policy;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
