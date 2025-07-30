const express = require('express');
const { body, validationResult } = require('express-validator');
const Instrument = require('../models/Instrument');
const UsageHistory = require('../models/UsageHistory');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Start using an instrument
router.post('/start', auth, [
    body('instrumentId').isMongoId().withMessage('Valid instrument ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { instrumentId, quantity = 1 } = req.body;
        const userId = req.user._id;

        // Find the instrument
        const instrument = await Instrument.findById(instrumentId);
        if (!instrument) {
            return res.status(404).json({ message: 'Instrument not found' });
        }

        // Check if instrument is available
        if (instrument.status !== 'available') {
            return res.status(400).json({ message: 'Instrument is not available' });
        }

        // Check if user is already using this instrument
        const existingUsage = instrument.currentUsers.find(
            user => user.user.toString() === userId.toString()
        );
        if (existingUsage) {
            return res.status(400).json({ message: 'You are already using this instrument' });
        }

        // Check available quantity
        const currentlyUsed = instrument.currentUsers.reduce((sum, user) => sum + user.quantity, 0);
        if (currentlyUsed + quantity > instrument.availableQuantity) {
            return res.status(400).json({
                message: `Not enough quantity available. Available: ${instrument.availableQuantity - currentlyUsed}`
            });
        }

        // Start the usage session
        const startTime = new Date();

        // Add user to instrument's current users
        instrument.currentUsers.push({
            user: userId,
            startTime,
            quantity
        });

        // Update instrument usage statistics
        instrument.usageCount += 1;
        await instrument.save();

        // Add to user's currently using list
        const user = await User.findById(userId);
        user.currentlyUsing.push({
            instrument: instrumentId,
            startTime
        });
        await user.save();

        // Create usage history record
        const usageHistory = new UsageHistory({
            user: userId,
            instrument: instrumentId,
            startTime,
            quantity,
            status: 'active'
        });
        await usageHistory.save();

        // Populate the updated instrument data
        await instrument.populate('currentUsers.user', 'name email');

        res.json({
            message: 'Started using instrument successfully',
            instrument,
            usageHistory: usageHistory._id
        });

    } catch (error) {
        console.error('Start usage error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Stop using an instrument
router.post('/stop', auth, [
    body('instrumentId').isMongoId().withMessage('Valid instrument ID is required'),
    body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { instrumentId, notes } = req.body;
        const userId = req.user._id;

        // Find the instrument
        const instrument = await Instrument.findById(instrumentId);
        if (!instrument) {
            return res.status(404).json({ message: 'Instrument not found' });
        }

        // Find user's current usage
        const userUsageIndex = instrument.currentUsers.findIndex(
            user => user.user.toString() === userId.toString()
        );

        if (userUsageIndex === -1) {
            return res.status(400).json({ message: 'You are not currently using this instrument' });
        }

        const userUsage = instrument.currentUsers[userUsageIndex];
        const endTime = new Date();
        const duration = Math.round((endTime - userUsage.startTime) / (1000 * 60)); // in minutes

        // Remove user from instrument's current users
        instrument.currentUsers.splice(userUsageIndex, 1);

        // Update instrument total usage time
        instrument.totalUsageTime += duration;
        await instrument.save();

        // Remove from user's currently using list
        const user = await User.findById(userId);
        user.currentlyUsing = user.currentlyUsing.filter(
            item => item.instrument.toString() !== instrumentId.toString()
        );
        await user.save();

        // Update usage history record
        const usageHistory = await UsageHistory.findOneAndUpdate(
            {
                user: userId,
                instrument: instrumentId,
                status: 'active'
            },
            {
                endTime,
                duration,
                status: 'completed',
                notes
            },
            { new: true }
        ).populate('user', 'name email').populate('instrument', 'name');

        // Populate the updated instrument data
        await instrument.populate('currentUsers.user', 'name email');

        res.json({
            message: 'Stopped using instrument successfully',
            instrument,
            usageHistory,
            duration
        });

    } catch (error) {
        console.error('Stop usage error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Force stop usage (admin only)
router.post('/force-stop', adminAuth, [
    body('instrumentId').isMongoId().withMessage('Valid instrument ID is required'),
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { instrumentId, userId, reason } = req.body;
        const adminId = req.user._id;

        // Find the instrument
        const instrument = await Instrument.findById(instrumentId);
        if (!instrument) {
            return res.status(404).json({ message: 'Instrument not found' });
        }

        // Find user's current usage
        const userUsageIndex = instrument.currentUsers.findIndex(
            user => user.user.toString() === userId.toString()
        );

        if (userUsageIndex === -1) {
            return res.status(400).json({ message: 'User is not currently using this instrument' });
        }

        const userUsage = instrument.currentUsers[userUsageIndex];
        const endTime = new Date();
        const duration = Math.round((endTime - userUsage.startTime) / (1000 * 60)); // in minutes

        // Remove user from instrument's current users
        instrument.currentUsers.splice(userUsageIndex, 1);

        // Update instrument total usage time
        instrument.totalUsageTime += duration;
        await instrument.save();

        // Remove from user's currently using list
        const user = await User.findById(userId);
        user.currentlyUsing = user.currentlyUsing.filter(
            item => item.instrument.toString() !== instrumentId.toString()
        );
        await user.save();

        // Update usage history record
        const usageHistory = await UsageHistory.findOneAndUpdate(
            {
                user: userId,
                instrument: instrumentId,
                status: 'active'
            },
            {
                endTime,
                duration,
                status: 'terminated',
                terminatedBy: adminId,
                terminationReason: reason
            },
            { new: true }
        ).populate('user', 'name email').populate('instrument', 'name');

        // Populate the updated instrument data
        await instrument.populate('currentUsers.user', 'name email');

        res.json({
            message: 'Usage terminated successfully',
            instrument,
            usageHistory,
            duration
        });

    } catch (error) {
        console.error('Force stop usage error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's usage history
router.get('/history/me', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const userId = req.user._id;

        let query = { user: userId };
        if (status) query.status = status;

        const usageHistory = await UsageHistory.find(query)
            .populate('instrument', 'name image category')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await UsageHistory.countDocuments(query);

        // Calculate total usage time for the user
        const totalTime = await UsageHistory.aggregate([
            { $match: { user: userId, status: { $in: ['completed', 'terminated'] } } },
            { $group: { _id: null, total: { $sum: '$duration' } } }
        ]);

        res.json({
            usageHistory,
            totalUsageTime: totalTime[0]?.total || 0,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get user usage history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all usage history (admin only)
router.get('/history/all', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, instrumentId, userId } = req.query;

        let query = {};
        if (status) query.status = status;
        if (instrumentId) query.instrument = instrumentId;
        if (userId) query.user = userId;

        const usageHistory = await UsageHistory.find(query)
            .populate('user', 'name email')
            .populate('instrument', 'name category')
            .populate('terminatedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await UsageHistory.countDocuments(query);

        res.json({
            usageHistory,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all usage history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user's active usage sessions
router.get('/active/me', auth, async (req, res) => {
    try {
        const activeUsage = await UsageHistory.find({
            user: req.user._id,
            status: 'active'
        })
            .populate('instrument', 'name category location')
            .sort({ startTime: -1 });

        res.json(activeUsage);
    } catch (error) {
        console.error('Get user active usage error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current active usage sessions (admin only)
router.get('/active', adminAuth, async (req, res) => {
    try {
        const activeUsage = await UsageHistory.find({ status: 'active' })
            .populate('user', 'name email')
            .populate('instrument', 'name category location')
            .sort({ startTime: -1 });

        res.json(activeUsage);
    } catch (error) {
        console.error('Get active usage error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
