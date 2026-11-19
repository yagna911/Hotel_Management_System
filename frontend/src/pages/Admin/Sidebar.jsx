import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/shnoor-logo.jpeg";

import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaBed,
  FaMoneyBillWave,
  FaUsers,
  FaConciergeBell,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("googleUser");
    navigate("/login");
  };

  return (
    <div className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logo} alt="Shnoor Logo" />

        <div className="sidebar-title">
          <h2>SHNOOR</h2>
          <p>Hotel Management System</p>
        </div>
      </div>

      {/* Menu */}
      <ul className="sidebar-menu">

        <li
          className={location.pathname === "/admin-dashboard" ? "active" : ""}
          onClick={() => navigate("/admin-dashboard")}
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </li>

        <li
          className={location.pathname === "/admin/reservations" ? "active" : ""}
          onClick={() => navigate("/admin/reservations")}
        >
          <FaCalendarCheck />
          <span>Reservations</span>
        </li>

        <li
          className={location.pathname === "/admin/rooms" ? "active" : ""}
          onClick={() => navigate("/admin/rooms")}
        >
          <FaBed />
          <span>Rooms</span>
        </li>

        <li
          className={location.pathname === "/admin/payments" ? "active" : ""}
          onClick={() => navigate("/admin/payments")}
        >
          <FaMoneyBillWave />
          <span>Payments</span>
        </li>

        <li
          className={location.pathname === "/admin/customers" ? "active" : ""}
          onClick={() => navigate("/admin/customers")}
        >
          <FaUsers />
          <span>Customer Management</span>
        </li>

        <li
          className={location.pathname === "/admin/adminservices" ? "active" : ""}
          onClick={() => navigate("/admin/adminservices")}
        >
          <FaConciergeBell />
          <span>AdminServices</span>
        </li>

        <li
          className={location.pathname === "/admin/reports" ? "active" : ""}
          onClick={() => navigate("/admin/reports")}
        >
          <FaChartBar />
          <span>Reports & Analysis</span>
        </li>

      </ul>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt />
        Logout
      </button>

    </div>
  );
}

export default Sidebar;