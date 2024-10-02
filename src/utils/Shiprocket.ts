import { Address, Order, Product, Cart } from "@prisma/client";
import { int } from "aws-sdk/clients/datapipeline";
import axios from "axios";
import { number, string, object } from "zod";

// Type Definitions
type CartItem = {
    cart_item_id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    color: string;
    product: Product;
};


type Bill = {
    subTotal: number;
    total: number;
    discount: number;
    deliveryFee: number;
    tax: number;
};

type User = {
    user_id: string;
    email: string;
    full_name: string | null;
    phone_number: string | null;
    cart: Cart[] ;
};

type PackageDetails = {
    delivery_postcode: string;
    weight: number;
    cod: number; // 1 for COD, 0 for Prepaid
    declared_value: number;
    pickup_address_location: string;
};

type Dimensions = {
    height: number;
    length: number;
    width: number;
}

type cartItemsWithWattDetails = {
  product_id: string;
  quantity: number;
  price: number;
  subTotal: number;
  discount: number;
  color: String;
  watt: number;
}

// Helper Function for Headers
const getShiprocketHeaders = () => ({
    Authorization: `Bearer ${process.env.SHIPROCKET_API_TOKEN}`
});

// Create Shiprocket Shipment
export const createShiprocketShipment = async (
  order: Order,
  user: User,
  cartItems: CartItem[],
  address: Address,
  totalWeight: number,
  dimensions: Dimensions,
  cartItemsWithWattDetails: cartItemsWithWattDetails[],
  pickup_location_name: string,
) => {
  try {
    // Define the GST rate (replace with the actual rate)
    const GST_RATE = 0.18; // 18% GST

    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      {
        order_id: order.order_id,
        order_date: order.order_date.toISOString(),
        pickup_location:pickup_location_name,
        billing_customer_name: user.full_name || '',
        billing_last_name: '',
        billing_address: address.street,
        billing_city: address.city,
        billing_pincode: address.postal_code,
        billing_state: address.state,
        billing_country: address.country,
        billing_email: user.email || '',
        billing_phone: user.phone_number || '',
        shipping_is_billing: true,
        order_items: cartItemsWithWattDetails.map((item) => {
          const matchingCartItem = cartItems.find(
            (ci) => ci.product_id === item.product_id
          );

          const basePrice = item.price; // Selling price without GST
          const gstInclusivePrice = basePrice * (1 + GST_RATE); // Inclusive of GST

          return {
            name: matchingCartItem?.product.name,
            sku: matchingCartItem?.product.SKU,
            units: item.quantity,
            selling_price: gstInclusivePrice.toFixed(2), // Price inclusive of GST, formatted to 2 decimal places
            discount: item.discount,
            color: item.color,
            watt: item.watt,
          };
        }),
        payment_method: order.payment_method,
        shipping_charges: order.shipping_charges,
        sub_total: (order.sub_total - order.discount + order.tax_amount).toFixed(2),
        weight: totalWeight,
        length: dimensions.length,
        breadth: dimensions.width,
        height: dimensions.height,
      },
      {
        headers: getShiprocketHeaders(),
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      // The request was made, and the server responded with a status code that falls out of the range of 2xx
      console.error('Shiprocket API responded with an error:', error.response.data);
      throw new Error(
        `Failed to create Shiprocket shipment. API Error: ${error.response.data.message || 'Unknown error'}`
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Shiprocket API:', error.request);
      throw new Error('Failed to create Shiprocket shipment. No response received from the Shiprocket API.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up the request to Shiprocket API:', error.message);
      throw new Error(`Failed to create Shiprocket shipment. Error: ${error.message}`);
    }
  }
};


// Select Best Courier
export const selectBestCourier = async (packageDetails: PackageDetails) => {
  try {
    // Fetch pickup location details
    
    const pickupResponse = await axios.get(
      'https://apiv2.shiprocket.in/v1/external/settings/company/pickup',
      { headers: getShiprocketHeaders() }
    );

    
    const pickupPincode = pickupResponse.data.data.shipping_address.find(
      (address: any) => address.pickup_location === packageDetails.pickup_address_location
    )?.pin_code;

    if (!pickupPincode) {
      throw new Error('Pickup pincode not found for the specified pickup address location.');
    }
    
    // Check courier serviceability
    const courierResponse = await axios.get(
      'https://apiv2.shiprocket.in/v1/external/courier/serviceability/',
      {
        headers: getShiprocketHeaders(),
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: packageDetails.delivery_postcode,
          cod: packageDetails.cod,
          weight: packageDetails.weight,
          declared_value: packageDetails.declared_value,
        },
      }
    );



    if (!courierResponse.data.data || !courierResponse.data.data.available_courier_companies.length) {
      console.error('No available courier companies for the selected route.');
      throw new Error('No available courier companies for the selected route.');
    }

    // Select the best courier
    const bestCourier = courierResponse.data.data.available_courier_companies.reduce(
      (prev: any, curr: any) => {
        if (curr.estimated_delivery_days <= 4) {
          if (!prev || curr.freight_charge < prev.freight_charge) {
            return curr;
          }
        }
        return prev;
      },
      null
    );

    if (!bestCourier) {
      console.error('No suitable courier found with delivery within 4 days.');
      throw new Error('No suitable courier found with delivery within 4 days.');
    }

    // Return best courier or handle AWB assign status
    if (bestCourier.awb_assign_status === 0) {
      console.error(
        `AWB assign error: ${bestCourier.response.data.awb_assign_error}`
      );
      throw new Error(
        `AWB assign error: ${bestCourier.response.data.awb_assign_error}`
      );
    }

    return bestCourier;
  } catch (error: any) {
    console.error('Error fetching Shiprocket courier partners:', error.message );
    throw new Error('Error fetching Shiprocket courier partners.');
  }
};


