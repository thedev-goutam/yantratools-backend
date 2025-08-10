const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    blog_id:{
        type:Number
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
    meta_title:{
        type:String
    },
    meta_keyword:{
        type:String
    },
    meta_description:{
        type:String
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

const Blog = mongoose.model('blog',blogSchema);

module.exports = Blog;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
