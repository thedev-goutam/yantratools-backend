const bcrypt = require("bcryptjs");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Order = require("../model/Order");
const crypto = require('crypto');
const Wishlist = require('../model/Wishlist');
const Address = require('../model/Address');
const Conversation = require('../model/Conversation');
const OrderDetail = require('../model/OrderDetail');
const Product = require('../model/Product');
const Coupon = require('../model/Coupon');
const BusinessSetting = require('../model/BusinessSetting');
const PaymentMode = require("../model/PaymentModes");
const Razorpay = require('razorpay');
const axios = require('axios');
const GenralSetting = require("../model/GenralSetting");
const fs = require("fs");
const path = require("path");
const transporter = require('../helpers/nodemail');
const moment = require('moment');
const handlebars = require("handlebars");
const { log } = require("util");
const helpers = require('handlebars-helpers')();
handlebars.registerHelper(helpers);
handlebars.registerHelper('eq', function (a, b) {
  return a == b;
});

// const razorpay = new Razorpay({
//   key_id: 'rzp_test_lExwsvuAFrBqRB',
//   key_secret: 'WXq3w08zse1QzIiyRey9elfa',
// });

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_ID,
  key_secret: config.RAZORPAY_SECRET,
});


module.exports = {
  register: async function (req, res) {
    const { name, email, password,phone } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      user = new User({
        name,
        email,
        password,
        phone
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        "mySecretToken",
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token,userType:user.user_type });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
  sendOtp: async function (req, res) {
    const { phone } = req.body;
    try {

      if(phone){
        const otp = generateOTP();
        let user = await User.findOne({ user_type: 'customer', phone });

        const fullPhoneNumber = '91' + phone;
          const authkey = '412959AHFdeHOz6628f475P1';
          const template = '662a2773d6fc054fe5492023';
  
          // Send OTP using the external API (MSG91 in this case)
         const otpResponse =  await axios.post(`https://control.msg91.com/api/v5/otp`, {
              template_id: template,
              mobile: fullPhoneNumber,
              authkey: authkey,
              OTP: otp
          }, {
              headers: {
                  'Content-Type': 'application/JSON'
              }
          });
          
        if(user){
          user.otp = otp;
          user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
          await user.save();
        }
        else{

          const lastUser = await User.findOne({}).sort({usr_id:-1});
          const salt = await bcrypt.genSalt(10); 
          const newUser = new User({
            usr_id:lastUser ? (lastUser.usr_id + 1) : 1,
            phone: phone.replace(/\D+/g, ''), // Ensure it's numeric
            password: await bcrypt.hash(phone, salt), // Hashing should be added if necessary
            email_verified_at: new Date(),
            user_type: 'customer',
            user_emergecy_contact: phone,
            otp: otp,
            otpExpires : Date.now() + 10 * 60 * 1000
        });
  
        await newUser.save();
        }
        // Send OTP to user's phone
        // Here, you should integrate with an SMS gateway to send the OTP
  
        res.json({ success: true,msg: "OTP sent to your phone " });
      }
      else{
        res.json({ success: false,msg: "Invalid phone number" });

      }
 
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false , msg: 'Internal server Error!!' });
    }
  },
  verifyOtp: async function (req, res) {
    const { phone, otp } = req.body;
    try {
      let user = await User.findOne({ phone });
      if (!user) {
        return res.status(400).json({ success: false, msg: "Invalid phone number or OTP" });
      }

      if (user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });
      }

      const payload = {
        user: {
          id: user.usr_id,
        },
      };

      // Clear the OTP before generating token
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      // Generate JWT
      const token = jwt.sign(payload, "mySecretToken", { expiresIn: '7d' });

      // ✅ Set HttpOnly cookie instead of returning token
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,         // ⚠️ only works over HTTPS!
        sameSite: 'Strict',   // or 'Lax' if needed
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({ success: true, user_type: user.user_type, user });

    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server error");
    }
  },
  updateProfile: async function(req,res){

    // console.log(req.body);
    // return
    

    try {
      const userId = req.userId;  // Assuming `req.user` has authenticated user details
      const user = await User.findOne({usr_id:userId});
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update user fields
      user.name = req.body.name;
      user.address = req.body.address;
      user.country = req.body.country;
      user.city = req.body.city;
      user.postal_code = req.body.postal_code;
      if(req.body.phone){
        user.phone = req.body.phone;
      }
    
      user.email = req.body.email;
  
      // Handle password update if both new_password and confirm_password match
      if (req.body.password && req.body.password === req.body.confirm_password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;
      }
  
      // Handle avatar upload
      if (req.body.avatar_original) {
        const avatarPath = req.body.avatar_original;
        user.avatar_original = avatarPath;
      }
  
      // Save the updated user
      await user.save();
  
      return res.status(200).json({ success:true, msg: 'Your Profile has been updated successfully!', user: user });
    } catch (error) {
      return res.status(500).json({ success:false , msg: 'Sorry! Something went wrong.' });
    }
  
    
  },

  addUpdateAddress: async function(req, res) {
    const userId = req.userId;
    const user = await User.findOne({usr_id:userId});
    const addressId = req.body.address_id;
    if(addressId){
      let address = await Address.findOne({address_id:addressId});
      address.address = req.body.address;
      address.country = req.body.country;
      address.city = req.body.city;
      address.postal_code = req.body.postal_code;
      address.phone = req.body.phone;
      address.alt_number = req.body.alt_number;
      await address.save();
      return res.status(200).json({ success:true, msg: 'Your address has been updated successfully!'});
    }else{
      let oldAddId = await Address.findOne({}).sort({address_id:-1});       
      let address = new Address({
            user_id: req.userId,
            address: req.body.address,
            country: req.body.country,
            city: req.body.city,
            postal_code: req.body.postal_code,
            phone: req.body.phone,
            alt_number:req.body.alt_number
        });
      if(oldAddId){
        address.address_id = Number(oldAddId.address_id) + 1;
      }
      else{
        address.address_id = 1;
        
      }
      await address.save();
      user.name = req.body.name;
      if(req.body.email){
        user.email = req.body.email;
      }
      await user.save();
      return res.status(200).json({ success:true, msg: 'New address added successfully!'});
    }    
    
  },
  getDashboardData: async function(req,res){

    try{
      let [productOrderCount,wishListCount,defaultAddress,deliveryViewd,paymentStatusViewed,conversationCount] = await Promise.all([
        Order.countDocuments({user_id:req.userId}),
        Wishlist.countDocuments({user_id:req.userId}),
        Address.findOne({user_id:req.userId,set_default:1}),
        Order.countDocuments({user_id:req.userId,delivery_viewed:0}),
        Order.countDocuments({user_id:req.userId,payment_status_viewed:0}),
        Conversation.countDocuments({sender_id:req.userId,user_id:{$ne:req.userId},sender_viewed:0})
      ]);
      res.status(200).json({success:true,data:{productOrderCount,wishListCount,defaultAddress,deliveryViewd,paymentStatusViewed,conversationCount}});
    }
    catch(err){
      res.status(400).json({success:false,data:{}});
    }  
  },
  getSidebarData: async function(req,res){
    try{

      let [deliveryViewd,paymentStatusViewed,conversationCount,user] = await Promise.all([
        Order.countDocuments({user_id:req.userId,delivery_viewed:0}),
        Order.countDocuments({user_id:req.userId,payment_status_viewed:0}),
        Conversation.countDocuments({sender_id:req.userId,user_id:{$ne:req.userId},sender_viewed:0}),
        User.findOne({usr_id:req.userId}).select('name avatar_original')
      ])

  
      res.status(200).json({success:true,data:{deliveryViewd,paymentStatusViewed,conversationCount,user}});
    }
    catch(err){
      res.status(400).json({success:false,data:{}});
    }

  
  
  },
  getUserData: async function(req,res){    
    try{
      let user = await User.findOne({usr_id:req.userId}).select('usr_id name avatar_original user_type phone');
      let wishListCount = await Wishlist.countDocuments({user_id:req.userId}); 
      let conversationCount = await Conversation.countDocuments({sender_id:req.userId,sender_viewed:0})
      res.status(200).json({success:true,data:{user,wishListCount,conversationCount}});
    }
    catch(err){
      res.status(400).json({success:false,data:{}});
    }
  
  },
  getUserWithDeafultAddress: async function(req,res){

    try{
      let user = await User.findOne({usr_id:req.userId}).select('name email phone');
      let address = await Address.findOne({user_id:req.userId}).sort({address_id:-1});
      res.status(200).json({success:true,user,address});
    }
    catch(err){
      res.status(400).json({success:false,data:{}});
    }
  
  },
  getUserProfileData: async function(req,res){

    try{
      let user = await User.findOne({usr_id:req.userId}).select('name phone email address country city postal_code');
      let address = await Address.find({user_id:req.userId}).sort({address_id:-1}); 
      res.status(200).json({success:true,data:{user,address}});
    }
    catch(err){
      res.status(400).json({success:false,data:{}});
    }
  
  },
  updateOrder: async function(req,res){

    try{
       let order = await Order.findOne({ ord_id:req.params.id });
       order.delivery_viewed = 1;
       order.payment_status_viewed = 1;
       order.save();
      res.status(200).json({success:true});

    }
    catch(err){
      res.status(400).json({success:false});
    }

  
  
  },

  getAllOrdersByUser: async function(req,res){
    let size = req.body.size || 10;
    let pageNo = req.body.pageNo || 1; 
    const query={};
    query.skip = Number(size * (pageNo - 1));
    query.limit = Number(size) || 0;
    const sort = { ord_id: -1 };
    const totalOrder = await Order.countDocuments({user_id:req.userId});

    // console.log(query,'--');
    
    
    if(totalOrder>0){
      const orders = await Order.find({user_id:req.userId}).sort(sort).skip(query.skip).limit(query.limit);

      const parsedOrders = orders.map(order => {
        return {
            ...order.toObject(),
            address: JSON.parse(order.shipping_address)
        };
    });
      
      const detailedOrders = [];
      for (let order of parsedOrders) {
        // Fetch order details based on order_id
        const orderDetails = await OrderDetail.find({ order_id: order.ord_id });
        const detailedOrderDetails = [];
        for (let detail of orderDetails) {
          const product = await Product.findOne({ prd_id: detail.product_id });
          
          detailedOrderDetails.push({
            orderDetail: detail,
            product: product || {}  // Include product details if found, otherwise empty object
          });
        }

        // Fetch user details if user_id is present
        let userDetails = null;
        if (order.user_id) {
          userDetails = await User.findOne({ usr_id: order.user_id });
        }

        // Construct a detailed order object
        detailedOrders.push({
          order: order,
          orderDetails: detailedOrderDetails,
          user: userDetails
        });
      }


        res.status(200).json({success:true,data:detailedOrders,total:totalOrder});
    }else{
        res.status(200).json({data:[],total:totalOrder}); 
    }
  
  
  },
  
  getAllConversationByUser: async function(req,res){

    const businessSetting = await BusinessSetting.findOne({type:"conversation_system"});
    if (businessSetting && businessSetting.value == 1) {

      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { created_at: -1 };
      const totalConv = await Conversation.countDocuments({$or: [{ sender_id: req.userId }, { receiver_id: req.userId }]});
  
      if(totalConv>0){
        const conversation = await Conversation.find({$or: [{ sender_id: req.userId }, { receiver_id: req.userId }]}).sort(sort).skip(query.skip).limit(query.limit);
  
          res.status(200).json({success:true,data:conversation,total:totalConv});
      }else{
          res.status(200).json({success:true,data:[],total:totalConv}); 
      }

    }
    else{
      res.status(200).json({success:false,msg:'Conversation is disabled at this moment'}); 
      
    }
  
  
  },
  getWishlistByUser: async function(req,res){
    let size = req.body.size || 10;
    let pageNo = req.body.pageNo || 1; 
    const query={};
    query.skip = Number(size * (pageNo - 1));
    query.limit = Number(size) || 0;
    const sort = { ord_id: -1 };
    const totalWish = await Wishlist.countDocuments({user_id:req.userId});

    if(totalWish>0){
      const wishlistItems = await Wishlist.find({ user_id: req.userId }).sort(sort).skip(query.skip).limit(query.limit);
    
      // Array to hold the wishlist with product details
      const wishlistWithProductDetails = [];
  
      for (const item of wishlistItems) {
          const product = await Product.findOne({ prd_id: item.product_id }); // Assuming `product_id` is the reference to the Product in Wishlist schema
          
          if (product) {
              wishlistWithProductDetails.push({
                  ...item.toObject(), // Convert Mongoose document to plain object
                  product: product.toObject() // Include the product details
              });
          }
      }
      res.status(200).json({success:true,data:wishlistWithProductDetails,total:totalWish});
    }
    else{
      res.status(200).json({data:[],total:totalWish}); 
    }
  },
  insertWishlist : async function(req, res){

    try{

      const check = await Wishlist.countDocuments({user_id:req.userId,product_id:req.body.product_id});

      if(check > 0){
        const wishlist = await Wishlist.deleteOne({user_id:req.userId,product_id:req.body.product_id});
        res.status(200).json({success:true,msg:"Item removed from your wishlist"});
      }
      else{
      const lastPrd = await Wishlist.findOne({}).sort({wish_id: -1});
  
  
      let objToInsert = {
        wish_id : Number(lastPrd.wish_id) + 1,
        product_id: Number(req.body.product_id),
        user_id: Number(req.userId)
      };

      const wish = await Wishlist.create(objToInsert);
       
      res.status(200).json({success:true,msg:"Item added to your wishlist!"});
  
      }

    }
    catch(err){
      res.status(400).json({success:false,msg:err});
    }
    
  },
  removeWishlist: async function(req, res) {
    try{
      const wishlist = await Wishlist.deleteOne({wish_id:req.body.wish_id});
      res.status(200).json({success:true,msg:'Delete Success'});
    }
    catch(error){
      res.status(400).json({success:false,msg:'Internal server Error'});
    }
  },
  applyCoupon: async function(req,res){
    try {
      // const coupons = [
      //   { code: "DISCOUNT10", discountPercent: 10 },
      //   { code: "SAVE50", discountAmount: 50 }
      // ];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const coupons = await Coupon.find({
        status: 'active',
        valid_from: { $lte: today },
        valid_to: { $gte: today }
      });

      const { coupon_code, cart_total } = req.body;

      // Validate request body
      if (!coupon_code || typeof cart_total !== "number") {
        return res.status(400).json({
          success: false,
          msg: "Coupon code and cart total are required."
        });
      }

      // Find the coupon
      const coupon = coupons.find(
        c => c.code.toLowerCase() === coupon_code.toLowerCase()
      );

      if (!coupon) {
        return res.status(404).json({
          success: false,
          msg: "Invalid coupon code."
        });
      }

      let discount = 0;
      let finalTotal = cart_total;

      // Apply discount
      if (coupon.type=='percentage') {
        discount = (cart_total * coupon.discount) / 100;
        finalTotal = cart_total - discount;
      } else if (coupon.type=='flat') {
        discount = coupon.discount;
        finalTotal = Math.max(cart_total - discount, 0); // avoid negative total
      }

      let discount_data = {
        discount_amount: discount,
        total_amount: finalTotal
      }

      return res.status(200).json({
        success: true,
        msg: "Coupon applied successfully.",
        data: discount_data
      });
    } catch (err) {
      console.error("Error applying coupon:", err);
      return res.status(500).json({
        success: false,
        msg: "Server error."
      });
    }
  },
  checkoutOrder: async function(req,res){
    
try {

    if(req.body.cart && req.body.cart.length > 0){
      // Step 1: Handling checkout information
      if (req.body.payment_option) {
          // Collect shipping info from request
          let shipping_info = {};
          let address = {};
          // Store address in the database if user is authenticated
          if (req.userId) {
            const user = await User.findOne({usr_id:req.userId});
            let oldAddId = await Address.findOne({}).sort({address_id:-1});
            if(req.body.address_id){
              address = await Address.findOne({address_id:req.body.address_id});              
            }else{              
              address = new Address({
                  user_id: req.userId,
                  address: req.body.address,
                  country: req.body.country,
                  city: req.body.city,
                  postal_code: req.body.postal_code,
                  phone: req.body.phone,
                  alt_number:req.body.alt_number
              });
              if(oldAddId){
                address.address_id = Number(oldAddId.address_id) + 1;
              }
              else{
                address.address_id = 1;
                
              }
              await address.save();
            }

            shipping_info = { 
                name: user.name,
                email: user.email,
                address: address.address,
                cust_gst_num: address.cust_gst_num,
                country: address.country,
                city: address.city,
                postal_code: address.postal_code,
                phone: address.phone,
                alt_number: address.alt_number,
                checkout_type: address.checkout_type,
            };
              
          }

          // Step 2: Creating and storing the order
          let oldOrderId = await Order.findOne({}).sort({ord_id:-1});
          let order = new Order();

          if (req.userId) {
              order.user_id = req.userId;
          } else {
              order.guest_id = Math.floor(100000 + Math.random() * 900000);
          }

          if(oldOrderId){
            order.ord_id = Number(oldOrderId.ord_id) + 1
          }
          else{
            order.ord_id = 1

          }
          // let codeString = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14) +'-'+ Math.floor(10 + Math.random() * 90);
          let codeString = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 8) + '-' + new Date().toISOString().replace(/[-:T.]/g, '').slice(8, 14) + Math.floor(10 + Math.random() * 90);
          order.shipping_address = JSON.stringify(shipping_info);
          order.cust_gst_num = req.body.cust_gst_num;
          order.payment_type = req.body.payment_option;
          order.delivery_viewed = 0;
          order.viewed = 0;
          order.payment_status_viewed = 0;
          order.code = codeString;
          order.date = Date.now();
          order.payment_status = 'unpaid';

          // Save the order and proceed with storing order details
          const savedOrder = await order.save();
          if (savedOrder) {
              let subtotal = 0;
              let tax = 0;
              let shipping = 0;

              let admin_products = [];
              let seller_products = {};

              // Order Details Storing
              for (const cartItem of req.body.cart) {
                  let product = await Product.findOne({prd_id:cartItem.prd_id});

                  if (product.added_by == 'admin') {
                      admin_products.push(cartItem.prd_id);
                  } else {
                      if (!seller_products[product.user_id]) {
                          seller_products[product.user_id] = [];
                      }
                      seller_products[product.user_id].push(cartItem.prd_id);
                  }

                  subtotal += Number(cartItem.total_price);

                  let taxPrice = (Number(cartItem.total_price) * product.tax/100);

                  tax += Math.round(Number(taxPrice) * (product.tax/100));

                  let product_variation = cartItem.variant;

                  // Decrease product stock
                  if (product_variation) {
                      let productStock = product.stocks.find(stock => stock.variant === product_variation);
                      if (productStock) {
                          productStock.qty -= Number(cartItem.qty);
                          await product.save();
                      }
                  } else {
                      product.current_stock -= Number(cartItem.qty);
                      await product.save();
                  }

                  // Save order details
          let oldOrderDId = await OrderDetail.findOne({}).sort({ordd_id:-1});

                  let orderDetail = new OrderDetail({
                      order_id: order.ord_id,
                      seller_id: product.user_id,
                      product_id: product.prd_id,
                      variation: product_variation,
                      price: cartItem.total_price,
                      tax: Math.round(taxPrice * (product.tax/100)),
                      product_referral_code: cartItem.product_referral_code,
                      quantity: cartItem.qty,
                      payment_status:'unpaid',
                      delivery_status:'pending',
                      shipping_type:'home_delivery'
                  });

                  if(oldOrderDId){
                    orderDetail.ordd_id = Number(oldOrderDId.ordd_id) + 1;
                  }
                  else{
                    orderDetail.ordd_id = 1;
                  }

                  // Calculate and store shipping cost
                  if (product.shipping_type === 'home_delivery') {
                    // let shpcost = await Product.findOne({prd_id:cartItem.prd_id}).select('shipping_cost');
                    //   orderDetail.shipping_cost = shpcost.shipping_cost
                    //   shipping += Number(orderDetail.shipping_cost);
                  } else {
                      orderDetail.shipping_cost = product.shipping_cost;
                      // orderDetail.pickup_point_id = cartItem.pickup_point;
                      shipping += Number(orderDetail.shipping_cost);
                  }

                  await orderDetail.save();

                  product.num_of_sale += 1;
                  await product.save();
              }        
              // return
              
              order.grand_total = Number(subtotal) + Number(shipping);

              let payment_mode;
              if(subtotal <=10000){
                payment_mode = await PaymentMode.findOne({amount:10000});
              }
              else if(subtotal >=10000 && subtotal <=40000){
                payment_mode = await PaymentMode.findOne({amount:40000});
              }
              else if(subtotal >= 40001 && subtotal <= 80000){
                payment_mode = await PaymentMode.findOne({amount:80000});

              }
              else if(subtotal >= 80001){
                //payment_mode = await PaymentMode.findOne({amount:80000});
                payment_mode = 'Full_Payment';
                
              }
              else{
                  payment_mode = 'Full_Payment';
              }

              order.full_with_discount = 0;
              order.advance_payment = 0;
              order.rest_payment = 0;
               order.cod_charges = 0;
                order.coupon_discount = 0;

              // Handle different payment modes
              switch (req.body.p_mode) {
                  case '1':
                      order.full_with_discount = Math.round((subtotal * payment_mode.discount) / 100);
                      order.cod_charges = 0;
                      order.coupon_discount = 0;
                      break;
                  case '2':
                      let advance_payment = Math.round((subtotal * payment_mode.part_percentage) / 100);
                      order.advance_payment = advance_payment;
                      order.rest_payment = subtotal - advance_payment;
                      order.cod_charges = 0;
                      order.coupon_discount = 0;
                      break;
                  case '3':
                      order.cod_charges = payment_mode.cod_charges;
                      order.coupon_discount = 0;
                      break;
                  default:
                      break;
              }

              order.p_mode = req.body.p_mode;

              // Apply coupon discount if available
              // if (req.session.coupon_discount) {
              //     order.grand_total -= req.session.coupon_discount;
              //     order.coupon_discount = req.session.coupon_discount;

              //     let couponUsage = new CouponUsage({
              //         user_id: req.user._id,
              //         coupon_id: req.session.coupon_id,
              //     });
              //     await couponUsage.save();
              // }

              const user = await User.findOne({usr_id:req.userId});

              if(req.body.p_mode != 3){

                await order.save();

                let rezponse = await createRazorPayOrder(savedOrder);
                
                 if(user.email){
                   let mail = await sendOrderMail(savedOrder.ord_id);
                 }
  
                res.status(200).json({ success: true, data: rezponse });
              }
              else{
                await order.save();
                if(user.email){
                  let mail = await sendOrderMail(savedOrder.ord_id);
                }
                res.status(200).json({ success: true, data: {code:codeString} });

              }


          }
      } else {
          res.status(200).json({ success: false, message: 'Payment option is required.' });
      }
    } else {
      res.status(200).json({ success: false, message: 'Please Refresh your page and try again.' });
  }
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  } 
  
  },

  checkoutDone: async function(req, res) {
    try{
      const payment = await razorpay.payments.fetch(req.body.payment_detail.razorpay_payment_id);
      if(payment.status == 'captured'){
        let paymtDeatail = JSON.stringify({id: payment.id,method:payment.method,amount:payment.amount,currency:payment.currency});
      
        let order  = await Order.findOne({ord_id:req.body.orderId});
        let orderDetail = await OrderDetail.find({order_id:req.body.orderId});
    
             order.payment_status = 'paid';
             order.payment_details = paymtDeatail;
    
             order.save();
             for(const ord of orderDetail) {
               await OrderDetail.findOneAndUpdate({ordd_id:ord.ordd_id},{payment_status:'paid',delivery_status:'pending'});
             }
        
         res.status(200).json({success:true,msg:'Payment Successfull',orderId:order.code});
      }
      else{
        res.status(200).json({success:false,msg:'Payment Not completed'});
      }

    }
    catch(error){
      res.status(400).json({success:false,msg:'Internal server Error'});
    }
   
    
  },
  deleteAddressById:async function (req, res) {
    try{
      const address = await Address.deleteOne({address_id:req.body.address_id});
      res.status(200).json({success:true,msg:'Delete Success'});
    }
    catch(error){
      res.status(400).json({success:false,msg:'Internal server Error'});
    }
  }
};

