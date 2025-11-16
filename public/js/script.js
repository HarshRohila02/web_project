// ========== OOP CLASSES ==========

// Shopping Cart Class
class Cart {
    constructor() {
        this.items = this.normalizeLoadedItems(this.loadFromStorage());
        this.taxRate = 0.05; 
    }
    normalizeLoadedItems(rawItems) {
        if (!Array.isArray(rawItems)) return [];
        const groupedByName = new Map();
        for (const it of rawItems) {
            if (!it || !it.name) continue;
            const priceNumber = typeof it.price === 'number' ? it.price : parseFloat(it.price);
            const price = isNaN(priceNumber) ? 0 : priceNumber;
            const key = it.name;
            const existing = groupedByName.get(key);
            if (existing) {
                existing.qty += it.qty ? parseInt(it.qty) || 1 : 1;
            } else {
                groupedByName.set(key, { name: it.name, price, qty: it.qty ? parseInt(it.qty) || 1 : 1 });
            }
        }
        return Array.from(groupedByName.values());
    }
    findIndexByName(name) {
        return this.items.findIndex(i => i.name === name);
    }
    addItem(item) {
        const priceNumber = typeof item.price === 'number' ? item.price : parseFloat(item.price);
        const price = isNaN(priceNumber) ? 0 : priceNumber;
        const idx = this.findIndexByName(item.name);
        if (idx !== -1) {
            this.items[idx].qty += 1;
        } else {
            this.items.push({ name: item.name, price, qty: 1 });
        }
        this.saveToStorage();
        showPopup(`${item.name} has been added to your cart!`, 'success');
    }
    incrementItem(name) {
        const idx = this.findIndexByName(name);
        if (idx !== -1) {
            this.items[idx].qty += 1;
            this.saveToStorage();
        }
    }
    decrementItem(name) {
        const idx = this.findIndexByName(name);
        if (idx !== -1) {
            this.items[idx].qty -= 1;
            if (this.items[idx].qty <= 0) {
                this.items.splice(idx, 1);
            }
            this.saveToStorage();
        }
    }
    removeItemByName(name) {
        const idx = this.findIndexByName(name);
        if (idx !== -1) {
            this.items.splice(idx, 1);
            this.saveToStorage();
        }
    }
    getItems() { return this.items; }
    calculateSubtotal() {
        let subtotal = 0;
        for (const item of this.items) {
            subtotal += item.price * item.qty;
        }
        return subtotal;
    }
    calculateTax() { return this.calculateSubtotal() * this.taxRate; }
    calculateTotal() { return this.calculateSubtotal() + this.calculateTax(); }
    saveToStorage() { localStorage.setItem('homeCookCart', JSON.stringify(this.items)); }
    loadFromStorage() {
        const items = localStorage.getItem('homeCookCart');
        return items ? JSON.parse(items) : [];
    }
    clearCart() {
        this.items = [];
        this.saveToStorage();
    }
}

// Meal Manager Class for filtering and sorting
class MealManager {
    constructor(meals) {
        this.allMeals = meals;
        this.filteredMeals = [...meals];
    }
    
    filterByPrice(priceRange) {
        if (!priceRange) {
            this.filteredMeals = [...this.allMeals];
            return;
        }
        const [min, max] = priceRange.split('-').map(p => p === '+' ? Infinity : parseFloat(p));
        this.filteredMeals = this.allMeals.filter(meal => {
            const price = meal.price;
            if (priceRange.includes('+')) {
                return price >= min;
            }
            return price >= min && price <= max;
        });
    }
    
    search(query) {
        if (!query) {
            this.filteredMeals = [...this.allMeals];
            return;
        }
        const lowerQuery = query.toLowerCase();
        this.filteredMeals = this.allMeals.filter(meal => 
            meal.name.toLowerCase().includes(lowerQuery) ||
            meal.description.toLowerCase().includes(lowerQuery)
        );
    }
    
