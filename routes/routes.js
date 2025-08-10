const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const jwt = require("jsonwebtoken");
const fs = require("fs");
const multer = require("multer");
const multerS3 = require('multer-s3')
const path = require("path");
const homeController = require('../controller/homeController');
const AdminController = require('../controller/AdminController');
const { S3, ListObjectsV2Command, CopyObjectCommand,HeadObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const { v4: uuidv4 } = require('uuid');
const Order = require('../model/Order');
const User = require('../model/User');
const Product = require('../model/Product');
const ShippingController = require('../controller/ShippingController');
const config = require("../config/config");
const s3 = new S3({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
  
    jwt.verify(token, "mySecretToken", (err, decodedToken) => {
      if (err) return res.sendStatus(403);
      req.userId = decodedToken.user.id;
      next();
    });
  };

  // router.get('/setId', async (req, res) => {
  //   const orders = await Order.find({ user_id: { $exists: false } });

  //   // res.json(orders.length);
  //   // return

  //   for (const order of orders) {
  //     if (order.shipping_address) {
  //       // Parse shipping_address to get the phone key
  //       const shippingData = JSON.parse(order.shipping_address);

  //       if (shippingData.phone) {
  //         // Find the user with the matching phone number
  //         const user = await User.findOne({ phone: shippingData.phone });

  //         if (user) {
  //           // Update the order with the user's ID
  //           await Order.updateOne(
  //             { ord_id: order.ord_id },
  //             { $set: { user_id: user.usr_id } }
  //           );
  //           console.log(`Updated order ${order.ord_id} with user_id ${user.usr_id}`);
  //         } else {
  //           console.log(`No user found for phone number ${shippingData.phone}`);
  //         }
  //       } else {
  //         console.log(`No phone key found in shipping_data for order ${order.ord_id}`);
  //       }
  //     } else {
  //       console.log(`No shipping_data found for order ${order.ord_id}`);
  //     }
  //   }
  // })

  // router.get('/setNumber',async (req, res) => {
  //       // Find documents without the `usr_id` key
  //       const documents = await User.find({ usr_id: { $exists: false } })

  //       let currentNumber = 9855;

  //       // console.log(documents,'-000');
  //       // res.status(200).json({msg:'testing'});

  //       // return
        

  //       // Prepare bulk update operations
  //       const bulkOps = documents.map((doc) => ({
  //           updateOne: {
  //               filter: { _id: doc._id }, // Match by document ID
  //               update: { $set: { usr_id: currentNumber++ } }, // Set `usr_id` with incrementing value
  //           },
  //       }));

  //       if (bulkOps.length > 0) {
  //           // Perform bulk write operation
  //           const result = await User.bulkWrite(bulkOps);
  //           console.log(`${result.modifiedCount} documents updated.`);
  //           res.status(200).json({msg:'updated'});
  //       } else {
  //           console.log("No documents found without 'usr_id'.");
  //           res.status(200).json({msg:'not updated'});
  //       }
    
  // })

  // router.get('/setPPrice',async (req,res)=>{

  //   try {
  //     // Update products where discount > 0
  //     await Product.updateMany(
  //         { discount: { $gt: 0 } }, // Filter for products with a discount greater than 0
  //         [
  //             {
  //                 $set: {
  //                     purchase_price: { $subtract: ["$unit_price", "$discount"] }, // Subtract discount from unit_price
  //                 },
  //             },
  //         ]
  //     );

  //     // Update products where discount is 0 or not set
  //     await Product.updateMany(
  //         { $or: [{ discount: 0 }, { discount: { $exists: false } }] }, // Filter for no discount
  //         [
  //             {
  //                 $set: {
  //                     purchase_price: "$unit_price", // Set purchase_price equal to unit_price
  //                 },
  //             },
  //         ]
  //     );

  //     return res.json({
  //         success: true,
  //         message: "Purchase price updated successfully for all products.",
  //     });
  // } catch (error) {
  //     console.error("Error updating purchase price:", error);
  //     return res.status(500).json({
  //         success: false,
  //         message: "Failed to update purchase price.",
  //         error: error.message,
  //     });
  // }

  // });

router.post('/register',userController.register);
router.post('/sendOtp',userController.sendOtp);
router.post('/verifyOtp',userController.verifyOtp);
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    path: '/',           // must match the path used when setting the cookie
    httpOnly: false,     // match what was set
    secure: true,        // use true if using HTTPS
    sameSite: 'Lax'
  });

  return res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/getDashboardData',authenticateToken,userController.getDashboardData);
