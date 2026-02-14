import mongoose, { Schema, model, models } from 'mongoose';

const GiftSchema = new Schema({
    productName: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, default: 'Gifts' },
    originalPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Prevent Mongoose OverwriteModelError
if (models.Gift) {
    delete models.Gift;
}

const Gift = model('Gift', GiftSchema);

export default Gift;
