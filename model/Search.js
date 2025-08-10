const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    query:{
        type:String
    },
    count:{
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

const Search = mongoose.model('search',searchSchema);

module.exports = Search;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
