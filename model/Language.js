const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
    name:{
        type:String
    },
    code:{
        type:String
    },
    rtl:{
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

const Language = mongoose.model('language',languageSchema);

module.exports = Language;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
