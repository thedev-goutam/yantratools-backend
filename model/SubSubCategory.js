const mongoose = require('mongoose');

const subsubcatSchema = new mongoose.Schema({
    name:{
        type:String
    },
    sub_sub_cat_id:{
        type:Number
    },
    sub_category_id:{
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

const SubSubCategory = mongoose.model('sub_sub_category',subsubcatSchema);

module.exports = SubSubCategory;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
