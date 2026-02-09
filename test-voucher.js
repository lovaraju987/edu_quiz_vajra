// Quick test script to create a sample voucher
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edu_quiz_vajra');

// Define Voucher schema
const voucherSchema = new mongoose.Schema({
    voucherCode: String,
    studentId: String,
    discountPercent: Number,
    expiryDate: Date,
    isRedeemed: Boolean,
    redeemedAt: Date,
    productId: mongoose.Schema.Types.ObjectId,
    status: String,
    quizDate: Date,
    rank: Number
});

const Voucher = mongoose.model('Voucher', voucherSchema);

// Create test voucher
async function createTestVoucher() {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now

    const voucher = await Voucher.create({
        voucherCode: 'TEST-VOUCHER-123',
        studentId: 'SUHASH',
        discountPercent: 50,
        expiryDate: expiryDate,
        isRedeemed: false,
        status: 'active',
        quizDate: new Date(),
        rank: 150
    });

    console.log('Test voucher created:', voucher);
    process.exit(0);
}

createTestVoucher().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
