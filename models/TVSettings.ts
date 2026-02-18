
import mongoose, { Schema, model, models } from 'mongoose';

const TVSettingsSchema = new Schema({
    // Section 1: Main Slides (The big background images)
    slides: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        imageUrl: { type: String, required: true },
        badge: { type: String, default: 'Feature' },
        isActive: { type: Boolean, default: true }
    }],

    // Section 2: Scroller 1 (Gifts/Products)
    scrollerOne: [{
        name: { type: String, required: true },
        imageUrl: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    }],

    // Section 3: Scroller 2 (Brands/Vouchers)
    scrollerTwo: [{
        name: { type: String, required: true },
        imageUrl: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    }],

    // Section 4: Header Ads
    headerAds: [{
        title: { type: String },
        imageUrl: { type: String }, // Removed required: true to allow drafts
        link: { type: String },
        isActive: { type: Boolean, default: true }
    }],

    updatedAt: { type: Date, default: Date.now }
});

// Prevent stale model compilation in development
if (process.env.NODE_ENV === 'development') {
    if (models.TVSettings) {
        delete models.TVSettings;
    }
}

const TVSettings = models.TVSettings || model('TVSettings', TVSettingsSchema);

export default TVSettings;
