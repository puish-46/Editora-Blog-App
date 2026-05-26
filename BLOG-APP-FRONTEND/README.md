# Blog App - Frontend

## Overview

A React + Vite frontend for the Blog App. Supports three user roles (User, Author, Admin) with protected routes and global auth state managed using Zustand.

## Project Structure

```
src/
├── App.jsx                    # Routes and layout setup
├── store/
│   └── authStore.js           # Zustand global auth state
├── components/
│   ├── Login.jsx              # Login page
│   ├── Register.jsx           # Register page
│   ├── Header.jsx             # Navigation header
│   ├── Footer.jsx             # Footer
│   ├── Home.jsx               # Home page
│   ├── Articles.jsx           # All articles listing
│   ├── ArticleByID.jsx        # Single article view
│   ├── WriteArticles.jsx      # Author — write new article
│   ├── EditArticle.jsx        # Author — edit article
│   ├── AuthorArticles.jsx     # Author — view own articles
│   ├── AuthorProfile.jsx      # Author profile page
│   ├── AuthorList.jsx         # Admin — list of authors
│   ├── UserList.jsx           # Admin — list of users
│   ├── UserProfile.jsx        # User profile page
│   ├── AdminProfile.jsx       # Admin profile page
│   ├── ProtectedRoute.jsx     # Restricts routes by role
│   ├── RootLayout.jsx         # Common layout wrapper
│   └── Unauthorized.jsx       # Access denied page
└── main.jsx                   # App entry point
```

## Concepts Covered

- **React Router** — multi-page navigation with nested routes
- **Zustand** — global state for auth (login/logout/user info)
- **Protected Routes** — role-based access (user / author / admin)
- **JWT via Cookies** — credentials sent with each request
- **Axios** — API calls to backend
- **Component Composition** — shared Header, Footer, RootLayout