    sort(sortBy) {
        const meals = [...this.filteredMeals];
        switch(sortBy) {
            case 'price-low':
                meals.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                meals.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                meals.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                return;
        }
        this.filteredMeals = meals;
    }
    
    getFilteredMeals() {
        return this.filteredMeals;
    }
}

// Review System Class
class ReviewSystem {
    constructor() {
        this.reviews = [];
    }
    
    async loadReviews(filters = {}) {
        try {
            let url = '/api/reviews';
            const params = new URLSearchParams();
            if (filters.rating) params.append('rating', filters.rating);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (params.toString()) url += '?' + params.toString();
            
            const response = await fetch(url);
            const result = await response.json();
            if (result.success) {
                this.reviews = result.data;
                return this.reviews;
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
        return [];
    }
    
    async createReview(reviewData) {
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error creating review:', error);
            return { success: false, error: error.message };
        }
    }
    
    renderReviews(container) {
        if (!container) return;
        if (this.reviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">No reviews yet. Be the first to review!</p>';
            return;
        }
        
        let html = '';
        const user = JSON.parse(localStorage.getItem('homecookUser')||'{}');
        this.reviews.forEach(review => {
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            const date = new Date(review.createdAt).toLocaleDateString();
            let buttons = '';
            if (user?.id && review.userId == user.id) {
                buttons = `<button class='btn-edit-review' data-id='${review._id}' style='margin-right:10px;background:#2196F3;color:white;border:none;padding:5px 15px;border-radius:4px;cursor:pointer'>Edit</button>
                           <button class='btn-delete-review' data-id='${review._id}' style='background:#f44336;color:white;border:none;padding:5px 15px;border-radius:4px;cursor:pointer'>Delete</button>`;
            }
            html += `
                <div style="background: white; padding: 20px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <h4 style="margin: 0;">${review.mealName}</h4>
                        <span style="color: #e67e22; font-size: 1.2rem;">${stars}</span>
                    </div>
                    <p style="color: #666; margin: 5px 0;"><strong>${review.userName}</strong> - ${date}</p>
                    <p>${review.comment}</p>
                    <div style="margin-top: 10px; text-align: right;">${buttons}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
}

// Form Validator Class
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static validatePassword(password) {
        return password.length >= 6;
    }
    
    static getPasswordStrength(password) {
        if (password.length === 0) return { strength: 0, text: '' };
        if (password.length < 6) return { strength: 1, text: 'Weak', color: 'red' };
        if (password.length < 10) return { strength: 2, text: 'Medium', color: 'orange' };
        return { strength: 3, text: 'Strong', color: 'green' };
    }
    
    static validatePhone(phone) {
        if (!phone) return true; // Optional
        const re = /^[0-9]{10}$/;
        return re.test(phone.replace(/\D/g, ''));
    }
}

// Global instances
const cart = new Cart();
let mealManager = null;

// ========== UTILITY FUNCTIONS ==========

function showPopup(message, type = 'info') {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white; border-radius: 5px; z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation: slideIn 0.3s;
    `;
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.style.animation = 'slideOut 0.3s';
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

// ========== PAGE INITIALIZATION FUNCTIONS ==========

async function initializeMealPlansPage() {
    try {
        const response = await fetch('/data/data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        mealManager = new MealManager(data.instantMeals);
        
        renderSubscriptionPlans(data.subscriptionPlans);
        renderInstantMeals(mealManager.getFilteredMeals());
        attachCartListeners();
        attachMealFilters();
        
    } catch (error) {
        console.error("Could not fetch or render meal data:", error);
    }
}

function attachMealFilters() {
    const searchInput = document.getElementById('meal-search-input');
    const priceFilter = document.getElementById('price-filter');
    const sortOptions = document.getElementById('sort-options');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            mealManager.search(e.target.value);
            mealManager.filterByPrice(priceFilter?.value);
            if (sortOptions?.value) mealManager.sort(sortOptions.value);
            renderInstantMeals(mealManager.getFilteredMeals());
            attachCartListeners();
        });
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', (e) => {
            mealManager.filterByPrice(e.target.value);
            if (searchInput?.value) mealManager.search(searchInput.value);
            if (sortOptions?.value) mealManager.sort(sortOptions.value);
            renderInstantMeals(mealManager.getFilteredMeals());
            attachCartListeners();
        });
    }
    
    if (sortOptions) {
        sortOptions.addEventListener('change', (e) => {
            mealManager.sort(e.target.value);
            renderInstantMeals(mealManager.getFilteredMeals());
            attachCartListeners();
        });
    }
}

async function initializeCheckoutPage() {
    try {
        const response = await fetch('/data/checkout.json');
        if (response.ok) {
            const cfg = await response.json();
            if (typeof cfg.taxRate === 'number') {
                cart.taxRate = cfg.taxRate;
            }
        }
    } catch (e) {
        console.warn('Checkout config not loaded, using defaults', e);
    } finally {
        renderCheckoutPage();
        attachCheckoutListeners();
    }
}

function attachCheckoutListeners() {
    const deliveryOptions = document.querySelectorAll('input[name="deliveryOption"]');
    const addressSection = document.getElementById('address-section');
    
    deliveryOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (e.target.value === 'delivery') {
                addressSection.style.display = 'block';
                document.getElementById('deliveryAddress').required = true;
            } else {
                addressSection.style.display = 'none';
                document.getElementById('deliveryAddress').required = false;
            }
        });
    });
    
    const payButton = document.getElementById('pay-button');
    if (payButton) {
        payButton.addEventListener('click', async () => {
            if (payButton.disabled) return;
            
            const items = cart.getItems();
            if (items.length === 0) {
                showPopup('Your cart is empty!', 'error');
                return;
            }
            
            const customerName = document.getElementById('customerName')?.value;
            const customerEmail = document.getElementById('customerEmail')?.value;
            const customerPhone = document.getElementById('customerPhone')?.value;
            const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked')?.value;
            const deliveryAddress = document.getElementById('deliveryAddress')?.value;
            
            if (!customerName || !customerEmail || !customerPhone) {
                showPopup('Please fill in all required fields', 'error');
                return;
            }
            
            if (deliveryOption === 'delivery' && !deliveryAddress) {
                showPopup('Please enter delivery address', 'error');
                return;
            }
            
            try {
                const orderData = {
                    items: items.map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.qty
                    })),
                    subtotal: cart.calculateSubtotal(),
                    tax: cart.calculateTax(),
                    total: cart.calculateTotal(),
                    deliveryOption,
                    deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : '',
                    customerName,
                    customerEmail,
                    customerPhone
                };
                
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
                
                const result = await response.json();
                if (result.success) {
                    showPopup('Order placed successfully!', 'success');
                    cart.clearCart();
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    showPopup('Failed to place order. Please try again.', 'error');
                }
            } catch (error) {
                showPopup('Error placing order. Please try again.', 'error');
                console.error('Order error:', error);
            }
        });
    }
}

