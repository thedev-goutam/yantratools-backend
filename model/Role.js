const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role_id:{
     type:Number
    },
    name:{
        type:String
    },
    permissions:{
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

const Role = mongoose.model('role',roleSchema);

module.exports = Role;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
