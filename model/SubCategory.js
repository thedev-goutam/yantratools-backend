const mongoose = require('mongoose');

const subcatSchema = new mongoose.Schema({
    name:{
        type:String
    },
    sub_cat_id:{
        type:Number
    },
    category_id:{
        type:Number
    },
    slug:{
        type:String
    },
    meta_title:{
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

const SubCategory = mongoose.model('sub_category',subcatSchema);

module.exports = SubCategory;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