router.get('/getSidebarData',authenticateToken,userController.getSidebarData);
router.get('/getUserData',authenticateToken,userController.getUserData);
router.get('/getUserWithDeafultAddress',authenticateToken,userController.getUserWithDeafultAddress);
router.get('/getUserProfileData',authenticateToken,userController.getUserProfileData);
router.post('/getAllOrdersByUser',authenticateToken,userController.getAllOrdersByUser);
router.post('/getAllConversationByUser',authenticateToken,userController.getAllConversationByUser);
router.post('/getWishlistByUser',authenticateToken,userController.getWishlistByUser);
router.post('/insertWishlist',authenticateToken,userController.insertWishlist);
router.post('/removeWishlist',authenticateToken,userController.removeWishlist);
router.post('/updateProfile',authenticateToken,userController.updateProfile);
router.post('/addUpdateAddress',authenticateToken,userController.addUpdateAddress);
router.post('/applyCoupon',authenticateToken,userController.applyCoupon);
router.post('/checkoutOrder',authenticateToken,userController.checkoutOrder);
router.post('/checkoutDone',authenticateToken,userController.checkoutDone);
router.post('/deleteAddressById',authenticateToken,userController.deleteAddressById);

router.get('/getFeatureSection',homeController.getFeatureSection);
router.get('/getBestSelling',homeController.getBestSelling);
router.get('/getBestSellingv2',homeController.getBestSellingv2);
router.get('/getVerifiedSellers',homeController.getVerifiedSellers);
router.get('/getTodaysDealProducts',homeController.getTodaysDealProducts);
router.get('/getFeaturedCategory',homeController.getFeaturedCategory);
router.get('/getHomCategoryWithProducts',homeController.getHomeCategoryWithProducts);
router.get('/getBottomBanner',homeController.getBottomBanner);
router.get('/getTop10Category',homeController.getTop10Category);
router.get('/getTop10Brands',homeController.getTop10Brands);
router.get('/getGeneralSetting',homeController.getGeneralSetting);
router.get('/getHomeCategoryWithLimt',homeController.getHomeCategoryWithLimt);
router.get('/getAllCategories',homeController.getAllCategories);
router.get('/getAllCountries',homeController.getAllCountries);
router.get('/getAllBrands',homeController.getAllBrands);
router.get('/getAllSliders',homeController.getAllSliders);
router.get('/getAllFeatureCategories',homeController.getAllFeatureCategories);
router.get('/getAllSellerWithShop',homeController.getAllSellerWithShop);
router.get('/getAllCategoriesPage',homeController.getAllCategoriesPage);
router.get('/getHomeDealWithFeatureCat',homeController.getHomeDealWithFeatureCat);
router.get('/getHomeCategoryProducts/:catId',homeController.getHomeCategoryProducts);
router.get('/getAllSubCatbyCat/:id',homeController.getAllSubCatbyCat);
router.get('/getAllSubSubCatbySubCat/:id',homeController.getAllSubSubCatbySubCat);
router.get('/getProductDetails/:id',homeController.getProductDetails);
router.get('/getPageContent/:id',homeController.getPageContent);
router.get('/getBlogBySlug/:id',homeController.getBlogBySlug);
router.get('/getBusinessSettingByType/:id',homeController.getBusinessSettingByType);
router.get('/getCurrencyById/:id',homeController.getCurrencyById);
router.get('/getPaymentByAmount/:id',homeController.getPaymentByAmount);
router.get('/updateOrder/:id',userController.updateOrder);
router.post('/requestCallback',homeController.insertRequestCallBack);
router.post('/insertReview',homeController.insertReview);
router.post('/insertQuestion',homeController.insertQuestion);
router.post('/bulkPurchaseEnquiry',homeController.bulkPurchaseEnquiry);

