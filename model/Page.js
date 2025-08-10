const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title:{
        type:String
    },
    slug:{
        type:String
    },
    content:{
        type:String
    },
    meta_title:{
        type:String
    },
    meta_description:{
        type:String
    },
    keywords:{
        type:String
    },
    meta_image:{
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

const Page = mongoose.model('page',pageSchema);

module.exports = Page;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
