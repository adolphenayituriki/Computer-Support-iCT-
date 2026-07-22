# CS Hub (iCT) — Computer Support System

A full-stack web application for **CS Hub**, a computer support and digital services center. The system provides a public-facing website, user dashboard, admin dashboard, AI-powered learning platform, real-time messaging, ticket management, and more.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Frontend Routes](#frontend-routes)
- [Backend API Endpoints](#backend-api-endpoints)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

CS Hub (iCT) is a computer support and training center based in Rwanda. This system allows users to:

- Browse services, courses, news, and team information
- Submit support tickets and track their status
- Suggest new services or features
- Chat directly with admin (1-on-1 messaging)
- Participate in a community group chat
- Access an AI-powered learning platform with quizzes, notes, and resources
- Play educational games

Admins can manage tickets, suggestions, conversations, team applications, beneficiaries, news, courses, and testimonials through a dedicated dashboard.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first CSS |
| **React Router 7** | Client-side routing |
| **React Icons** | Icon library |
| **Firebase Auth** | Google OAuth sign-in |
| **React Markdown** | Markdown rendering (AI learning) |
| **Vite Compression** | Gzip + Brotli pre-compression |

### Backend (Main)
| Technology | Purpose |
|---|---|
| **Express 4** | REST API framework |
| **MongoDB + Mongoose 9** | Database |
| **JWT (jsonwebtoken)** | Authentication |
| **bcryptjs** | Password hashing |
| **Swagger UI Express** | API documentation |
| **Brevo (SMTP)** | Email notifications |

### Backend (AI)
| Technology | Purpose |
|---|---|
| **Express 4** | AI API framework |
| **MongoDB + Mongoose 9** | AI data storage |
| **Multer** | File upload handling |
| **pdf-parse** | PDF document parsing |

---

## Project Structure

```
COMPUTER_SUPPORT/
├── frontend/                    # React SPA (Vite)
│   ├── src/
│   │   ├── components/          # All UI components (50+)
│   │   │   ├── Dashboard.jsx        # User dashboard (analytics, tickets, chat, group chat, help)
│   │   │   ├── AdminDashboard.jsx   # Admin dashboard
│   │   │   ├── AdminChatView.jsx    # Admin messaging panel
│   │   │   ├── UserChatView.jsx     # User 1-on-1 chat with admin
│   │   │   ├── GroupChatView.jsx    # Community group chat
│   │   │   ├── Navbar.jsx           # Public navigation bar
│   │   │   ├── Hero.jsx             # Landing page hero
│   │   │   ├── Services.jsx         # Services section
│   │   │   ├── HowItWorks.jsx       # How it works steps
│   │   │   ├── News.jsx             # News page
│   │   │   ├── Courses.jsx          # Knowledge base
│   │   │   ├── AILearning.jsx       # AI learning entry
│   │   │   ├── AILearningDashboard.jsx  # AI learning dashboard
│   │   │   ├── CollaboratorsPage.jsx    # Team profiles
│   │   │   └── ... (40+ more)
│   │   ├── AuthContext.jsx      # Authentication state
│   │   ├── LanguageContext.jsx  # EN/RW language support
│   │   ├── ToastContext.jsx     # Toast notifications
│   │   ├── SidebarContext.jsx   # Sidebar state
│   │   ├── App.jsx              # Routes & layout
│   │   ├── App.css              # All styles (16,000+ lines)
│   │   ├── api.js               # API base URL config
│   │   └── main.jsx             # Entry point
│   ├── public/                  # Static assets (logo, images)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # Express API server (port 3001)
│   ├── index.js                 # Server entry point
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js            # MongoDB connection
│   │   │   └── swagger.js       # Swagger config
│   │   ├── controllers/         # Business logic (13 controllers)
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT authentication middleware
│   │   ├── models/              # Mongoose schemas (18 models)
│   │   ├── routes/              # API routes (14 route files)
│   │   └── services/
│   │       └── mailer.js        # Brevo email service
│   ├── .env
│   └── package.json
│
├── backend-ai/                  # AI Learning API server (port 3002)
│   ├── index.js
│   ├── .env
│   └── package.json
│
├── README.md                    # This file
└── SECURITY.md
```

---

## Features

### Public Website
- **Landing Page** — Hero section, how-it-works steps, services grid, why-us popup, about, FAQ, testimonials, CTA, contact form
- **News** — Blog/news articles with comments and likes
- **Courses** — Knowledge base with course listings
- **AI Learning** — Entry point for AI learning platform
- **Collaborators** — Team member profiles with horizontal zigzag connector design
- **Game Hub** — Educational games (word scramble, speed quiz, memory match)
- **Contact** — Contact form with admin notifications
- **Newsletter Popup** — Email subscription
- **Emergency Button** — Quick access support
- **WhatsApp Float** — Persistent WhatsApp group link

### User Dashboard (`/dashboard`)
- **Analytics** — Ticket stats (open, in-progress, resolved, closed), suggestion count
- **Tickets** — Create, view, edit, delete support tickets with status filtering
- **Suggestions** — Submit and track service/feature suggestions
- **Messages (1-on-1)** — Real-time chat with admin, auto-refreshes every 4 seconds
- **Group Chat** — Community group chat, auto-refreshes every 3 seconds, live indicator
- **Help Center** — FAQ accordion, quick links to tickets/suggestions/WhatsApp/phone
- **Team Dashboard** — (For team members) assigned beneficiaries, all tickets view
- **Profile Settings** — Edit name/email, change password

### Admin Dashboard (`/admin`)
- **Tickets Management** — View, update status, reply to all user tickets
- **Suggestions Management** — Review, update status, reply to suggestions
- **Team Applications** — Review, approve/reject team applications
- **Conversations** — Direct messaging with any user, ticket/suggestion threads
- **Community Group Chat** — Admin participation in group chat
- **News Management** — Create, edit, delete news articles
- **Beneficiaries** — Manage assigned beneficiaries
- **Testimonials** — Manage user testimonials

### AI Learning Dashboard (`/ai-dashboard`)
- **AI Learning** — Topic-based learning sessions
- **AI Tutor** — Interactive AI-powered tutoring
- **AI Quiz** — Automated quiz generation
- **AI Notes** — AI-generated study notes
- **AI Resources** — Resource library with chat

### Authentication
- Email/password registration and login
- Google OAuth sign-in (Firebase)
- Forgot password with email reset
- JWT token-based session management
- Role-based access (user, team member, admin)

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MongoDB** Atlas account (or local MongoDB)
- **Brevo** account for email (or any SMTP provider)
- **Firebase** project for Google OAuth (optional)

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=3001
MONGO_URI_CLOUD=<your_mongodb_connection_string>
ADMIN_PASSWORD=<admin_account_password>
JWT_SECRET=<random_secret_string>
ADMIN_EMAIL=cshub.rw@gmail.com
BREVO_LOGIN=<brevo_smtp_login>
BREVO_API_KEY=<brevo_api_key>
BREVO_FROM_EMAIL=<sender_email>
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=<firebase_google_client_id>
```

### Backend AI (`backend-ai/.env`)

```env
PORT=3002
MONGO_URI_CLOUD=<same_mongodb_connection_string>
JWT_SECRET=<same_jwt_secret>
```

### Frontend (optional — has defaults)

```env
VITE_API_URL=http://localhost:3001
VITE_AI_API_URL=http://localhost:3002
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/COMPUTER_SUPPORT.git
cd COMPUTER_SUPPORT
```

### 2. Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend (main)
cd ../backend && npm install

# Backend (AI)
cd ../backend-ai && npm install
```

### 3. Set up environment variables

Create `.env` files in `backend/` and `backend-ai/` as shown in [Environment Variables](#environment-variables).

### 4. Seed the admin account

```bash
cd backend
npm run seed
```

This creates the default admin account using the `ADMIN_PASSWORD` and `ADMIN_EMAIL` from your `.env`.

### 5. Start the servers

Open three terminals:

```bash
# Terminal 1 — Frontend (port 5173)
cd frontend && npm run dev

# Terminal 2 — Backend API (port 3001)
cd backend && npm start

# Terminal 3 — AI Backend (port 3002)
cd backend-ai && npm start
```

### 6. Open the app

Visit [http://localhost:5173](http://localhost:5173)

---

## Frontend Routes

| Path | Component | Access |
|---|---|---|
| `/` | Landing Page (Home) | Public |
| `/contact` | Contact Form | Public |
| `/news` | News & Articles | Public |
| `/courses` | Knowledge Base | Public |
| `/ai-learning` | AI Learning Entry | Public |
| `/play` | Game Hub | Public |
| `/play/:category` | Game Play | Public |
| `/collaborators` | Team Profiles | Public |
| `/dashboard` | User Dashboard | Authenticated |
| `/admin` | Admin Dashboard | Admin only |
| `/ai-dashboard` | AI Learning Dashboard | Authenticated |
| `/setup-account` | Account Setup | Authenticated |

---

## Backend API Endpoints

All endpoints are prefixed with `/api`.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/forgot-password` | Request password reset |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Tickets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tickets` | Get user's tickets |
| POST | `/api/tickets` | Create ticket |
| PUT | `/api/tickets/:id` | Update ticket |
| DELETE | `/api/tickets/:id` | Delete ticket |
| POST | `/api/tickets/:id/messages` | Add message to ticket |
| GET | `/api/tickets/:id` | Get single ticket |

### Suggestions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/suggestions` | Get user's suggestions |
| POST | `/api/suggestions` | Create suggestion |
| POST | `/api/suggestions/:id/messages` | Add message to suggestion |

### Conversations (1-on-1 Chat)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/conversations` | Get user's conversation |
| POST | `/api/conversations` | Create conversation with first message |
| POST | `/api/conversations/:id/messages` | Send message in conversation |

### Group Chat (Community)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/group-chat` | Get community chat (auto-creates if none) |
| POST | `/api/group-chat/messages` | Send message to community chat |

### News
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/news` | List all articles |
| GET | `/api/news/:slug` | Get single article |
| POST | `/api/news/:slug/like` | Like article |
| POST | `/api/news/:slug/comment` | Add comment |

### Courses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | List all courses |
| GET | `/api/courses/:id` | Get single course |

### Contact
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contact` | Submit contact form |

### Team Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/team/apply` | Submit team application |
| GET | `/api/team/status` | Check application status |

### Beneficiaries
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/beneficiaries` | Get assigned beneficiaries |
| PUT | `/api/beneficiaries/:id/status` | Update beneficiary status |

### Admin Endpoints (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/tickets` | Get all tickets |
| PUT | `/api/admin/tickets/:id` | Update any ticket |
| POST | `/api/admin/tickets/:id/messages` | Reply to ticket |
| GET | `/api/admin/suggestions` | Get all suggestions |
| PUT | `/api/admin/suggestions/:id` | Update any suggestion |
| POST | `/api/admin/suggestions/:id/messages` | Reply to suggestion |
| GET | `/api/admin/conversations` | Get all conversations |
| POST | `/api/admin/conversations` | Create conversation with user |
| POST | `/api/admin/conversations/:id/messages` | Reply in conversation |
| DELETE | `/api/admin/conversations/:id` | Delete conversation |
| GET | `/api/admin/team-apps` | Get all team applications |
| PUT | `/api/admin/team-apps/:id` | Approve/reject application |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/news` | Manage news |
| POST | `/api/admin/news` | Create news article |
| PUT | `/api/admin/news/:id` | Update news article |
| DELETE | `/api/admin/news/:id` | Delete news article |

### Swagger API Documentation

Available at [http://localhost:3001/api-docs](http://localhost:3001/api-docs) when the backend is running.

---

## Database Models

| Model | Description |
|---|---|
| `User` | User accounts (name, email, password hash, role, Google ID) |
| `Ticket` | Support tickets with status, category, messages thread |
| `Suggestion` | User suggestions with status and message thread |
| `Conversation` | 1-on-1 user-admin conversations with messages |
| `GroupChat` | Community group chat with shared messages |
| `News` | News articles with comments, likes |
| `Course` | Knowledge base courses |
| `Contact` | Contact form submissions |
| `TeamApp` | Team member applications |
| `Beneficiary` | Assigned beneficiaries for team members |
| `Testimonial` | User testimonials |
| `SessionInvite` | AI learning session invites |
| `AIProfile` | AI learning user profiles |
| `LearningProgress` | AI learning progress tracking |
| `LearningSession` | AI learning session data |
| `TopicSession` | AI topic-based sessions |
| `Quiz` | AI-generated quizzes |
| `Notification` | System notifications |

---

## Authentication

The system uses **JWT (JSON Web Tokens)** for authentication:

1. User registers or logs in → receives a JWT token
2. Token is stored in `localStorage` as `cshub_token`
3. All API requests include `Authorization: Bearer <token>` header
4. Middleware (`auth.js`) verifies the token and attaches `req.user`
5. Admin-only routes additionally check `req.user.role === 'admin'`

**Password security:**
- Passwords are hashed with `bcryptjs` (10 salt rounds)
- Password reset via email token (valid for 1 hour)

---

## Deployment

### Frontend (Vercel)
- Deployed to: `https://computer-support-ict.vercel.app`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL`

### Backend (Render)
- Deployed to: `https://computer-support-ict.onrender.com`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: all listed in `.env`

### AI Backend (Render)
- Deployed to: `https://computer-support-ai.onrender.com`
- Build command: `npm install`
- Start command: `npm start`

### MongoDB
- Hosted on **MongoDB Atlas** (cloud)
- Connection via `MONGO_URI_CLOUD` environment variable

---

## Key Design Decisions

- **Bilingual support**: EN/RW toggle in navbar (RW currently disabled pending translations)
- **Color scheme**: Muted/neutral palette with `#FFCE08` (gold) as accent color
- **Glassmorphism**: Liquid glass header effects on landing page sections
- **Mobile-first**: Responsive design with sidebar drawers, 2-column grids, and touch-friendly inputs
- **Auto-refresh chat**: Messages and group chat poll every 3-4 seconds for near-real-time feel
- **Lazy loading**: Dashboard, admin, AI learning, news, and courses are lazy-loaded for faster initial page load
- **Code splitting**: Vite manual chunks separate vendor, firebase, icons, and markdown libraries
- **Compression**: Gzip + Brotli pre-compression via `vite-plugin-compression`

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Code Conventions
- **Frontend**: React functional components with hooks, CSS in `App.css` (single file), icon imports from `react-icons/fa`
- **Backend**: Express controllers + routes pattern, Mongoose models, JWT middleware
- **Naming**: PascalCase for components, camelCase for functions/variables, kebab-case for CSS classes
- **No comments** in code unless explicitly requested

---

## License

This project is proprietary software for CS Hub (iCT). All rights reserved.

---

**Built with care for CS Hub (iCT) — Computer Support & Digital Services**