async function initializeHowItWorksPage() {
    try {
        const response = await fetch('/data/how_it_works.json');
        if (!response.ok) return;
        const data = await response.json();

        const titleEl = document.getElementById('hiw-title');
        if (titleEl && data.pageTitle) titleEl.textContent = data.pageTitle;
        const subEl = document.getElementById('hiw-subtitle');
        if (subEl && data.subtitle) subEl.textContent = data.subtitle;

        const container = document.getElementById('steps-container-target');
        if (!container || !Array.isArray(data.steps)) return;

        const steps = [...data.steps].sort((a, b) => (a.order || 0) - (b.order || 0));

        let html = '';
        steps.forEach((step, index) => {
            let bulletsHTML = '';
            if (Array.isArray(step.bullets)) {
                bulletsHTML = '<ul>' + step.bullets.map(b => 
                    `<li>${b.label ? `<strong>${b.label}:</strong> ` : ''}${b.text || ''}</li>`
                ).join('') + '</ul>';
            }
            html += `
                <div class="step-card" style="opacity: 0; transform: translateY(20px); transition: all 0.6s ease;">
                    ${step.image ? `<img src="/${step.image}" alt="${step.title}">` : ''}
                    <h3>${step.order ? step.order + '. ' : ''}${step.title || ''}</h3>
                    ${bulletsHTML}
                </div>
            `;
        });
        container.innerHTML = html;
        
        // Animate on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        container.querySelectorAll('.step-card').forEach(card => {
            observer.observe(card);
        });
    } catch (e) {
        console.warn('How It Works data not loaded', e);
    }
}

