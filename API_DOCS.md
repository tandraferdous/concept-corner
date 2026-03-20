# API Documentation — Concept Corner

Base URL: `http://localhost:5000/api/v1`

All authenticated endpoints require an `Authorization: Bearer <token>` header.

---

## Authentication

### Register
**POST** `/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
Response: `201` — User created, verification email sent.

---

### Login
**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
Response:
```json
{
  "status": "success",
  "data": {
    "user": { "id": "...", "name": "John", "email": "...", "role": "student" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### Verify Email
**GET** `/auth/verify-email/:token`

---

### Forgot Password
**POST** `/auth/forgot-password`

```json
{ "email": "john@example.com" }
```

---

### Reset Password
**PATCH** `/auth/reset-password/:token`

```json
{ "password": "NewSecurePass123!" }
```

---

### Refresh Token
**POST** `/auth/refresh-token`

```json
{ "refreshToken": "eyJ..." }
```

---

### Get Current User
**GET** `/auth/me` *(Authenticated)*

---

## Courses

### Get All Courses
**GET** `/courses`

Query params:
- `page` (default: 1)
- `limit` (default: 12)
- `category`
- `level` (beginner | intermediate | advanced)
- `search`
- `sort` (price_asc | price_desc | newest | rating)
- `featured` (true)

---

### Get Single Course
**GET** `/courses/:id`

---

### Create Course
**POST** `/courses` *(Admin/Instructor)*

```json
{
  "title": "React Masterclass",
  "description": "Complete React course...",
  "shortDescription": "Learn React from scratch",
  "category": "Web Development",
  "price": 2999,
  "discountedPrice": 1999,
  "level": "intermediate",
  "language": "Bengali",
  "thumbnail": "https://...",
  "requirements": ["Basic JavaScript"],
  "learningOutcomes": ["Build React apps"]
}
```

---

### Update Course
**PATCH** `/courses/:id` *(Admin/Instructor)*

---

### Delete Course
**DELETE** `/courses/:id` *(Admin)*

---

### Publish/Unpublish Course
**PATCH** `/courses/:id/publish` *(Admin)*

---

## Lessons

### Get Lessons for Course
**GET** `/courses/:courseId/lessons`

---

### Get Single Lesson
**GET** `/courses/:courseId/lessons/:lessonId` *(Enrolled students only)*

---

### Create Lesson
**POST** `/courses/:courseId/lessons` *(Admin/Instructor)*

```json
{
  "title": "Introduction to React",
  "description": "In this lesson...",
  "videoUrl": "https://res.cloudinary.com/...",
  "hlsUrl": "https://res.cloudinary.com/.../master.m3u8",
  "duration": 1800,
  "order": 1,
  "isPreview": true
}
```

---

### Update Lesson
**PATCH** `/courses/:courseId/lessons/:lessonId` *(Admin/Instructor)*

---

### Delete Lesson
**DELETE** `/courses/:courseId/lessons/:lessonId` *(Admin)*

---

### Mark Lesson Complete
**POST** `/courses/:courseId/lessons/:lessonId/complete` *(Authenticated)*

---

## Payments (bKash)

### Create Payment
**POST** `/payments/create` *(Authenticated)*

```json
{
  "courseId": "...",
  "amount": 1999,
  "callbackUrl": "http://localhost:3000/checkout/callback"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "paymentID": "TR001...",
    "bkashURL": "https://...",
    "callbackURL": "...",
    "successCallbackURL": "...",
    "failureCallbackURL": "...",
    "cancelledCallbackURL": "...",
    "amount": "1999",
    "intent": "sale"
  }
}
```

---

### Verify Payment
**POST** `/payments/verify` *(Authenticated)*

```json
{
  "paymentID": "TR001...",
  "status": "success"
}
```

On success, auto-enrolls the student in the course.

---

### Payment History
**GET** `/payments/history` *(Authenticated)*

---

### bKash Webhook
**POST** `/payments/webhook`

bKash calls this endpoint with payment status updates.

---

## Cart

### Get Cart
**GET** `/cart` *(Authenticated)*

---

### Add to Cart
**POST** `/cart/add` *(Authenticated)*

```json
{ "courseId": "..." }
```

---

### Remove from Cart
**DELETE** `/cart/remove/:courseId` *(Authenticated)*

---

### Clear Cart
**DELETE** `/cart/clear` *(Authenticated)*

---

## Enrollments

### Get My Enrollments
**GET** `/enrollments` *(Authenticated)*

---

### Check Enrollment
**GET** `/enrollments/check/:courseId` *(Authenticated)*

---

## Reviews

### Get Course Reviews
**GET** `/courses/:courseId/reviews`

---

### Create Review
**POST** `/courses/:courseId/reviews` *(Enrolled students only)*

```json
{
  "rating": 5,
  "comment": "Excellent course!"
}
```

---

### Update Review
**PATCH** `/courses/:courseId/reviews/:reviewId` *(Review owner)*

---

### Delete Review
**DELETE** `/courses/:courseId/reviews/:reviewId` *(Review owner/Admin)*

---

## Admin Endpoints

All admin endpoints require `role: admin`.

### Dashboard Stats
**GET** `/admin/stats`

Response includes: totalUsers, totalCourses, totalEnrollments, totalRevenue, recentPayments, popularCourses.

---

### Get All Users
**GET** `/admin/users`

Query: `page`, `limit`, `role`, `search`

---

### Update User Role
**PATCH** `/admin/users/:userId/role`

```json
{ "role": "instructor" }
```

---

### Delete User
**DELETE** `/admin/users/:userId`

---

### Get All Payments
**GET** `/admin/payments`

Query: `page`, `limit`, `status`, `startDate`, `endDate`

---

### Revenue Analytics
**GET** `/admin/analytics/revenue`

Query: `period` (7d | 30d | 90d | 1y)

---

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
