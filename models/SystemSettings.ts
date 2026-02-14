import mongoose, { Schema, model, models } from 'mongoose';

const SystemSettingsSchema = new Schema({
    key: { type: String, required: true, unique: true, default: 'global' }, // Singleton document
    maintenanceMode: { type: Boolean, default: false },
    aiAutoScheduler: { type: Boolean, default: true },
    quizDuration: { type: Number, default: 900 }, // in seconds (15 mins)
    quizStartTime: { type: String, default: '06:00' }, // 6 AM
    quizEndTime: { type: String, default: '20:00' }, // 8 PM
    resultsReleaseTime: { type: String, default: '20:30' }, // 8:30 PM
    theme: { type: String, default: 'light' },
    updatedAt: { type: Date, default: Date.now }
});

const SystemSettings = models.SystemSettings || model('SystemSettings', SystemSettingsSchema);

export default SystemSettings;
