const express = require('express');
const { body, validationResult } = require('express-validator');
const Instrument = require('../models/Instrument');
const UsageHistory = require('../models/UsageHistory');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Get all instruments (public for users, detailed for admins)
router.get('/', auth, async (req, res) => {
    try {
        const { category, status, search, page = 1, limit = 10 } = req.query;

        let query = {};

        // Build query filters
        if (category) query.category = category;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const instruments = await Instrument.find(query)
            .populate('currentUsers.user', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Instrument.countDocuments(query);

        res.json({
            instruments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get instruments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single instrument by ID
router.get('/:id', auth, async (req, res) => {
    try {
        console.log('Received instrument ID:', req.params.id);
        console.log('ID type:', typeof req.params.id);
        console.log('Full URL:', req.originalUrl);

        // Check if the ID is the literal ":id" string
        if (req.params.id === ':id') {
            return res.status(400).json({
                message: 'Invalid instrument ID format. ID parameter not properly resolved.'
            });
        }

        const instrument = await Instrument.findById(req.params.id)
            .populate('currentUsers.user', 'name email');

        if (!instrument) {
            return res.status(404).json({ message: 'Instrument not found' });
        }

        res.json(instrument);
    } catch (error) {
        console.error('Get instrument error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new instrument (admin only)
router.post('/', adminAuth, upload.single('image'), [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('category').trim().isLength({ min: 1 }).withMessage('Category is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Delete uploaded file if validation fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ errors: errors.array() });
        }

        const instrumentData = {
            name: req.body.name,
            description: req.body.description,
            quantity: parseInt(req.body.quantity),
            availableQuantity: parseInt(req.body.quantity),
            category: req.body.category,
            location: req.body.location,
            manualGuide: req.body.manualGuide,
            status: req.body.status || 'available'
        };

        // Add image if uploaded
        if (req.file) {
            instrumentData.image = `/uploads/${req.file.filename}`;
        }

        // Parse specifications if provided
        if (req.body.specifications) {
            try {
                instrumentData.specifications = JSON.parse(req.body.specifications);
            } catch (e) {
                instrumentData.specifications = new Map();
            }
        }

        const instrument = new Instrument(instrumentData);
        await instrument.save();

        res.status(201).json({
            message: 'Instrument created successfully',
            instrument
        });
    } catch (error) {
        // Delete uploaded file if database save fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Create instrument error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update instrument (admin only)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const instrument = await Instrument.findById(req.params.id);
        if (!instrument) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Instrument not found' });
        }

        // Update fields
        const updateData = {};
        const allowedFields = ['name', 'description', 'quantity', 'category', 'location', 'manualGuide', 'status'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Handle quantity update
        if (req.body.quantity) {
            const newQuantity = parseInt(req.body.quantity);
            const currentlyUsed = instrument.currentUsers.reduce((sum, user) => sum + user.quantity, 0);
            updateData.availableQuantity = Math.max(0, newQuantity - currentlyUsed);
        }

        // Handle image update
        if (req.file) {
            // Delete old image if exists
            if (instrument.image) {
                const oldImagePath = path.join(__dirname, '..', instrument.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.image = `/uploads/${req.file.filename}`;
        }

        // Parse specifications if provided
        if (req.body.specifications) {
            try {
                updateData.specifications = JSON.parse(req.body.specifications);
            } catch (e) {
                // Keep existing specifications if parsing fails
            }
        }

        const updatedInstrument = await Instrument.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('currentUsers.user', 'name email');

        res.json({
            message: 'Instrument updated successfully',
            instrument: updatedInstrument
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error('Update instrument error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete instrument (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const instrument = await Instrument.findById(req.params.id);
        if (!instrument) {
            return res.status(404).json({ message: 'Instrument not found' });
        }

        // Check if instrument is currently being used
        if (instrument.currentUsers.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete instrument that is currently being used'
            });
        }

        // Delete associated image
        if (instrument.image) {
            const imagePath = path.join(__dirname, '..', instrument.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Instrument.findByIdAndDelete(req.params.id);

        res.json({ message: 'Instrument deleted successfully' });
    } catch (error) {
        console.error('Delete instrument error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get instrument usage statistics (admin only)
router.get('/:id/stats', adminAuth, async (req, res) => {
    try {
        const instrumentId = req.params.id;

        // Get usage history
        const usageHistory = await UsageHistory.find({ instrument: instrumentId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalUsage = usageHistory.reduce((sum, usage) => sum + usage.duration, 0);
        const averageUsage = usageHistory.length > 0 ? totalUsage / usageHistory.length : 0;

        // Get current users
        const instrument = await Instrument.findById(instrumentId)
            .populate('currentUsers.user', 'name email');

        const stats = {
            totalUsageTime: totalUsage,
            averageUsageTime: Math.round(averageUsage),
            totalSessions: usageHistory.length,
            currentUsers: instrument.currentUsers,
            recentUsage: usageHistory.slice(0, 10)
        };

        res.json(stats);
    } catch (error) {
        console.error('Get instrument stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
