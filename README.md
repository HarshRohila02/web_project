# HomeCook — Authentic Indian Home Kitchen (Web)

HomeCook is a Node.js + Express web application with EJS views and MongoDB (Mongoose). It provides meal plans, instant meals, checkout, reviews, contact submissions and HomeCook onboarding.

## Features
- Static and dynamic pages rendered with EJS
- Shopping cart (client-side, persisted in localStorage)
- CRUD API backed by MongoDB for Orders, Reviews, HomeCook applications, Contact submissions and Users
- Simple auth endpoints (signup/login) — JWT recommended for production
- Client-side form validation and UX scripts in `public/js/script.js`

## Quickstart (Windows)
1. Clone repository:
   git clone <repo-url>
2. Install dependencies:
   npm install
3. Create `.env` in project root with:
   ```
   MONGODB_URI=mongodb://localhost:27017/homecook
   JWT_SECRET=your_jwt_secret  # optional but recommended
   ```
4. Run in development:
   npm run dev
5. Open browser:
   http://localhost:3000

## Available npm scripts
- `npm run dev` — start server with nodemon (development)

## Project structure (important files)
- `server.js` — app entry (connects DB, mounts routes)
- `config/database.js` — MongoDB connection helper
- `routes/`
  - `index.js` — page routes (renders EJS views)
  - `api.js` — JSON API (CRUD routes)
- `models/` — Mongoose schemas (User, Order, Review, ContactSubmission, HomeCookApplication)
- `views/` — EJS templates and `partials/`
- `public/`
  - `css/style.css` — site styles
  - `js/script.js` — frontend logic (cart, filters, forms)
  - `data/*.json` — static demo data (meals, checkout, how it works)
- `package.json` — project metadata and scripts

## API overview (JSON)
Base: `/api`

- Orders
  - `POST /api/orders` — create order
  - `GET /api/orders` — list orders
  - `GET /api/orders/:id` — get order
  - `PUT /api/orders/:id` — update order
  - `DELETE /api/orders/:id` — delete order
- Reviews
  - `POST /api/reviews` — create review
  - `GET /api/reviews` — list (supports `mealId`, `rating`, `sortBy` query params)
  - `GET /api/reviews/:id`, `PUT /api/reviews/:id`, `DELETE /api/reviews/:id`
- HomeCook applications
  - `POST /api/homecooks`, `GET /api/homecooks`
- Contact submissions
  - `POST /api/contact`, `GET /api/contact`
- Users (auth)
  - `POST /api/users/signup`, `POST /api/users/login`

## Security & production notes
- Do NOT store plaintext passwords. Use bcrypt to hash passwords before saving.
- Implement JWT or session middleware to protect edit/delete API routes (review/order ownership).
- Validate and sanitize all inputs server-side (use `validator` or express-validator).
- Use environment secrets (MONGODB_URI, JWT_SECRET) and do not commit them.
- Add rate-limiting / CAPTCHA on contact endpoints to reduce spam.

## Development tips
- Use `npm ci` for CI installs (uses package-lock.json).
- Rebuild node_modules: `rmdir /s /q node_modules && npm ci` (Windows CMD) or `rm -rf node_modules && npm ci` (PowerShell/Git Bash).
- To add server-side meal management, create a `Meal` model and API endpoints (GET/POST/PUT/DELETE) and update views to render server-side.

## Contributing
- Create feature branch, write tests for new backend logic, submit PR with clear description.
- Keep secrets out of commits; use `.env` and `.gitignore`.

## License
Add your license file (e.g., MIT) and mention it here.
