const express = require('express');
const router = express.Router();

// Import models
const Order = require('../models/Order');
const Review = require('../models/Review');
const HomeCookApplication = require('../models/HomeCookApplication');
const ContactSubmission = require('../models/ContactSubmission');
const User = require('../models/User');

// ========== ORDERS CRUD ==========

// Create order
router.post('/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get all orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single order
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update order
router.put('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete order
router.delete('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== REVIEWS CRUD ==========

// Create review
router.post('/reviews', async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get all reviews (with optional filtering)
router.get('/reviews', async (req, res) => {
    try {
        const { mealId, rating, sortBy } = req.query;
        let query = {};
        
        if (mealId) query.mealId = mealId;
        if (rating) query.rating = parseInt(rating);
        
        let sort = { createdAt: -1 };
        if (sortBy === 'rating') sort = { rating: -1 };
        if (sortBy === 'oldest') sort = { createdAt: 1 };
        
        const reviews = await Review.find(query).sort(sort);
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single review
router.get('/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }
        res.json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update review
router.put('/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }
        res.json({ success: true, data: review });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete review
router.delete('/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== HOMECOOK APPLICATIONS CRUD ==========

// Create application
router.post('/homecooks', async (req, res) => {
    try {
        const application = new HomeCookApplication(req.body);
        await application.save();
        res.status(201).json({ success: true, data: application });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get all applications
router.get('/homecooks', async (req, res) => {
    try {
        const applications = await HomeCookApplication.find().sort({ createdAt: -1 });
        res.json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single application
router.get('/homecooks/:id', async (req, res) => {
    try {
        const application = await HomeCookApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }
        res.json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update application
router.put('/homecooks/:id', async (req, res) => {
    try {
        const application = await HomeCookApplication.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }
        res.json({ success: true, data: application });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete application
router.delete('/homecooks/:id', async (req, res) => {
    try {
        const application = await HomeCookApplication.findByIdAndDelete(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }
        res.json({ success: true, message: 'Application deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== CONTACT SUBMISSIONS ==========

// Create contact submission
router.post('/contact', async (req, res) => {
    try {
        const submission = new ContactSubmission(req.body);
        await submission.save();
        res.status(201).json({ success: true, data: submission });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get all contact submissions
router.get('/contact', async (req, res) => {
    try {
        const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
        res.json({ success: true, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== USER AUTH ==========

// User signup
router.post('/users/signup', async (req, res) => {
    try {
        const { email, password, name, phone, location, dietaryPreferences } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        
        const user = new User({
            name,
            email,
            password, // In production, hash this password
            phone,
            location,
            dietaryPreferences
        });
        
        await user.save();
        res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// User login
router.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password }); // In production, use bcrypt to compare hashed passwords
        
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        res.json({ success: true, data: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

