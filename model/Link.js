const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    name:{
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

const Link = mongoose.model('link',linkSchema);

module.exports = Link;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