async function initializeReviewsPage() {
    window.reviewSystem = new ReviewSystem();
    const container = document.getElementById('reviews-container');
    
    await window.reviewSystem.loadReviews();
    window.reviewSystem.renderReviews(container);
    
    // Attach filter listeners
    const ratingFilter = document.getElementById('review-rating-filter');
    const sortFilter = document.getElementById('review-sort');
    
    const applyFilters = async () => {
        const filters = {
            rating: ratingFilter?.value || '',
            sortBy: sortFilter?.value === 'newest' ? '' : sortFilter?.value === 'oldest' ? 'oldest' : 'rating'
        };
        await window.reviewSystem.loadReviews(filters);
        window.reviewSystem.renderReviews(container);
    };
    
    if (ratingFilter) ratingFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
    
    // Star rating
    const starRating = document.getElementById('star-rating');
    let selectedRating = 0;
    if (starRating) {
        const stars = starRating.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                for (let i = 0; i <= index; i++) {
                    stars[i].textContent = '★';
                }
            });
            star.addEventListener('mouseleave', () => {
                stars.forEach((s, i) => {
                    s.textContent = i < selectedRating ? '★' : '☆';
                });
            });
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                document.getElementById('reviewRating').value = selectedRating;
                stars.forEach((s, i) => {
                    s.textContent = i < selectedRating ? '★' : '☆';
                });
            });
        });
    }
    
    // Review form submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('homecookUser')||'{}');
            if (!user.id) {
              showPopup('Please log in to submit or update a review.','error');
              return;
            }
            const formData = new FormData(reviewForm);
            const reviewData = {
                mealName: formData.get('mealName'),
                userName: formData.get('userName'),
                userEmail: formData.get('userEmail'),
                userId: user.id, // link review to the logged in user
                rating: parseInt(formData.get('rating')),
                comment: formData.get('comment')
            };
            
            if (!reviewData.rating || reviewData.rating < 1) {
                showPopup('Please select a rating', 'error');
                return;
            }
            
            let result;
            if (window.editingReviewId) {
                // Edit mode
                result = await fetch('/api/reviews/' + window.editingReviewId, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(reviewData)
                }).then(r => r.json());
                delete window.editingReviewId;
            } else {
                result = await window.reviewSystem.createReview(reviewData);
            }
            if (result.success) {
                showPopup(window.editingReviewId ? 'Review updated!' : 'Review submitted successfully!', 'success');
                reviewForm.reset();
                document.querySelectorAll('#star-rating .star').forEach(s=>s.textContent='☆');
                if (typeof initializeReviewsPage === 'function') await initializeReviewsPage();
            } else {
                showPopup('Failed to submit review. Please try again.', 'error');
            }
        });
    }
}

// ========== RENDER FUNCTIONS ==========

