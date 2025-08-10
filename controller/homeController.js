const productModel = require("../model/Product");
const categoryModel = require("../model/Category");
const sellerModel = require("../model/Seller");
const homeCategory = require("../model/HomeCategory");
const bannerModel = require("../model/Banner");
const brandModel = require("../model/Brand");
const sliderModel = require("../model/Slider");
const Wishlist = require('../model/Wishlist');
const subcategoryModel = require("../model/SubCategory");
const subsubcategoryModel = require("../model/SubSubCategory");
const generalsettingModel = require("../model/GenralSetting");
const shopModel = require("../model/Shop");
const orderModel = require("../model/Order");
const orderDetailModel = require("../model/OrderDetail");
const userModel = require("../model/User");
const cmsModel = require("../model/Cms");
const questionModel = require("../model/Question");
const reviewModel = require("../model/Reviews");
const policyModel = require("../model/Policy");
const blogModel = require("../model/Blog");
const businessSettingModel = require('../model/BusinessSetting');
const currencyModel = require('../model/Currency');
const countryModel = require('../model/Country');
const paymentModeModel = require('../model/PaymentModes');
const RequestCallback = require("../model/RequestCallback");
const BulkPurchaseEnquiry = require("../model/BulkPurchaseEnquiry");
const Reviews = require("../model/Reviews");
const Questions = require("../model/Question");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  getFeatureSection: async (req, res) => {
    try {
      const k = await productModel.find({ featured: 1, published: 1 });
      res.status(200).json({success: true, data: k });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },
  getBestSelling: async (req, res) => {
    try {
      const products = await productModel
        .find({ published: 1, is_best_selling:1 })
        .sort({ created_at: -1 })
        .limit(12);

        const parsedProducts = products.map(product => {
          return {
              ...product.toObject(),
              photos: JSON.parse(product.photos)
          };

          
        });
      res.status(200).json({ success: true, data: parsedProducts });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },

  getHomeCategoryProducts: async (req, res) => {
    try {
      const homeCategoryId = req.params.catId;

      const products = await productModel
        .find({
          published: 1,
          category_id: homeCategoryId,
        })
        .sort({ prd_id: -1 })
        .limit(12);

      res.status(200).json({ success: true, data: products });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  },

  getVerifiedSellers: async (req, res) => {
    try {
      const sellers = await sellerModel.find({ verification_status: 1 });

      res.status(200).json({ success: true, data: sellers });
    } catch (err) {
      console.error("Error fetching verified sellers:", err);
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  },
  getTodaysDealProducts: async (req, res) => {
    try {
      const products = await productModel.find({
        published: 1,
        todays_deal: 1,
      });

      const parsedProducts = products.map(product => {
        return {
            ...product.toObject(),
            photos: JSON.parse(product.photos)
        };
    });

      res.status(200).json({ success: true, data: parsedProducts });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  },
  getFeaturedCategory: async (req, res) => {
    try {
      const categories = await categoryModel.find({ featured: 1 }).limit(7);

      res.status(200).json({ success: true, data: categories });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  },
  getBestSellingv2: async (req, res) => {
    try {
      const products = await productModel.find({
        published: 1,
        featured: 1,
      }).limit(12);

      const parsedProducts = products.map(product => {
        return {
            ...product.toObject(),
            photos: JSON.parse(product.photos)
        };
    });

      res.status(200).json({ success: true, data: parsedProducts });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  },

  getHomeCategoryWithProducts: async(req,res)=>{
    try {
      // Step 1: Fetch all home categories with status 1
      const homeCategories = await homeCategory.find({ status: 1 });
  
      if (!homeCategories || homeCategories.length === 0) {
        return res.status(404).json({ success: false, message: 'No Home Categories found' });
      }
  
      // Step 2: Extract category IDs from home categories
      const categoryIds = homeCategories.map((cat) => cat.category_id);
  
      // Step 3: Fetch all categories and products in a single batch query
      const categories = await categoryModel.find({ category_id: { $in: categoryIds } }).select("name slug category_id list_banner");
      const products = await productModel
        .find({ published: 1, category_id: { $in: categoryIds } })
        .sort({ createdAt: -1 });
  
      // Step 4: Map categories and products to their respective home categories
      const categoryMap = categories.reduce((map, cat) => {
        map[cat.category_id] = cat;
        return map;
      }, {});
  
      const productsByCategory = products.reduce((map, product) => {
        if (!map[product.category_id]) {
          map[product.category_id] = [];
        }
        map[product.category_id].push({
          ...product.toObject(),
          photos: JSON.parse(product.photos),
        });
        return map;
      }, {});
      
      // Step 5: Assemble the final response
      const categoriesWithProducts = homeCategories.map((homeCat) => ({
        homeCategory: {
          ...homeCat.toObject(),
          category_name: categoryMap[homeCat.category_id]?.name || null,
          category_slug: categoryMap[homeCat.category_id]?.slug || null,
          category_banner: categoryMap[homeCat.category_id]?.list_banner || null,
          category_link: '/category/'+categoryMap[homeCat.category_id]?.slug || null
        },
        products: (productsByCategory[homeCat.category_id] || []).slice(0, 12), // Limit to 12 products
      }));
  
      res.status(200).json({ success: true, data: categoriesWithProducts });
    } catch (err) {
      console.error('Error fetching home categories with products:', err);
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
  },
  getBottomBanner : async(req,res) => {
    try {
      const banners = await bannerModel.find({ position: 2, published: 1 }).select('photo url');

      res.status(200).json({ success: true, data: banners });
  } catch (err) {
      console.error('Error fetching banners:', err);
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
  },
  getTop10Category: async(req, res) => {
    try {
      const categories = await categoryModel.find({ top: 1 }).select('slug banner name');

      res.status(200).json({ success: true, data: categories });
  } catch (err) {
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
  },
  getTop10Brands:async(req,res)=>{
    try {
      const brands = await brandModel.find({ top: 1 });

      res.status(200).json({ success: true, data: brands });
  } catch (err) {
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
  },
  getHomeCategoryWithLimt:async(req,res)=>{
    try {
      // Step 1: Fetch categories with a limit of 11
      const categories = await categoryModel.find({}).limit(11).select('category_id slug name icon');
  
      if (!categories || categories.length === 0) {
        return res.status(404).json({ success: false, message: 'No categories found' });
      }
  
      // Step 2: Extract category IDs for batch fetching
      const categoryIds = categories.map((cat) => cat.category_id);
  
      // Step 3: Fetch all subcategories for the categories in a single query
      const subcategories = await subcategoryModel.find({ category_id: { $in: categoryIds } }).select('name slug category_id sub_cat_id');
  
      // Step 4: Extract subcategory IDs for batch fetching sub-subcategories
      const subcategoryIds = subcategories.map((subcat) => subcat.sub_cat_id);
  
      // Step 5: Fetch all sub-subcategories for the subcategories in a single query
      const subSubcategories = await subsubcategoryModel.find({ sub_category_id: { $in: subcategoryIds } }).select('name slug sub_sub_cat_id sub_category_id');
  
      // Step 6: Map sub-subcategories to their respective subcategories
      const subSubcategoryMap = subSubcategories.reduce((map, subSub) => {
        if (!map[subSub.sub_category_id]) {
          map[subSub.sub_category_id] = [];
        }
        map[subSub.sub_category_id].push(subSub);
        return map;
      }, {});
  
      // Step 7: Map subcategories to their respective categories with sub-subcategories
      const subcategoryMap = subcategories.reduce((map, subcat) => {
        if (!map[subcat.category_id]) {
          map[subcat.category_id] = [];
        }
        map[subcat.category_id].push({
          ...subcat.toObject(),
          subSubcategories: subSubcategoryMap[subcat.sub_cat_id] || [],
        });
        return map;
      }, {});
  
      // Step 8: Attach subcategories to their respective categories
      const categoriesWithSubcategories = categories.map((cat) => ({
        ...cat.toObject(),
        subcategories: subcategoryMap[cat.category_id] || [],
      }));
  
      res.status(200).json({ success: true, data: categoriesWithSubcategories });
    } catch (err) {
      console.error('Error fetching categories with subcategories:', err);
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
  },
  getAllCategoriesPage:async(req,res)=>{
    try {
      const categories = await categoryModel.find({});
      const categoriesWithSubcategories = await Promise.all(categories.map(async (cat) => {
        // Count products in this category
        const categoryProductCount = await productModel.countDocuments({ category_id: cat.category_id });
        const subcategories = await subcategoryModel.find({ category_id: cat.category_id });
        const subcategoriesWithSubSubcategories = await Promise.all(subcategories.map(async (subcat) => {
          // Count products in this subcategory
          const subcategoryProductCount = await productModel.countDocuments({ subcategory_id: subcat.sub_cat_id });
          const subSubcategories = await subsubcategoryModel.find({ sub_category_id: subcat.sub_cat_id });
          const subSubcategoriesWithCount = await Promise.all(subSubcategories.map(async (subsub) => {
            const subSubcategoryProductCount = await productModel.countDocuments({ subsubcategory_id: subsub.sub_sub_cat_id });

            return {
              ...subsub.toObject(),
              productCount: subSubcategoryProductCount
            };
          }));

          return {
            ...subcat.toObject(),
            productCount: subcategoryProductCount,
            subSubcategories: subSubcategoriesWithCount
          };
        }));

        return {
          ...cat.toObject(),
          productCount: categoryProductCount,
          subcategories: subcategoriesWithSubSubcategories
        };
      }));


      res.status(200).json({ success: true, data: categoriesWithSubcategories });
  } catch (err) {
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
  },
  getHomeDealWithFeatureCat:async(req,res) =>{
    try {
           // Fetch products where published is 1 and todays_deal is 1
        //    const todaysDealProducts = await productModel.find({ 
        //     published: 1, 
        //     todays_deal: 1 
        // }).sort({createdAt:-1}).select('slug photos discount unit_price name');
        const todaysDealProducts = await productModel.aggregate([
        {
          $match: {
            published: 1,
            todays_deal: 1
          }
        },
        {
          $addFields: {
            discount_percent: {
              $multiply: [
                { $divide: ["$discount", "$unit_price"] },
                100
              ]
            }
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $project: {
            slug: 1,
            photos: 1,
            discount: 1,
            unit_price: 1,
            name: 1,
            discount_percent: { $round: ["$discount_percent", 2] } // round to 2 decimals
          }
        }
      ]);
  
        const parsedProducts = todaysDealProducts.map(product => {
          return {
              ...product,
              photos: JSON.parse(product.photos),
          };
      });
  
        const todaysDealProductsCount = await productModel.countDocuments({ 
          published: 1, 
          todays_deal: 1 
      });
  
        // Send the results in a single response
        res.status(200).json({ 
            success: true, 
            data: {
                todaysDealProducts:parsedProducts,
                count:todaysDealProductsCount,
            } 
        });
      // const results = await productModel.aggregate([
      //   {
      //     $match: {
      //       published: 1,
      //       todays_deal: 1
      //     }
      //   },
      //   {
      //     $sort: { createdAt: -1 } // Sort by latest
      //   },
      //   {
      //     $facet: {
      //       todaysDealProducts: [
      //         { $limit: 100 }, // Optional: Limit results if necessary
      //         {
      //           $addFields: {
      //             photos: { $ifNull: [{ $cond: [{ $isArray: "$photos" }, "$photos", { $literal: [] }] }, []] }
      //           }
      //         }
      //       ],
      //       count: [{ $count: "total" }]
      //     }
      //   }
      // ]);
      
      // const todaysDealProducts = results[0].todaysDealProducts || [];
      // const count = results[0].count[0]?.total || 0;
      
      // res.status(200).json({
      //   success: true,
      //   data: {
      //     todaysDealProducts,
      //     count
      //   }
      // });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
  },
  getAllSliders:async function(req, res){
    try {
      const publishedSliders = await sliderModel.find({ 
        published: 1 
    }).select('photo slider_id title subtitle');
      res.status(200).json({ success: true, data: publishedSliders });
    } catch (err) {
  
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
},
getAllFeatureCategories:async function(req, res){
  try {
    const featuredCategories = await categoryModel.find({ 
      featured: 1 
  }).limit(7).select('name slug banner');
    res.status(200).json({ success: true, data: featuredCategories });
  } catch (err) {

    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
},

  getGeneralSetting:async(req,res)=>{
    try {
      const generalSetting = await generalsettingModel.findOne({});
      // console.log(generalSetting,'--');
      res.status(200).json({ success: true, data: generalSetting });
    } catch (err) {
      console.error('Server Error:', err);
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
  },
  getAllCategories:async function(req, res){
      try {
        const categories = await categoryModel.find({});
        res.status(200).json({ success: true, data: categories });
      } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
      }
  },
  getAllCountries:async function(req, res){
    try {
      const country = await countryModel.find({});
      res.status(200).json({ success: true, data: country });
    } catch (err) {
      console.error('Server Error:', err);
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
},
  getAllBrands:async function(req, res){
    try {
      const brand = await brandModel.find({}).select('name slug logo brand_id');
      res.status(200).json({ success: true, data: brand });
    } catch (err) {
      console.error('Server Error:', err);
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
},
  getNavSearch:async function(req, res){
    try {
      const keywords = [];
      const searchTerm = req.body.search;
      const reservedSymbols = ['-', '+', '<', '>', '@', '(', ')', '~'];
      let sanitizedSearchTerm = searchTerm;
  
      reservedSymbols.forEach(symbol => {
        sanitizedSearchTerm = sanitizedSearchTerm.split(symbol).join(' ');
      });
  
      const searchValues = sanitizedSearchTerm.split(/\s+/).filter(value => value);
  
      // Find products with the search term in tags
      const productsByTags = await productModel.find({
        published: 1,
        $or: searchValues.map(value => ({
          tags: { $regex: value, $options: 'i' }
        }))
      });
  
      // Extract keywords from products' tags
      productsByTags.forEach(product => {
        product.tags.split(',').forEach(tag => {
          if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
            if (!keywords.includes(tag.toLowerCase()) && keywords.length <= 100) {
              keywords.push(tag.toLowerCase());
            }
          }
        });
      });
  
      // Filter products by name
      // const filteredProducts = await productModel.find({
      //   published: 1,
      //   $or: [
      //     { name: { $regex: searchTerm, $options: 'i' } },
      //     { description: { $regex: searchTerm, $options: 'i' } },
      //     { tags: { $regex: searchTerm, $options: 'i' } }
      //   ]
      // }).limit(10);
      function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }

      const conditions = { published: 1 };

      if (searchTerm) {
        const terms = searchTerm.trim().split(/\s+/).map(escapeRegex);

        const andClauses = terms.map(term => {
          const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, "i");
          return {
            $or: [
              { name: { $regex: wordBoundaryRegex } },
              { description: { $regex: wordBoundaryRegex } },
              { tags: { $regex: wordBoundaryRegex } }
            ]
          };
        });

        conditions.$and = andClauses;
      }

      const filteredProducts = await productModel.find(conditions).limit(10);
  
      // Find sub-subcategories
      const subsubcategories = await subsubcategoryModel.find({
        name: { $regex: searchTerm, $options: 'i' }
      }).limit(10);
  
      // Find verified seller IDs
      const verifiedSellersId = await getVerifiedSellersId();
  
      // Find shops
      const shops = await shopModel.find({
        user_id: { $in: verifiedSellersId },
        name: { $regex: searchTerm, $options: 'i' }
      }).limit(10);
  
      // Render the view or return the result
      if (keywords.length > 0 || subsubcategories.length > 0 || filteredProducts.length > 0 || shops.length > 0) {
         return res.status(200).json({
          success: true,
          products: filteredProducts,
          subsubcategories,
          keywords,
          shops
        });
      }
      return res.status(404).json({success: false});
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
  },
  getOrderbyOrderCode:async(req,res)=>{

    try{

      const order = await orderModel.findOne({code:req.body.code});
      if(!order){
        res.status(404).json({ success: false, message: 'No order found with the provided code. Please check and try again.' });
      }
      const userOrder = await userModel.findOne({usr_id:order.user_id});
      let parsedOrder = order.toObject(); 
      parsedOrder.paredAddress = JSON.parse(order.shipping_address);
      order.paredAddress = JSON.parse(order.shipping_address);
      const orderDetail = await orderDetailModel.find({order_id:order.ord_id});
  
      const orderDetailWithProduct = await Promise.all(orderDetail.map(async (ordd) => {
        const product = await productModel.find({prd_id: ordd.product_id});
        const shippiedByWithProduct = await Promise.all(product.map(async (prd)=>{
          // console.log(prd);
          const shipper = await userModel.findOne({usr_id:prd.user_id});
          // console.log(shipper);
  
          return {
            ...prd.toObject(),
            shipper_name : shipper.name,
          }
        }));
  
        return {
           ...ordd.toObject(),
           products:shippiedByWithProduct
  
        }
  
      }));
  
      res.status(200).json({ success: true, data: {order:parsedOrder,orderDetail:orderDetailWithProduct,userDetail:{email:userOrder.email}} });

    }
    catch(err){
      res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }

  },
  searchQuery:async(req,res) => {
    try {
      const query = req.body.q;
      const sort_by = req.body.sort_by;
      let min_price = req.body.min_price;
      let max_price = req.body.max_price;
      const seller_id = req.body.seller_id;
      const page = parseInt(req.body.pageNo) || 1;
      const limit = parseInt(req.body.limit) || 12;
      const skip = (page - 1) * limit;
      let conditions = { published: 1};
      let fixedMinPrice = 0;
      let fixedMaxPrice = 0;

      // const regexQuery = new RegExp(query.split(' ').join('|'), 'i');


      // if (query) {
      //     conditions.$or = [
      //         { name: { $regex: query, $options: 'i' } },
      //         { description: { $regex: query, $options: 'i' } },
      //         { tags: { $regex: query, $options: 'i' } }
      //     ];
      // }

  //   if (query) {
  //     conditions.$or = [
  //         { name: { $regex: regexQuery } },
  //         { description: { $regex: regexQuery } },
  //         { tags: { $regex: regexQuery } }
  //     ];
  // }
      function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    
      if (query) {
        // split into individual words, ignore extra spaces
        const terms = query.trim().split(/\s+/).map(escapeRegex); // e.g., ["water","pump","3","inch","petrol"]

        // build an $and where each term must match at least one of the fields
        const andClauses = terms.map(term => {
          const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, "i");
          return {
            $or: [
              { name: { $regex: wordBoundaryRegex } },
              { description: { $regex: wordBoundaryRegex } },
              { tags: { $regex: wordBoundaryRegex } }
            ]
          };
        });

        conditions.$and = andClauses;
      }

      const brand = await brandModel.findOne({ slug: req.body.brand });
      if (brand) {
          conditions.brand_id = brand.brand_id;
      }
      const req_brands = req.body.brand;
      if (Array.isArray(req_brands) && req_brands.length > 0) {
          const filter_brands = await brandModel.find({ brand_id: { $in: req_brands } });          
          if (filter_brands.length > 0) {
              let brandIds = filter_brands.map(b => b.brand_id);              
              conditions.brand_id = { $in: brandIds };
          }
      }

      const req_ratings = req.body.rating;
      if (Array.isArray(req_ratings) && req_ratings.length > 0) {
          const minRating = Math.min(...req_ratings);
          conditions.rating = { $gte: minRating };
      }

      const priceRangeStrings = req.body.price_ranges;
      if (Array.isArray(priceRangeStrings) && priceRangeStrings.length > 0) {
        const priceConditions = priceRangeStrings.map(range => {
          const [minStr, maxStr] = range.split('-');
          const min = Number(minStr.trim());
          const max = maxStr.trim();

          if (max === '*' || max=='Above') {
            return { unit_price: { $gte: min } }; // e.g., 10000 and above
          } else {
            return { unit_price: { $gte: min, $lte: Number(max) } }; // bounded range
          }
        });

        conditions.$or = priceConditions;
      }

      if (seller_id) {
          const seller = await sellerModel.findOne({seller_id:seller_id});
          if (seller) {
              conditions.user_id = seller.user_id;
          }
      }
      
      const category = await categoryModel.findOne({ slug: req.body.category });
      if (category) {
          conditions.category_id = category.category_id;
          const catProductCount = await productModel.find(conditions).countDocuments();
          category = { ...category.toObject(), count: catProductCount};
      }

      let subcategory = await subcategoryModel.findOne({ slug: req.body.subcategory });

      if (subcategory) {
        const subCatId = subcategory.sub_cat_id;
        conditions.subcategory_id = subCatId;

        const subCatProductCount = await productModel.countDocuments(conditions);

        // Fetch related category
        let relatedCategory = await categoryModel.findOne({ category_id: subcategory.category_id });

        // Fetch related sub-subcategories
        let relatedSubcategories = await subsubcategoryModel.find({ sub_category_id: subCatId });

        // Add count to each related sub-subcategory
        if (relatedSubcategories && relatedSubcategories.length > 0) {
          // Use Promise.all for proper async handling
          relatedSubcategories = await Promise.all(
            relatedSubcategories.map(async (catitem) => {
              const count = await productModel.countDocuments({ subsubcategory_id: catitem.sub_sub_cat_id, published: 1 });
              return {
                ...catitem.toObject(),
                count,
              };
            })
          );
        }

        // Attach category info and counts
        if (relatedCategory) {
          const relCatProductCount = await productModel.countDocuments({ category_id: relatedCategory.category_id, published: 1 });
          relatedCategory = {
            ...relatedCategory.toObject(),
            count: relCatProductCount,
          };

          subcategory = {
            ...subcategory.toObject(),
            count: subCatProductCount,
            category: relatedCategory,
            subsubcategory: relatedSubcategories,
          };
        }
      }

      let subsubcategory = await subsubcategoryModel.findOne({ slug: req.body.subsubcategory });
      if (subsubcategory) {
        conditions.subsubcategory_id = subsubcategory.sub_sub_cat_id;
        const prodCount1 = await productModel.find(conditions).countDocuments();
        const relatedSubcategory = await subcategoryModel.findOne({ sub_cat_id: subsubcategory.sub_category_id });
        if (relatedSubcategory) {
            const prodCount2 = await productModel.find({subcategory_id:relatedSubcategory.sub_cat_id, published:1}).countDocuments();
            const relatedCategory = await categoryModel.findOne({ category_id: relatedSubcategory.category_id });
            if (relatedCategory) {
                const prodCount3 = await productModel.find({category_id:relatedCategory.category_id, published:1}).countDocuments();
                subsubcategory = {
                    ...subsubcategory.toObject(),
                    subcategory: { ...relatedSubcategory.toObject(), category: {...relatedCategory.toObject(), count: prodCount3}, count: prodCount2 },
                    count: prodCount1
                };
            } else {
                subsubcategory = { ...subsubcategory.toObject(), subcategory: relatedSubcategory };
            }
        }

          
      }      
      
      let productsQuery = productModel.find(conditions);      
      // if (min_price && max_price) {
      //     productsQuery = productsQuery.where('unit_price').gte(min_price).lte(max_price);
      // }
      // else{
      //    min_price = await productModel.findOne(conditions).sort({ unit_price: 1 }).select('unit_price');
      //    max_price = await productModel.findOne(conditions).sort({ unit_price: -1 }).select('unit_price')
      // }

      // if (query) {
      //     productsQuery = productsQuery.or([
      //       { name: { $regex: query, $options: 'i' } },
      //       { description: { $regex: query, $options: 'i' } },
      //       { tags: { $regex: query, $options: 'i' } }
      //     ]);
      // }

      if (sort_by) {
          switch (sort_by) {
              case '1':
                  productsQuery = productsQuery.sort({ created_at: -1 });
                  break;
              case '2':
                  productsQuery = productsQuery.sort({ created_at: 1 });
                  break;
                  case '3':
                    productsQuery = productsQuery.sort({ purchase_price: 1 });
                    break;
                    case '4':
                      productsQuery = productsQuery.sort({ purchase_price: -1 });
                      break;
                      default:
                        break;
          }
        }

        const products = await productsQuery.skip(skip).limit(limit);

        const parsedProducts = products.map(product => {
          return {
              ...product.toObject(),
              photos: JSON.parse(product.photos)
          };
      });

        const total = await productModel.find(conditions).countDocuments();
        const ratings = await productModel.distinct('rating', conditions);
        const roundedRatingsSet = new Set();
        ratings.forEach(r => {
          if (typeof r === 'number') {
            const rounded = Math.round(r);
            if (rounded >= 1 && rounded <= 5) {
              roundedRatingsSet.add(rounded);
            }
          }
        });        
        const brandIds = await productModel.distinct('brand_id', conditions);
        let brands = await brandModel
          .find({ brand_id: { $in: brandIds } })
          .select('brand_id name logo slug');

        brands = await Promise.all(
          brands.map(async (brand) => {
            // Create a copy of conditions so it doesn't overwrite for all brands
            const brandCondition = { ...conditions, brand_id: brand.brand_id };
            const prodBrndCount1 = await productModel.countDocuments(brandCondition);

            return {
              ...brand.toObject(),
              count: prodBrndCount1
            };
          })
        );
        const ratingRanges = Array.from(roundedRatingsSet).sort((a, b) => b - a);
        // const non_paginate_products = await productsQuery;
        
        // let attributes = [];
      // for (const product of non_paginate_products) {
      //     if (product.attributes && Array.isArray(JSON.parse(product.attributes))) {
      //         for (const attr of JSON.parse(product.attributes)) {
      //             let attribute = attributes.find(a => a.id === attr);
      //             if (!attribute) {
      //                 attribute = { id: attr, values: [] };
      //                 attributes.push(attribute);
      //             }
      //             const choice_options = JSON.parse(product.choice_options);
      //             const choice_option = choice_options.find(c => c.attribute_id === attr);
      //             if (choice_option) {
      //                 for (const value of choice_option.values) {
      //                     if (!attribute.values.includes(value)) {
      //                         attribute.values.push(value);
      //                     }
      //                 }
      //             }
      //         }
      //     }
      // }

      // let selected_attributes = [];
      // for (const attribute of attributes) {
      //     if (req.body['attribute_' + attribute.id]) {
      //         for (const value of req.body['attribute_' + attribute.id]) {
      //             const str = `"${value}"`;
      //             productsQuery = productsQuery.where('choice_options', new RegExp(str));
      //         }
      //         selected_attributes.push({
      //             id: attribute.id,
      //             values: req.body['attribute_' + attribute.id]
      //         });
      //     }
      // }


      let cms_content = '';
      if (req.body.category) {
          const cat_id = await categoryModel.findOne({ slug: req.body.category });
          if (cat_id) {
              cms_content = await cmsModel.find({ category: cat_id.category_id, blog_type: 1 });
          }
      }
      if (req.body.subcategory) {
          const subcat_id = await subcategoryModel.findOne({ slug: req.body.subcategory });
          if (subcat_id) {
              cms_content = await cmsModel.find({ sub_category: subcat_id.sub_cat_id, blog_type: 2 });
          }
      }
      if (req.body.subsubcategory) {
          const sub_subcat_id = await subsubcategoryModel.findOne({ slug: req.body.subsubcategory });
          if (sub_subcat_id) {
              cms_content = await cmsModel.find({ sub_sub_category: sub_subcat_id.sub_sub_cat_id, blog_type: 3 });
          }
      }

      // console.log(parsedProducts,'--');

      fixedMinPrice = await productModel.findOne(conditions).sort({ unit_price: 1 }).select('unit_price');
      fixedMaxPrice = await productModel.findOne(conditions).sort({ unit_price: -1 }).select('unit_price')
      const priceStep = 2000;
      const priceRanges = [];
      for (let price = fixedMinPrice.unit_price; price <= fixedMaxPrice.unit_price; price += priceStep) {
        priceRanges.push(price);
      }
      return res.json({
        success:true,
        products:parsedProducts,
          query,
          category: category ? category : null,
          subcategory: subcategory ? subcategory : null,
          subsubcategory: subsubcategory ? subsubcategory : null,
          brand: brand ? brand : null,
          brands: brands ? brands : null,
          sort_by,
          seller_id,
          min_price,
          max_price,
          fixedMinPrice,
          fixedMaxPrice,
          price_ranges: priceRanges,
          ratings: ratingRanges,
          // attributes,
          // selected_attributes,
          cms_content,
          total
      });
  } catch (error) {
      // console.error(error);
      res.status(500).json({ message: error });
  }
  },
  getCategoryDetails: async(req, res) => {
    try {
      let cms_content = '';
      const cat_slug = req.params.cat_slug;
      const category = await categoryModel.findOne({ slug: cat_slug }).select('category_id name banner icon slug meta_title meta_description');
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      cms_content = await cmsModel.find({ category: category.category_id, blog_type: 1 });
      //Find all subcategories for this category
      const subcategories = await subcategoryModel.find({category_id:category.category_id}).select('sub_cat_id name slug meta_title meta_description');
      //For each subcategory, fetch related products
      const subcategoriesWithProducts = await Promise.all(
      subcategories.map(async (subcat) => {
        const rawProducts = await productModel
          .find({ subcategory_id: subcat.sub_cat_id })
          .select('prd_id name price slug photos unit_price purchase_price discount rating is_best_selling current_stock')
          .limit(12);
        const productCount = await productModel.countDocuments({ subcategory_id: subcat.sub_cat_id });
        const products = rawProducts.map(product => {
          const parsedProduct = product.toObject();
          try {
            parsedProduct.photos = JSON.parse(parsedProduct.photos || '[]');
          } catch (err) {
            parsedProduct.photos = [];
          }
          return parsedProduct;
        });
        const link = '/category/'+category.slug+'/'+subcat.slug;
        return {
          ...subcat.toObject(),
          category_link: link,
          products: products,
          productCount: productCount
        };
      })
    );
      const respData = {
        category: category,
        subcategories: subcategoriesWithProducts,
        cms_content
      }
      res.status(200).json({ success: true, data: respData });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
  },
  getSubCategoryDetails: async(req, res) => {
    try {
      const cat_slug = req.params.cat_slug;
      const subcategory = await subcategoryModel.findOne({ slug: cat_slug }).select('sub_cat_id category_id name slug meta_title meta_description');
      if (!subcategory) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      
      const category = await categoryModel.findOne({ category_id: subcategory.category_id }).select('category_id name banner icon slug meta_title meta_description');
      const category_link = '/category/'+category.slug;
      const respData = {
        category: category,
        subcategory: subcategory,
        category_link: category_link       
      }
      res.status(200).json({ success: true, data: respData });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
  },
  getAllSubCatbyCat: async (req, res) => {
    try {
      const id = req.params.id;

      const subcat = await subcategoryModel.find({category_id:id})

      res.status(200).json({ success: true, data: subcat });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  },
  getAllSubSubCatbySubCat: async (req, res) => {
    try {
      const id = req.params.id;

      const subsubcat = await subsubcategoryModel.find({sub_category_id:id})

      res.status(200).json({ success: true, data: subsubcat });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  },
  getProductDetails: async (req, res) => {
    try {
    const { product_referral_code } = req.query;
 
        const detailedProduct = await productModel.findOne({ slug: req.params.id });

        let relatedFilter = {prd_id: { $ne: detailedProduct.prd_id },published:1};

        if(detailedProduct.category_id){relatedFilter.category_id = detailedProduct.category_id;}
        if(detailedProduct.subcategory_id){relatedFilter.subcategory_id = detailedProduct.subcategory_id}
        if(detailedProduct.subsubcategory_id){relatedFilter.subsubcategory_id = detailedProduct.subsubcategory_id}

        if (!detailedProduct || !detailedProduct.published) {
            // return res.status(404).send('Product not found or not published');
            return res.status(200).json({ success: false, data: [] });
        }

        let [
            brand,
            category,
            subCategory,
            subSubCategory,
            user,
            shop,
            seller,
            relatedProduct
        ] = await Promise.all([
            brandModel.findOne({brand_id:detailedProduct.brand_id}).select('logo name slug'),
            categoryModel.findOne({category_id:detailedProduct.category_id}).select('name slug'),
            subcategoryModel.findOne({sub_cat_id:detailedProduct.subcategory_id}).select('name slug'),
            subsubcategoryModel.findOne({sub_sub_cat_id:detailedProduct.subsubcategory_id}).select('name'),
            userModel.findOne({usr_id:detailedProduct.user_id}).select('usr_id name user_type'),
            shopModel.findOne({user_id:detailedProduct.user_id}).select('name'),
            sellerModel.findOne({user_id:detailedProduct.user_id}),
            productModel.find(relatedFilter).sort({ num_of_sale: -1 }).select('name slug photos unit_price discount rating current_stock').limit(30)
        ]);

        if (product_referral_code) {
            res.cookie('product_referral_code', product_referral_code, { maxAge: 43200 * 1000 });
            res.cookie('referred_product_id', detailedProduct._id.toString(), { maxAge: 43200 * 1000 });
        }

        let photos = [];
   
        if (detailedProduct.photos) {
            photos = JSON.parse(detailedProduct.photos);
        }

        let is_wishlist = false;        
        if(req.query.user_id){
          const check = await Wishlist.countDocuments({user_id:req.query.user_id,product_id:detailedProduct.prd_id});
          if(check > 0){
            is_wishlist = true;
          }
        }        

        const parsedProducts = await Promise.all(
          relatedProduct.map(async product => {
            let rel_wishlist = false;

            if (req.query.user_id) {
              const check = await Wishlist.countDocuments({
                user_id: req.query.user_id,
                product_id: product.prd_id, // use the current product, not detailedProduct
              });
              if (check > 0) {
                rel_wishlist = true;
              }
            }

            // safe parse for photos
            let photos;
            try {
              photos = JSON.parse(product.photos);
            } catch (e) {
              photos = []; // or fallback however you want
            }

            return {
              ...product.toObject(),
              photos,
              is_wishlist:rel_wishlist,
            };
          })
        );

        // Convert photos to WebP if needed
        // if (detailedProduct.photos && detailedProduct.photos.length > 0) {
        //     if (/\.(jpg|jpeg|png)$/i.test(JSON.parse(detailedProduct.photos)[0])) {
        //         await convertJpegUrlToWebP(detailedProduct.photos, detailedProduct._id);
        //         await detailedProduct.save();
        //     }
        // }

        // console.log(relatedProduct,'--');
        
        // Fresh data after conversion
        const freshProduct = await productModel.findOne({prd_id:detailedProduct.prd_id});

        const data = {
          detailedProduct: {
            ...freshProduct.toObject(),
            photos,
            is_wishlist
        },
            category_name: category?.name,
            sub_cat_name: subCategory?.name,
            sub_sub_cat_name: subSubCategory?.name,
            brand_name: brand?.name,
            brand_logo: brand?.logo,
            brand_slug: brand?.slug,
            category_slug: category?.slug,
            sub_cat_slug: subCategory?.slug,
            user,
            shop,
            seller,
            relatedProduct:parsedProducts
        };
        res.status(200).json({ success: true, data: data });

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }

  },

  getRelatedProductsPagination:async(req,res)=>{
    let size = req.body.size || 5;
    let pageNo = req.body.pageNo || 1; 
    let filter = {prd_id: { $ne: req.body.prd_id },published:1};
    if(req.body.cat_id){
      filter.category_id = req.body.cat_id;
    }
    if(req.body.sub_cat_id){
      filter.subcategory_id = req.body.sub_cat_id
    }
    if(req.body.sub_sub_cat_id){
      filter.subsubcategory_id = req.body.sub_sub_cat_id
    }
    const query={};
    query.skip = Number(size * (pageNo - 1));
    query.limit = Number(size) || 0;
    const sort = { purchase_price: 1,num_of_sale:-1 };
    const totalP = await productModel.countDocuments(filter);
    if(totalP>0){
      const prdts = await productModel.find(filter).select('name slug photos unit_price discount rating current_stock').sort(sort).skip(query.skip).limit(query.limit);
      const parsedProducts = prdts.map(product => {
        return {
            ...product.toObject(),
            photos: JSON.parse(product.photos)
        };
    });
        res.status(200).json({success:true,data:parsedProducts,total:totalP});
    }else{
        res.status(200).json({success:false,data:[],total:totalP}); 
    }

  },
  getPageContent: async (req, res) => {
    try {
      const id = req.params.id;

      const policy = await policyModel.findOne({name:id}).select('content')

      res.status(200).json({ success: true, data: policy });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  },
  getAllReviewsByProduct: async function (req, res) { 
  try {
    let id = req.body.id;
    let size = req.body.size || 2;
    let pageNo = req.body.pageNo || 1;

    const query = {};
    query.skip = Number(size * (pageNo - 1));
    query.limit = Number(size) || 0;
    const sort = { review_id: -1 };

    const totalR = await reviewModel.countDocuments({ product_id: id, status: 1 });

    // Calculate average rating
    const avgRatingAgg = await reviewModel.aggregate([
      { $match: { product_id: id, status: 1 } },
      { $group: {
        _id: "$product_id",
        avgRating: { $avg: "$rating" }
      }}
    ]);

    const avgRating = avgRatingAgg.length > 0 ? avgRatingAgg[0].avgRating : 0;

    if (totalR > 0) {
      const review = await reviewModel.find({ product_id: id, status: 1 })
        .sort(sort)
        .skip(query.skip)
        .limit(query.limit);

      const enrichedReviews = await Promise.all(
        review.map(async (review) => {
          const userId = review.user_id;

          const userInfo = await userModel.findOne({ usr_id: userId }).select('name avatar_original');

          // Fetch orders for the user with `payment_status` = 'paid'
          const userOrders = await orderModel.find({
            user_id: userId,
            payment_status: 'paid'
          });

          let isVerifiedPurchase = false;

          for (const order of userOrders) {
            const orderDetails = await orderDetailModel.find({
              order_id: order.ord_id,
              product_id: id
            });

            if (orderDetails.length > 0) {
              isVerifiedPurchase = true;
              break;
            }
          }

          return {
            ...review.toObject(),
            isVerifiedPurchase,
            userInfo
          };
        })
      );

      res.status(200).json({
        success: true,
        data: enrichedReviews,
        total: totalR,
        averageRating: avgRating
      });
    } else {
      res.status(200).json({
        success: false,
        data: [],
        total: totalR,
        averageRating: 0
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}
,
getAllQuestionByProduct: async function (req, res) {
  let id = req.body.id
  let size = req.body.size || 5;
  let pageNo = req.body.pageNo || 1; 
  const query={};
  query.skip = Number(size * (pageNo - 1));
  query.limit = Number(size) || 0;
  const sort = { blog_id: -1 };
  const totalQ = await questionModel.countDocuments({product_id:id,status:1});
  if(totalQ>0){
      const question = await questionModel.find({product_id:id,status:1}).sort(sort).skip(query.skip).limit(query.limit);

      const questionWithUserPromises = question.map(async ques => {
        if(ques.user_id > 0){
          const user = await userModel.findOne({usr_id:ques.user_id});
          return {
            ...ques.toObject(),
            user
        };
        }
        else{
          return {
            ...ques.toObject()
          }
        }
       
   
    });

    const questionWithUser = await Promise.all(questionWithUserPromises);

    // console.log(questionWithUser,'-question');
    

      res.status(200).json({success:true,data:questionWithUser,total:totalQ});
  }else{
      res.status(200).json({success:false,data:[],total:totalQ}); 
  }
 
},
  getAllBlog: async function (req, res) {
    let size = req.body.size || 10;
    let pageNo = req.body.pageNo || 1; 
    const query={};
    query.skip = Number(size * (pageNo - 1));
    query.limit = Number(size) || 0;
    const sort = { blog_id: -1 };
    const totalBlog = await blogModel.countDocuments({});
    if(totalBlog>0){
        const blog = await blogModel.find({}).sort(sort).skip(query.skip).limit(query.limit);
        res.status(200).json({success:true,data:blog,total:totalBlog});
    }else{
        res.status(200).json({data:[{}],total:totalBlog}); 
    }
   
},
getBlogBySlug: async function (req, res) {
  try{
      const {id:slug} = req.params;

      const user = await blogModel.findOne({blog_slug:slug});

      const recent = await blogModel.find().sort({blog_id:-1}).select('blog_title blog_slug');
      
      res.status(200).json({success:true,data:user,recent});

  } catch(err){
      res.status(500).json({ msg:err }) 
  }
},
getBusinessSettingByType: async function (req, res) {
  try{
      const {id} = req.params;

      const bs = await businessSettingModel.findOne({type:id});

      res.status(200).json({success:true,data:bs});

  } catch(err){
      res.status(500).json({ msg:err }) 
  }
},
getCurrencyById: async function (req, res) {
  try{
      const {id} = req.params;

      const curr = await currencyModel.findOne({currency_id:id});

      res.status(200).json({success:true,data:curr});

  } catch(err){
      res.status(500).json({ msg:err }) 
  }
},
getPaymentByAmount: async function (req, res) {
  try{
      const {id} = req.params;

      const amount = await paymentModeModel.findOne({amount:id});

      res.status(200).json({success:true,data:amount});

  } catch(err){
      res.status(500).json({ msg:err }) 
  }
},
getAllSellerWithShop:async function(req, res){
  try {
    const sellerwithoutShop = await sellerModel.find({});

    const sellerWithPromises = sellerwithoutShop.map(async seller => {
        const shop = await shopModel.findOne({user_id:seller.user_id}).select('name');
        return {
          ...seller.toObject(),
          shop
      };
  });

  const sellerWithShop = await Promise.all(sellerWithPromises);

  // console.log(sellerWithShop,'-');
  

    res.status(200).json({ success: true, data: sellerWithShop });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
},
insertRequestCallBack:async function (req, res){
  try{
    const lastId = await RequestCallback.findOne().sort({rc_id:-1});
    // console.log(lastId);
    // return;
    
    let reqBody = {};
  
    if(lastId){
      reqBody = {
        rc_id: Number(lastId.rc_id) + 1,
        name:req.body.name,
        phone:req.body.phone,
        email:req.body.email,
        message:req.body.message,
        product_id:req.body.product_id
       };
    }
    else{
      reqBody = {
        rc_id: 1,
        name:req.body.name,
        phone:req.body.phone,
        email:req.body.email,
        message:req.body.message,
        product_id:req.body.product_id
       };
    }
  
    const reqc = await RequestCallback.create(reqBody);
    res.status(200).json({ success: true, msg:'You will be contacted Shortly..' });
  }
  catch(err){
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
 

  
},
bulkPurchaseEnquiry:async function(req, res) {
  try{
    const lastId = await BulkPurchaseEnquiry.findOne().sort({bulk_id:-1});
    // console.log(lastId);
    // return;
    
    let reqBody = {};
  
    if(lastId){
      reqBody = {
        bulk_id: Number(lastId.bulk_id) + 1,
        name:req.body.name,
        phone:req.body.phone,
        email:req.body.email,
        pincode:req.body.pincode,
        city:req.body.city,
        state:req.body.state,
        remark:req.body.remark,
        urgency:req.body.urgency,
        quality:req.body.quality,
        target_price:req.body.target_price,
        product_id:req.body.product_id
       };
    }
    else{
      reqBody = {
        bulk_id: 1,
        name:req.body.name,
        phone:req.body.phone,
        email:req.body.email,
        pincode:req.body.pincode,
        city:req.body.city,
        state:req.body.state,
        remark:req.body.remark,
        urgency:req.body.urgency,
        quality:req.body.quality,
        target_price:req.body.target_price,
        product_id:req.body.product_id
       };
    }
  
    const reqc = await BulkPurchaseEnquiry.create(reqBody);
    res.status(200).json({ success: true, msg:'You will be contacted Shortly..' });
  }
  catch(err){
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
},

insertReview:async function (req, res){
  // console.log(req.body);
  // return
  try{
    
    let reqBody = {};
    if(req.body.token){
      jwt.verify(token, "mySecretToken", (err, decodedToken) => {
        if (err) return res.sendStatus(403);
        reqBody.user_id = decodedToken.user.usr_id;
        next();
      });
    }
    else{
      reqBody.user_id = req.body.user_id;
    }

    const lastId = await Reviews.findOne().sort({review_id:-1});

  
    if(lastId){
      reqBody = {
        review_id: Number(lastId.review_id) + 1,
        user_id: reqBody.user_id,
        product_id:req.body.product_id,
        name:req.body.token ? null : req.body.name,
        rating:req.body.rating,
        comment:req.body.comment,
        image:req.body.image,
        status:req.body.status,
        viewed:req.body.viewed
       };
    }
    else{
      reqBody = {
        review_id: 1,
        user_id: reqBody.user_id,
        product_id:req.body.product_id,
        name:req.body.token ? null : req.body.name,
        rating:req.body.rating,
        comment:req.body.comment,
        image:req.body.image,
        status:req.body.status,
        viewed:req.body.viewed
       };
    }
  
    const review = await Reviews.create(reqBody);
    res.status(200).json({ success: true, msg:'You Review has been recorded..' });
  }
  catch(err){
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
 

  
},
insertQuestion:async function (req, res){
  // console.log(req.body);
  // return
  
  try{
    
    let reqBody = {};
    if(req.body.token){
      jwt.verify(token, "mySecretToken", (err, decodedToken) => {
        if (err) return res.sendStatus(403);
        reqBody.user_id = decodedToken.user.id;
        next();
      });
    }
    else{
      reqBody.user_id = null;
    }

    const lastId = await Questions.findOne().sort({question_id:-1});

    if(lastId){
      reqBody = {
        question_id: Number(lastId.question_id) + 1,
        product_id:req.body.product_id,
        name:req.body.token ? null : req.body.name,
        questions:req.body.questions,
        status:req.body.status,
        viewed:req.body.viewed
       };
    }
    else{
      reqBody = {
        question_id: 1,
        product_id:req.body.product_id,
        name:req.body.token ? null : req.body.name,
        questions:req.body.questions,
        status:req.body.status,
        viewed:req.body.viewed
       };
    }
  
    const question = await Questions.create(reqBody);
    res.status(200).json({ success: true, msg:'You Question has been recorded..' });
  }
  catch(err){
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
 

  
}

};


async function getVerifiedSellersId() {
  try {
    const verifiedSellers = await sellerModel.find({ verification_status: 1 }).select('user_id');
    return verifiedSellers.map(seller => seller.user_id);
  } catch (err) {
    console.error('Error fetching verified sellers:', err);
    throw err;
  }
}