//Goutam
router.get('/getCategoryDetails/:cat_slug', homeController.getCategoryDetails);
router.get('/getSubCategoryDetails/:cat_slug', homeController.getSubCategoryDetails);

router.post('/getNavSearch',homeController.getNavSearch);
router.post('/getAllBlog',homeController.getAllBlog);
router.post('/getOrderbyOrderCode',homeController.getOrderbyOrderCode);
router.post('/searchQuery',homeController.searchQuery);
router.post('/getAllReviewsByProduct',homeController.getAllReviewsByProduct);
router.post('/getRelatedProductsPagination',homeController.getRelatedProductsPagination);
router.post('/getAllQuestionByProduct',homeController.getAllQuestionByProduct);


//Admin routes
router.get('/getUserById',authenticateToken,AdminController.getUserById);
router.post('/updateUserById',authenticateToken,AdminController.updateUserById);
router.post('/adminLogin',AdminController.adminLogin);
router.get('/getAllRoles',AdminController.getAllRoles);
router.get('/getAllSlider',AdminController.getAllSlider);
router.get('/getAllCategoriess',AdminController.getAllCategories);
router.get('/getAllHomeCategoriess',AdminController.getAllHomeCategories);
router.get('/getAllBrandss',AdminController.getAllBrands);
router.get('/getHomeCategoryAdmin',AdminController.getHomeCategoryAdmin);
router.get('/getAdminDashboard',AdminController.getAdminDashboard);
router.post('/createSlider',AdminController.createSlider);
router.post('/createHomeCategory',AdminController.createHomeCategory);
router.post('/createBanner',AdminController.createBanner);
router.post('/getAllBannerByPosition',AdminController.getAllBannerByPosition);
router.get('/getSideBarDataAdmin',AdminController.getSideBarDataAdmin);
router.post('/getAllBrandsAdmin',AdminController.getAllBrandsAdmin);
router.post('/getAllCategorysAdmin',AdminController.getAllCategorysAdmin);
router.post('/getAllSubcatsAdmin',AdminController.getAllSubcatsAdmin);
router.post('/getAllSubSubcatsAdmin',AdminController.getAllSubSubcatsAdmin);
router.post('/getAllInhouseProductAdmin',AdminController.getAllInhouseProductAdmin);
router.post('/getAllDigitalProductAdmin',AdminController.getAllDigitalProductAdmin);
router.post('/getAllReviewsAdmin',AdminController.getAllReviewsAdmin);
router.post('/getAllQuestionsAdmin',AdminController.getAllQuestionsAdmin);
router.post('/getAllOrdersAdmin',AdminController.getAllOrdersAdmin);
router.post('/getAllUnshippedOrdersAdmin',AdminController.getAllUnshippedOrdersAdmin);
router.post('/getOrderbyOrderCodeAdmin',AdminController.getOrderbyOrderCode);
router.post('/getAllPickupPointOrdersAdmin',AdminController.getAllPickupPointOrdersAdmin);
router.post('/getAllSalesOrderAdmin',AdminController.getAllSalesOrderAdmin);
router.post('/getAllReqCallBackAdmin',AdminController.getAllReqCallBackAdmin);
router.post('/getAllModelCallBackAdmin',AdminController.getAllModelCallBackAdmin);
router.post('/getAllStaffAdmin',AdminController.getAllStaffAdmin);
router.post('/getAllRoleAdmin',AdminController.getAllRoleAdmin);
router.post('/getAllSellersAdmin',AdminController.getAllSellersAdmin);
router.post('/getAllCustomersAdmin',AdminController.getAllCustomersAdmin);
router.post('/getAllConversationAdmin',AdminController.getAllConversationAdmin);
router.post('/getAllBlogsAdmin',AdminController.getAllBlogsAdmin);
router.post('/getAllCmsCategoryAdmin',AdminController.getAllCmsCategoryAdmin);
router.post('/getAllCmsSubCategoryAdmin',AdminController.getAllCmsSubCategoryAdmin);
router.post('/getAllCmsSubSubCategoryAdmin',AdminController.getAllCmsSubSubCategoryAdmin);
router.post('/createProduct',AdminController.createProduct);
router.get('/getProductById/:id',AdminController.getProductById);
router.get('/getProductRatings/:id',AdminController.getProductRatings);
router.get('/deleteProductById/:id',AdminController.deleteProductById);
router.get('/getSliderById/:id',AdminController.getSliderById);
router.get('/deleteSliderById/:id',AdminController.deleteSliderById);
router.get('/deleteHomeCatById/:id',AdminController.deleteHomeCatById);
router.get('/getBannerById/:id',AdminController.getBannerById);
router.get('/deleteBannerById/:id',AdminController.deleteBannerById);
router.get('/deleteProductQuestionById/:id',AdminController.deleteProductQuestionById)
router.get('/getProductQuestionById/:id',AdminController.getProductQuestionById);
router.post('/createBrands',AdminController.createBrands);
router.get('/getBrandById/:id',AdminController.getBrandById);
router.get('/deleteBrandById/:id',AdminController.deleteBrandById);
router.get('/deleteStaffById/:id',AdminController.deleteBrandById);
router.get('/deleteRoleById/:id',AdminController.deleteBrandById);
router.post('/createCategory',AdminController.createCategory);
router.get('/getCategoryById/:id',AdminController.getCategoryById);
router.get('/deleteCategoryById/:id',AdminController.deleteCategoryById);
router.post('/createBlogs',AdminController.createBlogs);
router.get('/getBlogById/:id',AdminController.getBlogById);
router.get('/deleteBlogById/:id',AdminController.deleteBlogById);
router.post('/createSubCategory',AdminController.createSubCategory);
router.get('/getSubCategoryById/:id',AdminController.getSubCategoryById);
router.get('/deleteSubCategoryById/:id',AdminController.deleteSubCategoryById);
router.post('/createSubSubCategory',AdminController.createSubSubCategory);
router.get('/getSubSubCategoryById/:id',AdminController.getSubSubCategoryById);
router.get('/deleteSubSubCategoryById/:id',AdminController.deleteSubSubCategoryById);
router.post('/createQuestion',AdminController.createQuestion);
router.post('/updateFeaturedById',AdminController.updateFeaturedById);
router.post('/updateProductKeys',AdminController.updateProductKeys);
router.post('/updateSliderKeys',AdminController.updateSliderKeys);
router.post('/updateHomeCatKeys',AdminController.updateHomeCatKeys);
router.post('/updateBannerKeys',AdminController.updateBannerKeys);
router.post('/updateProductReviewKeys',AdminController.updateProductReviewKeys);
router.post('/updateProductQuestionKeys',AdminController.updateProductQuestionKeys);
router.post('/updateOrderKeys',AdminController.updateOrderKeys);
router.post('/updateOrderPaymentStatus',AdminController.updateOrderPaymentStatus);
router.post('/updateOrderPaymentMode',AdminController.updateOrderPaymentMode);
router.post('/updateOrderDeliveryStatus',AdminController.updateOrderDeliveryStatus);
router.post('/generateCustomerInvoice',AdminController.generateCustomerInvoice);
router.get('/deleteOrderById/:id',AdminController.deleteOrderById);
router.get('/deleteUserById/:id',AdminController.deleteUserById);
router.post('/createMessage',AdminController.createMessage);
router.get('/getConvById/:id',AdminController.getConvById);
router.get('/deleteConvById/:id',AdminController.deleteConvById);
router.post('/createPolicy',AdminController.createPolicy);
router.get('/getPolicyByNameAdmin/:id',AdminController.getPolicyByNameAdmin);
router.post('/createStaff',AdminController.createStaff);
router.get('/getStaffById/:id',AdminController.getStaffById);
router.post('/createRole',AdminController.createRole);
router.get('/getRoleById/:id',AdminController.getRoleById);
router.get('/testEmail',AdminController.emailSend);
router.post('/createCoupon',AdminController.createCoupon);
router.post('/getAllCouponsAdmin',AdminController.getAllCouponsAdmin);
router.get('/getCouponById/:id',AdminController.getCouponById);