function renderCheckoutPage() {
    const checkoutSummaryList = document.getElementById('checkout-summary-list');
    const subtotalEl = document.getElementById('subtotal-amount');
    const taxEl = document.getElementById('tax-amount');
    const totalEl = document.getElementById('total-amount');
    const payButton = document.getElementById('pay-button');

    if (!checkoutSummaryList || !subtotalEl || !taxEl || !totalEl || !payButton) return;

    checkoutSummaryList.innerHTML = '';
    const items = cart.getItems();

    if (items.length === 0) {
        checkoutSummaryList.innerHTML = '<li>Your cart is empty.</li>';
        payButton.disabled = true;
    } else {
        items.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'checkout-item';
            li.innerHTML = `
                <div class="co-left">${item.name}</div>
                <div class="co-middle">
                    <div class="qty-control">
                        <button type="button" class="qty-btn">-</button>
                        <span class="qty-num">${item.qty}</span>
                        <button type="button" class="qty-btn">+</button>
                    </div>
                </div>
                <div class="co-right">
                    <div class="line-amount">₹${(item.price * item.qty).toFixed(2)}</div>
                    <button type="button" class="remove-link">Remove</button>
                </div>
            `;
            
            li.querySelector('.qty-btn:first-child').addEventListener('click', () => {
                cart.decrementItem(item.name);
                renderCheckoutPage();
                attachCheckoutListeners();
            });
            li.querySelector('.qty-btn:last-child').addEventListener('click', () => {
                cart.incrementItem(item.name);
                renderCheckoutPage();
                attachCheckoutListeners();
            });
            li.querySelector('.remove-link').addEventListener('click', () => {
                cart.removeItemByName(item.name);
                renderCheckoutPage();
                attachCheckoutListeners();
            });

            checkoutSummaryList.appendChild(li);
        });
        payButton.disabled = false;
    }

    const subtotal = cart.calculateSubtotal();
    const tax = cart.calculateTax();
    const total = cart.calculateTotal();

    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    taxEl.textContent = `₹${tax.toFixed(2)}`;
    totalEl.textContent = `₹${total.toFixed(2)}`;
    payButton.textContent = `Proceed to Pay (₹${total.toFixed(2)})`;
}

function renderSubscriptionPlans(plans) {
    const container = document.getElementById('plans-container-target');
    if (!container) return;
    
    let htmlString = '';
    plans.forEach(plan => {
        const featuresHTML = plan.features.map(f => `<li>${f}</li>`).join('');
        const featuredClass = plan.featured ? 'featured' : '';
        htmlString += `
            <div class="plan-card ${featuredClass}">
                <h3>${plan.name}</h3>
                <p class="price">${plan.priceText}</p>
                <ul>${featuresHTML}</ul>
                <button class="btn btn-select-plan" data-name="${plan.name}" data-price="${plan.price}">
                        Select ${plan.name}
                </button>
            </div>
        `;
    });
    container.innerHTML = htmlString;
}

function renderInstantMeals(meals) {
    const container = document.getElementById('instant-meals-target');
    if (!container) return;
    
    let htmlString = '';
    meals.forEach(meal => {
        htmlString += `
            <div class="meal-card">
                <img src="/${meal.image}" alt="${meal.name}">
                <h4>${meal.name}</h4>
                <p class="meal-price">₹${meal.price}</p>
                <p class="meal-description">${meal.description}</p>
                <button class="btn btn-add-to-cart" data-name="${meal.name}" data-price="${meal.price}">
                        Add To Cart
                </button>
            </div>
        `;
    });
    container.innerHTML = htmlString;
}

function attachCartListeners() {
    document.querySelectorAll('.btn-add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const name = e.target.dataset.name;
            const price = parseFloat(e.target.dataset.price);
            if (name && price) {
                cart.addItem({ name, price });
            }
        });
    });

    document.querySelectorAll('.btn-select-plan').forEach(button => {
        button.addEventListener('click', (e) => {
            const name = e.target.dataset.name;
            const price = parseFloat(e.target.dataset.price);
            if (name && price) {
                cart.addItem({ name, price });
            }
        });
    });
}

// ========== FORM HANDLERS ==========

