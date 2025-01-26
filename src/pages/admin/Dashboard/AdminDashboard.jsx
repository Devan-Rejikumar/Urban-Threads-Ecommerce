import React, { Fragment } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { adminLogout as logout } from "../../../redux/slices/adminAuthSlice"
import "bootstrap/dist/css/bootstrap.min.css"
import "./AdminDashboard.css"
import axios from "axios"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/adminLogout",
        {},
        {
          withCredentials: true,
        },
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

  return (
    <Fragment>
      <div className="dashboard-container">
        <div className="content-header">
          <h1>Admin Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
        <div className="dashboard-content">
          <div className="sidebar">
            <nav>
              <div className="nav-section">
                <h6 className="nav-title">General</h6>
                <ul className="nav-items">
                  <li>
                    <Link to="products" className="nav-link">
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link to="categories" className="nav-link">
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link to="users" className="nav-link">
                      User Listing
                    </Link>
                  </li>
                  <li>
                    <Link to="orders" className="nav-link">
                      Order Management
                    </Link>
                  </li>
                  <li>
                    <Link to="coupons" className="nav-link">
                      Coupon Management
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
    </Fragment>
  )
}

export default AdminDashboard