//export Excel
router.get('/exportAllProduct',AdminController.exportAllProduct);
router.get('/getYearListOrders',AdminController.getYearListOrders);
router.post('/orderAnalyticsSummary',AdminController.orderAnalyticsSummary);

//shipping Routes

router.get('/getAllCourierList/:id',ShippingController.getAllCourierList);
router.post('/insertOrder',ShippingController.insertOrderV2);
router.post('/getShippingRates',ShippingController.getShippingRates);
router.post('/manifestSingleOrder',ShippingController.manifestSingleOrder);
router.post('/getShipmentDataById',ShippingController.getShipmentDataById);
router.post('/getShipmentDataByIdV2',ShippingController.getShipmentDataByIdV2);
router.post('/getOrderShipTracking',ShippingController.getOrderShipTracking);
router.post('/cancelOrder',ShippingController.cancelOrder);






const storageUpload = multer({
  storage: multer.memoryStorage(), // Store file in memory for processing
  limits: {
    fileSize: 1000000, // Limit file size to 1MB
  },
  fileFilter(req, file, cb) {
    // Allow only specific image formats
    if (!file.originalname.match(/\.(png|jpg|jpeg|jfif|webp)$/i)) {
      return cb(new Error('Please upload a valid image (png, jpg, jpeg, jfif, webp)'));
    }
    cb(null, true);
  },
});

