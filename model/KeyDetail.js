const mongoose = require('mongoose');

const keyDetailSchema = new mongoose.Schema({
    key_id:{
        type:String
    },
    key_secret:{
        type:String
    },
    status:{
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

const KeyDetail = mongoose.model('key_detail',keyDetailSchema);

module.exports = KeyDetail;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
