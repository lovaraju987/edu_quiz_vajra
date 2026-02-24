import mongoose, { Schema, model, models } from 'mongoose';

const BroadcastSchema = new Schema({
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'urgent', 'success'], default: 'info' },
    active: { type: Boolean, default: true },
    targetSchool: { type: String, default: null }, // Null means all schools
    createdBy: { type: String, required: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) }, // Default 2 hours
    createdAt: { type: Date, default: Date.now }
});

const Broadcast = models.Broadcast || model('Broadcast', BroadcastSchema);

export default Broadcast;
