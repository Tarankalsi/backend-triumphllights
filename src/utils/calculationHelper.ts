import { Address, Product, ProductWatt } from "@prisma/client"
import { selectBestCourier } from "./Shiprocket";


type CartItem = {
    cart_item_id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    color: string;
    product: Product;
    watt: ProductWatt | null | undefined;
};

export const billing = async (cartItems: CartItem[], address: Address, tax: number, pickup_location_name: string) => {
    // Validate watt field in cartItems
    const invalidCartItem = cartItems.find(item => item.watt === null || item.watt === undefined);
    if (invalidCartItem) {
        throw new Error(`Cart item with ID ${invalidCartItem.cart_item_id} has an undefined or null watt.`);
    }

    const bill = {
        subTotal: 0,
        total: 0,
        discount: 0,
        deliveryFee: 0,
        tax: 0
    };

    const totalWeight = calculateCartWeight(cartItems);
    
    const courier_partner = await selectBestCourier({
        delivery_postcode: address.postal_code,
        weight: totalWeight,
        cod: 1, // 1 for COD, 0 for Prepaid
        declared_value: bill.total,
        pickup_address_location: pickup_location_name,
    });

    bill.deliveryFee = courier_partner.rate;

    // Calculate subtotal
    cartItems.forEach((cartItem) => {
        if (cartItem.watt) {
            bill.subTotal += cartItem.watt.price * cartItem.quantity;

            // Assuming discount is a percentage applied to each product's price
            if (cartItem.product.discount_percent > 0) {
                bill.discount += (cartItem.watt.price * cartItem.product.discount_percent / 100) * cartItem.quantity;
            }
        }else {
            throw new Error(`Product watt details not found for product sku : ${cartItem.product.SKU}`);
        }
    });

    // Calculate total
    bill.tax = (bill.subTotal * (tax / 100));
    bill.total = bill.subTotal + bill.deliveryFee + bill.tax - bill.discount;

    return bill;
};

export const calculateCartWeight = (cartItems: CartItem[]) => {
    let weight = 0;  // Initialize weight to 0
    cartItems.forEach((cartItem) => {
        weight += (cartItem.product.item_weight / 1000) * cartItem.quantity;  // Correct accumulation
    });
    return weight;
};