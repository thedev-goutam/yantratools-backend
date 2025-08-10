const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    brand_id:{type:Number},
    name:{
        type:String
    },
    logo:{
        type:String
    },
    top:{
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

const Brand = mongoose.model('brand',brandSchema);

module.exports = Brand;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
