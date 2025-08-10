const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Order = require("../model/Order");
const crypto = require('crypto');
const Wishlist = require('../model/Wishlist');
const Address = require('../model/Address');
const Conversation = require('../model/Conversation');
const OrderDetail = require('../model/OrderDetail');
const Product = require('../model/Product');
const BusinessSetting = require('../model/BusinessSetting');
const PaymentMode = require("../model/PaymentModes");
const Category = require("../model/Category");
const SubCategory = require("../model/SubCategory");
const SubSubCategory = require("../model/SubSubCategory");
const Brand = require("../model/Brand");
const Seller = require("../model/Seller");
const Reviews = require("../model/Reviews");
const Questions = require("../model/Question");
const RequestCallBack = require("../model/RequestCallback");
const ModelCallback = require("../model/ModelData");
const Blog = require("../model/Blog");
const CMS = require("../model/Cms");
const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const GenralSetting = require("../model/GenralSetting");
const transporter = require('../helpers/nodemail');
const moment = require('moment');
const handlebars = require("handlebars");
const Staff = require("../model/Staff");
const Role = require("../model/Role");
const Coupon = require("../model/Coupon");
const Message = require("../model/Message");
const Policy = require("../model/Policy");
const Slider = require("../model/Slider");
const Banner = require("../model/Banner");
const HomeCategory = require("../model/HomeCategory");
const XLSX = require('xlsx');
const helpers = require('handlebars-helpers')();
handlebars.registerHelper(helpers);
handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

module.exports = {
   adminLogin:async function(req, res) {
     const { email, password } = req.body;
    try{
    const user = await User.findOne({ email: email,user_type: { $in: ['admin', 'staff'] }});
    if(user) { 
      const ismatch = await bcrypt.compare(password,user.password);
      const staff = await Staff.findOne({user_id:user.usr_id});
      let role = {};
      if(staff) {
        role = await Role.findOne({role_id:staff.role_id});
      }

      if(ismatch) {
             const payload = {
        user: {
          id: user.usr_id,
        },
      };
      
      jwt.sign(
        payload,
        "mySecretToken",
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ success:true, token,user_type:user.user_type,role:role.permissions });
        }
      );
      }
      else{
        res.status(200).json({success:false,msg:'User not found!!'});
      }
      
    }
    else{
      res.status(200).json({success:false,msg:'User not found!!'});
    }
    } catch (err) {
      res.status(500).send("Server error");
    }
   },
    getAdminDashboard: async function(req, res) {
        try{
            let [publishProducts,sellerProducts,adminProducts,categoryCount,subcatCount,subsubcatCount,brandCount,sellerCount,approvedsellerCount,pendingsellerCount] = await Promise.all([
                Product.countDocuments({published:1}),
                Product.countDocuments({published:1,added_by:'seller'}),
                Product.countDocuments({published:1,added_by:'admin'}),
                Category.countDocuments({}),
                SubCategory.countDocuments({}),
                SubSubCategory.countDocuments({}),
                Brand.countDocuments({}),
                Seller.countDocuments({}),
                Seller.countDocuments({verification_status:1}),
                Seller.countDocuments({verification_status:0}),

              ])

              let catWithSales = await getCatWithSales();
              let catWithStock = await getCatWithStock();

            res.status(200).json({success:true,data:{
                publishProducts,sellerProducts,adminProducts,categoryCount,subcatCount,subsubcatCount,brandCount,sellerCount,approvedsellerCount,pendingsellerCount,catWithSales,catWithStock
            }});
          }
          catch(err){
            res.status(400).json({success:false,data:{}});
          }  
    },
    getSideBarDataAdmin: async function(req, res) {
      try{
          let [prdReviewCount,orderCount,prdQuestionCount,sellerCount,conversationCount] = await Promise.all([
              Reviews.countDocuments({viewed:0}),
              Order.countDocuments({viewed:0}),
              Questions.countDocuments({viewed:0}),
              Seller.countDocuments({verification_status:0,verification_info:{$ne:null}}),
              Conversation.countDocuments({receiver_id:9,receiver_viewed:1})
            ])
          res.status(200).json({success:true,data:{
            prdReviewCount,orderCount,prdQuestionCount,sellerCount,
            conversationCount
          }});
        }
        catch(err){
          res.status(400).json({success:false,data:{}});
        }  
  },
    getAllBrandsAdmin: async function(req,res){

        let size = req.body.size || 10;
        let pageNo = req.body.pageNo || 1; 
        let query = {};
        if(req.body.search){
          query.name = {$regex: req.body.search, $options: 'i'}
        }
        let pagination={};
        pagination.skip = Number(size * (pageNo - 1));
        pagination.limit = Number(size) || 0;
        const sort = { created_at: -1 };
        const totalBrands = await Brand.countDocuments(query);
    
        if(totalBrands>0){
          const brand = await Brand.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);
    
            res.status(200).json({success:true,data:brand,total:totalBrands});
        }else{
            res.status(200).json({success:true,data:[],total:totalBrands}); 
        }
    
    },
    getAllCategorysAdmin: async function(req,res){

      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      let query = {};
      if(req.body.search){
        query.name = {$regex: req.body.search, $options: 'i'}
      }
      let pagination={};
      pagination.skip = Number(size * (pageNo - 1));
      pagination.limit = Number(size) || 0;
      const sort = { created_at: -1 };
      const totalCat = await Category.countDocuments(query);
  
      if(totalCat>0){
        const cat = await Category.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);
  
          res.status(200).json({success:true,data:cat,total:totalCat});
      }else{
          res.status(200).json({success:true,data:[],total:totalCat}); 
      }
  
  },
  getAllSubcatsAdmin: async function(req,res){

    let size = req.body.size || 10;
    let pageNo = req.body.pageNo || 1; 
    let query = {};
    if(req.body.search){
      query.name = {$regex: req.body.search, $options: 'i'}
    }
    let pagination={};
    pagination.skip = Number(size * (pageNo - 1));
    pagination.limit = Number(size) || 0;
    const sort = { created_at: -1 };
    const totalSubCat = await SubCategory.countDocuments(query);

    if(totalSubCat>0){
      const subcat = await SubCategory.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);

      const subcatWithCategory = await Promise.all(
        subcat.map(async (subcat) => {
            const category = await Category.findOne({ category_id: subcat.category_id }, 'name');
            return {
                ...subcat.toObject(),
                categoryName: category ? category.name : null
            };
        })
    );

        res.status(200).json({success:true,data:subcatWithCategory,total:totalSubCat});
    }else{
        res.status(200).json({success:true,data:[],total:totalSubCat}); 
    }

},
getAllSubSubcatsAdmin: async function(req,res){

  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let query = {};
  if(req.body.search){
    query.name = {$regex: req.body.search, $options: 'i'}
  }
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const sort = { created_at: -1 };
  const totalSubSubCat = await SubSubCategory.countDocuments(query);

  if(totalSubSubCat>0){
    const subsubcat = await SubSubCategory.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);

    const subSubCatsWithNames = await Promise.all(
      subsubcat.map(async (subSubCat) => {
          const subcategory = await SubCategory.findOne({ sub_cat_id: subSubCat.sub_category_id }, 'name category_id');
          const category = subcategory
                    ? await Category.findOne({ category_id: subcategory.category_id }, 'name')
                    : null;
          return {
              ...subSubCat.toObject(),
              subCategoryName: subcategory ? subcategory.name : null,
              categoryName: category ? category.name : null
          };
      })
  );

      res.status(200).json({success:true,data:subSubCatsWithNames,total:totalSubSubCat});
  }else{
      res.status(200).json({success:true,data:[],total:totalSubSubCat}); 
  }

},

getAllInhouseProductAdmin: async function(req,res){
  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let query = {};
  if(req.body.search){
    query =  {$or: [
    { name: { $regex: req.body.search, $options: 'i' } },
    { sku: { $regex: req.body.search, $options: 'i' } }
  ]
}
  }

  let sort={}

  if(req.body.sort_by){
    const type = req.body.sort_by; 
    const [colName, query] = type.split(","); 
    const sortOrder = query === 'asc' ? 1 : -1;

// Construct the sort object
    sort = { [colName]: sortOrder };
  }
  else{
    sort = {created_at : -1};
  }
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalPrd = await Product.countDocuments(query);

  if(totalPrd>0){
    const prd = await Product.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);
    const parsedProducts = prd.map(pr => {
      return {
          ...pr.toObject(),
          photos: pr.photos ? JSON.parse(pr.photos) : []
      };
  });
    

      res.status(200).json({success:true,data:parsedProducts,total:totalPrd});
  }else{
      res.status(200).json({success:true,data:[],total:totalPrd}); 
  }

},

