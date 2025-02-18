import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, X } from 'lucide-react';
import axiosInstance from "../../../utils/axiosInstance";
import Header from "../Header";
import { Fragment } from "react";
import Footer from "../Footer";
import { useFormik } from 'formik';
import * as Yup from 'yup';


const AddressForm = ({ initialData, onSubmit, onCancel }) => {
    const validationSchema = Yup.object({
        firstName: Yup.string().required('First Name is required')
        .min(2, 'First Name must be at least 2 characters')
        .matches(/^[a-zA-Z\s]+$/, 'First Name should only contain letters'),
        lastName : Yup.string().required('Last Name is required')
        .min(2, 'Last Name must be at least 2 characters')
        .matches(/^[a-zA-Z\s]+$/, 'Last Name should only contain letters'),
        phoneNumber : Yup.string().required('Phone Number is required')
        .matches(/^[6-9]\d{9}$/, 'Phone number must start with 6-9 and be 10 digits')
        .test('no-repeated', 'Phone number cannot have excessive repeated digits', value => {
            if (!value) return true;
            // Check for more than 8 repeated digits
            return !/(.)\1{7,}/.test(value);
        })
        .test('no-sequential', 'Phone number cannot be sequential', value => {
            if (!value) return true;
            const sequential = "0123456789";
            const reverseSequential = "9876543210";
            return !sequential.includes(value) && !reverseSequential.includes(value);
        }),
         streetAddress : Yup.string().required('Street Address is required')
         .min(5, 'Street Address must be at least 5 characters'),
         city : Yup.string() .required('City is required')
         .matches(/^[a-zA-Z\s]+$/, 'City should only contain letters'),
         state : Yup.string().required('State is required')
         .matches(/^[a-zA-Z\s]+$/, 'State should only contain letters'),
         pincode : Yup.string().required('Pincode is required')
         .matches(/^[1-9][0-9]{5}$/, 'Pincode must be 6 digits and cannot start with 0'),
         
         isDefault : Yup.boolean(),
    })

    const formik = useFormik({
        initialValues: initialData || {
            firstName: '',
            lastName: '',
            phoneNumber: '',
            streetAddress: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false
        },
        validationSchema,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    useEffect(() => {
        if (initialData) {
            formik.setValues(initialData);
        }
    }, [initialData]);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        formik.setFieldValue('phoneNumber', value);
    };
    return (
        <form onSubmit={formik.handleSubmit}>
        <div className="row mb-3">
            <div className="col-md-6">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                    type="text"
                    className={`form-control ${formik.touched.firstName && formik.errors.firstName ? 'is-invalid' : ''}`}
                    id="firstName"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.firstName && formik.errors.firstName ? (
                    <div className="invalid-feedback">{formik.errors.firstName}</div>
                ) : null}
            </div>
            <div className="col-md-6">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                    type="text"
                    className={`form-control ${formik.touched.lastName && formik.errors.lastName ? 'is-invalid' : ''}`}
                    id="lastName"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.lastName && formik.errors.lastName ? (
                    <div className="invalid-feedback">{formik.errors.lastName}</div>
                ) : null}
            </div>
        </div>
        
            <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                <input
                    type="tel"
                    className={`form-control ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'is-invalid' : ''}`}
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                    <div className="invalid-feedback">{formik.errors.phoneNumber}</div>
                ) : null}
            </div>
            <div className="mb-3">
                <label htmlFor="streetAddress" className="form-label">Street Address</label>
                <input
                    type="text"
                    className={`form-control ${formik.touched.streetAddress && formik.errors.streetAddress ? 'is-invalid' : ''}`}
                    id="streetAddress"
                    name="streetAddress"
                    value={formik.values.streetAddress}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                />
                {formik.touched.streetAddress && formik.errors.streetAddress ? (
                    <div className="invalid-feedback">{formik.errors.streetAddress}</div>
                ) : null}
            </div>
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="city" className="form-label">City</label>
                    <input
                        type="text"
                        className={`form-control ${formik.touched.city && formik.errors.city ? 'is-invalid' : ''}`}
                        id="city"
                        name="city"
                        value={formik.values.city}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                    />
                    {formik.touched.city && formik.errors.city ? (
                        <div className="invalid-feedback">{formik.errors.city}</div>
                    ) : null}
                </div>
                <div className="col-md-6">
                    <label htmlFor="state" className="form-label">State</label>
                    <input
                        type="text"
                        className={`form-control ${formik.touched.state && formik.errors.state ? 'is-invalid' : ''}`}
                        id="state"
                        name="state"
                        value={formik.values.state}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                    />
                    {formik.touched.state && formik.errors.state ? (
                        <div className="invalid-feedback">{formik.errors.state}</div>
                    ) : null}
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor="pincode" className="form-label">Pincode</label>
                <input
                    type="text"
                    className={`form-control ${formik.touched.pincode && formik.errors.pincode ? 'is-invalid' : ''}`}
                    id="pincode"
                    name="pincode"
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                />
                {formik.touched.pincode && formik.errors.pincode ? (
                    <div className="invalid-feedback">{formik.errors.pincode}</div>
                ) : null}
            </div>
            <div className="mb-3">
                <div className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="isDefault"
                        name="isDefault"
                        checked={formik.values.isDefault}
                        onChange={formik.handleChange}
                    />
                    <label className="form-check-label" htmlFor="isDefault">
                        Set as default address
                    </label>
                </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
                {onCancel && (
                    <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                )}
                <button type="submit" className="btn btn-primary">
                    {initialData ? 'Update Address' : 'Add Address'}
                </button>
            </div>
        </form>
    );
};

