import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import pool from "./config/db.js";

// =====================================================
// ROUTES
// =====================================================

// Authentication
import authRoutes from "./routes/authRoutes.js";

// Admin Dashboard
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";

// Admin Rooms
import roomRoutes from "./routes/roomRoutes.js";

// Admin Services
import servicesRoutes from "./routes/servicesRoutes.js";

// Admin Reports
import adminReportsRoutes from "./routes/adminReportsRoutes.js";

// Admin Customer Management
import customerRoutes from "./routes/customermanagementRoutes.js";

// Customer Dashboard
import customerDashboardRoutes from "./routes/CustomerRoutes/customerDashboardRoutes.js";

// Admin Reservations
import adminReservationsRoutes from "./routes/adminReservationsRoutes.js";

// Admin Payments
import paymentRoutes from "./routes/paymentRoutes.js";
// Customer Bookings
import customerBookingRoutes from "./routes/CustomerRoutes/customerBookingRoutes.js";

// Customer Rooms
import customerRoomsRoutes from "./routes/CustomerRoutes/customerRoomsRoutes.js";
import customerServiceRoutes from "./routes/customerRoutes/customerServiceRoutes.js";
// Customer Payments
import customerPaymentRoutes from "./routes/CustomerRoutes/customerPaymentRoutes.js";
import customerAccountRoutes from "./routes/CustomerRoutes/customerAccountRoutes.js";

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();


// =====================================================
// ENVIRONMENT INFORMATION
// =====================================================

console.log("========================================");
console.log("ENVIRONMENT");
console.log("========================================");

console.log(
  "EMAIL_USER:",
  process.env.EMAIL_USER || "Not configured"
);

console.log(
  "FRONTEND_URL:",
  process.env.FRONTEND_URL || "Not configured"
);


// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

// -----------------------------------------------------
// CORS
// -----------------------------------------------------

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


// -----------------------------------------------------
// JSON BODY PARSER
// -----------------------------------------------------

app.use(
  express.json()
);


// -----------------------------------------------------
// URL ENCODED BODY PARSER
// -----------------------------------------------------

app.use(
  express.urlencoded({
    extended: true,
  })
);


// =====================================================
// DATABASE TEST ROUTE
// =====================================================

