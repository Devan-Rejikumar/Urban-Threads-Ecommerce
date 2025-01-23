import React, { useState, useEffect } from 'react';
import { Edit, MapPin, Plus, Trash2, X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import AddressForm from '../user/profile/Address.jsx';

const AddressModal = ({ show, onHide, onAddressUpdated }) => {
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axiosInstance.get('/auth/addresses');
        if (response.data.success) {
          setAddresses(response.data.addresses);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    };

    if (show) {
      fetchAddresses();
    }
  }, [show]);

  const handleAddAddress = async (addressData) => {
    try {
      const response = await axiosInstance.post('/auth/address', addressData);
      if (response.data.success) {
        setAddresses([...addresses, response.data.address]);
        setShowAddForm(false);
        onAddressUpdated();
      }
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const handleEditAddress = async (updatedAddress) => {
    try {
      const response = await axiosInstance.put(`/auth/address/${updatedAddress._id}`, updatedAddress);
      if (response.data.success) {
        const updatedAddresses = addresses.map(addr => addr._id === updatedAddress._id ? response.data.address : addr);
        setAddresses(updatedAddresses);
        setEditingAddress(null);
        onAddressUpdated();
      }
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await axiosInstance.delete(`/auth/address/${addressId}`);
      setAddresses(addresses.filter(addr => addr._id !== addressId));
      onAddressUpdated();
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable modal-dialog-end" style={{ margin: '0 0 0 auto', height: '100vh', maxWidth: '400px' }}>
        <div className="modal-content h-100">
          <div className="modal-header">
            <h5 className="modal-title">Manage Addresses</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <button
              className="btn btn-primary w-100 mb-4"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="icon-small me-2" /> Add New Address
            </button>

            {showAddForm && (
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            {editingAddress && (
              <AddressForm
                initialData={editingAddress}
                onSubmit={handleEditAddress}
                onCancel={() => setEditingAddress(null)}
              />
            )}

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
                        onClick={() => setEditingAddress(address)}
                      >
                        <Edit className="icon-small" />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteAddress(address._id)}
                      >
                        <Trash2 className="icon-small" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;