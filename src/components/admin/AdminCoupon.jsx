import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { setCoupons, setLoading, setError } from "../../redux/slices/couponSlice"
import "bootstrap/dist/css/bootstrap.min.css"
import "./AdminCoupon.css"
import { Breadcrumb } from 'react-bootstrap';
import Swal from "sweetalert2"


const AdminCoupon = () => {
  const dispatch = useDispatch()
  const { coupons, loading } = useSelector((state) => state.coupon)
  const [activeTab, setActiveTab] = useState("list")
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountAmount: "",
    minimumPurchase: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    maxUses: "",
  })
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    fetchCoupons()
  }, [])

  const validateForm = () => {
    const errors = {}
    
    // Coupon code validation (6-7 characters, letters and digits only)
    if (!/^[A-Za-z0-9]{6,7}$/.test(formData.code)) {
      errors.code = "Coupon code must be 6-7 characters long and contain only letters and numbers"
    }

    // Date validations
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    if (startDate < today) {
      errors.startDate = "Start date cannot be in the past"
    }

    if (endDate <= startDate) {
      errors.endDate = "End date must be after start date"
    }

    // Discount amount validation
    if (Number(formData.discountAmount) <= 0) {
      errors.discountAmount = "Discount amount must be greater than 0"
    }

    if (formData.discountType === "percentage" && Number(formData.discountAmount) > 99) {
      errors.discountAmount = "Percentage discount cannot exceed 100%"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const fetchCoupons = async () => {
    try {
      dispatch(setLoading())
      const response = await axios.get("http://localhost:5000/api/admin/coupons", { withCredentials: true })
      dispatch(setCoupons(response.data.coupons))
    } catch (error) {
      dispatch(setError(error.message))
    }
  }

  const handleDelete = async (id, code) => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete coupon ${code}. This action cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      // If user confirms deletion
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:5000/api/admin/coupons/${id}`, { withCredentials: true })
        
        // Show success message
        await Swal.fire({
          title: 'Deleted!',
          text: `Coupon ${code} has been deleted successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Refresh coupon list
        fetchCoupons()
      }
    } catch (error) {
      // Show error message
      Swal.fire({
        title: 'Error!',
        text: `Failed to delete coupon: ${error.message}`,
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      dispatch(setError(error.message))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    
    try {
      await axios.post("http://localhost:5000/api/admin/coupons", formData, { withCredentials: true })
      setFormData({
        code: "",
        discountType: "percentage",
        discountAmount: "",
        minimumPurchase: "",
        maxDiscount: "",
        startDate: "",
        endDate: "",
        maxUses: "",
      })
      setValidationErrors({})
      fetchCoupons()
      setActiveTab("list")
    } catch (error) {
      console.error(error)
    }
  }

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )

  return (
    <div className="container mt-4">
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/admin-dashboard">Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item active>Coupons</Breadcrumb.Item>
      </Breadcrumb>
      <div className="row mb-4">
        <div className="col">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                onClick={() => setActiveTab("list")}
                className={`nav-link ${activeTab === "list" ? "active" : ""}`}
              >
                Coupon List
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab("create")}
                className={`nav-link ${activeTab === "create" ? "active" : ""}`}
              >
                Create Coupon
              </button>
            </li>
          </ul>
        </div>
      </div>

      {activeTab === "list" ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="col">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{coupon.code}</h5>
                  <p className="card-text">
                    {coupon.discountType === "percentage" ? `${coupon.discountAmount}%` : `₹${coupon.discountAmount}`}
                  </p>
                  <p className="card-text">
                    <small className="text-muted">Valid till: {new Date(coupon.endDate).toLocaleDateString()}</small>
                  </p>
                </div>
                <div className="card-footer">
                  <button onClick={() => handleDelete(coupon._id, coupon.code)} className="btn btn-danger w-100">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
              <div className="mb-3">
                <label htmlFor="code" className="form-label">
                  Coupon Code
                </label>
                <input
                  type="text"
                  id="code"
                  placeholder="Coupon Code (6-7 characters, letters and numbers only)"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={`form-control ${validationErrors.code ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.code && (
                  <div className="invalid-feedback">{validationErrors.code}</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="discountType" className="form-label">
                  Discount Type
                </label>
                <select
                  id="discountType"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="form-select"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="discountAmount" className="form-label">
                  Discount Amount
                </label>
                <input
                  type="number"
                  id="discountAmount"
                  placeholder="Discount Amount"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  className={`form-control ${validationErrors.discountAmount ? 'is-invalid' : ''}`}
                  min="0"
                  step="0.01"
                  required
                />
                {validationErrors.discountAmount && (
                  <div className="invalid-feedback">{validationErrors.discountAmount}</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="minimumPurchase" className="form-label">
                  Minimum Purchase
                </label>
                <input
                  type="number"
                  id="minimumPurchase"
                  placeholder="Minimum Purchase"
                  value={formData.minimumPurchase}
                  onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
                  className="form-control"
                  min="0"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="startDate" className="form-label">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`form-control ${validationErrors.startDate ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.startDate && (
                  <div className="invalid-feedback">{validationErrors.startDate}</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="endDate" className="form-label">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`form-control ${validationErrors.endDate ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.endDate && (
                  <div className="invalid-feedback">{validationErrors.endDate}</div>
                )}
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCoupon