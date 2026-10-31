# Placement Tracker

A web app to track job applications through each stage of the placement process.
I built it to keep track of my own applications and interview rounds.

## Features
- Register and login (passwords hashed with bcrypt, sessions for login state)
- Add, edit, and delete applications (company, role, date, status, notes)
- Status summary with counts, and filtering by status
- Each user sees only their own data
- Styled, responsive pages

## Tech stack
- Node.js and Express (routing, middleware)
- SQLite with better-sqlite3 (database)
- EJS (server-rendered pages)
- bcryptjs and express-session (authentication)
- HTML and CSS

## Database
- `users`: id, name, email (unique), password_hash
- `applications`: id, user_id (foreign key to users), company, role, date_applied, status, notes

One user has many applications (one-to-many).

## How to run
1. `npm install`
2. `npm start`
3. Open http://localhost:3000

## Security notes
- Prepared statements for all queries (prevents SQL injection)
- Every query on applications filters by the logged-in user's id
- Status values are validated on the server

## Known limitations and next steps
- Session secret is hardcoded; it should move to an environment variable
- No CSRF protection yet
- Runs locally only; next steps are Google sign-in, PostgreSQL, and deployment

## What I learned
I built this from scratch to understand how a full web app fits together: routes, a database, templates, and styling. The hardest part was understanding sessions and middleware, and debugging taught me to check the basics first, like restarting the server and saving files.