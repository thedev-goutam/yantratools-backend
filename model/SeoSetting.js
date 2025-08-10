const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
    keyword:{
        type:String
    },
    author:{
        type:String
    },
    revisit:{
        type:String
    },
    sitemap_link:{
        type:String
    },
    description:{
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

const SeoSetting = mongoose.model('seller',seoSchema);

module.exports = SeoSetting;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
