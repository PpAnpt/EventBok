# EventBok — Concert Ticket Booking System

> CPE 241 Term Project — King Mongkut's University of Technology Thonburi

## 📁 Project Structure

```
eventbok/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── api/
│   │   │   ├── http.js         # Base HTTP fetch utility
│   │   │   └── index.js        # All API calls (concerts, bookings, etc.)
│   │   ├── components/
│   │   │   └── Layout.jsx      # Sidebar + top bar layout
│   │   ├── pages/
│   │   │   ├── auth/           LoginPage.jsx
│   │   │   ├── dashboard/      Dashboard.jsx
│   │   │   ├── concerts/       ConcertList.jsx
│   │   │   ├── seatings/       Seatings.jsx
│   │   │   ├── booking/        BookingList.jsx
│   │   │   ├── payments/       PaymentList.jsx
│   │   │   ├── report/         Report.jsx
│   │   │   └── settings/       Settings.jsx
│   │   ├── utils/
│   │   │   └── AuthContext.jsx # Login/logout state
│   │   ├── App.jsx             # Routes
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles + CSS variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express.js backend
│   ├── src/
│   │   ├── app.js              # Entry point, routes setup
│   │   ├── db/
│   │   │   └── pool.js         # PostgreSQL connection pool
│   │   ├── routes/             # One file per resource
│   │   │   ├── auth.routes.js
│   │   │   ├── concerts.routes.js
│   │   │   ├── venues.routes.js
│   │   │   ├── sessions.routes.js
│   │   │   ├── seatmaps.routes.js
│   │   │   ├── zones.routes.js
│   │   │   ├── seats.routes.js
│   │   │   ├── bookings.routes.js
│   │   │   ├── payments.routes.js
│   │   │   ├── tickets.routes.js
│   │   │   ├── customers.routes.js
│   │   │   └── reports.routes.js
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Database queries
│   │   └── utils/
│   │       ├── logger.js
│   │       ├── response.js     # sendList, sendOne, sendError helpers
│   │       └── auth.middleware.js  # JWT auth + role check
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── sql/
│       ├── 001_schema.sql      # All CREATE TABLE statements
│       └── 002_seed.sql        # Sample data
│
├── docker-compose.yml          # PostgreSQL + Adminer
├── package.json                # Root scripts
└── README.md
```

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd eventbok
npm run install:all
```

### 2. Setup Environment

```bash
# Server
cp server/.env.example server/.env

# Client (optional)
cp client/.env.example client/.env
```

### 3. Start Database

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` and Adminer (DB GUI) on `http://localhost:8080`

### 4. Run the App

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **Adminer**: http://localhost:8080 (server: `pgdatabase`, user: `root`, pass: `root`, db: `eventbok_db`)

## 🗃️ Database (PostgreSQL)

Tables: `organizers`, `venues`, `concerts`, `seatmaps`, `zones`, `seats`, `sessions`, `customers`, `bookings`, `tickets`, `payments`

## 🛠️ Tech Stack

| Layer    | Technology                |
|----------|---------------------------|
| Frontend | React 18, Vite, Recharts  |
| Backend  | Node.js, Express.js       |
| Database | PostgreSQL 16             |
| Auth     | JWT                       |
| DevDB    | Docker + Adminer          |

## 📌 API Endpoints

| Method | Path                  | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/auth/login       | Login             |
| GET    | /api/concerts         | List concerts     |
| POST   | /api/concerts         | Create concert    |
| GET    | /api/bookings         | List bookings     |
| POST   | /api/bookings         | Create booking    |
| GET    | /api/payments         | List payments     |
| GET    | /api/reports/summary  | Dashboard stats   |
