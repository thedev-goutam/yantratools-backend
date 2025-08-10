const mongoose = require('mongoose');

const catSchema = new mongoose.Schema({

    category_id:{
     type:Number
    },
    name:{
        type:String
    },
    commision_rate:{
        type:Number
    },
    banner:{
        type:String
    },
    list_banner:{
        type:String
    },
    icon:{
        type:String
    },
    featured:{
        type:Number
    },
    top:{
        type:Number
    },
    digital:{
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

const Category = mongoose.model('category',catSchema);

module.exports = Category;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
