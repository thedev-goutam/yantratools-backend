const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
    slider_id:{
        type:Number
    },
    photo:{
        type:String
    },
    title:{
        type:String
    },
    subtitle:{
        type:String
    },
    published:{
        type:Number
    },
    link:{
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

const Slider = mongoose.model('slider',sliderSchema);

module.exports = Slider;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