function generateRandomString() {
  // Generate a random UUID and use only the first 32 characters
  const randomString = uuidv4().replace(/-/g, ''); // Remove hyphens
  return randomString;
}

// router.post('/updateMetaBatch', async (req, res) => {
//   try {
//     // Get continuation token from query params (for pagination)
//     let continuationToken = req.body.ct || null;

//     const listCommand = new ListObjectsV2Command({
//       Bucket: config.AWS_BUCKET_NAME,
//       Prefix: "uploads/products/photos/",
//       MaxKeys: 1000,
//       ContinuationToken: continuationToken // If null, starts from the beginning
//     });

//     const { Contents, NextContinuationToken } = await s3.send(listCommand);

//     if (!Contents || Contents.length === 0) {
//       return res.json({ message: "No more files left to process!" });
//     }

//     let incorrectFiles = [];

//     for (const obj of Contents) {
//       if (obj.Key.endsWith(".webp")) {
//         try {
//           const headCommand = new HeadObjectCommand({
//             Bucket: config.AWS_BUCKET_NAME,
//             Key: obj.Key
//           });

//           const headResponse = await s3.send(headCommand);

//           if (headResponse.ContentType !== "image/webp") {
//             incorrectFiles.push(obj.Key);
//           }
//         } catch (error) {
//           console.error(`⚠️ Error checking ${obj.Key}:`, error.message);
//         }
//       }
//     }

//     if (incorrectFiles.length > 0) {
//       console.log(`Updating ${incorrectFiles.length} files...`);

//       for (const key of incorrectFiles) {
//         const copyCommand = new CopyObjectCommand({
//           Bucket: config.AWS_BUCKET_NAME,
//           CopySource: `/${config.AWS_BUCKET_NAME}/${key}`,
//           Key: key,
//           MetadataDirective: "REPLACE",
//           ContentType: "image/webp"
//         });

//         await s3.send(copyCommand);
//       }
//     }

//     console.log(`✅ Updated ${incorrectFiles.length} WebP images!`);

//     res.json({
//       message: `Processed ${Contents.length} images, updated ${incorrectFiles.length}.`,
//       nextContinuationToken: NextContinuationToken || null // Send next token if more images exist
//     });

//   } catch (err) {
//     console.error("❌ Error processing images:", err);
//     res.status(500).json({ error: "Something went wrong!" });
//   }
// });

