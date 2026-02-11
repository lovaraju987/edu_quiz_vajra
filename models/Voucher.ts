import mongoose from 'mongoose';

const VoucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String },
    discountPercentage: { type: Number, required: true },
    maxDiscount: { type: Number },
    minPurchase: { type: Number, default: 0 },
    expiry: { type: Date, required: true },
    status: {
        type: String,
        enum: ['active', 'redeemed', 'expired'],
        default: 'active'
    },
    type: { type: String, default: 'quiz_reward' }, // quiz_reward, purchased

    // Usage details
    redeemedAt: { type: Date },
    orderId: { type: String },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

    // Payment tracking if relevant
    paymentId: { type: String },
    deliveryDetails: {
        fullName: String,
        phone: String,
        address: String,
        city: String,
        pincode: String
    }
}, { timestamps: true });

export default mongoose.models.Voucher || mongoose.model('Voucher', VoucherSchema);
