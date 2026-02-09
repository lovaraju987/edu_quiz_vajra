import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
    productName: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Books', 'Gadgets', 'Accessories', 'Other']
    },
    originalPrice: { type: Number, required: true },
    imageUrl: { type: String },
    brand: { type: String },
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Index for filtering active products
ProductSchema.index({ isActive: 1, category: 1 });

const Product = models.Product || model('Product', ProductSchema);

export default Product as any;
