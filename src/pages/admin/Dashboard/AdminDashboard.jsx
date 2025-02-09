import React, { Fragment, useState } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { adminLogout as logout } from "../../../redux/slices/adminAuthSlice"
import { FaProductHunt, FaListUl, FaUsers, FaShoppingCart, FaTicketAlt, FaGift, FaMoon, FaSun, FaChartLine, FaHome } from "react-icons/fa"
import axios from "axios"
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [darkMode, setDarkMode] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/adminLogout",
        {},
        {
          withCredentials: true,
        }
      )

      if (response.status === 200) {
        dispatch(logout())
        navigate("/admin-login", { replace: true })
      } else {
        console.error("Failed to log out")
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className={`dashboard-container ${darkMode ? 'dark' : ''}`}>
      <div className="content-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button onClick={toggleDarkMode} className="btn btn-secondary mr-2">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="sidebar">
          <nav>
            <div className="nav-section">
              {/* <h6 className="nav-title">General</h6> */}
              <ul className="nav-items">
                <li>
                  <Link to="/admin-dashboard" className="nav-link">
                    <FaHome /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="products" className="nav-link">
                    <FaProductHunt /> Products
                  </Link>
                </li>
                <li>
                  <Link to="categories" className="nav-link">
                    <FaListUl /> Categories
                  </Link>
                </li>
                <li>
                  <Link to="users" className="nav-link">
                    <FaUsers /> User Listing
                  </Link>
                </li>
                <li>
                  <Link to="orders" className="nav-link">
                    <FaShoppingCart /> Order Management
                  </Link>
                </li>
                <li>
                  <Link to="coupons" className="nav-link">
                    <FaTicketAlt /> Coupon Management
                  </Link>
                </li>
                <li>
                  <Link to="offers" className="nav-link">
                    <FaGift /> Offers
                  </Link>
                </li>
                <li>
                  <Link to="sales-report" className="nav-link">
                    <FaChartLine /> Sales Report
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