router.post('/uploadImagesS3', storageUpload.single('image'), async (req, res, next) => {
  try {
    // Convert the uploaded image to WebP format using sharp
    const webpBuffer = await sharp(req.file.buffer)
      .webp() // Convert to WebP format
      .toBuffer();

    // Generate a dynamic file name based on timestamp and original name
    // const fileName = `${Date.now().toString()}-${req.file.originalname.split('.')[0]}.webp`;
    const fileName = `${generateRandomString()}.webp`;

    // Upload the WebP image to S3
    const uploadParams = {
      Bucket: 'yantra-bucket', // Your S3 bucket name
      Key: `${req.body.path}/${fileName}`, // Path in the S3 bucket
      Body: webpBuffer, // Converted image buffer
      ContentType: 'image/webp', // Content type for WebP images
    };

    // Upload the file to S3
    const data = await s3.putObject(uploadParams);

    // Respond with success message and S3 file URL
    // const imageUrl = `https://${uploadParams.Bucket}.s3.${AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    res.send({
      imageName: fileName,
      msg: 'Upload successful',
      status: 'ok',
    });
  } catch (error) {
    // Pass any errors to the error handler
    next(error);
  }
});


// const imageStorage = multer.diskStorage({
//   destination: "public/uploads/users/",
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });
// const imageUpload = multer({
//   storage: imageStorage,
//   limits: {
//     fileSize: 1000000, // 1000000 Bytes = 1 MB
//   },
//   fileFilter(req, file, cb) {
//     if (
//       !file.originalname.match(/\.(png|jpg|JPG|jpeg|JPEG|PNG|docx|jfif|xlsx)$/)
//     ) {
//       // upload only png and jpg format
//       return cb(new Error("Please upload a Image"));
//     }
//     cb(undefined, true);
//   },
// });

// router.post(
//   "/uploadImage",
//   imageUpload.single("image"),
//   (req, res) => {
//     res.send({
//       imageName: req.file.filename,
//       msg: "Upload succesfully",
//       status: "ok",
//     });
//   },
//   (error, req, res, next) => {
//     res.status(400).send({ error: error.message });
//   }
// );

const imageUserStorages3 = multerS3({
  s3: s3,
  bucket: 'yantra-bucket', // Replace with your bucket name
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, `uploads/users/${Date.now().toString()}-${file.originalname}`); // Save to images folder
  }
});

const imageBlogStorages3 = multerS3({
  s3: s3,
  bucket: 'yantra-bucket', // Replace with your bucket name
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, `uploads/blog-image/${Date.now().toString()}-${file.originalname}`); // Save to images folder
  }
});

const imageProductImagesStorages3 = multerS3({
  s3: s3,
  bucket: 'yantra-bucket', // Replace with your bucket name
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, `uploads/products/photos/${Date.now().toString()}-${file.originalname}`); // Save to images folder
  }
});

const imageProductMetaImagesStorages3 = multerS3({
  s3: s3,
  bucket: 'yantra-bucket', // Replace with your bucket name
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, `uploads/products/meta/${Date.now().toString()}-${file.originalname}`); // Save to images folder
  }
});

const imageProductPDFStorages3 = multerS3({
  s3: s3,
  bucket: 'yantra-bucket', // Replace with your bucket name
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, `uploads/products/pdf/${Date.now().toString()}-${file.originalname}`); // Save to images folder
  }
});

const imageReviewStorages3 = multerS3({
  s3: s3,
  bucket: 'yantra-bucket', // Replace with your bucket name
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, `uploads/review/thumbnails/${Date.now().toString()}-${file.originalname}`); // Save to images folder
  }
});

const imageBrandImagesStorages3 = multerS3({
  s3: s3,
  bucket: 'yantra-bucket', // Replace with your bucket name
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, `uploads/brands/${Date.now().toString()}-${file.originalname}`); // Save to images folder
  }
});

const imageCategoryImagesStorages3 = multerS3({
  s3: s3,
  bucket: 'yantra-bucket', // Replace with your bucket name
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, `uploads/categories/banner/${Date.now().toString()}-${file.originalname}`); // Save to images folder
  }
});

const imageCategoryIconImagesStorages3 = multerS3({
  s3: s3,
  bucket: 'yantra-bucket', // Replace with your bucket name
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, `uploads/categories/icon/${Date.now().toString()}-${file.originalname}`); // Save to images folder
  }
});


