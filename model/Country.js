const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    code:{
        type:String
    },
    name:{
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

const Country = mongoose.model('country',countrySchema);

module.exports = Country;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
