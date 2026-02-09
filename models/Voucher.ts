import mongoose, { Schema, model, models } from 'mongoose';

const VoucherSchema = new Schema({
    voucherCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String },
    idNo: { type: String, required: true },
    discountPercent: { type: Number, default: 50 },
    generatedDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true }, // 30 days from generation
    isRedeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date },
    redeemedProduct: { type: Schema.Types.ObjectId, ref: 'Product' },
    status: {
        type: String,
        enum: ['active', 'redeemed', 'expired'],
        default: 'active'
    },
    quizDate: { type: Date, required: true }, // date of quiz that earned this voucher
    rank: { type: Number }, // student's rank when voucher was generated

    // Payment Integration Fields
    paymentId: { type: String }, // Razorpay payment ID
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
    cartItems: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number
    }]
});

// Index for efficient queries
VoucherSchema.index({ studentId: 1, status: 1 });
VoucherSchema.index({ expiryDate: 1 });

const Voucher = models.Voucher || model('Voucher', VoucherSchema);

export default Voucher as any;
