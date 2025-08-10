const mongoose = require('mongoose');

const homeCatSchema = new mongoose.Schema({
    homecat_id:{
         type:Number
    },
    category_id:{
        type:Number
    },
    subsubcategories:{
        type:Number
    },
    status:{
        type:Number
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

const HomeCategory = mongoose.model('home_category',homeCatSchema);

module.exports = HomeCategory;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
