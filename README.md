# LuxeBags E-Commerce Website

A complete vanilla HTML, CSS, and JavaScript eCommerce website with Firebase Authentication, Firestore, and Paystack integration.

## Project Structure

```
/
├── index.html           # Home page
├── shop.html            # Product listing page
├── product.html         # Product detail page
├── cart.html            # Shopping cart page
├── checkout.html        # Checkout and payment page
├── orders.html          # Order history page
├── login.html           # User login page
├── register.html        # User registration page
├── forgot-password.html # Password reset page
├── order-confirmation.html # Order success page
├── css/
│   └── style.css        # Main stylesheet
├── js/
│   ├── firebase.js      # Firebase configuration and database functions
│   ├── auth.js          # Authentication utilities
│   ├── cart.js          # Shopping cart logic
│   ├── products.js      # Product management
│   ├── orders.js        # Order management
│   ├── paystack.js      # Paystack payment integration
│   └── utils.js         # Utility functions
├── admin/
│   ├── login.html       # Admin login page
│   ├── dashboard.html   # Admin dashboard
│   ├── products.html    # Product management
│   └── orders.html      # Order management
├── assets/
│   ├── images/          # Product images
│   └── icons/           # Icons and favicons
├── firebase.json        # Firebase hosting configuration
├── .firebaserc          # Firebase project configuration
└── firestore.rules      # Firestore security rules
```

## Features

### Customer Features
- User Registration & Login
- Forgot Password
- Home Page with Hero Banner
- Product Categories
- Product Search & Filters
- Product Details with Image Gallery
- Shopping Cart
- Wishlist
- Checkout with Delivery Information
- Paystack Payment Integration
- Order Confirmation
- Order History with Tracking
- PDF Receipt Generation
- Dark Mode Toggle

### Admin Features
- Secure Admin Login
- Dashboard with Statistics
- Sales Analytics
- Orders Management
- Order Status Updates
- Product Management (CRUD)
- Customer Management
- Order Export (CSV)

## Database Structure

### Users Collection
```
users/{uid}
  - name: string
  - email: string
  - phone: string
  - address: string
  - photo: string
  - role: 'user' | 'admin'
  - createdAt: timestamp
```

### Products Collection
```
products/{productId}
  - name: string
  - description: string
  - category: string
  - price: number
  - oldPrice: number (optional)
  - stock: number
  - images: string[]
  - sizes: string[]
  - colors: string[]
  - rating: number
  - isTrending: boolean
  - createdAt: timestamp
```

### Orders Collection
```
orders/{orderId}
  - orderNumber: string
  - userId: string
  - customerName: string
  - email: string
  - phone: string
  - address: string
  - items: array
  - subtotal: number
  - shippingFee: number
  - total: number
  - paymentMethod: string
  - paymentStatus: 'success' | 'pending' | 'failed'
  - orderStatus: 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
  - transactionReference: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Order Status Flow

1. **Pending** - Order placed, awaiting processing
2. **Processing** - Order is being prepared
3. **Packed** - Order is packed and ready for shipping
4. **Shipped** - Order is on the way
5. **Delivered** - Order has been delivered
6. **Cancelled** - Order was cancelled

## Setup Instructions

1. Replace Firebase config in `js/firebase.js` with your project credentials
2. Update Paystack public key in `js/paystack.js`
3. Update admin email in `js/firebase.js`
4. Deploy to Firebase Hosting:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   firebase deploy
   ```

## Environment Variables

Configure in your hosting environment:
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` - Your Paystack public key

## Security Rules

The `firestore.rules` file provides secure access:
- Users can only read/write their own orders
- Admins have full access to all collections
- Products are publicly readable
- Product writes require admin access
- Order creation is protected

## Backend & Production Hardening

This project is served on Vercel (Next.js) with Firebase (Auth + Firestore) and
Paystack payments. The following production controls are in place:

### Authentication & Permissions
- All API routes verify the Firebase ID token server-side via `src/lib/auth.ts`
  (`requireUser`, `requireAdmin`). Client-supplied identity is never trusted.
- Orders can only be created by **registered, authenticated users**; the user id
  in the order must match the authenticated user.
- Admins are resolved from the `users/{uid}.role` field (or `ADMIN_EMAIL`).

### Orders & User History
- `POST /api/orders` creates the order **before** charging, writing atomically to
  both `orders/{id}` and `users/{uid}/orders/{id}` (the user's order history) via
  an Admin batch, so history can never diverge.
- `GET /api/orders` returns the current user's history; `GET /api/orders/[id]`
  returns a single order for the owner or an admin.
- Stock is decremented inside a Firestore transaction in the Paystack webhook
  (`src/app/api/webhook/paystack/route.ts`), and the webhook verifies the charge
  with Paystack before marking the order paid.

### Rate Limiting
- `src/lib/rateLimit.ts` provides a sliding-window limiter applied per route
  (e.g. 10 order creations/min, 120 reads/min). On Vercel, swap the in-memory
  store for Upstash/Vercel KV for global limits.

### Security & RLS
- `firestore.rules` enforces: orders created only by their owner as `pending`,
  users read own doc only, profile writes admin-only (no privilege escalation),
  products publicly readable but admin-writable.
- `vercel.json` sets CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, and CDN cache headers for static assets.

### Error Tracking & Logs
- `src/lib/logger.ts` emits structured JSON logs and forwards exceptions to an
  error tracker when `SENTRY_DSN`/`ERROR_TRACKING_DSN` is set.

### CI/CD, Scaling & Recovery
- `.github/workflows/ci.yml` runs lint + typecheck + build on every PR/push.
- `.github/workflows/deploy.yml` deploys to Vercel on `main`/`master`.
- Vercel provides CDN, load balancing, and autoscaling; functions are stateless
  and idempotent. The webhook is idempotent on `paymentReference` and has a
  payment-recovery path that reconstructs a lost order from a verified charge.

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styles with variables, flexbox, grid
- **Vanilla JavaScript** - ES6 modules, no frameworks
- **Firebase** - Authentication, Firestore, Storage
- **Paystack** - Payment processing