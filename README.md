# EventSphere — Full-Stack Ticket Booking Platform

EventSphere is a full-stack event ticketing platform built with:

- **Frontend** — Vanilla HTML/CSS/JavaScript (preserved original design)
- **Backend** — Node.js + Express.js
- **Database** — MongoDB (Mongoose / MongoDB Atlas)
- **Auth** — JWT + bcryptjs

---

## Project Structure

```
E1/
├── frontend/
│   ├── login.html
│   ├── user-dashboard.html
│   ├── admin-dashboard.html
│   └── js/
│       └── api.js              ← Centralised API config
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env                    ← Fill your MongoDB URI here
│   ├── .env.example
│   ├── config/db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Booking.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── bookingController.js
│   │   ├── userController.js
│   │   └── analyticsController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── userRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   └── utils/
│       ├── bookingRef.js
│       └── seed.js
│
└── README.md
```

---

## Requirements

- Node.js v18+
- MongoDB Atlas account (free tier works)
- npm

---

## Setup Instructions

### Step 1 — MongoDB Atlas

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a new cluster (free M0 tier).
3. Create a database user with a username and password.
4. Whitelist your IP address (or use `0.0.0.0/0` for development).
5. Click **Connect → Drivers** and copy the connection string. It looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2 — Configure Environment Variables

Open `backend/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/eventsphere?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@eventsphere.com
ADMIN_PASSWORD=Admin@Secure2025
NODE_ENV=development
```

> ⚠️ **Never commit `.env` to Git.** It is already in `.gitignore`.

### Step 3 — Install Dependencies

```bash
cd backend
npm install
```

### Step 4 — Seed the Database

This creates the admin account and 8 sample events:

```bash
npm run seed
```

Expected output:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ Admin created: admin@eventsphere.com
✅ Inserted 8 sample events.

🎉 Seeding complete!
   Admin login: admin@eventsphere.com / Admin@Secure2025
```

### Step 5 — Start the Server

**Development (auto-restart on file changes):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

### Step 6 — Open the App

```
http://localhost:5000/login.html
```

---

## Admin Login

```
Email:    admin@eventsphere.com
Password: Admin@Secure2025
```

> To change the admin credentials, update `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`  
> and re-run `npm run seed`.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login (user or admin) |
| GET | `/api/auth/me` | User | Get own profile |
| PUT | `/api/auth/me` | User | Update own profile |
| GET | `/api/auth/check-email?email=` | Public | Check email availability |

### Events

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | Public | List active/upcoming events |
| GET | `/api/events/all` | Admin | List all events (incl. draft) |
| GET | `/api/events/:id` | Public | Get single event |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/:id` | Admin | Update event |
| DELETE | `/api/events/:id` | Admin | Delete event |

### Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | User | Book tickets |
| GET | `/api/bookings/my-bookings` | User | Own bookings |
| GET | `/api/bookings/:id` | User | Single booking |
| GET | `/api/bookings/admin/all` | Admin | All bookings |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | Admin | All registered users |
| GET | `/api/admin/analytics` | Admin | Summary stats |
| GET | `/api/admin/analytics/events` | Admin | Sales by event |
| GET | `/api/admin/analytics/revenue` | Admin | Revenue by date |

---

## Ticket Pricing Logic

The backend auto-generates 3 ticket tiers from the base price:

| Tier | Price | Convenience Fee |
|------|-------|----------------|
| General Admission | Base price | ₹150 |
| VIP Experience | Base × 2.5 | ₹299 |
| Platinum Pass | Base × 5 | ₹499 |

> **The backend always recalculates the final price** — the frontend cannot manipulate amounts.

---

## Booking Reference Format

Every booking gets a unique reference:
```
ES-20260921-A8F42K
```

---

## Security

- Passwords hashed with **bcrypt** (salt rounds: 12)
- Authentication via **JWT** (7-day expiry)
- Admin routes protected by role-based middleware
- Users cannot access other users' bookings
- Frontend prices are ignored — backend recalculates from DB
- `.env` excluded from git via `.gitignore`
- CORS restricted to localhost origins

---

## Changing the API Base URL for Production

Open `frontend/js/api.js` and change:

```javascript
const API_BASE = 'http://localhost:5000/api';
```

to your production URL, e.g.:

```javascript
const API_BASE = 'https://api.eventsphere.com/api';
```
