const mongoose = require('mongoose');

const instrumentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    availableQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    manualGuide: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['available', 'unavailable', 'maintenance'],
        default: 'available'
    },
    specifications: {
        type: Map,
        of: String,
        default: new Map()
    },
    category: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: null
    },
    currentUsers: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            startTime: {
                type: Date,
                default: Date.now
            },
            quantity: {
                type: Number,
                default: 1
            }
        }],
        default: []
    },
    totalUsageTime: {
        type: Number,
        default: 0 // in minutes
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Virtual for checking if instrument is fully occupied
instrumentSchema.virtual('isFullyOccupied').get(function () {
    const currentlyUsedQuantity = (this.currentUsers || []).reduce((sum, user) => sum + (user.quantity || 0), 0);
    return currentlyUsedQuantity >= this.quantity;
});

// Virtual for available quantity for new users
instrumentSchema.virtual('currentlyAvailable').get(function () {
    const currentlyUsedQuantity = (this.currentUsers || []).reduce((sum, user) => sum + (user.quantity || 0), 0);
    return Math.max(0, this.quantity - currentlyUsedQuantity);
});

// Ensure virtuals are included in JSON
instrumentSchema.set('toJSON', { virtuals: true });
instrumentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Instrument', instrumentSchema);
