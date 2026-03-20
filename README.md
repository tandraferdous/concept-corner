# 🎓 Concept Corner — Premium Video Course Selling Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/bKash-Payment-pink?style=for-the-badge" />
</p>

A fully functional, production-ready video course selling platform with premium animations, secure bKash payment integration, complete course and student management, and enterprise-level security.

## ✨ Features

### 🔐 Authentication & Security
- Email/password signup with email verification
- JWT authentication (15 min access token, 7 day refresh token)
- Account lockout after 5 failed attempts
- bcrypt password hashing (12 salt rounds)
- Rate limiting (100 req/15min general, 20 req/min auth)
- CORS, XSS, and CSRF protection
- Input sanitization with express-mongo-sanitize

### 📚 Course Management
- Full CRUD for courses and lessons
- HLS adaptive video streaming (360p, 720p, 1080p)
- Course categories, search, and filtering
- 5-star rating and review system
- Progress tracking per student
- Certificate generation on completion

### 💳 Payment System (bKash)
- Create payment endpoint
- Payment verification
- Webhook handling
- Auto-enrollment on successful payment
- Invoice generation
- Payment history

### 👨‍🎓 Student Dashboard
- Enrolled courses with progress bars
- Custom HLS video player
- Lesson completion tracking
- Wishlist management
- Certificate download

### 👨‍💼 Admin Dashboard
- Revenue analytics with charts
- User management
- Course approval/rejection
- Payment monitoring
- Activity logs

### 🎨 Premium Design
- Framer Motion animations throughout
- Parallax hero section
- Animated course cards
- Smooth page transitions
- Mobile-first responsive design
- Dark mode support

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB 7.0, Mongoose |
| Auth | JWT, bcrypt |
| Payment | bKash API |
| Video | HLS.js |
| Storage | Cloudinary |
| Email | Nodemailer (SMTP/SendGrid) |
| State | Zustand |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/tandraferdous/concept-corner.git
cd concept-corner

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit environment files with your credentials
# See Configuration section below

# Start all services
docker-compose up -d

# Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

### Option 2: Manual Setup

```bash
# Clone
git clone https://github.com/tandraferdous/concept-corner.git
cd concept-corner

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev

# Frontend setup (new terminal)
cd frontend
cp .env.example .env.local
# Edit .env.local with your credentials
npm install
npm run dev
```

## ⚙️ Configuration

### Backend Environment Variables (`backend/.env`)

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/concept-corner

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_64_char_random_hex_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another_64_char_random_hex_string
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:3000

# bKash Payment (get from bKash developer portal)
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@conceptcorner.com
FROM_NAME=Concept Corner

# Cloudinary (for video/image hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Environment Variables (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=Concept Corner
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📁 Project Structure

```
concept-corner/
├── backend/
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── controllers/     # Route handlers
│   │   │   ├── authController.ts
│   │   │   ├── courseController.ts
│   │   │   ├── lessonController.ts
│   │   │   ├── enrollmentController.ts
│   │   │   ├── paymentController.ts
│   │   │   ├── reviewController.ts
│   │   │   ├── cartController.ts
│   │   │   └── adminController.ts
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.ts      # JWT verification
│   │   │   ├── rateLimiter.ts
│   │   │   ├── validate.ts
│   │   │   └── error.ts
│   │   ├── models/          # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Course.ts
│   │   │   ├── Lesson.ts
│   │   │   ├── Enrollment.ts
│   │   │   ├── Payment.ts
│   │   │   ├── Review.ts
│   │   │   └── Cart.ts
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # Utilities
│   │   │   ├── jwt.ts
│   │   │   ├── email.ts
│   │   │   ├── bkash.ts
│   │   │   └── helpers.ts
│   │   └── server.ts        # Entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/          # Auth pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/     # Protected dashboards
│   │   │   ├── student/
│   │   │   ├── instructor/
│   │   │   └── admin/
│   │   ├── courses/         # Course catalog
│   │   ├── course/[id]/     # Course detail
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── layout.tsx
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── auth/            # Auth components
│   │   ├── course/          # Course components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── layout/          # Navbar, Footer
│   │   ├── payment/         # Payment components
│   │   └── ui/              # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # API client, helpers
│   ├── styles/              # Global CSS
│   ├── .env.example
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── docker-compose.yml
├── .gitignore
├── README.md
├── API_DOCS.md
└── DEPLOYMENT.md
```

## 🔌 API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/verify-email/:token` | Verify email |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| PATCH | `/api/v1/auth/reset-password/:token` | Reset password |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/courses` | Get all courses |
| GET | `/api/v1/courses/:id` | Get single course |
| POST | `/api/v1/courses` | Create course (admin) |
| PATCH | `/api/v1/courses/:id` | Update course |
| DELETE | `/api/v1/courses/:id` | Delete course |

### Payments (bKash)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/create` | Create bKash payment |
| POST | `/api/v1/payments/verify` | Verify payment |
| GET | `/api/v1/payments/history` | Payment history |
| POST | `/api/v1/payments/webhook` | bKash webhook |

See [API_DOCS.md](./API_DOCS.md) for the complete API reference.

## 🔒 Security Features

- ✅ bcrypt password hashing (12 salt rounds)
- ✅ JWT with short-lived access tokens (15 min)
- ✅ Refresh token rotation (7 days)
- ✅ Rate limiting (20 req/min for auth endpoints)
- ✅ Account lockout after 5 failed login attempts
- ✅ Input sanitization (mongo-sanitize + xss-clean)
- ✅ Helmet.js security headers
- ✅ CORS whitelist configuration
- ✅ Environment variable protection
- ✅ Email verification required
- ✅ HTTPS ready

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide including:
- MongoDB Atlas setup
- Vercel/Railway deployment
- Nginx reverse proxy configuration
- SSL certificate setup
- Environment variable management
- bKash production credentials

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<p align="center">Built with ❤️ for learners in Bangladesh 🇧🇩</p>
