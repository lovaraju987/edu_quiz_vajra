import mongoose, { Schema, model, models } from 'mongoose';

const SystemSettingsSchema = new Schema({
    key: { type: String, required: true, unique: true, default: 'global' }, // Singleton document
    maintenanceMode: { type: Boolean, default: false },
    aiAutoScheduler: { type: Boolean, default: true },
    theme: { type: String, default: 'light' },
    updatedAt: { type: Date, default: Date.now }
});

const SystemSettings = models.SystemSettings || model('SystemSettings', SystemSettingsSchema);

export default SystemSettings;
