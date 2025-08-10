const mongoose = require('mongoose');

const generalSettingSchema = new mongoose.Schema({
    gen_id:{type:Number},
    frontend_color:{
        type:String
    },
    logo:{
        type:String
    },
    footer_logo:{
        type:String
    },
    admin_logo:{
        type:String
    },
    admin_login_background:{
        type:String
    },
    admin_login_sidebar:{
        type:String
    },
    favicon:{
        type:String
    },
    site_name:{
        type:String
    },
    address:{
        type:String
    },
    description:{
        type:String
    },
    phone:{
        type:String
    },
    email:{
        type:String
    },
    favicon:{
        type:String
    },
    facebook:{
        type:String
    },
    instagram:{
        type:String
    },
    twitter:{
        type:String
    },
    youtube:{
        type:String
    },
    google_plus:{
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

const GenralSetting = mongoose.model('general_setting',generalSettingSchema);

module.exports = GenralSetting;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
