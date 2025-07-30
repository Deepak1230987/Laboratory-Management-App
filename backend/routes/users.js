const express = require('express');
const User = require('../models/User');
const UsageHistory = require('../models/UsageHistory');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('currentlyUsing.instrument', 'name category image')
            .select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user statistics
        const usageStats = await UsageHistory.aggregate([
            { $match: { user: user._id, status: { $in: ['completed', 'terminated'] } } },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    totalTime: { $sum: '$duration' },
                    avgTime: { $avg: '$duration' }
                }
            }
        ]);

        const stats = usageStats[0] || { totalSessions: 0, totalTime: 0, avgTime: 0 };

        res.json({
            user,
            stats: {
                totalSessions: stats.totalSessions,
                totalTime: stats.totalTime,
                averageTime: Math.round(stats.avgTime || 0)
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users (admin only)
router.get('/all', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role, isActive } = req.query;

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const users = await User.find(query)
            .populate('currentlyUsing.instrument', 'name category')
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user by ID (admin only)
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('currentlyUsing.instrument', 'name category image')
            .select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user usage statistics
        const usageStats = await UsageHistory.aggregate([
            { $match: { user: user._id, status: { $in: ['completed', 'terminated'] } } },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    totalTime: { $sum: '$duration' },
                    avgTime: { $avg: '$duration' }
                }
            }
        ]);

        const stats = usageStats[0] || { totalSessions: 0, totalTime: 0, avgTime: 0 };

        res.json({
            user,
            stats: {
                totalSessions: stats.totalSessions,
                totalTime: stats.totalTime,
                averageTime: Math.round(stats.avgTime || 0)
            }
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
    try {
        const { isActive } = req.body;
        const userId = req.params.id;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean value' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user role (admin only)
router.patch('/:id/role', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: 'Role must be either admin or user' });
        }

        // Prevent admin from demoting themselves
        if (userId === req.user._id.toString() && role === 'user') {
            return res.status(400).json({ message: 'You cannot demote yourself' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: `User role updated to ${role} successfully`,
            user
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get dashboard statistics (admin only)
router.get('/admin/dashboard', adminAuth, async (req, res) => {
    try {
        // Get user counts
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const adminUsers = await User.countDocuments({ role: 'admin' });

        // Get current active sessions
        const activeSessions = await UsageHistory.countDocuments({ status: 'active' });

        // Get usage statistics for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentUsage = await UsageHistory.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $in: ['completed', 'terminated'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    totalTime: { $sum: '$duration' }
                }
            }
        ]);

        // Get most used instruments
        const topInstruments = await UsageHistory.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $in: ['completed', 'terminated'] }
                }
            },
            {
                $group: {
                    _id: '$instrument',
                    totalUsage: { $sum: '$duration' },
                    sessionCount: { $sum: 1 }
                }
            },
            { $sort: { totalUsage: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'instruments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'instrument'
                }
            },
            { $unwind: '$instrument' }
        ]);

        const usage = recentUsage[0] || { totalSessions: 0, totalTime: 0 };

        res.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                admins: adminUsers
            },
            usage: {
                activeSessions,
                recentSessions: usage.totalSessions,
                recentTotalTime: usage.totalTime
            },
            topInstruments
        });
    } catch (error) {
        console.error('Get dashboard statistics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
