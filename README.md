# Computer Support Hub

A full-stack web application for managing computer support requests, service suggestions, and team-based beneficiary assistance.

## Features

- **Support Tickets** — Submit, track, and resolve technical support requests with status updates and conversations.
- **Suggestions** — Propose new services or improvements; discuss with the team.
- **Messages** — Real-time chat with support staff.
- **Team Dashboard** — Manage beneficiaries, view assigned tickets, and track resolution progress.
- **Admin Panel** — Full CRUD management for users, tickets, suggestions, contacts, teams, news, courses, beneficiaries, and testimonials.
- **News & Courses** — Public information pages for announcements and educational content.
- **Authentication** — Login, registration, password reset, and team applications.

## Tech Stack

- **Frontend:** React (Vite), React Router, CSS
- **Backend:** Node.js, Express, MongoDB (via Mongoose)
- **Auth:** JSON Web Tokens (JWT)

## Getting Started

1. Install dependencies:

   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Start the backend (port 5000):

   ```
   cd backend && npm start
   ```

3. Start the frontend (port 5173):

   ```
   cd frontend && npm run dev
   ```

4. Open `http://localhost:5173` in your browser.
