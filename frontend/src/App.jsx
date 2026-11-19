import React from "react";
import { Routes, Route } from "react-router-dom";

// =====================================================
// PROTECTED ROUTE
// =====================================================

import ProtectedRoute from "./pages/ProtectedRoute";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Navbar from "./pages/Navbar";
import Hero from "./pages/Hero";
import About from "./pages/About";
import Services from "./pages/Services";
import BookDemo from "./pages/BookDemo";
import Contact from "./pages/Contact";
import Footer from "./pages/Footer";

// =====================================================
// AUTHENTICATION
// =====================================================

import Login from "./pages/Login";
import GetStarted from "./pages/GetStarted";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// =====================================================
// ADMIN
// =====================================================

import AdminDashboard from "./pages/Admin/AdminDashboard";
import Reservations from "./pages/Admin/Reservations";
import Rooms from "./pages/Admin/Rooms";
import Payments from "./pages/Admin/Payments";
import CustomerManagement from "./pages/Admin/CustomerManagement";
import AdminServices from "./pages/Admin/AdminServices";
import Reports from "./pages/Admin/Reports";
// =====================================================
// CUSTOMER
// =====================================================

import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import CustomerBookings from "./pages/Customer/CustomerBookings";
import CustomerBookingDetails from "./pages/Customer/CustomerBookingDetails";
import CustomerRooms from "./pages/Customer/CustomerRooms";
import CustomerBookRoom from "./pages/Customer/CustomerBookRoom";
import CustomerServices from "./pages/Customer/CustomerServices";
import CustomerPayments from "./pages/Customer/CustomerPayments";
import CustomerProfile from "./pages/Customer/CustomerProfile";
// =====================================================
// SUPER ADMIN
// =====================================================

import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/SuperAdmin/SuperAdminUsers";
import SuperAdminManagement from "./pages/SuperAdmin/SuperAdminManagement";
import SuperAdminHotels from "./pages/SuperAdmin/SuperAdminHotels";
import SuperAdminReports from "./pages/SuperAdmin/SuperAdminReports";


// =====================================================
// APP CSS
// =====================================================

import "./App.css";

// =====================================================
// HOME PAGE
// =====================================================

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <BookDemo />
      <Contact />
      <Footer />
    </>
  );
}

// =====================================================
// 404 PAGE
// =====================================================

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "10px",
        fontFamily: "Arial, sans-serif",
        background: "#f5f7fb",
        color: "#1f2937",
        padding: "20px",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "72px",
          fontWeight: "800",
        }}
      >
        404
      </h1>

      <h2
        style={{
          margin: 0,
          fontSize: "28px",
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          margin: 0,
          color: "#6b7280",
        }}
      >
        The page you are looking for does not exist.
      </p>
    </div>
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <Routes>

      {/* =================================================
          PUBLIC ROUTES
      ================================================= */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/get-started"
        element={<GetStarted />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />


      {/* =================================================
          SUPER ADMIN ROUTES
      ================================================= */}

      <Route
        path="/super-admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/users"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/admins"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/management"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/hotels"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminHotels />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/reports"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminReports />
          </ProtectedRoute>
        }
      />




      {/* =================================================
          ADMIN ROUTES
      ================================================= */}

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reservations"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Reservations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Rooms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Payments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <CustomerManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/adminservices"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminServices />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      


      {/* =================================================
          CUSTOMER ROUTES
      ================================================= */}

      {/* CUSTOMER DASHBOARD */}

      <Route
        path="/customer-dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["CUSTOMER", "VIP"]}
          >
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          CUSTOMER BOOKINGS
      ================================================= */}

      <Route
        path="/customer/bookings"
        element={
          <ProtectedRoute
            allowedRoles={["CUSTOMER", "VIP"]}
          >
            <CustomerBookings />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          CUSTOMER BOOKING DETAILS
          
          View button from CustomerBookings.jsx
          goes to:
          
          /customer/bookings/:bookingId
      ================================================= */}

      <Route
        path="/customer/bookings/:bookingId"
        element={
          <ProtectedRoute
            allowedRoles={["CUSTOMER", "VIP"]}
          >
            <CustomerBookingDetails />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          CUSTOMER ROOMS
      ================================================= */}

      <Route
        path="/customer/rooms"
        element={
          <ProtectedRoute
            allowedRoles={["CUSTOMER", "VIP"]}
          >
            <CustomerRooms />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          CUSTOMER BOOK ROOM
      ================================================= */}

      <Route
        path="/customer/book-room/:roomId"
        element={
          <ProtectedRoute
            allowedRoles={["CUSTOMER", "VIP"]}
          >
            <CustomerBookRoom />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          CUSTOMER SERVICES
      ================================================= */}

      <Route
        path="/customer/services"
        element={
          <ProtectedRoute
            allowedRoles={["CUSTOMER", "VIP"]}
          >
            <CustomerServices />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          CUSTOMER PAYMENTS
      ================================================= */}

      <Route
        path="/customer/payments"
        element={
          <ProtectedRoute
            allowedRoles={["CUSTOMER", "VIP"]}
          >
            <CustomerPayments />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          CUSTOMER PROFILE
      ================================================= */}

      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute
            allowedRoles={["CUSTOMER", "VIP"]}
          >
            <CustomerProfile />
          </ProtectedRoute>
        }
      />


      

      {/* =================================================
          404
      ================================================= */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}

export default App;