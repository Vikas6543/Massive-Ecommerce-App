============================================================
BACKEND OVERVIEW
========================
This repository contains the backend application built with technologies such as:
* Node.js
* Express.js
* MongoDB
* Socket.IO
* Redis

============================================================
TECH STACK
========================
Core:
* Express
* MongoDB (Mongoose)
* Node.js

Authentication & Security:
* bcryptjs
* jsonwebtoken
* helmet
* cors
* express-rate-limit

Real-time Communication:
* socket.io

Caching:
* ioredis

File Uploads:
* cloudinary
* multer
* multer-storage-cloudinary

Validation:
* joi

Email:
* nodemailer

Payments:
* razorpay

Logging:
* morgan

============================================================
INSTALLATION
========================
1. Install dependencies
   npm install

2. Configure environment variables
   Create a .env file and add the required variables.

3. Start development server
   npm run dev

4. Start production server
   npm start

============================================================
APPLICATION STARTUP FLOW
========================
1. Load environment variables
   src/config/env.js

2. Initialize Redis
   src/config/redis.js

3. Import Express application
   src/app.js

4. Connect to MongoDB
   src/config/db.js

5. Create HTTP server
   http.createServer(app)

6. Initialize Socket.IO
   src/config/socket.js

7. Expose Socket.IO instance
   src/services/notification.service.js

8. Start listening on:
   process.env.PORT || 5000

============================================================
CONFIGURATION MODULES
========================
src/config/env.js
* Loads environment variables using dotenv

src/config/db.js
* Connects to MongoDB using MONGO_URI

src/config/cloudinary.js
* Configures Cloudinary
Required:
* CLOUDINARY_CLOUD_NAME
* CLOUDINARY_API_KEY
* CLOUDINARY_API_SECRET

src/config/email.js
* Configures Nodemailer
Required:
* SMTP_USER
* SMTP_PASS

src/config/razorpay.js
* Configures Razorpay client
Required:
* RAZORPAY_KEY_ID
* RAZORPAY_KEY_SECRET

src/config/redis.js
* Initializes Redis client
* Logs connection and errors
Required:
* REDIS_HOST
* REDIS_PORT

src/config/socket.js
* Initializes Socket.IO
* JWT authentication for socket connections
* Socket CORS configuration
Required:
* ACCESS_TOKEN_SECRET
* CLIENT_URL

============================================================
ENVIRONMENT VARIABLES
========================
PORT
NODE_ENV
MONGO_URI
ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET
CLIENT_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
SMTP_USER
SMTP_PASS
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
REDIS_HOST
REDIS_PORT

============================================================
REALTIME NOTIFICATIONS
========================
Socket.IO Features:
* JWT authenticated socket connections
* User-specific rooms
* Role-based rooms
* Online users tracking using Map
* Realtime notification delivery

Related Files:
src/config/socket.js
src/services/notification.service.js

============================================================
REDIS
========================
Redis is initialized in:
src/config/redis.js
Usage:
* Caching
* Session-like storage
* Performance optimization
* Service-specific data storage

============================================================
PROJECT STRUCTURE
========================
src/

├── app.js
│   Express application setup

├── config/
│   Configuration modules

├── controllers/
│   API request handlers
│   admin.controller.js
│   auth.controller.js
│   brand.controller.js
│   cart.controller.js
│   category.controller.js
│   coupon.controller.js
│   notification.controller.js
│   order.controller.js
│   product.controller.js
│   review.controller.js
│   search.controller.js
│   seller.controller.js
│   wishlist.controller.js

├── middlewares/
│   Express middleware
│   auth.middleware.js
│   upload.middleware.js
│   validate.middleware.js

├── models/
│   Mongoose models
│   BrandModel.js
│   CartModel.js
│   CategoryModel.js
│   CouponModel.js
│   NotificationModel.js
│   OrderModel.js
│   PaymentModel.js
│   ProductModel.js
│   ReviewModel.js
│   UserModel.js
│   WishlistModel.js

├── routes/
│   Route definitions
│   admin.routes.js
│   auth.routes.js
│   brand.routes.js
│   cart.routes.js
│   category.routes.js
│   coupon.routes.js
│   notification.routes.js
│   order.routes.js
│   product.routes.js
│   review.routes.js
│   search.routes.js
│   seller.routes.js
│   wishlist.routes.js

├── services/
│   Shared business logic
│   email.service.js
│   notification.service.js

├── utils/
│   Utility helpers
│   ApiError.js
│   ApiResponse.js
│   asyncHandler.js
│   deviceInfo.js
│   jwt.js
│   otp.js
└── validations/
Validation schemas
```
auth.validation.js
coupon.validation.js
order.validation.js
product.validation.js
```

============================================================
AUTHENTICATION & SECURITY
========================
Authentication:
* JWT based authentication
* Access token support
* Refresh token support

Password Security:
* bcryptjs password hashing

Security Middleware:
* helmet
* cors
* express-rate-limit

Socket Security:
* JWT verification during connection

============================================================
FILE UPLOADS & MEDIA
========================
Upload Stack:
* multer
* cloudinary
* multer-storage-cloudinary

Configuration File:
src/config/cloudinary.js
Capabilities:
* Image uploads
* Cloud media storage
* Cloudinary asset management

============================================================
PAYMENT INTEGRATION
========================
Provider:
* Razorpay
Configuration:
* src/config/razorpay.js

Used For:
* Order payments
* Payment processing
* Transaction workflows

============================================================
EMAIL SERVICE
========================
Provider:
* Gmail SMTP

Library:
* Nodemailer

Configuration:
* src/config/email.js

Required Variables:
* SMTP_USER
* SMTP_PASS

============================================================
ERROR HANDLING
========================
ApiError.js
* Standard application error class

ApiResponse.js
* Standard API response format

asyncHandler.js
* Async route wrapper
* Centralized error propagation

============================================================
RECOMMENDED IMPROVEMENTS
========================
1. Add .env.example
2. Add API documentation
3. Add database seed scripts
4. Add migration scripts
5. Add deployment instructions
6. Add testing documentation