function initializeContactForm() {
    const form = document.getElementById('contactForm');
    const messageEl = document.getElementById('form-message');
    const charCounter = document.getElementById('char-counter');
    const messageField = document.getElementById('contactMessage');
    
    if (charCounter && messageField) {
        messageField.addEventListener('input', (e) => {
            const length = e.target.value.length;
            charCounter.textContent = `${length} / 500 characters`;
            if (length > 450) {
                charCounter.style.color = 'red';
            } else {
                charCounter.style.color = '#666';
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    if (messageEl) {
                        messageEl.textContent = 'Message sent successfully!';
                        messageEl.style.display = 'block';
                        messageEl.style.color = 'green';
                    }
                    showPopup('Message sent successfully!', 'success');
                    form.reset();
                    if (charCounter) charCounter.textContent = '0 / 500 characters';
                } else {
                    showPopup('Failed to send message. Please try again.', 'error');
                }
            } catch (error) {
                showPopup('Error sending message. Please try again.', 'error');
            }
        });
    }
}

function initializeSignupForm() {
    const form = document.getElementById('signupForm');
    const passwordField = document.getElementById('signupPassword');
    const passwordConfirmField = document.getElementById('signupPasswordConfirm');
    const passwordStrengthEl = document.getElementById('password-strength');
    const passwordMatchEl = document.getElementById('password-match');
    const messageEl = document.getElementById('signup-message');
    
    if (passwordField && passwordStrengthEl) {
        passwordField.addEventListener('input', (e) => {
            const strength = FormValidator.getPasswordStrength(e.target.value);
            passwordStrengthEl.textContent = strength.text ? `Password strength: ${strength.text}` : '';
            passwordStrengthEl.style.color = strength.color || '#666';
        });
    }
    
    if (passwordConfirmField && passwordMatchEl) {
        passwordConfirmField.addEventListener('input', (e) => {
            if (passwordField.value === e.target.value) {
                passwordMatchEl.textContent = '✓ Passwords match';
                passwordMatchEl.style.color = 'green';
            } else {
                passwordMatchEl.textContent = '✗ Passwords do not match';
                passwordMatchEl.style.color = 'red';
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (passwordField.value !== passwordConfirmField.value) {
                showPopup('Passwords do not match', 'error');
                return;
            }
            
            if (!FormValidator.validatePassword(passwordField.value)) {
                showPopup('Password must be at least 6 characters', 'error');
                return;
            }
            
            const formData = new FormData(form);
            const dietaryPrefs = formData.getAll('dietaryPreferences');
            
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                phone: formData.get('phone') || '',
                location: formData.get('location') || '',
                dietaryPreferences: dietaryPrefs
            };
            
            try {
                const response = await fetch('/api/users/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    showPopup('Account created successfully!', 'success');
                    setTimeout(() => {
                        window.location.href = '/user_auth.html';
                    }, 1500);
                } else {
                    showPopup(result.error || 'Failed to create account', 'error');
                }
            } catch (error) {
                showPopup('Error creating account. Please try again.', 'error');
            }
        });
    }
}

function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    const messageEl = document.getElementById('login-message');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    // Save login info in localStorage
                    localStorage.setItem('homecookUser', JSON.stringify(result.data));
                    showPopup('Login successful!', 'success');
                    setTimeout(() => { window.location.href = '/'; }, 1500);
                } else {
                    showPopup(result.error || 'Invalid credentials', 'error');
                }
            } catch (error) {
                showPopup('Error logging in. Please try again.', 'error');
            }
        });
    }
}

function initializeHomeCookForm() {
    const form = document.getElementById('homecookOnboardForm');
    const fileInput = document.getElementById('licenseFile');
    const filePreview = document.getElementById('file-preview');
    const messageEl = document.getElementById('onboardMessage');
    
    if (fileInput && filePreview) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                filePreview.style.display = 'block';
                filePreview.innerHTML = `<p>Selected: ${file.name}</p>`;
            } else {
                filePreview.style.display = 'none';
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                location: formData.get('location'),
                licenceStatus: formData.get('licenceStatus')
            };
            
            try {
                const response = await fetch('/api/homecooks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    if (messageEl) {
                        messageEl.textContent = 'Application submitted successfully! We will contact you soon.';
                        messageEl.style.display = 'block';
                    }
                    showPopup('Application submitted successfully!', 'success');
                    form.reset();
                    if (filePreview) filePreview.style.display = 'none';
                } else {
                    showPopup('Failed to submit application. Please try again.', 'error');
                }
            } catch (error) {
                showPopup('Error submitting application. Please try again.', 'error');
            }
        });
    }
}