getAllDigitalProductAdmin: async function(req,res){
  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let pagination={};
  let sort ={created_at:-1};
  let query = {digital:1}
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalPrd = await Product.countDocuments(query);

  if(totalPrd>0){
    const prd = await Product.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);
    const parsedProducts = prd.map(pr => {
      return {
          ...pr.toObject(),
          photos: JSON.parse(pr.photos)
      };
  });
    

      res.status(200).json({success:true,data:parsedProducts,total:totalPrd});
  }else{
      res.status(200).json({success:true,data:[],total:totalPrd}); 
  }

},
getAllReviewsAdmin: async function(req,res){

  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let query = {};
  let sort={}

  if(req.body.sort_by){
    const type = req.body.sort_by; 
    const [colName, query] = type.split(","); 
    const sortOrder = query === 'asc' ? 1 : -1;

// Construct the sort object
    sort = { [colName]: sortOrder };
  }
  else{
    sort = {created_at : -1};
  }
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalReviews = await Reviews.countDocuments(query);

  if(totalReviews>0){
    const reviewUser = await Reviews.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);

    const reviewsWithUser = await Promise.all(
      reviewUser.map(async (review) => {
          const user = await User.findOne({ usr_id: review.user_id }, 'name');
          const product = await Product.findOne({prd_id: review.product_id},'name slug added_by');
          return {
              ...review.toObject(),
              userName: user ? user.name : null,
              product : product ? product : {}
          };
      })
  );

      res.status(200).json({success:true,data:reviewsWithUser,total:totalReviews});
  }else{
      res.status(200).json({success:true,data:[],total:totalReviews}); 
  }

},

getAllQuestionsAdmin: async function(req,res){

  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let sort = {created_at : -1};
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalQuestions = await Questions.countDocuments();

  if(totalQuestions>0){
    const questionUser = await Questions.find().sort(sort).skip(pagination.skip).limit(pagination.limit);

    const questionsWithUser = await Promise.all(
      questionUser.map(async (ques) => {
          const user = await User.findOne({ usr_id: ques.user_id }, 'name email');
          const product = await Product.findOne({prd_id: ques.product_id},'name slug');
          return {
              ...ques.toObject(),
              user: user ? user : {},
              product : product ? product : {}
          };
      })
  );

      res.status(200).json({success:true,data:questionsWithUser,total:totalQuestions});
  }else{
      res.status(200).json({success:true,data:[],total:totalQuestions}); 
  }

},

getAllOrdersAdmin: async function(req,res){

  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let sort = {created_at : -1};
  let query = {};

  const currentDate = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(currentDate.getDate() - 7);

  const startDate = req.body.startDate ? new Date(req.body.startDate) : oneWeekAgo;
  const endDate = req.body.endDate ? new Date(req.body.endDate) : new Date(currentDate.setHours(23, 59, 59, 999));
  // const endDate = req.body.endDate ? new Date(req.body.endDate) : currentDate;

  if(req.body.search){
      query.code = {$regex: req.body.search, $options: 'i'}
  }
  if(req.body.payment_type){
    query.payment_status = req.body.payment_type;
  }

  if(!req.body.search){
    query.created_at = { $gte: startDate, $lte: endDate }
  }

  let orderIdsWithDeliveryStatus = [];
if (req.body.delivery_type) {
    const orderDetailsWithStatus = await OrderDetail.find({ 
      delivery_status: req.body.delivery_type 
    }).select('order_id').lean();
    orderIdsWithDeliveryStatus = [...new Set(orderDetailsWithStatus.map(od => od.order_id))];
}

// console.log(orderIdsWithDeliveryStatus,'--');


// Only include orders with matching delivery status if specified
if (orderIdsWithDeliveryStatus.length > 0) {
    query.ord_id = { $in: orderIdsWithDeliveryStatus };
}

  // if(req.body.delivery_type){
  //   query.delivery_type = req.body.delivery_type;
  // }
  
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalOrders = await Order.find(query).countDocuments();

  if(totalOrders>0){
    const orders = await Order.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);

          // Fetch order details, product details, and user details
          const ordersWithDetails = await Promise.all(orders.map(async order => {
            // Fetch order details by order ID
            const orderDetails = await OrderDetail.find({ order_id: order.ord_id });
            
            // Fetch product details for each order detail
            const productDetails = await Promise.all(orderDetails.map(async detail => {
              const product = await Product.findOne({prd_id:detail.product_id});
              return { ...detail.toObject(), product };
            }));
            
            // Calculate the sum of price + tax
            const totalAmount = productDetails.reduce((sum, detail) => sum + (detail.price), 0);
            
            // Fetch user details
            const user = await User.findOne({usr_id : order.user_id});
            
            return {
              ...order.toObject(),
              orderDetails: productDetails,
              totalAmount,
              user,
              shipAdd: JSON.parse(order.shipping_address)
            };
          }));



      res.status(200).json({success:true,data:ordersWithDetails,total:totalOrders});
  }else{
      res.status(200).json({success:true,data:[],total:totalOrders}); 
  }

},
getAllUnshippedOrdersAdmin: async function(req,res){

  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let sort = {created_at : -1};
  let query = {};
  query.shipping_status = 'Unshipped';

  const currentDate = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(currentDate.getDate() - 7);

  const startDate = req.body.startDate ? new Date(req.body.startDate) : oneWeekAgo;
  const endDate = req.body.endDate ? new Date(req.body.endDate) : new Date(currentDate.setHours(23, 59, 59, 999));
  // const endDate = req.body.endDate ? new Date(req.body.endDate) : currentDate;

  if(req.body.search){
      query.code = {$regex: req.body.search, $options: 'i'}
  }
  if(req.body.payment_type){
    query.payment_status = req.body.payment_type;
  }

  if(!req.body.search){
    query.created_at = { $gte: startDate, $lte: endDate }
  }

  let orderIdsWithDeliveryStatus = [];
if (req.body.delivery_type) {
    const orderDetailsWithStatus = await OrderDetail.find({ 
      delivery_status: req.body.delivery_type 
    }).select('order_id').lean();
    orderIdsWithDeliveryStatus = [...new Set(orderDetailsWithStatus.map(od => od.order_id))];
}

// console.log(orderIdsWithDeliveryStatus,'--');


// Only include orders with matching delivery status if specified
if (orderIdsWithDeliveryStatus.length > 0) {
    query.ord_id = { $in: orderIdsWithDeliveryStatus };
}

  // if(req.body.delivery_type){
  //   query.delivery_type = req.body.delivery_type;
  // }
  
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalOrders = await Order.find(query).countDocuments();

  if(totalOrders>0){
    const orders = await Order.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);

          // Fetch order details, product details, and user details
          const ordersWithDetails = await Promise.all(orders.map(async order => {
            // Fetch order details by order ID
            const orderDetails = await OrderDetail.find({ order_id: order.ord_id });
            
            // Fetch product details for each order detail
            const productDetails = await Promise.all(orderDetails.map(async detail => {
              const product = await Product.findOne({prd_id:detail.product_id});
              return { ...detail.toObject(), product };
            }));
            
            // Calculate the sum of price + tax
            const totalAmount = productDetails.reduce((sum, detail) => sum + (detail.price), 0);
            
            // Fetch user details
            const user = await User.findOne({usr_id : order.user_id});
            
            return {
              ...order.toObject(),
              orderDetails: productDetails,
              totalAmount,
              user,
              shipAdd: JSON.parse(order.shipping_address)
            };
          }));



      res.status(200).json({success:true,data:ordersWithDetails,total:totalOrders});
  }else{
      res.status(200).json({success:true,data:[],total:totalOrders}); 
  }

},

