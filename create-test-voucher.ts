import dbConnect from './lib/db';
import Voucher from './models/Voucher';

async function createTestVoucher() {
    await dbConnect();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const voucher = await Voucher.create({
        voucherCode: 'QUIZ50-SUHASH-001',
        studentId: 'SUHASH',
        discountPercent: 50,
        expiryDate: expiryDate,
        isRedeemed: false,
        status: 'active',
        quizDate: new Date(),
        rank: 150
    });

    console.log('✅ Voucher created:', voucher);
    process.exit(0);
}

createTestVoucher().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
