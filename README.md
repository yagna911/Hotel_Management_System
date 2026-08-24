# Hotel Management System

A full-stack Hotel Management System developed using React, Node.js, Express.js, and PostgreSQL.

The system provides separate functionality for customers and administrators to manage hotel rooms, reservations, services, payments, and customer information.

---

## 📌 Project Overview

The Hotel Management System is a web-based application designed to simplify hotel operations and provide customers with an easy way to browse rooms, make reservations, manage bookings, and request hotel services.

The application consists of:

- Customer-facing frontend
- Admin dashboard
- Node.js and Express.js backend
- PostgreSQL database
- Authentication and authorization
- Room management
- Reservation management
- Customer management
- Service management
- Payment management
- Booking cancellation
- Reports and dashboard statistics

---

# 🚀 Features

## 👤 Customer Features

Customers can:

- Register a new account
- Login securely
- Logout
- View available hotel rooms
- View room details
- View room types and prices
- Select check-in and check-out dates
- Select number of adults and children
- Make room reservations
- Select additional hotel services
- View booking total
- Make payment
- View payment information
- View booking history
- View upcoming reservations
- View completed reservations
- View cancelled reservations
- View individual booking details
- Cancel eligible reservations
- View refund status
- Submit special requests
- View customer profile information

---

# 🏨 Room Management

Administrators can:

- Add rooms
- Edit room information
- Delete rooms
- View all rooms
- View room numbers
- View room types
- Update room prices
- Update room status

Room statuses include:

- Available
- Occupied
- Maintenance

The system also checks room availability before creating a reservation.

---

# 📅 Reservation Management

Administrators can:

- View all reservations
- View reservation details
- View customer information
- View room information
- Update reservation status
- View check-in dates
- View check-out dates
- View booking amounts
- View payment status
- Add or edit reservation remarks

Customers can:

- Create reservations
- View reservations
- View upcoming reservations
- View completed reservations
- Cancel eligible reservations
- View booking details

---

# 🛎️ Hotel Services

The system supports additional hotel services.

Administrators can:

- Add services
- Edit services
- Delete services
- View services
- Update service prices
- Update service availability
- Manage service categories

Customers can:

- View available services
- Select services during booking
- Specify service quantities
- View service charges

---

# 💳 Payment Management

The system includes payment management functionality.

Payment information includes:

- Booking ID
- Payment amount
- Payment method
- Payment status
- Payment date
- Invoice number

Supported payment methods depend on the options configured in the application.

Room payment is recorded when the booking is created.

Additional service charges can be tracked separately.

---

# 👥 Customer Management

Administrators can manage customer information including:

- Customer name
- Email
- Phone number
- Customer bookings
- Customer reservation history

Customer information is stored in the PostgreSQL `customers` table.

---

# 📊 Admin Dashboard

The administrator dashboard provides an overview of hotel operations.

Dashboard information includes:

- Total bookings
- Upcoming bookings
- Available rooms
- Occupied rooms
- Check-ins
- Pending reservations
- Customers
- Payments
- Services
- Reports

---

# 📈 Reports

The system provides administrative reporting functionality for monitoring hotel operations.

Reports can include information related to:

- Reservations
- Customers
- Rooms
- Payments
- Services
- Hotel activity

---

# 🔐 Authentication

The application provides authentication for users.

Authentication functionality includes:

- Customer registration
- Customer login
- Password hashing
- JWT authentication
- Role-based access
- Protected admin functionality
- Password reset functionality

Passwords are stored using secure password hashing.

---

# 🛠️ Technologies Used

## Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3
- React Router
- Axios
- React Icons
- React Big Calendar
- date-fns

## Backend

- Node.js
- Express.js
- PostgreSQL
- pg
- bcrypt
- JSON Web Token (JWT)
- Nodemailer
- dotenv

## Database

- PostgreSQL

---

# 📁 Project Structure

```text
Hotel-Management-System/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   |
|   |   |   |___ Customer/
|   |   |   |
│   │   │   | ___SuperAdmin/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── backend/
│   │
│   ├── logs/
│   ├── scripts/
│   ├── scratch/
│   ├── uploads/
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── server.js
│   │
│   ├── tests/
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── .gitignore
└── README.md