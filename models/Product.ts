import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    features: [String],
    tags: [String]
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
