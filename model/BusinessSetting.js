const mongoose = require('mongoose');

const businessSettingSchema = new mongoose.Schema({
    type:{
        type:String
    },
    value:{
        type:Number
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

const BusinessSetting = mongoose.model('business_setting',businessSettingSchema);

module.exports = BusinessSetting;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
