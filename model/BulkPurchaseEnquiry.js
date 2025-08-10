const mongoose = require('mongoose');

const bulkPurchaseSchema = new mongoose.Schema({
    bulk_id:{
      type:Number
    },
    product_id:{
        type:Number
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
    pincode:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    remark:{
        type:String
    },
    urgency:{
        type:String
    },
    quality:{
        type:String
    },
    target_price:{
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

const BulkPurchaseEnquiry = mongoose.model('bulk_purchase_enquiry',bulkPurchaseSchema);

module.exports = BulkPurchaseEnquiry;