
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const TVSettingsSchema = new mongoose.Schema({
    slides: [{ type: mongoose.Schema.Types.Mixed }],
    scrollerOne: [{ type: mongoose.Schema.Types.Mixed }],
    scrollerTwo: [{ type: mongoose.Schema.Types.Mixed }],
    headerAds: [{ type: mongoose.Schema.Types.Mixed }],
}, { strict: false });

const TVSettings = mongoose.models.TVSettings || mongoose.model('TVSettings', TVSettingsSchema);

async function checkTV() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('No MONGODB_URI found');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const docs = await TVSettings.find({});
        console.log('Total TVSettings docs found:', docs.length);

        docs.forEach((doc, index) => {
            console.log(`Doc #${index + 1} ID:`, doc._id);
            console.log(`  headerAds count:`, doc.headerAds ? doc.headerAds.length : 'undefined');
            if (doc.headerAds && doc.headerAds.length > 0) {
                console.log('  First Header Ad:', doc.headerAds[0]);
            }
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTV();
