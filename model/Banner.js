const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    banner_id:{
    type:Number
    },
    photo:{
        type:String
    },
    url:{
        type:String
    },
    position:{
        type:Number
    },
    published:{
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

const Banner = mongoose.model('banner',bannerSchema);

module.exports = Banner;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
