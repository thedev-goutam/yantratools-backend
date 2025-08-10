const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
    cms_id:{
       type:Number
    },
    blog_type:{
        type:Number
    },
    category:{
        type:String
    },
    sub_category:{
        type:String
    },
    sub_sub_category:{
        type:String
    },
    blog_title:{
        type:String
    },
    blog_image:{
        type:String
    },
    blog_description:{
        type:String
    },
    blog_slug:{
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

const Cms = mongoose.model('cms',cmsSchema);

module.exports = Cms;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
