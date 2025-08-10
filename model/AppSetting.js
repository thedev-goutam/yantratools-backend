const mongoose = require('mongoose');

const appSettingSchema = new mongoose.Schema({
    app_id:{type:Number},
    name:{
        type:String
    },
    logo:{
        type:String
    },
    currency_id:{
        type:String
    },
    currency_format:{
        type:String
    },
    facebook:{
        type:String
    },
    twitter:{
        type:String
    },
    instagram:{
        type:Boolean
    },
    youtube:{
        type:Boolean
    },
    google_plus:{
        type:String
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

const AppSetting = mongoose.model('app_setting',appSettingSchema);

module.exports = AppSetting;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
