
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const TVSettingsSchema = new mongoose.Schema({
    slides: [{ type: mongoose.Schema.Types.Mixed }],
    headerAds: [{
        title: String,
        imageUrl: String,
        link: String,
        isActive: { type: Boolean, default: true }
    }],
}, { strict: false });

const TVSettings = mongoose.models.TVSettings || mongoose.model('TVSettings', TVSettingsSchema);

async function manualUpdate() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('No MONGODB_URI found');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const ads = [
            { title: "Test Ad 1", imageUrl: "/test1.png", link: "#1" },
            { title: "Test Ad 2", imageUrl: "/test2.png", link: "#2" }
        ];

        const res = await TVSettings.findOneAndUpdate(
            {},
            { $set: { headerAds: ads } },
            { new: true, upsert: true }
        );

        console.log('Update Result:', JSON.stringify(res, null, 2));
        if (res && res.headerAds) {
            console.log('Update Result HeaderAds Count:', res.headerAds.length);
        } else {
            console.log('res.headerAds is undefined');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

manualUpdate();
