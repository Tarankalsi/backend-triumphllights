
import zod from "zod";

export const productSchema = zod.object({
    name: zod.string(),
    description: zod.string(),
    availability: zod.number(),
    SKU: zod.string().toUpperCase(),
    discount_percent: zod.number().optional(),
    material: zod.string().optional(),
    shape: zod.string().optional(),
    design_style: zod.string().optional(),
    fixture_form: zod.string().optional(),
    ideal_for: zod.string().optional(),
    power_source: zod.string().optional(),
    installation: zod.string().optional(),
    shade_material: zod.string().optional(),
    voltage: zod.string().optional(),
    light_color: zod.string().optional(),
    light_source: zod.string().optional(),
    light_color_temperature: zod.string().optional(),
    included_components: zod.string().optional(),
    lighting_method: zod.string().optional(),
    item_weight: zod.number(),
    height: zod.number(),
    length: zod.number(),
    width: zod.number(),
    quantity: zod.string().optional(),
    power_rating: zod.string().optional(),
    brightness: zod.string().optional(),
    controller_type: zod.string().optional(),
    switch_type: zod.string().optional(),
    switch_mounting: zod.string().optional(),
    mounting_type: zod.string().optional(),
    fixture_type: zod.string().optional(),
    assembly_required: zod.string().optional(),
    primary_material: zod.string().optional(),
    number_of_light_sources: zod.string().optional(),
    surge_protection: zod.string().optional(),
    shade_color: zod.string().optional(),
    key_features: zod.string().optional(),
    batteries: zod.string().optional(),
    embellishment: zod.string().optional(),
    colors: zod.array(
        zod.object({
            color_name: zod.string(),
            hex: zod.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
        })
    ),
    watts: zod.array(
        zod.object({
            watt: zod.number(),
            price: zod.number()
        })
    )
})

export const pdUpdateSchema = zod.object({
    name: zod.string().optional(),
    description: zod.string().optional(),
    availability: zod.number().optional(),
    SKU: zod.string().toUpperCase().optional(),
    material: zod.string().optional(),
    shape: zod.string().optional(),
    design_style: zod.string().optional(),
    fixture_form: zod.string().optional(),
    ideal_for: zod.string().optional(),
    power_source: zod.string().optional(),
    installation: zod.string().optional(),
    shade_material: zod.string().optional(),
    voltage: zod.string().optional(),
    light_color: zod.string().optional(),
    light_source: zod.string().optional(),
    light_color_temperature: zod.string().optional(),
    included_components: zod.string().optional(),
    lighting_method: zod.string().optional(),
    item_weight: zod.number().optional(),
    height: zod.number().optional(),
    length: zod.number().optional(),
    width: zod.number().optional(),
    quantity: zod.string().optional(),
    power_rating: zod.string().optional(),
    brightness: zod.string().optional(),
    controller_type: zod.string().optional(),
    switch_type: zod.string().optional(),
    switch_mounting: zod.string().optional(),
    mounting_type: zod.string().optional(),
    fixture_type: zod.string().optional(),
    assembly_required: zod.string().optional(),
    primary_material: zod.string().optional(),
    number_of_light_sources: zod.string().optional(),
    surge_protection: zod.string().optional(),
    shade_color: zod.string().optional(),
    key_features: zod.string().optional(),
    batteries: zod.string().optional(),
    embellishment: zod.string().optional(),
    colors: zod.array(
        zod.object({
            color_name: zod.string(),
            hex: zod.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
        })
    ).optional(),
    watts: zod.array(
        zod.object({
            watt: zod.number(),
            price: zod.number()
        })
    ).optional()
})


export const categorySchema = zod.object({
    name: zod.string(),
    description: zod.string().optional(),
})
export const updateCategorySchema = zod.object({
    name: zod.string().optional(),
    description: zod.string().optional(),
})

export const admin_signupSchema = zod.object({
    full_name: zod.string(),
    email: zod.string().email(),
    password: zod.string().min(6).optional(),
    role: zod.string().toUpperCase().optional()
});

export const admin_signinSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6)
});


export const reviewSchema = zod.object({
    rating: zod.number().int().min(0, { message: "Rating must be at least 0" }).max(5, { message: "Rating cannot exceed 5" }),
    review_text: zod.string(),
});

export const user_signupSchema = zod.object({
    full_name: zod.string(),
    email: zod.string().email()
})

export const otpVerificationSchema = zod.object({
    code: zod.string().length(6, 'Invalid OTP'),
})

export const user_signinSchema = zod.object({
    email: zod.string().email()
})

export const a_change_pass_1 = zod.object({
    email: zod.string().email()
})

export const a_change_pass_2 = zod.object({
    oldPassword: zod.string().min(6),
    newPassword: zod.string().min(6)
})

export const signedUrlImageSchema = zod.object({
    imageName: zod.string(),
    contentType: zod.string()
})

export enum OrderStatus {
    Processing = 'processing',
    Shipped = 'shipped',
    Delivered = 'delivered',
    Cancelled = 'cancelled',
    Returned = 'returned',
}

export enum PaymentMethod {
    CashOnDelivery = 'COD',
    UPI = 'upi',
    DebitCard = 'debit card',
    NetBanking = 'net banking',
    CreditCard = 'credit card',
    BankTransfer = 'bank transfer'
}


export const createOrderSchema = zod.object({
    payment_method: zod.enum([
        PaymentMethod.CashOnDelivery,
        PaymentMethod.CreditCard,
        PaymentMethod.DebitCard,
        PaymentMethod.BankTransfer,
        PaymentMethod.NetBanking,
        PaymentMethod.UPI
    ]),
    address_id: zod.string(),
})



export const addressSchema = zod.object({
    street: zod.string().optional(),
    city: zod.string().optional(),
    state: zod.string().optional(),
    postal_code: zod.string().optional(),
    country: zod.string().optional(),
    phone_number: zod
        .string()
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional() // Ensures exactly 10 digits
});


export const createCartSchema = zod.object({
    is_temporary: zod.boolean().optional()
})