// Generate AWB Code
export const generateAWBCode = async (shipment_id: number, courier_id: number) => {
    try {
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
            { shipment_id, courier_id },
            { headers: getShiprocketHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error generating AWB code:', error);
        throw new Error('Failed to generate AWB code');
    }
};

// Generate Label
export const generateLabel = async (shipment_id: number) => {
    try {
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/courier/generate/label',
            { shipment_id: [shipment_id] },
            { headers: getShiprocketHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error generating Shiprocket label:', error);
        throw new Error('Failed to generate Shiprocket label');
    }
};

// Request Pickup
export const requestPickup = async (shipment_id: number) => {
    try {
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/courier/generate/pickup',
            { shipment_id: [shipment_id] },
            { headers: getShiprocketHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error requesting pickup:', error);
        throw new Error('Failed to request pickup');
    }
};

// Generate Manifest
export const generateManifest = async (shipment_id: number) => {
    try {
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/manifests/generate',
            { shipment_id: [shipment_id] },
            { headers: getShiprocketHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error generating manifest:', error);
        throw new Error('Error generating manifest');
    }
};

// Get Tracking
export const getTracking = async ( order_id : number,channel_id: number) => {
    try {
        const response = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${order_id}&channel_id=${channel_id}`, { headers: getShiprocketHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error tracking shipment:', error);
        throw new Error('Failed to track shipment');
    }
};

// Update Shiprocket Order
export const updateShiprocketOrder = async (shipmentId: number, payload: object) => {
    try {
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/pickups/create',
            { shipment_id: shipmentId, ...payload },
            { headers: getShiprocketHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating Shiprocket order:', error);
        throw new Error('Failed to update Shiprocket order');
    }
};

export const cancelShiprocketOrder = async (order_id: number) => {
    try {
        // const trackingResponse = await axios.get(
        //     `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${order_id}`,
        //     { headers: getShiprocketHeaders() }
        // );

        // const status = trackingResponse.data.current_status;
        // if (status === 'shipped' || status === 'in transit') {
        //     throw new Error('Order cannot be canceled as it is already shipped or in transit');
        // }

        const cancelResponse = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/orders/cancel',
            { "ids": [order_id] },
            { headers: getShiprocketHeaders() }
        );

        return cancelResponse;
    } catch (error) {
        console.error('Error while cancelling the order:', error);
        throw new Error('Failed to cancel order');
    }
};
