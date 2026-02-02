import mongoose, { Schema, model, models } from 'mongoose';

const GiftSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true }, // Store URL for now
    createdAt: { type: Date, default: Date.now }
});

const Gift = models.Gift || model('Gift', GiftSchema);

export default Gift;
