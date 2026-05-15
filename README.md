# Payment API Integration System

A RESTful API for managing church tithes, offerings, and PTA payments with simulated mobile money integration (MTN, Airtel, Zamtel).

## Features
- User registration & login with JWT authentication
- Payment simulation (tithe, offering, PTA)
- Transaction history
- Admin dashboard endpoints
- MongoDB database

## Tech Stack
- Node.js + Express.js
- MongoDB Atlas
- JWT for authentication
- bcryptjs for password hashing

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/users/profile | Get profile |
| POST | /api/payments | Make payment |
| GET | /api/payments/my-payments | Payment history |

## Setup
1. Clone repository
2. Run `npm install`
3. Create `.env` file
4. Run `npm run dev`