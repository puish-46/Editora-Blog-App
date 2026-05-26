# Blog App - Backend

## Overview

A Node.js + Express REST API backend for the Blog App. Connects to MongoDB and supports role-based routes for Users, Authors, and Admins.

## Project Structure

```
BLOG-APP-BACKEND/
├── APIs/
│   ├── CommonAPI.js      # Login / Register (public routes)
│   ├── UserAPI.js        # User routes
│   ├── AuthorAPI.js      # Author routes (write, edit, delete articles)
│   └── AdminAPI.js       # Admin routes (manage users & authors)
├── middlewares/
│   └── verifyToken.js    # JWT auth middleware
├── models/
│   ├── UserModel.js      # Mongoose User schema
│   └── ArticleModel.js   # Mongoose Article schema
├── config/               # DB config
├── server.js             # Express server entry point
└── .env                  # Environment variables
```

## API Routes

| Base Path | Who Can Access | Purpose |
|-----------|---------------|---------|
| `/auth` | Public | Login & Register |
| `/user-api` | Users | Read articles, manage profile |
| `/author-api` | Authors | Write, edit, delete articles |
| `/admin-api` | Admins | Manage users and authors |

## Concepts Covered

- **Express Router** — separate route files per role
- **JWT + Cookie Parser** — token stored in HTTP-only cookie
- **CORS** — allowing frontend at `localhost:5173`
- **Mongoose Models** — User and Article schemas
- **Error Handling Middleware** — ValidationError, CastError, duplicate fields
- **Role-Based Access** — protected routes via `verifyToken` middleware
