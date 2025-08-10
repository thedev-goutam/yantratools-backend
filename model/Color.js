const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    name:{
        type:String
    },
    code:{
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

const Color = mongoose.model('color',colorSchema);

module.exports = Color;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
