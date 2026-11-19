# TravelMitra 🌍

A colourful, responsive travel discovery and trip-planning website built for a Web Technology Lab project.

## Tech stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js + Express
- Database: none to install. Data is stored in a local JSON file (`data/db.json`)
- Authentication: JWT + bcryptjs

## Features
- Explore Indian destinations with category filters and search
- Destination details, estimated budgets and highlights
- User registration and login
- Create and delete personal trips
- Feedback form saved to the local database
- Responsive layout for mobile and desktop

## Requirements
Only Node.js (LTS). No database server is needed.

## Run locally
1. Open this folder in VS Code.
2. Open the terminal in the project root.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create your environment file:
   - Windows PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`
5. Edit `.env` and set a long random `JWT_SECRET`.
6. Start the app:
   ```bash
   npm run dev
   ```
7. Open **http://localhost:5000**

## API overview
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/destinations` | List destinations; optional `q` and `region` |
| GET | `/api/destinations/:id` | Destination details |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current account (JWT) |
| GET | `/api/trips` | List signed-in user's trips |
| POST | `/api/trips` | Create trip |
| PUT | `/api/trips/:id` | Update own trip |
| DELETE | `/api/trips/:id` | Delete own trip |
| POST | `/api/feedback` | Submit feedback |

Protected endpoints require `Authorization: Bearer <token>`.

## Database
Data is saved in `data/db.json`, created automatically on first run.
Collections: `users`, `destinations`, `trips`, `feedback`.
Sample destinations are added automatically the first time the server starts.
To reset everything, stop the server and delete the `data` folder.

## Notes
- This is a college demonstration starter, not a production booking platform.
- Destination budgets are illustrative estimates, not live quotes.
- Photos are loaded from Unsplash and need an internet connection.
- Admin role is reserved in the user model; admin management screens are not included in this starter build.
- Never publish your `.env` file or commit secrets to GitHub.

## Refinements in this version
- Search input is regex-escaped; invalid IDs return 404 instead of crashing.
- Trip updates only accept whitelisted fields (users can't reassign trips); dates are validated.
- Stronger input validation on register and feedback; internal error details are no longer sent to clients.
- JWT secret is centralised in `backend/config.js` and mandatory when `NODE_ENV=production`.
- JSON 404 for unknown `/api` routes and a global error handler.
- Frontend: HTML-escaped destination cards, auto-logout on expired session, Esc closes dialogs, keyboard-accessible cards, trip dates/budget shown, delete confirmation, date-picker limits, "My trips" now reachable on mobile, better contrast and focus styles.
