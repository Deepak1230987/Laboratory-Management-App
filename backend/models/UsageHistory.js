const mongoose = require('mongoose');

const usageHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instrument: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instrument',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    quantity: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'terminated'],
        default: 'active'
    },
    notes: {
        type: String,
        default: null
    },
    terminatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    terminationReason: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Calculate duration before saving when endTime is set
usageHistorySchema.pre('save', function (next) {
    if (this.endTime && this.startTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert to minutes
    }
    next();
});

// Index for faster queries
usageHistorySchema.index({ user: 1, createdAt: -1 });
usageHistorySchema.index({ instrument: 1, createdAt: -1 });
usageHistorySchema.index({ status: 1 });

module.exports = mongoose.model('UsageHistory', usageHistorySchema);
