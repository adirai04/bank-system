# Bank System

A simple bank backend API built with Node.js, Express and MongoDB. It provides user authentication, account management, and transaction handling (including system-initiated initial funds).

## Features

- User registration and login (JWT authentication)
- Account creation and balance retrieval
- Transaction creation and system-initiated initial funds

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16+ recommended)
- Access to a MongoDB instance (URI)

## Environment Variables

Create a `.env` file in the project root with at least:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret used to sign JWT tokens
- (Optional) `PORT` - Port to run the server (defaults to 3000)

## Install

Install dependencies:

```bash
npm install
```

## Run

Start in development (using nodemon):

```bash
npx nodemon server.js
```

Start in production:

```bash
node server.js
```

By default the server listens on port `3000` (see `server.js`).

## API Endpoints

Base path: `/api`

- Auth (`/api/auth`)
	- `POST /register` — Create a new user
	- `POST /login` — Login and receive JWT
	- `POST /logout` — Logout (token blacklist)

- Accounts (`/api/accounts`) — Protected routes (require JWT)
	- `POST /` — Create a new account
	- `GET /` — Get all accounts for logged-in user
	- `GET /balance/:accountId` — Get balance for an account

- Transactions (`/api/transactions`) — Protected routes
	- `POST /` — Create a new transaction
	- `POST /system/initial-funds` — Create initial funds (system user only)

The route handlers live in `src/routes/` and controllers in `src/controllers/`.

## Project Structure

- `server.js` — App entry; connects to DB and starts the server
- `src/app.js` — Express app and route mounting
- `src/db/db.js` — MongoDB connection
- `src/routes/` — Express route definitions
- `src/controllers/` — Request handlers
- `src/models/` — Mongoose models
- `src/middlewares/` — Authentication middleware

## Notes

- The app expects `MONGO_URI` and `JWT_SECRET` to be set; the server will exit if the database connection fails.
- Authentication middleware reads tokens from `cookies.token` or `Authorization: Bearer <token>` header.

## Contributing

Feel free to open issues or submit pull requests.

## License

MIT
