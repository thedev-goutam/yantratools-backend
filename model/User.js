const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    usr_id:{
        type:Number
    },
    referred_by:{
        type:String
    },
    provider_id:{
        type:String
    },
    user_type:{
        type:String
    },
    name:{
        type:String
    },
    email:{
        type:String
    },
    phone:{
        type:String
    },
    user_emergecy_contact:{
        type:String
    },
    email_verified_at:{
        type:String
    },
    verification_code:{
        type:String
    },
    new_email_verificiation_code:{
        type:String
    },
    password:{
        type:String
    },
    remember_token:{
        type:String
    },
    avatar:{
        type:String
    },
    avatar_original:{
        type:String
    },
    address:{
        type:String
    },
    cust_gst_num:{
        type:String
    },
    country:{
        type:String
    },
    city:{
        type:String
    },
    postal_code:{
        type:String
    },
    balance:{
        type:String
    },
    banned:{
        type:Number
    },
    referral_code:{
        type:String
    },
    customer_package_id:{
        type:String
    },
    remaining_uploads:{
        type:String
    },
    otp:{
        type:String
    },
    otpExpires:{
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

const User = mongoose.model('user',userSchema);

module.exports = User;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
