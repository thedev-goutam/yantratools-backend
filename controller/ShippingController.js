const axios = require("axios");
const config = require("../config/config");
const fs = require("fs");
const Order = require("../model/Order");
const OrderDetail = require("../model/OrderDetail");
const User = require("../model/User");
const Product = require("../model/Product");
const Category = require("../model/Category");
const SubCategory = require("../model/SubCategory");

const TOKEN_FILE = "token.json";

module.exports = {
  getAllCourierList: async (req, res) => {
    try {
      const token = await getToken();
      const courier = await axios.get(
        `${config.BIGSHIP_BASEURL}api/courier/get/all?shipment_category=${req.params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({ success: true, data: courier.data.data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  insertOrder: async (req, res) => {
    // try {
    const order = await Order.findOne({ code: req.body.orderId });
    const user = await User.findOne({ usr_id: order.user_id });
    const orderDetail = await OrderDetail.find({ order_id: order.ord_id });
   const COD_charges = order.cod_charges || 0;
   const full_with_discount = order.full_with_discount || 0;
    let shippingDetail = JSON.parse(order.shipping_address);
    let warehouse = {
      pickup_location_id: 149036,
      return_location_id: 149036,
    };

const restPayment = order.rest_payment || 0;

// Determine the payment mode
const isFullPrepaid = order.p_mode === 1;
const isPartialPayment = order.p_mode === 2;
const isFullCOD = order.p_mode === 3;

const prdDet = await Promise.all(
  orderDetail.map(async (order) => {
    const product = await Product.findOne({ prd_id: order.product_id });

    if (!product) {
      return res.status(500).json({ success: false, message: "No product Found" });
    }

    // Determine the correct collectable amount per product
    let collectableAmount = 0;
    if (isFullPrepaid) {
      collectableAmount = 0;
    } else if (isPartialPayment) {
      collectableAmount = Math.round(restPayment);
    } else if (isFullCOD) {
      const totalProducts = orderDetail.length;
      const codChargePerProduct = Math.round(COD_charges / totalProducts);
      collectableAmount = Math.round(order.price + codChargePerProduct);
    }

    return {
      product_category: "Others",
      product_name: product.name,
      product_quantity: order.quantity,
      each_product_invoice_amount: isFullCOD ? order.price + COD_charges : isFullPrepaid ? order.price - full_with_discount: order.price,
      each_product_collectable_amount: collectableAmount, // Correct collectable amount
    };
  })
);

// Calculate total invoice amount
const totalInvoiceAmount = prdDet.reduce((sum, p) => sum + p.each_product_invoice_amount, 0);

// Determine total collectable amount
let totalCollectableAmount = 0;
if (isFullPrepaid) {
  totalCollectableAmount = 0;
} else if (isPartialPayment) {
  totalCollectableAmount = restPayment;
} else if (isFullCOD) {
  totalCollectableAmount = totalInvoiceAmount;
}

// Extract first and last name
const nameParts = shippingDetail.name.trim().split(/\s+/);
const addressParts = splitStringIntoChunks(shippingDetail.address);
let userDetail = {
  first_name: nameParts[0],
  last_name: nameParts.length > 1 ? nameParts.slice(1).join(" ") : "n.a",
  company_name: "",
  contact_number_primary: user.phone,
  contact_number_secondary: shippingDetail.alt_phone,
  consignee_address: {
    address_line1: addressParts[0] ,
    address_line2:addressParts[1] ? addressParts[1] : '',
    pincode: shippingDetail.postal_code,
  },
};

let orderBody = {
  shipment_category: "b2c",
  warehouse_detail: warehouse,
  consignee_detail: userDetail,
  order_detail: {
    invoice_date: new Date().toISOString(),
    invoice_id: order.code,
    payment_type: isFullPrepaid ? "Prepaid" : isPartialPayment ? "Partial Payment" : "COD",
    shipment_invoice_amount: totalInvoiceAmount, 
    total_collectable_amount: totalCollectableAmount, // Corrected
    box_details: [
      {
        each_box_dead_weight: req.body.box_dead_weight,
        each_box_length: req.body.box_length,
        each_box_width: req.body.box_width,
        each_box_height: req.body.box_height,
        each_box_invoice_amount: totalInvoiceAmount,
        each_box_collectable_amount: totalCollectableAmount,
        box_count: 1,
        product_details: prdDet,
      },
    ],
    ewaybill_number: "",
    document_detail: {
      invoice_document_file: "",
      ewaybill_document_file: "",
    },
  },
};

    const token = await getToken();
    const response = await axios.post(
      `${config.BIGSHIP_BASEURL}api/order/add/single`,
      orderBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      const parts = response.data.data.split(" ");
      const systemOrderId = parts[parts.length - 1];

      await Order.updateOne(
        { ord_id: order.ord_id },
        {
          $set: {
            shipping_order_id: systemOrderId,
            shipping_status: "Unshipped",
          },
        }
      );
      res.status(201).json({
        success: true,
        data: response.data,
        message: "Order Created Successfully",
      });
    } else {
      res.status(200).json({ success: false, message: response.data.message });
    }
    // } catch (err) {
    //   res.status(500).json({ success: false, message: err.message });
    // }
  },

  insertOrderV2: async (req, res) => {
    try {
      const order = await Order.findOne({ code: req.body.orderId });
      const user = await User.findOne({ usr_id: order.user_id });
      const orderDetail = await OrderDetail.find({ order_id: order.ord_id });
  
      const COD_charges = order.cod_charges || 0;
      const full_with_discount = order.full_with_discount || 0;
      let shippingDetail = JSON.parse(order.shipping_address);
      let warehouse = {
        pickup_location_id: 149036,
        return_location_id: 149036,
      };
  
      const restPayment = order.rest_payment || 0;
      const splitNumber = req.body.split_number || 1; // Default to 1 if no split
  
      // Determine the payment mode
      const isFullPrepaid = order.p_mode === 1;
      const isPartialPayment = order.p_mode === 2;
      const isFullCOD = order.p_mode === 3;
  
      // Process product details
      const prdDet = await Promise.all(
        orderDetail.map(async (order) => {
          const product = await Product.findOne({ prd_id: order.product_id });
  
          if (!product) {
            return res.status(500).json({ success: false, message: "No product Found" });
          }
  
          // Determine the correct collectable amount per product
          let collectableAmount = 0;
          if (isFullPrepaid) {
            collectableAmount = 0;
          } else if (isPartialPayment) {
            collectableAmount = restPayment; // Split collectable amount
          } else if (isFullCOD) {
            const totalProducts = orderDetail.length;
            const codChargePerProduct = COD_charges / totalProducts;
            collectableAmount = (order.price + codChargePerProduct);
          }
  
          return {
            product_category: "Others",
            product_name: product.name,
            product_quantity: order.quantity, // Distribute quantity across splits
            each_product_invoice_amount: isFullCOD
              ? (order.price + COD_charges)
              : isFullPrepaid
              ? (order.price - full_with_discount)
              : order.price,
            each_product_collectable_amount: collectableAmount,
          };
        })
      );
  
      // Calculate total invoice amount
      const totalInvoiceAmount = prdDet.reduce((sum, p) => sum + p.each_product_invoice_amount, 0);
  
      // Determine total collectable amount
      let totalCollectableAmount = 0;
      if (isFullPrepaid) {
        totalCollectableAmount = 0;
      } else if (isPartialPayment) {
        totalCollectableAmount = restPayment;
      } else if (isFullCOD) {
        totalCollectableAmount = totalInvoiceAmount;
      }
  
      // Extract first and last name
      const nameParts = shippingDetail.name.trim().split(/\s+/);
      const addressParts = splitStringIntoChunks(shippingDetail.address);
      let userDetail = {
        first_name: nameParts[0],
        last_name: nameParts.length > 1 ? nameParts.slice(1).join(" ") : "n.a",
        company_name: "",
        contact_number_primary: user.phone,
        contact_number_secondary: shippingDetail.alt_phone,
        consignee_address: {
          address_line1: addressParts[0],
          address_line2: addressParts[1] ? addressParts[1] : "",
          pincode: shippingDetail.postal_code,
        },
      };
  
      // Loop to create multiple shipments based on split_number
      // const token = await getToken();
      let createdOrders = [];
  
      for (let i = 0; i < splitNumber; i++) {
        console.log(i,'--');
        
        let orderBody = {
          shipment_category: "b2c",
          warehouse_detail: warehouse,
          consignee_detail: userDetail,
          order_detail: {
            invoice_date: new Date().toISOString(),
            invoice_id: `${order.code}-Package-${i + 1}`, // Unique invoice ID for each split
            payment_type: isFullPrepaid ? "Prepaid" : ((isPartialPayment || isFullCOD) && i === 0) ? "COD" : "Prepaid",
            shipment_invoice_amount: totalInvoiceAmount,
            total_collectable_amount: i === 0 ? totalCollectableAmount : 0,
            box_details: [
              {
                each_box_dead_weight: req.body.split_number == 1 ? req.body.box_dead_weight : req.body.dimensionList[i].weight ,
                each_box_length: req.body.split_number == 1 ?  req.body.box_length : req.body.dimensionList[i].length ,
                each_box_width: req.body.split_number == 1 ?  req.body.box_width : req.body.dimensionList[i].width ,
                each_box_height: req.body.split_number == 1 ?  req.body.box_height : req.body.dimensionList[i].height ,
                each_box_invoice_amount: totalInvoiceAmount,
                each_box_collectable_amount: i === 0 ? totalCollectableAmount : 0,
                box_count: 1,
                product_details: prdDet,
              },
            ],
            ewaybill_number: "",
            document_detail: {
              invoice_document_file: "",
              ewaybill_document_file: "",
            },
          },
        };
        console.log('---------------------');
  
        // console.log(orderBody,'orderBody');
        console.log(orderBody.order_detail.box_details,'orderBody');

        console.log('---------------------');

        
        // const response = await axios.post(
        //   `${config.BIGSHIP_BASEURL}api/order/add/single`,
        //   orderBody,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );
  
        // if (response.data.success) {
        //   const parts = response.data.data.split(" ");
        //   const systemOrderId = parts[parts.length - 1];
  
        //   await Order.updateOne(
        //     { ord_id: order.ord_id },
        //     {
        //       $push: {
        //         shipping_order_ids: systemOrderId, // Store multiple order IDs
        //       },
        //       shipping_status: "Unshipped",
        //     }
        //   );
  
        //   createdOrders.push({
        //     success: true,
        //     system_order_id: systemOrderId,
        //     message: `Split Order ${i + 1} Created Successfully`,
        //   });
        // } else {
        //   createdOrders.push({
        //     success: false,
        //     message: `Split Order ${i + 1} Failed: ${response.data.message}`,
        //   });
        // }
      }
  
      res.status(201).json({
        success: true,
        data: createdOrders,
        message: "Split Orders Processed",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },  

  getShippingRates: async (req, res) => {
    try {
      const token = await getToken();
      const courier = await axios.get(
        `${config.BIGSHIP_BASEURL}api/order/shipping/rates?shipment_category=${req.body.shipment_category}&system_order_id=${req.body.system_order_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({ success: true, data: courier.data.data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  manifestSingleOrder: async (req, res) => {
    let body = {
      system_order_id: req.body.system_order_id,
      courier_id: req.body.courier_id,
    };
    const token = await getToken();
    const response = await axios.post(
      `${config.BIGSHIP_BASEURL}api/order/manifest/single`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      await Order.updateOne(
        { ord_id: req.body.order_id },
        { $set: { shipping_status: "Shipped" } }
      );
      res.status(200).json({
        success: true,
        data: response.data,
        message: "Order Shipped Successfully",
      });
    } else {
      res.status(200).json({ success: false, message: response.data.message });
    }
  },
  getShipmentDataById: async (req, res) => {
    try {
      const token = await getToken();
      const courierResponse = await axios.post(
        `${config.BIGSHIP_BASEURL}api/shipment/data`,
        {},
        {
          params: {
            shipment_data_id: req.body.shipment_data_id,
            system_order_id: req.body.system_order_id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { data } = courierResponse;
      if (!data.success) {
        return res.status(200).json({ success: false, message: data.message });
      }

      const { shipment_data_id, order_id } = req.body;
      const { master_awb, res_FileContent, res_FileName, res_MediaType } =
        data.data || {};

      switch (shipment_data_id) {
        case 1:
          await Order.updateOne(
            { ord_id: order_id },
            { $set: { awb: master_awb, shipping_status: "AWB Generated" } }
          );
          return res.status(200).json({
            success: true,
            message: "Order AWB Generated Successfully",
          });

        case 2:
          await Order.updateOne(
            { ord_id: order_id },
            { $set: { awb: master_awb, shipping_status: "Label Generated" } }
          );
          if (res_FileContent) {
            const labelPdf = Buffer.from(res_FileContent, "base64");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${res_FileName}.pdf`
            );
            res.setHeader("Content-Type", res_MediaType);
            return res.send(labelPdf);
          }
          break;

        case 3:
          await Order.updateOne(
            { ord_id: order_id },
            { $set: { shipping_status: "Manifest Generated" } }
          );
          if (res_FileContent) {
            const manifestPdf = Buffer.from(res_FileContent, "base64");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${res_FileName}.pdf`
            );
            res.setHeader("Content-Type", res_MediaType);
            return res.send(manifestPdf);
          }
          break;

        default:
          return res
            .status(400)
            .json({ success: false, message: "Invalid shipment_data_id" });
      }
    } catch (error) {
      console.error("Error fetching shipment data:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getShipmentDataByIdV2: async (req, res) => {
    try {
      const token = await getToken();
      const courierResponse = await axios.post(
        `${config.BIGSHIP_BASEURL}api/shipment/data`,
        {},
        {
          params: {
            shipment_data_id: req.body.shipment_data_id,
            system_order_id: req.body.system_order_id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { data } = courierResponse;
      if (!data.success) {
        return res.status(200).json({ success: false, message: data.message });
      }

      const { shipment_data_id, order_id } = req.body;
      const { master_awb, res_FileContent, res_FileName, res_MediaType } =
        data.data || {};

      switch (shipment_data_id) {
        case 1:
          await Order.updateOne(
            { ord_id: order_id },
            { $set: { awb: master_awb, shipping_status: "AWB Generated" } }
          );
          return res.status(200).json({
            success: true,
            message: "Order AWB Generated Successfully",
          });

        case 2:
          await Order.updateOne(
            { ord_id: order_id },
            { $set: { awb: master_awb, shipping_status: "Label Generated" } }
          );
          if (res_FileContent) {
            const labelPdf = Buffer.from(res_FileContent, "base64");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${res_FileName}.pdf`
            );
            res.setHeader("Content-Type", res_MediaType);
            return res.send(labelPdf);
          }
          break;

        case 3:
          await Order.updateOne(
            { ord_id: order_id },
            { $set: { shipping_status: "Manifest Generated" } }
          );
          if (res_FileContent) {
            const manifestPdf = Buffer.from(res_FileContent, "base64");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${res_FileName}.pdf`
            );
            res.setHeader("Content-Type", res_MediaType);
            return res.send(manifestPdf);
          }
          break;

        default:
          return res
            .status(400)
            .json({ success: false, message: "Invalid shipment_data_id" });
      }
    } catch (error) {
      console.error("Error fetching shipment data:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getOrderShipTracking: async (req, res) => {
    try {
      const token = await getToken();
      const courier = await axios.get(
        `${config.BIGSHIP_BASEURL}api/tracking?tracking_type=${req.body.tracking_type}&tracking_id=${req.body.tracking_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({ success: true, data: courier.data.data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  cancelOrder: async (req, res) => {
    const token = await getToken();
    const response = await axios.put(
      `${config.BIGSHIP_BASEURL}api/order/cancel`,
      req.body.awbs,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      await Order.updateOne(
        { ord_id: req.body.order_id },
        { $set: { shipping_status: "Order Cancel" } }
      );
      return res.status(200).json({
        success: true,
        message: "Order Canceled Successfully",
      });
    } else {
      res.status(200).json({ success: false, message: response.data.message });
    }
    // } catch (err) {
    //   res.status(500).json({ success: false, message: err.message });
    // }
  },
};

async function getToken() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const fileContent = fs.readFileSync(TOKEN_FILE, "utf8");

      // Handle empty or corrupted file
      if (!fileContent.trim()) {
        console.warn("⚠️ Token file is empty, generating new token...");
        return await generateToken();
      }

      const tokenData = JSON.parse(fileContent);
      const currentTime = Math.floor(Date.now() / 1000);

      if (tokenData.token && currentTime < tokenData.expiry) {
        console.log("✅ Using cached token from file");
        return tokenData.token;
      }
    }

    console.log("⚠️ Token expired or file missing, generating new one...");
    return await generateToken();
  } catch (err) {
    console.error("❌ Error reading token file:", err);
    return await generateToken(); // Generate new token if file read fails
  }
}

function splitStringIntoChunks(str, chunkSize = 50) {
  // Remove special characters (keeping only letters, numbers, and spaces)
  str = str.replace(/[^a-zA-Z0-9\s]/g, '');

  let chunks = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
  }
  return chunks;
}
async function generateToken() {
  try {
    const response = await axios.post(
      `${config.BIGSHIP_BASEURL}api/login/user`,
      {
        user_name: config.BIGSHIP_EMAIL,
        password: config.BIGSHIP_PASSWORD,
        access_key: config.BIGSHIP_ACCESS_KEY,
      },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { token } = response.data.data;
    const expiry = Math.floor(Date.now() / 1000) + 43200; // 12 hours from now

    // Ensure token file is written safely
    fs.writeFileSync(
      TOKEN_FILE,
      JSON.stringify({ token, expiry }, null, 2),
      "utf8"
    );
    return token;
  } catch (err) {
    console.error("❌ Error generating token:", err);
    throw err;
  }
}