const AddressManagement = () => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await axiosInstance.get('/auth/addresses');
            if (response.data.success && Array.isArray(response.data.addresses)) {
                setAddresses(response.data.addresses || []);
                // Set selected address to the default address if it exists
                const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddress(defaultAddress._id);
                }
            } else {
                setError('Invalid response format from server');
            }
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch addresses');
            setLoading(false);
            showToast('Error fetching addresses', 'error');
        }
    };

    const handleAddAddress = async (addressData) => {
        try {
            const response = await axiosInstance.post('/auth/address', addressData);
            if (response.data.success) {
                await fetchAddresses();
                setShowAddForm(false);
                showToast('Address Added Successfully!', 'success');
            } else {
                throw new Error(response.data.message || 'Failed to add address');
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to add address', 'error');
        }
    };

    const handleEditAddress = async (updatedAddress) =>{
        try {
            console.log('Updating address with ID:', updatedAddress._id);
        console.log('Update payload:', updatedAddress);

        const updatePayload = {
            firstName: updatedAddress.firstName,
            lastName: updatedAddress.lastName,
            phoneNumber: updatedAddress.phoneNumber,
            streetAddress: updatedAddress.streetAddress,
            city: updatedAddress.city,
            state: updatedAddress.state,
            pincode: updatedAddress.pincode,
            isDefault: updatedAddress.isDefault
        };

        const response = await axiosInstance.put(
            `/auth/address/${updatedAddress._id}`,
            updatePayload
        );

        if (response.data.success) {
            await fetchAddresses(); 
            setEditingAddress(null);
            showToast('Address Updated Successfully', 'success');
        } else {
            throw new Error(response.data.message || 'Failed to update address');
        }
    } catch (error) {
        console.error('Update error:', error);
        showToast(error.response?.data?.message || 'Failed to update address', 'error');
    }
};


        
    const handleDeleteAddress = async () => {
        try {
            const response = await axiosInstance.delete(`/auth/address/${addressToDelete}`);
            if (response.data.success) {
                await fetchAddresses(); 
                setShowDeleteModal(false);
                setAddressToDelete(null);
                showToast('Address Deleted Successfully!', 'success');
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete address', 'error');
        }
    };

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast show position-fixed top-0 end-0 m-3 ${type === 'error' ? 'bg-danger text-white' : ''}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    // Function to handle starting the edit process
    const startEditing = (address) => {
        setEditingAddress(address);
        setSelectedAddress(address._id); // Set the selected address when editing
    };

    if (loading) return (
        <div className="container py-4">
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="container py-4">
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        </div>
    );

    return (

        <Fragment>
            <Header />
            <div className="container py-4">          
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title mb-0">Manage Addresses</h5>
                </div>
                <div className="card-body">
                    <button
                        className="btn btn-primary w-100 mb-4"
                        onClick={() => setShowAddForm(true)}
                    >
                        <Plus className="icon-small me-2" /> Add New Address
                    </button>

                    {/* Address List */}
                    <div className="address-list">
                        {addresses.map((address) => (
                            <div key={address._id} className="address-item card mb-3">
                                <div className="card-body">
                                    <div className="d-flex align-items-start">
                                        <div className="form-check flex-grow-1">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="selectedAddress"
                                                id={`address-${address._id}`}
                                                checked={selectedAddress === address._id}
                                                onChange={() => setSelectedAddress(address._id)}
                                            />
                                            <label className="form-check-label" htmlFor={`address-${address._id}`}>
                                                <strong>{address.firstName} {address.lastName}</strong>
                                                <p className="mb-0 text-muted">
                                                    {address.streetAddress}<br />
                                                    {address.city}, {address.state} - {address.pincode}<br />
                                                    Phone: {address.phoneNumber}
                                                    {address.isDefault && (
                                                        <span className="badge bg-primary ms-2">Default</span>
                                                    )}
                                                </p>
                                            </label>
                                        </div>
                                        <div className="address-actions">
                                            <button
                                                className="btn btn-outline-primary btn-sm me-2"
                                                onClick={() => startEditing(address)}
                                            >
                                                <Edit className="icon-small" />
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => {
                                                    setAddressToDelete(address._id);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                <Trash2 className="icon-small" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add/Edit/Delete Modals */}
                    {/* Add Address Modal */}
                    <div className={`modal ${showAddForm ? 'show d-block' : ''}`} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add New Address</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowAddForm(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <AddressForm
                                        onSubmit={handleAddAddress}
                                        onCancel={() => setShowAddForm(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Address Modal */}
                    <div className={`modal ${editingAddress ? 'show d-block' : ''}`} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Address</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setEditingAddress(null)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <AddressForm
                                        initialData={editingAddress}
                                        onSubmit={handleEditAddress}
                                        onCancel={() => setEditingAddress(null)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    <div className={`modal ${showDeleteModal ? 'show d-block' : ''}`} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Delete Address</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowDeleteModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p>Are you sure you want to delete this address? This action cannot be undone.</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleDeleteAddress}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Backdrop */}
                    {(showAddForm || editingAddress || showDeleteModal) && (
                        <div className="modal-backdrop show"></div>
                    )}
                </div>
            </div>
        </div>
        <Footer />
        </Fragment>
        
    )}

    export default AddressManagement;