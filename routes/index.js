const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
    res.render('index');
});

// Meal Plans page
router.get('/meal_plans.html', (req, res) => {
    res.render('meal_plans');
});

// How It Works page
router.get('/how_it_works.html', (req, res) => {
    res.render('how_it_works');
});

// Contact page
router.get('/contact.html', (req, res) => {
    res.render('contact');
});

// Checkout page
router.get('/checkout.html', (req, res) => {
    res.render('checkout');
});

// User Auth (Login) page
router.get('/user_auth.html', (req, res) => {
    res.render('user_auth');
});

// Signup page
router.get('/signup.html', (req, res) => {
    res.render('signup');
});

// HomeCook Onboard page
router.get('/homecook_onboard.html', (req, res) => {
    res.render('homecook_onboard');
});

// Reviews page
router.get('/reviews.html', (req, res) => {
    res.render('reviews');
});

module.exports = router;

