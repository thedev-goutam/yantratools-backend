const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    prd_id:{
     type:Number
    },
    name:{
        type:String
    },
    added_by:{
        type:String
    },
    user_id:{
        type:Number
    },
    category_id:{
        type:Number
    },
    subcategory_id:{
        type:Number
    },
    subsubcategory_id:{
        type:Number
    },
    brand_id:{
        type:Number
    },
    slug:{
        type:String
    },
    sku:{
        type:String
    },
    photos:{
        type:String
    },
    thumbnail_img:{
        type:String
    },
    video_provider:{
        type:String
    },
    video_link:{
        type:String
    },
    tags:{
        type:String
    },
    description:{
        type:String
    },
    unit_price:{
        type:Number
    },
    purchase_price:{
        type:Number
    },
    variant_product:{
        type:String
    },
    attributes:{
        type:String
    },
    choice_options:{
        type:String
    },
    colors:{
        type:String
    },
    variations:{
        type:String
    },
    todays_deal:{
        type:Number
    },
    published:{
        type:Number
    },
    is_best_selling: {
        type: Number
    },
    featured:{
        type:Number
    },
    current_stock:{
        type:Number
    },
    unit:{
        type:String
    },
    min_qty:{
        type:Number
    },
    discount:{
        type:Number
    },
    discount_type:{
        type:String
    },
    tax:{
        type:Number
    },
    tax_type:{
        type:String
    },
    shipping_type:{
        type:String
    },
    shipping_cost:{
        type:Number
    },
    num_of_sale:{
        type:Number
    },
    meta_title:{
        type:String
    },
    meta_description:{
        type:String
    },
    meta_img:{
        type:String
    },
    pdf:{
        type:String
    },
    rating:{
        type:Number
    },
    barcode:{
        type:String
    },
    digital:{
        type:Number
    },
    file_name:{
        type:String
    },
    file_path:{
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

const Product = mongoose.model('product',productSchema);

module.exports = Product;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
