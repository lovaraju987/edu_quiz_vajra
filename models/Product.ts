import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
    // Unified Product Fields
    productName: { type: String, required: true }, // HEAD Preferred
    name: { type: String }, // Alias/Backwards compat

    description: { type: String, required: true },

    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Books', 'Gadgets', 'Accessories', 'Other']
    },

    originalPrice: { type: Number, required: true }, // HEAD Preferred
    price: { type: Number }, // Alias/Backwards compat

    imageUrl: { type: String }, // HEAD Preferred
    image: { type: String }, // Alias/Backwards compat

    brand: { type: String },

    // Inventory & Status
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },

    // Additional Incoming Fields
    rating: { type: Number, default: 4.5 },
    features: [String],
    tags: [String],

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for filtering active products
ProductSchema.index({ isActive: 1, category: 1 });

const Product = models.Product || model('Product', ProductSchema);

export default Product as any;