// Index page search
function initializeIndexPage() {
    const searchInput = document.getElementById('meal-search');
    const resultsDiv = document.getElementById('search-results');
    
    if (searchInput && resultsDiv) {
        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                resultsDiv.style.display = 'none';
                return;
            }
            
            try {
                const response = await fetch('/data/data.json');
                const data = await response.json();
                const allItems = [...data.subscriptionPlans, ...data.instantMeals];
                const matches = allItems.filter(item => 
                    item.name.toLowerCase().includes(query.toLowerCase()) ||
                    (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
                );
                
                if (matches.length > 0) {
                    resultsDiv.style.display = 'block';
                    resultsDiv.innerHTML = matches.map(item => 
                        `<div style="padding: 10px; border-bottom: 1px solid #ddd; cursor: pointer;" 
                              onclick="window.location.href='/meal_plans.html'">
                            <strong>${item.name}</strong> - ${item.description || ''}
                         </div>`
                    ).join('');
                } else {
                    resultsDiv.style.display = 'block';
                    resultsDiv.innerHTML = '<div style="padding: 10px;">No results found</div>';
                }
            } catch (error) {
                console.error('Search error:', error);
            }
        });
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// --- Global review edit/delete handlers ---
document.addEventListener('click', async function(event) {
  const user = JSON.parse(localStorage.getItem('homecookUser')||'{}');
  // Edit handler
  if (event.target.classList.contains('btn-edit-review')) {
    const id = event.target.getAttribute('data-id');
    const review = (window.reviewSystem && window.reviewSystem.reviews.find(r => r._id === id)) || null;
    if (!review) return showPopup('Could not load review for editing', 'error');
    document.getElementById('reviewMealName').value = review.mealName;
    document.getElementById('reviewUserName').value = review.userName;
    document.getElementById('reviewUserEmail').value = review.userEmail;
    document.getElementById('reviewRating').value = review.rating;
    document.getElementById('reviewComment').value = review.comment;
    // update stars visual
    const stars = document.querySelectorAll('#star-rating .star');
    for(let i=0;i<stars.length;i++){
      stars[i].textContent = i < review.rating ? '★' : '☆';
    }
    window.editingReviewId = id;
    showPopup('Edit this review and submit to update.','info');
  }
  // Delete handler
  if (event.target.classList.contains('btn-delete-review')) {
    const id = event.target.getAttribute('data-id');
    if (!user.id) {
      showPopup('You must be logged in to delete your review','error');
      return;
    }
    if (confirm('Are you sure you want to delete this review?')) {
      const res = await fetch(`/api/reviews/${id}?userId=${user.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showPopup('Review deleted!', 'success');
        if (typeof initializeReviewsPage === 'function') initializeReviewsPage();
      } else {
        showPopup('Could not delete: ' + result.error, 'error');
      }
    }
  }
});

// ========== MAIN INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', () => {
    // Page-specific initializations
    if (document.getElementById('plans-container-target')) {
        initializeMealPlansPage();
    }

    if (document.getElementById('checkout-summary-list')) {
        initializeCheckoutPage();
    }

    if (document.getElementById('steps-container-target')) {
        initializeHowItWorksPage();
    }

    if (document.getElementById('reviews-container')) {
        initializeReviewsPage();
    }
    
    // Form initializations
    initializeContactForm();
    initializeSignupForm();
    initializeLoginForm();
    initializeHomeCookForm();
    initializeIndexPage();
});
