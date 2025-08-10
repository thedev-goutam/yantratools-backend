const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review_id:{
        type:Number
    },
    product_id:{
        type:Number
    },
    user_id:{
        type:Number
    },
    name:{
        type:String
    },
    rating:{
        type:Number
    },
    comment:{
        type:String
    },
    image:{
        type:String
    },
    status:{
        type:Number
    },
    viewed:{
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

const Reviews = mongoose.model('review',reviewSchema);

module.exports = Reviews;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
