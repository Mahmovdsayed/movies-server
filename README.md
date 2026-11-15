# Movies Server

Backend API server built with Bun, Hono, Drizzle ORM, Neon PostgreSQL, Better-Auth, and Redis. Designed for integration with mobile clients using Expo.

---

## Tech Stack

- Runtime: Bun
- Framework: Hono
- Database: Neon PostgreSQL via Drizzle ORM
- Authentication: Better-Auth (Expo integration, Email OTP, HaveIBeenPwned)
- Caching: Redis (ioredis) with distributed locking
- Email: Nodemailer (SMTP)
- Validation: Zod

---

## Project Structure

```
src/
├── config/
│   └── env.ts
├── constant/
│   └── constant.ts
├── database/
│   ├── schemas/
│   │   ├── auth.ts
│   │   ├── movies.ts
│   │   └── index.ts
│   └── index.ts
├── helpers/
│   └── redis.ts
├── infrastructure/
│   ├── auth/
│   │   ├── auth.ts
│   │   └── password.ts
│   └── email/
│       ├── email.templates.ts
│       ├── email.ts
│       └── email.types.ts
├── middleware/
│   ├── auth.ts
│   ├── cache.ts
│   └── validate.ts
├── modules/
│   └── movies/
│       ├── movies.controller.ts
│       ├── movies.routes.ts
│       ├── movies.schema.ts
│       ├── movies.service.ts
│       └── movies.types.ts
├── types/
│   ├── app.ts
│   ├── http.ts
│   └── user.ts
├── validation/
│   └── global/
│       └── param.validation.ts
├── index.ts
└── server.ts
```

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://user:password@host/database?sslmode=require
REDIS_URL=redis://localhost:6379

BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
MAIL_FROM="Movies App" <no-reply@example.com>
ADMIN_EMAIL=admin@example.com

LOGIN_SIG=your_16_char_secret_signature
JWT_SECRET=your_16_char_jwt_secret
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3

CORS_ORIGIN=http://localhost:8081,http://localhost:19000
```

---

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Push Database Schema

```bash
bunx drizzle-kit push
```

### 3. Start Development Server

```bash
bun run dev
```

### 4. Type Check

```bash
bun run typecheck
```

---

## API Endpoints

### Health Check

- `GET /` - Server status and Redis connection state.

### Authentication

Mounted at `/api/auth/*` and handled directly by Better-Auth. Compatible with `@better-auth/expo/client`.

- `POST /api/auth/sign-up/email` - Sign up with email, password, and name (triggers OTP email verification automatically).
- `POST /api/auth/sign-in/email` - Sign in with email and password.
- `POST /api/auth/email-otp/verify-email` - Verify email using 6-digit OTP code.
- `POST /api/auth/email-otp/send-verification-otp` - Resend verification or login OTP code.
- `POST /api/auth/forget-password/email-otp` - Send password reset OTP code.
- `POST /api/auth/email-otp/reset-password` - Reset password using OTP code and new password.
- `GET /api/auth/get-session` - Retrieve the active user session.
- `POST /api/auth/sign-out` - Sign out and invalidate session.

### Movies Module

Base path: `/v1/movies`

#### 1. Get Liked Movies
- Route: `GET /v1/movies/liked`
- Headers: `Authorization: Bearer <token>` or session cookie
- Caching: Redis cache enabled (`LikedMovies:user:<userId>`), returns `X-Cache: HIT` or `MISS`
- Response:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-string",
        "userId": "user-uuid",
        "mediaId": 550,
        "mediaType": "movie",
        "title": "Fight Club",
        "imageUrl": "https://image.tmdb.org/t/p/w500/path.jpg",
        "rating": 8.4,
        "likedAt": "2026-11-16T00:00:00.000Z"
      }
    ]
  }
  ```

#### 2. Like a Movie or Series
- Route: `POST /v1/movies/liked`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Invalidation: Clears `LikedMovies:user:<userId>` cache
- Request Body:
  ```json
  {
    "mediaId": 550,
    "mediaType": "movie",
    "title": "Fight Club",
    "imageUrl": "https://image.tmdb.org/t/p/w500/path.jpg",
    "rating": 8.4
  }
  ```
- Response (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Movie added to liked list",
    "data": {
      "id": "uuid-string",
      "userId": "user-uuid",
      "mediaId": 550,
      "mediaType": "movie",
      "title": "Fight Club",
      "imageUrl": "https://image.tmdb.org/t/p/w500/path.jpg",
      "rating": 8.4,
      "likedAt": "2026-11-16T00:00:00.000Z"
    }
  }
  ```

#### 3. Unlike a Movie or Series
- Route: `DELETE /v1/movies/liked/:id`
- Headers: `Authorization: Bearer <token>`
- Invalidation: Clears `LikedMovies:user:<userId>` cache
- Response (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Movie removed from liked list",
    "data": {
      "id": "uuid-string",
      "userId": "user-uuid",
      "mediaId": 550,
      "mediaType": "movie",
      "title": "Fight Club",
      "imageUrl": "https://image.tmdb.org/t/p/w500/path.jpg",
      "rating": 8.4,
      "likedAt": "2026-11-16T00:00:00.000Z"
    }
  }
  ```

---

## Expo Client Setup Example

```ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "http://<YOUR_LOCAL_IP>:3000",
  plugins: [
    expoClient({
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});
```