getAllPickupPointOrdersAdmin:async function(req, res){
  try {
    let size = req.body.size || 10;
    let pageNo = req.body.pageNo || 1; 
    let sort = {code : -1};
    let orders;
    let totalOrders;
    let ordersWithDetails;
    let pagination={};
    pagination.skip = Number(size * (pageNo - 1));
    pagination.limit = Number(size) || 0;
    const user = req.userId; // Assuming authenticated user data is available on the request

    // user.user_type === 'staff' && user.staff.pick_up_point
    if (user) {
      // Fetch orders for a specific pickup point
      const pickupPointId = user.staff.pick_up_point.id;

      // Get distinct order IDs for the specific pickup point
      const orderIds = await OrderDetail.find({ pickup_point_id: pickupPointId })
      .distinct('order_id');
      
      totalOrders = orderIds.length;
      // Fetch orders by order IDs
      orders = await Order.find({ _id: { $in: orderIds } })
        .sort(sort) // Sort by code in descending order
        .skip(pagination.skip)
        .limit(pagination.limit); // Adjust pagination limit as needed

        ordersWithDetails = await Promise.all(orders.map(async order => {
          // Fetch order details by order ID
          const orderDetails = await OrderDetail.find({ order_id: order.ord_id });
          
          // Fetch product details for each order detail
          const productDetails = await Promise.all(orderDetails.map(async detail => {
            const product = await Product.findOne({prd_id:detail.product_id});
            return { ...detail.toObject(), product };
          }));
          
          // Calculate the sum of price + tax
          const totalAmount = productDetails.reduce((sum, detail) => sum + (detail.price + detail.tax), 0);
          
          // Fetch user details
          const user = await User.findOne({usr_id : order.user_id});
          
          return {
            ...order.toObject(),
            orderDetails: productDetails,
            totalAmount,
            user
          };
        }));

    } else {
      // Fetch orders where shipping type is "Pick-up Point"
      const orderIds = await OrderDetail.find({ shipping_type: 'pickup_point' })
        .distinct('order_id');

      totalOrders = orderIds.length;

      // Fetch orders by order IDs
      orders = await Order.find({ ord_id: { $in: orderIds } })
        .sort({ code: -1 }) // Sort by code in descending order
        .skip(pagination.skip)
        .limit(pagination.limit); // Adjust pagination limit as needed

        ordersWithDetails = await Promise.all(orders.map(async order => {
          // Fetch order details by order ID
          const orderDetails = await OrderDetail.find({ order_id: order.ord_id });
          
          // Fetch product details for each order detail
          const productDetails = await Promise.all(orderDetails.map(async detail => {
            const product = await Product.findOne({prd_id:detail.product_id});
            return { ...detail.toObject(), product };
          }));
          
          // Calculate the sum of price + tax
          const totalAmount = productDetails.reduce((sum, detail) => sum + (detail.price + detail.tax), 0);
          
          // Fetch user details
          const user = await User.findOne({usr_id : order.user_id});
          
          return {
            ...order.toObject(),
            orderDetails: productDetails,
            totalAmount,
            user
          };
        }));

    }  

    if(totalOrders > 0){
      res.status(200).json({success:true,data:ordersWithDetails,total:totalOrders});
    }
    else{
      res.status(200).json({success:true,data:[],total:0});

    }
  } catch (error) {
    // console.error(error);
    res.status(500).send('An error occurred while fetching orders.');
  }
},
getAllSalesOrderAdmin:async function(req, res) {
  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let sort = {created_at : -1};
  let query = {};

  if(req.body.search){
      query.code = {$regex: req.body.search, $options: 'i'}
  }
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalOrders = await Order.find(query).countDocuments();

  if(totalOrders>0){
    const orders = await Order.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);

          // Fetch order details, product details, and user details
          const ordersWithDetails = await Promise.all(orders.map(async order => {
            // Fetch order details by order ID
            const orderDetails = await OrderDetail.find({ order_id: order.ord_id });

            let status;
            
            // Fetch product details for each order detail
            const productDetails = await Promise.all(orderDetails.map(async detail => {

              if(detail.delivery_status !='delivered'){
                status = 'Pending';
              }
              else{
                status = 'Delivered';
              }
              const product = await Product.findOne({prd_id:detail.product_id});
              return { ...detail.toObject(), product };
            }));
            
            // Calculate the sum of price + tax
            const totalAmount = productDetails.reduce((sum, detail) => sum + (detail.price + detail.tax), 0);
            const totalShipping = productDetails.reduce((sum, detail) => sum + (detail.shipping_cost), 0);
            
            // Fetch user details
            const user = await User.findOne({usr_id : order.user_id});
            
            return {
              ...order.toObject(),
              orderDetails: productDetails,
              totalAmount,
              totalShipping,
              user,
              status
            };
          }));



      res.status(200).json({success:true,data:ordersWithDetails,total:totalOrders});
  }else{
      res.status(200).json({success:true,data:[],total:totalOrders}); 
  }
},
getAllReqCallBackAdmin:async function(req, res){
  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let sort = {rc_id : -1};
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalCallBack = await RequestCallBack.find().countDocuments();

  if(totalCallBack>0){
    const request = await RequestCallBack.find().sort(sort).skip(pagination.skip).limit(pagination.limit);

          // Fetch order details, product details, and user details
          const rqCallback = await Promise.all(request.map(async req => {
            // Fetch order details by order ID

            const product = await Product.findOne({prd_id:req.product_id});
            
            return {
              ...req.toObject(),
              product
            };
          }));



      res.status(200).json({success:true,data:rqCallback,total:totalCallBack});
  }else{
      res.status(200).json({success:true,data:[],total:totalCallBack}); 
  }
},
getAllSellersAdmin:async function(req, res){
  try {
    let sellersQuery = Seller.find().sort({ created_at: -1 }); 
    let filter = {}
    // Search Filter
    if (req.body.search) {
      // Fetch user IDs matching the search criteria
      const userIds = await User.find({
        user_type: 'seller',
        $or: [
          { name: { $regex: req.body.search, $options: 'i' } }, // Case-insensitive search
          { email: { $regex: req.body.search, $options: 'i' } }
        ]
      }).distinct('usr_id'); // Retrieves an array of unique user IDs

      // Filter sellers by matching user IDs
      sellersQuery = sellersQuery.where({ user_id: { $in: userIds } });
      filter.user_id = { $in: userIds };
    }

    // Approved Status Filter
    if (req.body.status) {
      // Filter by verification status
      sellersQuery = sellersQuery.where({ verification_status: req.body.status });
      filter.verification_status = req.body.status;
    }

    let totalSeller = await Seller.countDocuments(filter);

    // Pagination
    const page = parseInt(req.body.pageNo) || 1; // Get the current page or default to 1
    const limit = req.body.size; // Limit the number of sellers per page

    // Execute query with pagination
    const sellers = await sellersQuery.skip((page - 1) * limit).limit(limit).exec();

    const sellersWithUserData = await Promise.all(sellers.map(async (seller) => {
      const user = await User.findOne({usr_id:seller.user_id}).exec(); // Fetch the user data for each seller

      const productCount = await Product.countDocuments({ user_id: seller.user_id });

      return {
        ...seller.toObject(), // Convert seller document to plain object
        user: user ? user.toObject() : null, // Attach user data or null if not found
        productCount: productCount
      };
    }));

     
    if(totalSeller > 0 ){
      res.status(200).json({success:true,data:sellersWithUserData,total:totalSeller});
    }
    else{
      res.status(200).json({success:true,data:[],total:totalSeller});
    }
    
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
},
getAllCustomersAdmin:async function(req, res) {
  try{

    let size = req.body.size || 10;
    let pageNo = req.body.pageNo || 1; 
    let sort = {created_at : -1};
    let query = {};
  
    if(req.body.search){
        query.$or = [ 
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
    }
    let pagination={};
    pagination.skip = Number(size * (pageNo - 1));
    pagination.limit = Number(size) || 0;
    const totalCust = await User.find(query).countDocuments();
  
    if(totalCust > 0){
      const user = await User.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit);
        res.status(200).json({success:true,data:user,total:totalCust});
    }else{
        res.status(200).json({success:true,data:[],total:totalCust}); 
    }
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},

getAllConversationAdmin:async function(req, res) {
  try{

    const conversationSetting = await BusinessSetting.findOne({ type: 'conversation_system' });
    if (conversationSetting && conversationSetting.value == 1){

      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      let sort = {created_at : -1};
      let pagination={};
      pagination.skip = Number(size * (pageNo - 1));
      pagination.limit = Number(size) || 0;
      const totalConv = await Conversation.countDocuments();
    
      if(totalConv > 0){
        const conv = await Conversation.find().sort(sort).skip(pagination.skip).limit(pagination.limit);

        const convWithDetails = await Promise.all(
          conv.map(async (conversation) => {
            const sender = await User.findOne({usr_id:conversation.sender_id}).select('name email') // Adjust fields as needed
            const receiver = await User.findOne({usr_id:conversation.receiver_id}).select('name email')// Adjust fields as needed

            return {
              ...conversation.toObject(),
              sender,
              receiver
            };
          })
        );

          res.status(200).json({success:true,data:convWithDetails,total:totalConv});
      }else{
          res.status(200).json({success:true,data:[],total:totalConv}); 
      }
    }
    else{
      res.status(200).send('Conversation is disabled at this moment');
    }

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
getAllBlogsAdmin:async function(req, res) {
  try{
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      let sort = {created_at : -1};
      let pagination={};
      pagination.skip = Number(size * (pageNo - 1));
      pagination.limit = Number(size) || 0;
      const totalBlogs = await Blog.countDocuments();
    
      if(totalBlogs > 0){
        const blog = await Blog.find().sort(sort).skip(pagination.skip).limit(pagination.limit);

          res.status(200).json({success:true,data:blog,total:totalBlogs});
      }else{
          res.status(200).json({success:true,data:[],total:totalBlogs}); 
      }

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
getAllCmsCategoryAdmin:async function(req, res) {
  try{
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      let sort = {created_at : -1};
      let pagination={};
      pagination.skip = Number(size * (pageNo - 1));
      pagination.limit = Number(size) || 0;
      const totalCat = await CMS.countDocuments({blog_type:1});
    
      if(totalCat > 0){
        const cms = await CMS.find({blog_type : 1}).sort(sort).skip(pagination.skip).limit(pagination.limit);

        const cmswithcat = await Promise.all(
          cms.map(async (cat) => {

            const category = await Category.findOne({category_id: cat.category}).select('name');

            return {
              ...cat.toObject(),
              category   
            };
          })
        );

          res.status(200).json({success:true,data:cmswithcat,total:totalCat});
      }else{
          res.status(200).json({success:true,data:[],total:totalCat}); 
      }

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
getAllCmsSubCategoryAdmin:async function(req, res) {
  try{
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      let sort = {created_at : -1};
      let pagination={};
      pagination.skip = Number(size * (pageNo - 1));
      pagination.limit = Number(size) || 0;
      const totalsubcat = await CMS.countDocuments({blog_type:2});
    
      if(totalsubcat > 0){
        const cms = await CMS.find({blog_type : 2}).sort(sort).skip(pagination.skip).limit(pagination.limit);

        const cmswithsubcat = await Promise.all(
          cms.map(async (cat) => {

            const category = await Category.findOne({category_id: cat.category}).select('name');
            const subcategory = await SubCategory.findOne({sub_cat_id: Number(cat.sub_category)}).select('name');

            return {
              ...cat.toObject(),
              category,
              subcategory  
            };
          })
        );

          res.status(200).json({success:true,data:cmswithsubcat,total:totalsubcat});
      }else{
          res.status(200).json({success:true,data:[],total:totalsubcat}); 
      }

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
getAllCmsSubSubCategoryAdmin:async function(req, res) {
  try{
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      let sort = {created_at : -1};
      let pagination={};
      pagination.skip = Number(size * (pageNo - 1));
      pagination.limit = Number(size) || 0;
      const totalsubsubcat = await CMS.countDocuments({blog_type:3});
    
      if(totalsubsubcat > 0){
        const cms = await CMS.find({blog_type : 3}).sort(sort).skip(pagination.skip).limit(pagination.limit);

        const cmswithsubsubcat = await Promise.all(
          cms.map(async (cat) => {

            const category = await Category.findOne({category_id: cat.category}).select('name');
            const subcategory = await SubCategory.findOne({sub_cat_id: cat.sub_category}).select('name');
            const subsubcategory = await SubSubCategory.findOne({sub_sub_cat_id: cat.sub_sub_category}).select('name');


            return {
              ...cat.toObject(),
              category ,
              subcategory,
              subsubcategory  
            };
          })
        );

          res.status(200).json({success:true,data:cmswithsubsubcat,total:totalsubsubcat});
      }else{
          res.status(200).json({success:true,data:[],total:totalsubsubcat}); 
      }

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},

createProduct:async function(req, res) {
  try{

    const lastPrd = await Product.findOne({}).sort({prd_id:-1});
    
    let  { name, added_by, category_id, subcategory_id, subsubcategory_id, brand_id, current_stock, sku, unit, min_qty, tags, description, video_provider, video_link, unit_price, purchase_price, tax, tax_type, discount, discount_type, shipping_type, shipping_cost, meta_title, meta_description, meta_img,pdf,photos } = req.body;

    // SKU validation
    if(!req.body.prd_id){
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
          return res.status(200).json({ success:false,msg: 'SKU must be unique' });
      }
    }
    else{
      // console.log(req.body.slug);
      const existingSlug = await Product.countDocuments({ slug: req.body.slug });
      // console.log(existingSlug);
      if(existingSlug > 1){
        return res.status(200).json({ success:false,msg: 'Slug must be unique' });
      }
    }

    // return
    // Find refund addon
    // const refundRequestAddon = await Addon.findOne({ unique_identifier: 'refund_request' });


    if(discount > 0 ){
       purchase_price = Number(unit_price) - Number(discount);
    }
    else{
      purchase_price = Number(unit_price);
    }

    const product = new Product({
        prd_id: lastPrd ? (lastPrd.prd_id + 1) : 1,
        name,
        added_by,
        // user_id: req.user.user_type === 'seller' ? req.user._id : await User.findOne({ user_type: 'admin' }).usr_id,
        user_id: await User.findOne({ user_type: 'admin' }).usr_id || 9,
        category_id,
        subcategory_id,
        subsubcategory_id,
        brand_id,
        current_stock,
        sku,
        // refundable: (refundRequestAddon && refundRequestAddon.activated === 1 && refundable) ? 1 : 0,
        unit,
        min_qty,
        tags: tags,
        description,
        video_provider,
        video_link,
        unit_price,
        purchase_price,
        tax,
        tax_type,
        discount,
        discount_type,
        shipping_type,
        shipping_cost: shipping_type === 'free' ? 0 : shipping_type === 'flat_rate' ? shipping_cost : 0,
        meta_title: meta_title || name,
        meta_description: meta_description || description,
        pdf,
        meta_img,
        photos,
        published:1,
        digital:0,
        todays_deal:0,
        num_of_sale:0,
        rating:0,
        barcode:null,

    });

    // Handling file uploads
    // if (req.files['photos']) {
    //     product.photos = req.files['photos'].map(file => file.path);
    // }

    // if (req.files['thumbnail_img']) {
    //     product.thumbnail_img = req.files['thumbnail_img'][0].path;
    // }

    // product.meta_img = req.files['meta_img'] ? req.files['meta_img'][0].path : product.thumbnail_img;

    // if (req.files['pdf']) {
    //     product.pdf = req.files['pdf'][0].path;
    // }

    // Generate slug
    // if(!req.body.prd_id){
    //   product.slug = name.replace(/[^A-Za-z0-9\-]/g, '').replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 5);
    // }
    // else{
    //   product.slug = req.body.slug;
    // }
    if (!req.body.prd_id) {
      const name = product.name; // Ensure `name` exists
      product.slug = name
        .toLowerCase()                            // Convert to lowercase for consistency
        .replace(/[^A-Za-z0-9\s]/g, '')           // Remove special characters except spaces
        .replace(/\s+/g, '-')                     // Replace spaces with hyphens
        .slice(0, 50)                             // Optional: Limit length for readability
        + '-' + Math.random().toString(36).substr(2, 5); // Add random string to ensure uniqueness
    } else {
      product.slug = req.body.slug;
    }

    // Colors and attributes
    // product.colors = colors ? JSON.stringify(colors) : JSON.stringify([]);
    // product.attributes = choice_no ? JSON.stringify(choice_no) : JSON.stringify([]);

    // let choice_options = [];
    // if (choice_no) {
    //     choice_no.forEach(no => {
    //         let str = `choice_options_${no}`;
    //         let item = {
    //             attribute_id: no,
    //             values: req.body[str].split(',').join('|').split(',')
    //         };
    //         choice_options.push(item);
    //     });
    // }
    // product.choice_options = JSON.stringify(choice_options);

    // Save product
    // console.log(product);
    // return
    if(!req.body.prd_id){
      await product.save();
      res.status(200).json({success:true,msg:'Product has been inserted successfully'});
    }
    else{
      await Product.findOneAndUpdate({prd_id:req.body.prd_id},req.body);
      res.status(200).json({success:true,msg:'Product has been Updated successfully'});

    }


  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
getProductById:async function(req,res){

  try{
    const detailedProduct = await Product.findOne({ prd_id: req.params.id });

    // if (!detailedProduct || !detailedProduct.published) {
    //     return res.status(404).send('Product not found or not published');
    // }

  res.status(200).json({ success: true, data: detailedProduct });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
getProductRatings:async function(req,res){

  try{
    const query = {
      product_id: req.params.id,
      status: '1'
  };
  
  const reviews = await Reviews.find(query);

  // Initialize variables
  let reviewTotal = 0;
  let starSum = 0;
  const starCounts = {
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0
  };

  // Step 2: Iterate through reviews and calculate totals
  reviews.forEach(review => {
      const rating = review.rating??0; // Assuming 'rating' exists in each document
      reviewTotal++;
      starSum += rating;
      if (starCounts[rating] !== undefined) {
          starCounts[rating]++;
      }
  });
console.log(reviewTotal, starSum);
  // Step 3: Calculate average star rating
  const avgStar = reviewTotal > 0 ? (starSum / reviewTotal).toFixed(1) : 0;

  // Step 4: Prepare the JSON response
  const response = {
      reviewTotal,
      ratingTotal: starSum, 
      avgStar,
      starCounts
  };

  res.status(200).json({ success: true, data: response });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
getProductQuestionById:async function(req,res){

  try{
    const detailQuestion = await Questions.findOne({ question_id: req.params.id });

    const product = await Product.findOne({prd_id: detailQuestion.product_id},'name slug');

    const user = await User.findOne({usr_id:detailQuestion.user_id},'name email');

    if (!detailQuestion) {
        return res.status(404).send('Product Question not found.');
    }

  res.status(200).json({ success: true, data: detailQuestion,product,user });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
deleteProductById:async function (req, res){
  try{
    const prd = await Product.findOneAndDelete({prd_id:req.params.id});
    res.status(200).json({ success: true,msg:'Product has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
getSliderById:async function(req,res){

  try{
    const detailSlider = await Slider.findOne({ slider_id: req.params.id });

  res.status(200).json({ success: true, data: detailSlider });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
deleteSliderById:async function (req, res){
  try{
    const prd = await Slider.findOneAndDelete({slider_id:req.params.id});
    res.status(200).json({ success: true,msg:'Slider has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
deleteHomeCatById:async function (req, res){
  try{
    const prd = await HomeCategory.findOneAndDelete({homecat_id:req.params.id});
    res.status(200).json({ success: true,msg:'Home Category has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
getBannerById:async function(req,res){

  try{
    const detailBanner = await Banner.findOne({ banner_id: req.params.id });

  res.status(200).json({ success: true, data: detailBanner });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
deleteBannerById:async function (req, res){
  try{
    const prd = await Banner.findOneAndDelete({banner_id:req.params.id});
    res.status(200).json({ success: true,msg:'Banner has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
deleteProductQuestionById:async function (req, res){
  try{
    const prd = await Questions.findOneAndDelete({question_id:req.params.id});
    res.status(200).json({ success: true,msg:'Product has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
updateProductKeys:async function (req, res){
  try{
    const prd = await Product.findOneAndUpdate({prd_id:req.body.prd_id},req.body);
    res.status(200).json({ success: true,msg:'Product has been updated..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
updateSliderKeys:async function (req, res){
  try{
    const prd = await Slider.findOneAndUpdate({slider_id:req.body.slider_id},req.body);
    res.status(200).json({ success: true,msg:'Slider has been updated..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
updateHomeCatKeys:async function (req, res){
  try{
    const prd = await HomeCategory.findOneAndUpdate({homecat_id:req.body.homecat_id},req.body);
    res.status(200).json({ success: true,msg:'Home Category has been updated..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
updateBannerKeys:async function (req, res){
  try{
    const prd = await Banner.findOneAndUpdate({banner_id:req.body.banner_id},req.body);
    res.status(200).json({ success: true,msg:'Banner has been updated..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
updateProductReviewKeys:async function (req, res){
  try{
    const prd = await Reviews.findOneAndUpdate({review_id:req.body.prd_id},req.body);
    res.status(200).json({ success: true,msg:'Product Reviews has been updated..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
updateProductQuestionKeys:async function (req, res){
  try{
    const prd = await Questions.findOneAndUpdate({question_id:req.body.prd_id},req.body);
    res.status(200).json({ success: true,msg:'Product Question has been updated..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
updateOrderKeys:async function (req, res){
  try{
    const ord = await Order.findOneAndUpdate({ord_id:req.body.ord_id},req.body);
    res.status(200).json({ success: true,msg:'Order has been updated..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
createBrands:async function(req,res){

  const lastBrand = await Brand.findOne({}).sort({brand_id:-1});

  const {brand_id, name, meta_title, meta_description, slug,logo } = req.body;

  let brandSlug;
  if (slug) {
      brandSlug = slug.replace(/\s+/g, '-');
  } else {
      brandSlug = name.replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-]/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  }

  const brand = new Brand({
      brand_id:lastBrand? (lastBrand.brand_id + 1) : 1,
      name,
      meta_title,
      meta_description,
      slug: brandSlug,
      logo: logo,
      top:0
  });

  try {
 
     if(brand_id){
      await Brand.findOneAndUpdate({brand_id:brand_id},req.body);
      res.status(200).send({ success:true, message: 'Brand has been updated successfully' });
     }
     else{
       await brand.save();
       res.status(200).send({ success:true, message: 'Brand has been inserted successfully' });
     }

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
getBrandById:async function(req,res){

  try{
    const detailBrand = await Brand.findOne({ brand_id: req.params.id });

  res.status(200).json({ success: true, data: detailBrand });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
deleteBrandById:async function (req, res){
  try{
    const prd = await Brand.findOneAndDelete({brand_id:req.params.id});
    res.status(200).json({ success: true,msg:'Brand has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
deleteStaffById:async function (req, res){
  try{
    const prd = await Staff.findOneAndDelete({staff_id:req.params.id});
    res.status(200).json({ success: true,msg:'Staff has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
createRole:async function(req,res){

  const lastRole = await Role.findOne({}).sort({role_id:-1});

  const {role_id, name, permissions } = req.body;

  const role = new Role({
      role_id:lastRole? (lastRole.role_id + 1) : 1,
      name,
      permissions
  });

  try {
 
     if(role_id){
      await Role.findOneAndUpdate({role_id:role_id},req.body);
      res.status(200).send({ success:true, message: 'Role has been updated successfully' });
     }
     else{
       await role.save();
       res.status(200).send({ success:true, message: 'Role has been inserted successfully' });
     }

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
deleteRoleById:async function (req, res){
  try{
    const prd = await Role.findOneAndDelete({role_id:req.params.id});
    res.status(200).json({ success: true,msg:'Role has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
deleteOrderById:async function (req, res){
  try{
    const prd = await Order.findOneAndDelete({ord_id:req.params.id});

    const orrdd = await OrderDetail.deleteMany({order_id:req.params.id});
    res.status(200).json({ success: true,msg:'Order has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
deleteUserById:async function (req, res){
  try{
    const prd = await User.findOneAndDelete({usr_id:req.params.id});

    res.status(200).json({ success: true,msg:'User has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
deleteConvById:async function (req, res){
  try{
    const prd = await Conversation.findOneAndDelete({conv_id:req.params.id});

    res.status(200).json({ success: true,msg:'Conversation has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
createCoupon:async function(req,res){

  const lastCoupon = await Coupon.findOne({}).sort({coupon_id:-1});

  const {coupon_id, code, discount, type, status, valid_from, valid_to } = req.body;

  const coupon = new Coupon({
      coupon_id:lastCoupon? (lastCoupon.coupon_id + 1) : 1,
      code,
      discount,
      type,
      status,
      valid_from,
      valid_to
  });

  try {
 
     if(coupon_id){
      await Coupon.findOneAndUpdate({coupon_id:coupon_id},req.body);
      res.status(200).send({ success:true, message: 'Coupon has been updated successfully' });
     }
     else{
       await coupon.save();
       res.status(200).send({ success:true, message: 'Coupon has been inserted successfully' });
     }

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
getAllCouponsAdmin:async function(req, res) {
  try{
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      let sort = {created_at : -1};
      let pagination={};
      pagination.skip = Number(size * (pageNo - 1));
      pagination.limit = Number(size) || 0;
      const totalCoupons = await Coupon.countDocuments();
    
      if(totalCoupons > 0){
        const coupon = await Coupon.find().sort(sort).skip(pagination.skip).limit(pagination.limit);

          res.status(200).json({success:true,data:coupon,total:totalCoupons});
      }else{
          res.status(200).json({success:true,data:[],total:totalCoupons}); 
      }

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
getCouponById:async function(req,res){
  try{
    const coupon = await Coupon.findOne({ coupon_id: req.params.id });

     res.status(200).json({ success: true, data:coupon});
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
createCategory:async function(req,res){
  const {category_id,name,slug,commision_rate,banner,icon,digital,meta_title,meta_description} = req.body;

  const lastCat = await Category.findOne({}).sort({category_id:-1});

  let catSlug;
  if (slug) {
      catSlug = slug.replace(/\s+/g, '-');
  } else {
      catSlug = name.replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-]/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  }

  const cat = new Category({
     category_id: lastCat ? (lastCat.category_id + 1) : 1,
      name,
      meta_title,
      meta_description,
      slug: catSlug,
      banner,
      icon,
      digital,
      commision_rate,
      featured:1,
      top:1
  });

  try {
 
     if(category_id){
      await Category.findOneAndUpdate({category_id:category_id},req.body);
      res.status(200).send({ success:true, message: 'Category has been updated successfully' });
     }
     else{
       await cat.save();
       res.status(200).send({ success:true, message: 'Category has been inserted successfully' });
     }

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
createMessage:async function(req,res){

  const lastMessage = await Message.findOne({}).sort({message_id:-1});

  const {conversation_id, sender_id, user_id,message, sender_viewed, receiver_viewed} = req.body;

  const msg = new Message({
      message_id:lastMessage? (lastMessage.message_id + 1) : 1,
      conversation_id,
      sender_id,
      user_id,
      message,
      sender_viewed,
      receiver_viewed,
  });

  try {
       await msg.save();
       res.status(200).send({ success:true, message: 'Message has been inserted successfully' });

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
getConvById:async function(req,res){

  try{
    const conv = await Conversation.findOne({ conv_id: req.params.id });

    const sender = await User.findOne({usr_id:conv.sender_id}).select('name');
    const receiver = await User.findOne({usr_id:conv.receiver_id}).select('name');
    const messages = await Message.find({conversation_id:conv.conv_id});

    const messageWithUser = await Promise.all(
      messages.map(async (mess) => {
          const user = await User.findOne({usr_id:mess.user_id}).select('name avatar_original');
          return {
              ...mess.toObject(),
              user
          };
      })
  );

     res.status(200).json({ success: true, data: conv,sender,receiver,messages:messageWithUser});
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
getUserById:async function(req,res){

  try{
     const user = await User.findOne({ usr_id: req.userId }).select('name email password');
     res.status(200).json({ success: true, data: user});
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
updateUserById:async function(req,res){

  try{

    let val={};
    const salt = await bcrypt.genSalt(10); 
    if(req.body.newPass){
      val = {
        name:req.body.name,
        email:req.body.email,
        password:await bcrypt.hash(req.body.newPass, salt)
      }
    }
    else{
      val = {
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
      }
    }
     const user = await User.findOneAndUpdate({ usr_id: req.userId },val);
     res.status(200).json({ success: true,msg:'Update Success'});
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
getPolicyByNameAdmin:async function(req,res){

  try{
    const data = await Policy.findOne({ name: req.params.id });

     res.status(200).json({ success: true, data });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
getCategoryById:async function(req,res){

  try{
    const detailCat = await Category.findOne({ category_id: req.params.id });

     res.status(200).json({ success: true, data: detailCat });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
createBlogs:async function(req,res){

  const lastBlog = await Blog.findOne({}).sort({blog_id:-1});

  const {blog_id, blog_title, meta_title,meta_keyword, meta_description, blog_slug,blog_image,blog_description } = req.body;

  let blogSlug;
  if (blog_slug) {
      blogSlug = blog_slug.replace(/\s+/g, '-');
  } else {
      blogSlug = blog_title.replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-]/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  }

  const blog = new Blog({
      blog_id:lastBlog? (lastBlog.blog_id + 1) : 1,
      blog_title,
      blog_description,
      blog_image,
      meta_title,
      meta_keyword,
      meta_description,
      blog_slug: blogSlug,
  });

  try {
 
     if(blog_id){
      await Blog.findOneAndUpdate({blog_id:blog_id},req.body);
      res.status(200).send({ success:true, message: 'Blog has been updated successfully' });
     }
     else{
       await blog.save();
       res.status(200).send({ success:true, message: 'Blog has been inserted successfully' });
     }

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
getBlogById:async function(req,res){

  try{
    const blog = await Blog.findOne({ blog_id: req.params.id });

     res.status(200).json({ success: true, data: blog });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
deleteCategoryById:async function (req, res){
  try{
    const prd = await Category.findOneAndDelete({category_id:req.params.id});
    res.status(200).json({ success: true,msg:'Category has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
deleteBlogById:async function (req, res){
  try{
    const prd = await Blog.findOneAndDelete({blog_id:req.params.id});
    res.status(200).json({ success: true,msg:'Blog has been deleted..' });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
updateFeaturedById:async function (req, res){
  try{
    const cat = await Category.findOneAndUpdate({category_id:req.body.category_id},{featured:req.body.featured});
    res.status(200).json({ success: true,msg:'Category has been updated..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
createSubCategory:async function(req,res){
  const {sub_cat_id,category_id,name,slug,meta_title,meta_description} = req.body;

  const lastsubCat = await SubCategory.findOne({}).sort({sub_cat_id:-1});

  let catSlug;
  if (slug) {
      catSlug = slug.replace(/\s+/g, '-');
  } else {
      catSlug = name.replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-]/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  }

  const subcat = new SubCategory({
      sub_cat_id: lastsubCat ? (lastsubCat.sub_cat_id + 1) : 1,
      category_id,
      name,
      meta_title,
      meta_description,
      slug: catSlug,
  });

  try {
 
     if(sub_cat_id){
      await SubCategory.findOneAndUpdate({sub_cat_id:sub_cat_id},req.body);
      res.status(200).send({ success:true, message: 'SubCategory has been updated successfully' });
     }
     else{
       await subcat.save();
       res.status(200).send({ success:true, message: 'SubCategory has been inserted successfully' });
     }

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
getSubCategoryById:async function(req,res){

  try{
    const detailSubCat = await SubCategory.findOne({ sub_cat_id: req.params.id });

  res.status(200).json({ success: true, data: detailSubCat });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
deleteSubCategoryById:async function (req, res){
  try{
    const prd = await SubCategory.findOneAndDelete({sub_cat_id:req.params.id});
    res.status(200).json({ success: true,msg:'SubCategory has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
createSubSubCategory:async function(req,res){
  const {sub_sub_cat_id,sub_category_id,name,slug,meta_title,meta_description} = req.body;

  const lastsubCat = await SubSubCategory.findOne({}).sort({sub_sub_cat_id:-1});

  let catSlug;
  if (slug) {
      catSlug = slug.replace(/\s+/g, '-');
  } else {
      catSlug = name.replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-]/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  }

  const cat = new SubSubCategory({
    sub_sub_cat_id: lastsubCat ? (lastsubCat.sub_sub_cat_id + 1) : 1,
      sub_category_id,
      name,
      meta_title,
      meta_description,
      slug: catSlug,
  });

  try {
 
     if(sub_sub_cat_id){
      await SubSubCategory.findOneAndUpdate({sub_sub_cat_id:sub_sub_cat_id},req.body);
      res.status(200).send({ success:true, message: 'SubSubCategory has been updated successfully' });
     }
     else{
       await cat.save();
       res.status(200).send({success:true, message: 'SubSubCategory has been inserted successfully' });
     }

  } catch (err) {
      res.status(500).send({success:false, message: 'Something went wrong', error: err.message });
  }
},
getSubSubCategoryById:async function(req,res){

  try{
    const detailSubCat = await SubSubCategory.findOne({ sub_sub_cat_id: req.params.id });
  res.status(200).json({ success: true, data: detailSubCat });
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},
deleteSubSubCategoryById:async function (req, res){
  try{
    const prd = await SubSubCategory.findOneAndDelete({sub_sub_cat_id:req.params.id});
    res.status(200).json({ success: true,msg:'SubSubCategory has been deleted..' });

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
getOrderbyOrderCode:async(req,res)=>{

  try{

    const order = await Order.findOne({code:req.body.code}); 
    const userOrder = await User.findOne({usr_id:order.user_id});
    // console.log(userOrder);
    let parsedOrder = order.toObject(); 
    parsedOrder.paredAddress = JSON.parse(order.shipping_address);
    order.paredAddress = JSON.parse(order.shipping_address);
    const orderDetail = await OrderDetail.find({order_id:order.ord_id});

    const orderDetailWithProduct = await Promise.all(orderDetail.map(async (ordd) => {
      const product = await Product.find({prd_id: ordd.product_id});
      const shippiedByWithProduct = await Promise.all(product.map(async (prd)=>{
        // console.log(prd);
        const shipper = await User.findOne({usr_id:prd.user_id});
        // console.log(shipper);

        return {
          ...prd.toObject(),
          shipper_name : shipper.name,
          prd_photos : JSON.parse(prd.photos)
        }
      }));

      return {
         ...ordd.toObject(),
         products:shippiedByWithProduct

      }

    }));

    res.status(200).json({ success: true, data: {order:parsedOrder,orderDetail:orderDetailWithProduct,userDetail:{name:userOrder.name,phone:userOrder.phone}} });

  }
  catch(err){
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }

},
updateOrderPaymentStatus:async function(req, res){
  try{
    const upd = await Order.findOneAndUpdate({ord_id:req.body.idtoupdate},{payment_status:req.body.value});
    const updOrd = await OrderDetail.updateMany({order_id:req.body.idtoupdate},{ $set: { payment_status: req.body.value } });
    res.status(200).json({success:true,msg:'Order updated successfully'});
  }
  catch(err){
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }



},

updateOrderPaymentMode:async function(req, res){
  try{
    const upd = await Order.findOneAndUpdate({ord_id:req.body.idtoupdate},{p_mode:Number(req.body.value)});
    // const updOrd = await OrderDetail.updateMany({order_id:req.body.idtoupdate},{ $set: { payment_status: req.body.value } });
    res.status(200).json({success:true,msg:'Order updated successfully'});
  }
  catch(err){
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }

},
updateOrderDeliveryStatus:async function(req, res){
  try{
    // const upd = await Order.findOneAndUpdate({ord_id:req.body.idtoupdate},{delivery_status:req.body.value});
    const updOrd = await OrderDetail.updateMany({order_id:req.body.idtoupdate},{ $set: { delivery_status: req.body.value } });
    res.status(200).json({success:true,msg:'Order updated successfully'});
  }
  catch(err){
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }

},
createQuestion:async function(req,res){

  try {
      await Questions.findOneAndUpdate({question_id:req.body.question_id},req.body);
      res.status(200).send({ success:true, message: 'Product Question has been updated successfully' });

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
createPolicy:async function(req,res){

  try {
      await Policy.findOneAndUpdate({policy_id:req.body.policy_id},req.body);
      res.status(200).send({ success:true, message: 'Policy has been updated successfully' });

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
getAllStaffAdmin:async function(req, res){
  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let sort = {staff_id : -1};
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalStaff = await Staff.countDocuments();

  if(totalStaff>0){
    const staff = await Staff.find().sort(sort).skip(pagination.skip).limit(pagination.limit);

          // Fetch order details, product details, and user details
          const staffCallback = await Promise.all(staff.map(async req => {
            // Fetch order details by order ID
            const user = await User.findOne({usr_id:req.user_id});
            const role = await Role.findOne({role_id:req.role_id});
            return {
              ...req.toObject(),
              user,
              role
            };
      
          }));
      res.status(200).json({success:true,data:staffCallback,total:totalStaff});
  }else{
      res.status(200).json({success:true,data:[],total:totalStaff}); 
  }
},
getAllRoleAdmin:async function(req, res){
  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let sort = {role_id : -1};
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalRole = await Role.find().countDocuments();

  if(totalRole>0){
    const role = await Role.find().sort(sort).skip(pagination.skip).limit(pagination.limit);
      res.status(200).json({success:true,data:role,total:totalRole});
  }else{
      res.status(200).json({success:true,data:[],total:totalRole}); 
  }
},
getAllModelCallBackAdmin:async function(req, res){
  let size = req.body.size || 10;
  let pageNo = req.body.pageNo || 1; 
  let sort = {rc_id : -1};
  let pagination={};
  pagination.skip = Number(size * (pageNo - 1));
  pagination.limit = Number(size) || 0;
  const totalCallBack = await ModelCallback.find().countDocuments();

  if(totalCallBack>0){
    const request = await ModelCallback.find().sort(sort).skip(pagination.skip).limit(pagination.limit);

          // Fetch order details, product details, and user details
          const rqCallback = await Promise.all(request.map(async req => {
            // Fetch order details by order ID

            if(req.user_id){
              const user = await User.findOne({prd_id:req.product_id});
              return {
                ...req.toObject(),
                user
              };
            }
            return {
              ...req.toObject(),
            };
      
          }));
      res.status(200).json({success:true,data:rqCallback,total:totalCallBack});
  }else{
      res.status(200).json({success:true,data:[],total:totalCallBack}); 
  }
},
generateCustomerInvoice:async function (req, res){
  try{
     
   const order = await Order.findOne({code: req.body.code});
   const orderDetail = await OrderDetail.find({order_id:order.ord_id});
    let parsedOrder = order.toObject(); 

    let total = order.grand_total;

    parsedOrder.one = false;
      parsedOrder.two = false;
      parsedOrder.three =false;

    if(order.p_mode == 1){
      parsedOrder.one = true;
      parsedOrder.two = false;
      parsedOrder.three =false;
      total = Number(order.grand_total) - Number(order.full_with_discount);
    }
    else if(order.p_mode == 2){
      parsedOrder.one = false;
      parsedOrder.two = true;
      parsedOrder.three =false;
      total = Number(order.grand_total);
    }
    else if(order.p_mode == 3){
      parsedOrder.one = false;
      parsedOrder.two = false;
      parsedOrder.three = true;
      total = Number(order.grand_total) + Number(order.cod_charges);
    }

     if(order.cust_gst_num){
      parsedOrder.cust_gst_num = order.cust_gst_num
     }
     else{
      parsedOrder.cust_gst_num = 'NA';
     }
     if(order.full_with_discount){
      parsedOrder.full_with_discount = order.full_with_discount;
     }
     else{
      parsedOrder.full_with_discount = 0;
     }
    parsedOrder.shipping_address = JSON.parse(order.shipping_address);
    parsedOrder.invoice_subtotal = formatPrice(sumOfPrices(orderDetail,'price') - sumOfPrices(orderDetail,'tax'));
    parsedOrder.invoice_shippingcost = formatPrice(sumOfPrices(orderDetail,'shipping'));
    parsedOrder.invoice_fulldis = formatPrice(order.full_with_discount);
    parsedOrder.invoice_advp = formatPrice(order.advance_payment);
    parsedOrder.invoice_codc = formatPrice(order.cod_charges);
    parsedOrder.balance_invoice = formatPrice(Number(order.rest_payment) + sumOfPrices(orderDetail,'shipping'));
    parsedOrder.tax_invoice = formatPrice(sumOfPrices(orderDetail,'tax'));
    parsedOrder.invoice_total = formatPrice(total);
    // parsedOrder.invoice_date = moment(order.created_at).format('DD-MM-YYYY'); 
    parsedOrder.invoice_date = formatDateV2(order.created_at);

   const orderDetailWithProduct = await Promise.all(orderDetail.map(async (ordd) => {
    const product = await Product.find({prd_id: ordd.product_id});
    return {
       ...ordd.toObject(),
       product_name:product[0].name,
       inv_unit_price:formatPrice(Number(ordd.price)/Number(ordd.quantity) - Number(ordd.tax) ),
       inv_tax: formatPrice(Number(ordd.tax)/Number(ordd.quantity)),
       inv_total: formatPrice(Number(ordd.price))
    }

  }));

const genralSetting = await GenralSetting.findOne();

   const currentPath = __dirname; // get the current directory path
   const parentPath = path.resolve(currentPath, '..'); // get the parent directory path
  let filePath = `${parentPath}/public/invoice/customer_invoice.html`
   const source = fs.readFileSync(filePath, "utf-8").toString();
   const template = handlebars.compile(source);
   const replacements = {
    site_logo:genralSetting.logo,
    site_name:genralSetting.site_name,
    site_address:genralSetting.address,
    site_email:genralSetting.email,
    site_phone:genralSetting.phone,
    order:parsedOrder,
    orderDetails:orderDetailWithProduct,

   };

   const htmlToSend = template(replacements);
  //  console.log(parsedOrder);
  //  console.log(htmlToSend);
  //  return;
        // // Launch Puppeteer and generate the PDF
        // const browser = await puppeteer.launch();
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // // Set the HTML content in the Puppeteer page
        await page.setContent(htmlToSend);

        // // Generate the PDF from the HTML content
        // const pdfBuffer = await page.pdf({ format: 'A4' });

        // const page = await browser.newPage();
        // await page.goto(`${parentPath}/public/invoice/customer_invoice.html`);
        const pdfBuffer = await page.pdf({ format: 'A4',printBackground: true});

        const fileName = `order-${order.code}.pdf`;

        fs.writeFile(`${parentPath}/public/invoice/${fileName}`, pdfBuffer, async (err) => {
          if (err) {
            res.status(500).json({"success":false ,error:err})
          }
            res.status(200).json({"success":true,path:`${fileName}`});
        });

        await browser.close();
  }
  catch(err){
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
},

getAllRoles:async function(req, res){
  try {
    const roles = await Role.find({});
    res.status(200).json({ success: true, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
},

createSlider:async function(req,res){

  const lastSlider = await Slider.findOne({}).sort({slider_id:-1});

  const {slider_id,title,subtitle,link,photo } = req.body;

  const slider = new Slider({
      slider_id:lastSlider? (lastSlider.slider_id + 1) : 1,
      title,
      subtitle,
      link,
      photo,
      published:1
  });

  try {
    if(slider_id){
      await Slider.findOneAndUpdate({slider_id:slider_id},req.body);
      res.status(200).send({ success:true, message: 'Slider has been updated successfully' });
     }
     else{
      await slider.save();
      res.status(200).send({ success:true, message: 'Slider has been inserted successfully' });
     }

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},

getAllSlider:async function(req, res){
  try {
    const slider = await Slider.find({});
    res.status(200).json({ success: true, data: slider });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
},

getAllCategories:async function(req, res){
  try {
    const cat = await Category.find({});
    res.status(200).json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
},
createHomeCategory:async function(req,res){

  const lastHcat = await HomeCategory.findOne({}).sort({homecat_id:-1});

  const {category_id } = req.body;

  const hcat = new HomeCategory({
    homecat_id:lastHcat? (lastHcat.homecat_id + 1) : 1,
    category_id,
    subsubcategories:null,
    status:1
  });

  try {
    // if(slider_id){
    //   await Slider.findOneAndUpdate({slider_id:slider_id},req.body);
    //   res.status(200).send({ success:true, message: 'Slider has been updated successfully' });
    //  }
    //  else{
      await hcat.save();
      res.status(200).send({ success:true, message: 'Home Category has been inserted successfully' });
    //  }

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
getAllHomeCategories:async function(req, res){
  try {
    const homeCategories  = await HomeCategory.find({});

    const categories = await Category.find({}, { category_id: 1 }); // Only fetch `_id` from categories

    // Extract the `cat_id` values from the categories
    const categoryIds = categories.map((cat) => cat.category_id.toString());

    // Filter home categories where `cat_id` is not in the category IDs
    const unmatchedHomeCategories = [];
    for (const homeCat of homeCategories) {
      if (!categoryIds.includes(homeCat.category_id.toString())) {
        unmatchedHomeCategories.push(homeCat);
      }
    }

    res.status(200).json({ success: true, data: unmatchedHomeCategories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
},

getAllBrands:async function(req, res){
  try {
    const brand = await Brand.find({});
    res.status(200).json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
},
createBanner:async function(req,res){

  const lastBanner = await Banner.findOne({}).sort({banner_id:-1});

  const {banner_id, photo, url, position } = req.body;

  const banner = new Banner({
      banner_id:lastBanner ? (lastBanner.banner_id + 1) : 1,
      photo,
      url:url ? url : '#',
      position:position ? position : 2,
      published: 1
  });

  try {
 
     if(banner_id){
      await Banner.findOneAndUpdate({banner_id:banner_id},req.body);
      res.status(200).send({ success:true, message: 'Banner has been updated successfully' });
     }
     else{
       await banner.save();
       res.status(200).send({ success:true, message: 'Banner has been inserted successfully' });
     }

  } catch (err) {
      res.status(500).send({ success:false, message: 'Something went wrong', error: err.message });
  }
},
getAllBannerByPosition:async function(req, res) {
  try{
      let pos = req.body.pos
      try {
        const banner = await Banner.find({position:pos});
        res.status(200).json({ success: true, data: banner });
      } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
      }

  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }
},
getHomeCategoryAdmin: async(req,res)=>{
  try {
    // Find all home categories with status 1
    const homeCategories = await HomeCategory.find({});

    if (!homeCategories || homeCategories.length === 0) {
        return res.status(404).json({ success: false, message: 'No Home Categories found' });
    }

    // Fetch the latest 12 products for each home category
    const categoriesWithProducts = await Promise.all(homeCategories.map(async (homeCategory) => {
      const category = await Category.findOne({category_id:homeCategory.category_id});
        return { 
          ...homeCategory.toObject(),
          category_name: category.name,
          category_slug: category.slug
        }
    }));

    res.status(200).json({ success: true, data: categoriesWithProducts });
} catch (err) {
    console.error('Error fetching home categories with products:', err);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
}
},

getRoleById:async function(req,res){
  try{
    const role = await Role.findOne({ role_id: req.params.id });

     res.status(200).json({ success: true, data:role});
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},

getStaffById:async function(req,res){
  try{
    const staff = await Staff.findOne({ staff_id: req.params.id });

          const user = await User.findOne({usr_id:staff.user_id}).select('name email phone password');
          const role = await Role.findOne({role_id:staff.role_id});
          const staffUser = {
            ...staff.toObject(),
            user,
            role
          };

     res.status(200).json({ success: true, data:staffUser});
  }
  catch(error) {
    res.status(500).send('Internal Server Error');
  }

},

createStaff:async function(req, res){

   try {
    const lastStaff = await Staff.findOne({}).sort({staff_id:-1});
    const lastUser = await User.findOne({}).sort({usr_id:-1});
    // Check if a user with the given email already exists
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    if(req.body.staff_id){

      if(req.body.password && req.body.oldPassword){
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }
      else{
        req.body.password = req.body.oldPassword;
      }

      const user = await User.findOneAndUpdate({usr_id:req.body.user_id}, {name:req.body.name,email:req.body.email,phone:req.body.phone,password:req.body.password})
      const staff = await Staff.findOneAndUpdate({staff_id:req.body.staff_id},{user_id:req.body.user_id,role_id:req.body.role_id});

      return res.status(200).json({
        success: true,
        message: 'Staff has been updated successfully',
      });
    }
    else{
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already used' });
      }
          // Create and save the new user
    const user = new User({
      usr_id: lastUser ? (lastUser.usr_id + 1) : 1,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.mobile,
      user_type: "staff",
      password: hashedPassword
    });

    const savedUser = await user.save();

    // Create and save the staff record
    const staff = new Staff({
      user_id: savedUser.usr_id,
      role_id: req.body.role_id
    });
    await staff.save();

    // Send success response with user and staff data
    return res.status(201).json({
      success: true,
      message: 'Staff has been inserted successfully',
    });
    }

  } catch (error) {
    console.error('Error inserting staff:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while inserting staff',
    });
  }

},
orderAnalyticsSummary: async function(req, res) {
  const year = Number(req.body.year);
  let data =  await generateOrderSummary(year);

  res.status(200).json({'status':'success',data});

},
getYearListOrders:async function(req, res) {
  try {
    const years = await Order.aggregate([
      {
        $group: {
          _id: { $year: '$created_at' }, // Replace 'created_at' with your date field
        },
      },
      {
        $sort: { _id: -1 }, // Sort years in descending order
      },
    ]);

    // Map to only include year values
    const yearList = years.map((year) => year._id);

    res.status(200).json({data:yearList});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch years', details: err.message });
  }
},
exportAllProduct: async function(req, res) {
  let data = [];

    let product = await Product.find({});

    for (const ap of product) {

      // let val = {
      //   "name": ap.name,
      //   "link": `https://yantratools.com/product/${ap.slug}`,
      //   "meta_title":ap.meta_title,
      //   "meta_description": ap.meta_description,
      //   "tags":ap.tags,
      //   "published":ap.published
      // }

    let val = {
      "name":ap.name,
      "added_by":ap.added_by,
      "user_id":ap.user_id,
      "category_id":ap.category_id,
      "subcategory_id":ap.subcategory_id,
      "subsubcategory_id":ap.subsubcategory_id,
      "brand_id":ap.brand_id,
      "video_provider":ap.video_provider,
      "video_link":ap.video_link,
      "unit_price":ap.unit_price,
      "purchase_price":ap.purchase_price,
      "unit":ap.unit,
      "current_stock":ap.current_stock,
      "meta_title":ap.meta_title,
      "meta_description":ap.meta_description,
    }
    data.push(val)
   }
  
  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  res.set('Content-Disposition', 'attachment; filename=Product.xlsx');
  res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(excelBuffer);

},
emailSend:async (req, res) => {
  let mailOptions;
  const filePath = path.join(__dirname, '/emailTemplate/testEmail.html');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const replacements = {
      "studentEmail":'test@gmail.com',
  };
  const htmlToSend = template(replacements);

  mailOptions = {
    from: "yantratools@gmail.com",
    to: "ayushr418@gmail.com",
    subject: `New email`,
    // text: body,
    replyTo: 'yantratools@gmail.com',
    html: htmlToSend
}

transporter.sendMail(mailOptions, async (err, result) => {

  console.log(err,result,'--');
  

  // if (err) {
  //     res.status(400).json('Opps error occured')
  // } else {
  //     res.status(200).json({'success':"true","msg":"Msg sent"});
  // }
})
}


}


async function generateOrderSummary(year) {
  // 1. Fetch Orders for the given year
  const orders = await Order.aggregate([
    {
      $match: {
        created_at: {
          $gte: new Date(`${year}-01-01T00:00:00Z`),
          $lt: new Date(`${year + 1}-01-01T00:00:00Z`),
        },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%d-%m-%Y", date: "$created_at" } },
          hour: { $hour: "$created_at" },
        },
        totalOrders: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.date": -1, "_id.hour": 1 },
    },
  ]);

  // 2. Transform data to the required format
  const groupedData = {};
  orders.forEach((order) => {
    const { date, hour } = order._id;
    if (!groupedData[date]) {
      groupedData[date] = {};
    }
    groupedData[date][hour] = order.totalOrders;
  });

  // 3. Prepare Excel Data
  const excelData = [["Date", ...Array.from({ length: 24 }, (_, i) => i), "Total Order Placed"]];
  for (const date in groupedData) {
    const row = [date];
    let totalOrders = 0;

    for (let hour = 0; hour < 24; hour++) {
      if (groupedData[date][hour]) {
        row.push(groupedData[date][hour]);
        totalOrders += groupedData[date][hour];
      } else {
        row.push(""); // Skip empty hours
      }
    }
    row.push(totalOrders);
    excelData.push(row);
  }

  return excelData;
  // 4. Create and Save Excel File
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Order Summary");

  const rootDir = path.resolve(__dirname, "../"); 

  const publicFolderPath = path.join(rootDir, "public", "exports");
const filePath = path.join(publicFolderPath, `Order_Summary_${year}.xlsx`);

// Ensure the "public/exports" folder exists (create it if not)
if (!fs.existsSync(publicFolderPath)) {
  fs.mkdirSync(publicFolderPath, { recursive: true });
}

  const fileName = `Order_Summary_${year}.xlsx`;
  XLSX.writeFile(workbook, filePath);
   return fileName;
  // console.log(`Excel file generated: ${fileName}`);
}

async function getCatWithSales(){
    let categories = await Category.find();
    const catresult = [];
    for (const category of categories) {
      const products = await Product.find({ category_id: category.category_id });
      let totalSales = 0;
      products.forEach((product) => {
        totalSales += product.num_of_sale; 
      });
      catresult.push({
          _id: category._id,
          name: category.name,
          totalSale: totalSales,
        });
      }
      return catresult;
}

async function getCatWithStock(){
    let categories = await Category.find();
    const catresult = [];
    for (const category of categories) {
      const products = await Product.find({ category_id: category.category_id });
      let totalQuantity = 0;
     
      products.forEach((product) => {
        if (product.variant_product > 0) {
          
        } else {
          // If not a variant product, add the current stock directly
          totalQuantity = Number(product.current_stock);
        }
      });

      // Push the category with the total quantity into the result array
      catresult.push({
        _id: category._id,
        name: category.name,
        totalQuantity: totalQuantity,
      });


      }
      return catresult;
}

function formatPrice(price) {
  // Use Intl.NumberFormat for Indian currency formatting
  const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
  });

  // Format the price and replace currency symbol '₹' with 'Rs.' if needed
  const formattedPrice = formatter.format(price).replace('₹', 'Rs.');

  return formattedPrice;
}

function formatDateV2(dateString){
  const date = new Date(dateString);

  // Convert to IST (UTC + 5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // Offset in milliseconds
  const istDate = new Date(date.getTime() - istOffset);

  // Format the date parts
  const day = String(istDate.getDate()).padStart(2, '0');
  const month = String(istDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = istDate.getFullYear();
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');

  // Return formatted string
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

function sumOfPrices(data,key){
  let sum = 0;
  for (const val of data) {

    if(key == 'price'){
      sum += Number(val?.price);
    }
    else if(key == 'tax'){
      sum += Number(val?.tax);
    }
    else if(key == 'shipping'){
      sum += Number(val?.shipping_cost);
    }

  }
  return sum;
}
