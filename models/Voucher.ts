import mongoose, { Schema, model, models } from 'mongoose';

const VoucherSchema = new Schema({
    // Unified Schema Fields
    voucherCode: { type: String, required: true, unique: true, index: true }, // HEAD Preferred
    code: { type: String, unique: true, sparse: true }, // Backwards compat

    studentId: { type: String, required: true, index: true },
    studentName: { type: String },
    idNo: { type: String, required: true },

    discountPercent: { type: Number, default: 50 }, // HEAD Preferred
    discountPercentage: { type: Number }, // Backwards compat

    // Limits
    maxDiscount: { type: Number },
    minPurchase: { type: Number, default: 0 },
    applicableCategories: { type: [String], default: ['All'] },

    // Dates
    generatedDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true }, // HEAD Preferred
    expiry: { type: Date }, // Backwards compat

    // Status
    status: {
        type: String,
        enum: ['active', 'redeemed', 'expired'],
        default: 'active'
    },

    quizDate: { type: Date, required: true },
    rank: { type: Number },

    // Redemption
    isRedeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date },
    redeemedProduct: { type: Schema.Types.ObjectId, ref: 'Product' },

    // Payment Integration Fields
    paymentId: { type: String },
    orderId: { type: String }, // Razorpay order ID
    deliveryAddress: {
        fullName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        landmark: String
    },
    deliveryDetails: { // Backwards compat structure
        fullName: String,
        phone: String,
        address: String,
        city: String,
        pincode: String
    },
    cartItems: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number
    }]
}, { timestamps: true });

// Index for efficient queries
VoucherSchema.index({ studentId: 1, status: 1 });
VoucherSchema.index({ expiryDate: 1 });

const Voucher = models.Voucher || model('Voucher', VoucherSchema);

export default Voucher as any;