const imageProductImagesUpload = multer({
  storage: imageProductImagesStorages3,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(png|jpg|JPG|jpeg|JPEG|PNG|jfif|webp)$/)
    ) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

const imageProductMetaImagesUpload = multer({
  storage: imageProductMetaImagesStorages3,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(png|jpg|JPG|jpeg|JPEG|PNG|webp|jfif)$/)
    ) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

const imageProductPdfUpload = multer({
  storage: imageProductPDFStorages3,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(pdf)$/)
    ) {
      // upload only png and jpg format
      return cb(new Error("Please upload a PDF file"));
    }
    cb(undefined, true);
  },
});

const imageUserUpload = multer({
  storage: imageUserStorages3,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(png|jpg|JPG|jpeg|JPEG|PNG|jfif|webp)$/)
    ) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});


const imageBlogUpload = multer({
  storage: imageBlogStorages3,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(png|jpg|JPG|jpeg|JPEG|PNG|jfif|webp)$/)
    ) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

const imageReviewUpload = multer({
  storage: imageReviewStorages3,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(png|jpg|JPG|jpeg|JPEG|PNG|webp|jfif)$/)
    ) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

const imageBrandsUpload = multer({
  storage: imageBrandImagesStorages3,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(png|jpg|JPG|jpeg|JPEG|PNG|webp|jfif)$/)
    ) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

const imageCatBannerUpload = multer({
  storage: imageCategoryImagesStorages3,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(png|jpg|JPG|jpeg|JPEG|PNG|webp)$/)
    ) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

const imageCatIconUpload = multer({
  storage: imageCategoryIconImagesStorages3,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(png|jpg|JPG|jpeg|JPEG|PNG)$/)
    ) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});


router.post(
  "/uploadProductImages",
  imageProductImagesUpload.single("image"),
  (req, res) => {
    const imageName = req.file.key.split('/').pop(); 
    res.send({
      imageName: imageName,
      msg: "Upload succesfully",
      status: "ok",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.post(
  "/uploadProductMetaImages",
  imageProductMetaImagesUpload.single("image"),
  (req, res) => {
    const imageName = req.file.key.split('/').pop(); 
    res.send({
      imageName: imageName,
      msg: "Upload succesfully",
      status: "ok",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.post(
  "/uploadProductPDF",
  imageProductPdfUpload.single("image"),
  (req, res) => {
    const imageName = req.file.key.split('/').pop(); 
    res.send({
      imageName: imageName,
      msg: "Upload succesfully",
      status: "ok",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);


router.post(
  "/uploadUserImage",
  imageUserUpload.single("image"),
  (req, res) => {
    const imageName = req.file.key.split('/').pop(); 
    res.send({
      imageName: imageName,
      msg: "Upload succesfully",
      status: "ok",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.post(
  "/uploadBlogImage",
  imageUserUpload.single("image"),
  (req, res) => {
    const imageName = req.file.key.split('/').pop(); 
    res.send({
      imageName: imageName,
      msg: "Upload succesfully",
      status: "ok",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.post(
  "/uploadReviewImage",
  imageReviewUpload.single("image"),
  (req, res) => {
    const imageName = req.file.key.split('/').pop(); 
    res.send({
      imageName: imageName,
      msg: "Upload succesfully",
      status: "ok",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.post(
  "/uploadBrandImage",
  imageBrandsUpload.single("image"),
  (req, res) => {
    const imageName = req.file.key.split('/').pop(); 
    res.send({
      imageName: imageName,
      msg: "Upload succesfully",
      status: "ok",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.post(
  "/uploadCatBanner",
  imageCatBannerUpload.single("image"),
  (req, res) => {
    const imageName = req.file.key.split('/').pop(); 
    res.send({
      imageName: imageName,
      msg: "Upload succesfully",
      status: "ok",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.post(
  "/uploadCatIcon",
  imageCatIconUpload.single("image"),
  (req, res) => {
    const imageName = req.file.key.split('/').pop(); 
    res.send({
      imageName: imageName,
      msg: "Upload succesfully",
      status: "ok",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);


module.exports = router;