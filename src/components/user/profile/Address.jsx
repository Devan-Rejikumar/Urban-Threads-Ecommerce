import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, X } from 'lucide-react';
import axiosInstance from "../../../utils/axiosInstance";
import Header from "../Header";
import { Fragment } from "react";
import Footer from "../Footer";


const AddressForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                    />
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                <input
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="streetAddress" className="form-label">Street Address</label>
                <input
                    type="text"
                    className="form-control"
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    required
                />
            </div>
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="city" className="form-label">City</label>
                    <input
                        type="text"
                        className="form-control"
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label htmlFor="state" className="form-label">State</label>
                    <input
                        type="text"
                        className="form-control"
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                    />
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor="pincode" className="form-label">Pincode</label>
                <input
                    type="text"
                    className="form-control"
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    required
                />
            </div>
            <div className="mb-3">
                <div className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
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