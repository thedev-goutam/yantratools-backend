const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    staff_id:{
     type:Number
    },
    user_id:{
        type:Number
    },
    role_id:{
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

const Staff = mongoose.model('staff',staffSchema);

module.exports = Staff;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