function generateOTP() {
  // return crypto.randomBytes(3).toString("hex");
  const otp = crypto.randomInt(1000, 9999);
  return otp.toString();
}

async function sendOrderMail(ord_id){

  const order = await Order.findOne({ord_id: ord_id});
  const orderDetail = await OrderDetail.find({order_id:order.ord_id});
  const user = await User.findOne({usr_id:order.user_id});
   let parsedOrder = order.toObject(); 
   parsedOrder.p_mode_one = false;
   parsedOrder.p_mode_two = false;
   parsedOrder.p_mode_three = false;

   let total = order.grand_total;

   if(order.p_mode == 1){
    parsedOrder.p_mode_one = true;
     total = Number(order.grand_total) - Number(order.full_with_discount);
    }
    else if(order.p_mode == 2){
      total = Number(order.grand_total);
      parsedOrder.p_mode_two = true;
    }
    else if(order.p_mode == 3){
     parsedOrder.p_mode_three = true;
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
   parsedOrder.invoice_date = formatDateV2(order.created_at);

  const orderDetailWithProduct = await Promise.all(orderDetail.map(async (ordd) => {
   const product = await Product.find({prd_id: ordd.product_id});
   return {
      ...ordd.toObject(),
      product_name:product[0].name,
      inv_unit_price:formatPrice(Number(ordd.price)/Number(ordd.quantity) - Number(ordd.tax)),
      inv_tax: formatPrice(Number(ordd.tax)/Number(ordd.quantity)),
      inv_total: formatPrice(Number(ordd.price))
   }

 }));

const genralSetting = await GenralSetting.findOne();


  let mailOptions;
  const filePath = path.join(__dirname, '/emailTemplate/orderMail.html');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
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

  mailOptions = {
    from: "yantratools@gmail.com",
    to: user.email,
    subject: `Your Yantratool.com order #${order?.code} order code of ${orderDetailWithProduct?.length} item has been Placed`,
    // text: body,
    html: htmlToSend
}

transporter.sendMail(mailOptions, async (err, result) => {
  
})
}


async function createRazorPayOrder(order){

  let total = Number(order.grand_total);

  if(order.p_mode == 1){
   total = Number(order.grand_total) - Number(order.full_with_discount);
  }
  else if(order.p_mode == 2){
   total = Number(order.advance_payment)
  }

  total = total * 100
  
  const options = {
    amount: total, // Convert to smallest currency unit (e.g., paise)
    currency: 'INR',
  };

  let shipping = JSON.parse(order.shipping_address);

  let userData = {
    name:shipping.name,
    email:shipping.email,
    phone:shipping.phone,
    orderId:order.ord_id
  }
  
  try {
    const order = await razorpay.orders.create(options);
    // console.log(order);
    // console.log(userData);
    return {order,userData};
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