app.get(
  "/",
  async (req, res) => {

    try {

      const result = await pool.query(
        "SELECT NOW() AS current_time"
      );

      res.status(200).json({

        success: true,

        message:
          "Hotel Management API is running",

        database:
          "Connected",

        time:
          result.rows[0].current_time,

      });

    } catch (error) {

      console.error(
        "Database test error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Database connection failed",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  async (req, res) => {

    try {

      await pool.query(
        "SELECT 1"
      );

      res.status(200).json({

        success: true,

        message:
          "Server and database are working",

      });

    } catch (error) {

      console.error(
        "Health check error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Database is not available",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// AUTHENTICATION ROUTES
// =====================================================
//
// POST /api/auth/login
// POST /api/auth/register
// POST /api/auth/forgot-password
// POST /api/auth/reset-password
//
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);


// =====================================================
// ADMIN DASHBOARD ROUTES
// =====================================================
//
// GET /api/admin/dashboard
//
// =====================================================

app.use(
  "/api/admin",
  adminDashboardRoutes
);


// =====================================================
// ADMIN RESERVATION ROUTES
// =====================================================
//
// GET    /api/admin/reservations
// POST   /api/admin/reservations
// PUT    /api/admin/reservations/:id
// DELETE /api/admin/reservations/:id
//
// =====================================================

app.use(
  "/api/admin/reservations",
  adminReservationsRoutes
);


// =====================================================
// ADMIN PAYMENT ROUTES
// =====================================================
//
// GET  /api/admin/payments
// POST /api/admin/payments
//
// =====================================================

app.use(
  "/api/admin/payments",
  paymentRoutes
);


// =====================================================
// ADMIN SERVICES ROUTES
// =====================================================
//
// GET    /api/admin/services
// POST   /api/admin/services
// PUT    /api/admin/services/:id
// DELETE /api/admin/services/:id
//
// =====================================================

app.use(
  "/api/admin",
  servicesRoutes
);


// =====================================================
// ADMIN REPORTS ROUTES
// =====================================================
//
// GET /api/admin/reports
//
// =====================================================

app.use(
  "/api/admin",
  adminReportsRoutes
);


// =====================================================
// ADMIN / GENERAL ROOM ROUTES
// =====================================================
//
// GET    /api/rooms
// POST   /api/rooms
// PUT    /api/rooms/:id
// DELETE /api/rooms/:id
//
// =====================================================

app.use(
  "/api/rooms",
  roomRoutes
);


// =====================================================
// ADMIN CUSTOMER MANAGEMENT ROUTES
// =====================================================
//
// GET    /api/customers
// GET    /api/customers/:id
// POST   /api/customers
// PUT    /api/customers/:id
// DELETE /api/customers/:id
//
// =====================================================

app.use(
  "/api/customers",
  customerRoutes
);


// =====================================================
// CUSTOMER DASHBOARD ROUTES
// =====================================================
//
// GET /api/customer-dashboard/:customerId
//
// =====================================================

app.use(
  "/api/customer-dashboard",
  customerDashboardRoutes
);


// =====================================================
// CUSTOMER BOOKING ROUTES
// =====================================================
//
// GET  /api/customer-bookings/:customerId
// POST /api/customer-bookings
//
// =====================================================

app.use(
  "/api/customer-bookings",
  customerBookingRoutes
);


// =====================================================
// CUSTOMER ROOM ROUTES
// =====================================================
//
// GET /api/customer-rooms
//
// =====================================================

app.use(
  "/api/customer-rooms",
  customerRoomsRoutes
);

app.use(
  "/api/customer-services",
  customerServiceRoutes
);
// =====================================================
// CUSTOMER PAYMENT ROUTES
// =====================================================
//
// GET  /api/customer-payments/:customerId
// POST /api/customer-payments
//
// =====================================================

app.use(
  "/api/customer-payments",
  customerPaymentRoutes
);

app.use(
  "/api/customer/account",
  customerAccountRoutes
);
// =====================================================
// API 404 ROUTE
// =====================================================

app.use(
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        "API route not found",

      path:
        req.originalUrl,

    });

  }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (error, req, res, next) => {

    console.error(
      "========================================"
    );

    console.error(
      "GLOBAL SERVER ERROR"
    );

    console.error(
      "========================================"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );

    res.status(
      error.status || 500
    ).json({

      success: false,

      message:
        error.message ||
        "Internal server error",

    });

  }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;


app.listen(
  PORT,
  () => {

    console.log(
      "========================================"
    );

    console.log(
      "SHNOOR HOTEL MANAGEMENT SYSTEM"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Server running on port ${PORT}`
    );

    console.log(
      `http://localhost:${PORT}`
    );

    console.log(
      "========================================"
    );

    console.log(
      "Available API groups:"
    );

    console.log(
      "Authentication       : /api/auth"
    );

    console.log(
      "Admin Dashboard      : /api/admin"
    );

    console.log(
      "Admin Reservations   : /api/admin/reservations"
    );

    console.log(
      "Admin Payments       : /api/admin/payments"
    );

    console.log(
      "Admin Services       : /api/admin/services"
    );

    console.log(
      "Admin Reports        : /api/admin/reports"
    );

    console.log(
      "Rooms                : /api/rooms"
    );

    console.log(
      "Customers            : /api/customers"
    );

    console.log(
      "Customer Dashboard   : /api/customer-dashboard"
    );

    console.log(
      "Customer Bookings    : /api/customer-bookings"
    );

    console.log(
      "Customer Rooms       : /api/customer-rooms"
    );

    console.log(
      "Customer Payments    : /api/customer-payments"
    );

    console.log(
      "Health Check         : /api/health"
    );

    console.log(
      "========================================"
    );

  }
);