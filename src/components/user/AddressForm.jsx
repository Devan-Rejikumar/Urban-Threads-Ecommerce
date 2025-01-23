import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../utils/axiosInstance';

const AddressForm = ({ show, onHide, editingAddress }) => {
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Reset or populate form when editing address changes
  useEffect(() => {
    if (editingAddress) {
      setAddress(editingAddress);
    } else {
      // Reset to default values when adding new address
      setAddress({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
    }
  }, [editingAddress]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        // Update existing address
        await axiosInstance.put(`/auth/address/${editingAddress._id}`, address);
      } else {
        // Add new address
        await axiosInstance.post('/auth/address', address);
      }
      onHide(); // Close modal after successful save
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editingAddress ? 'Edit Address' : 'Add New Address'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSaveAddress}>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={address.firstName}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={address.lastName}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="phoneNumber"
              value={address.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Street Address</Form.Label>
            <Form.Control
              type="text"
              name="streetAddress"
              value={address.streetAddress}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>PIN Code</Form.Label>
            <Form.Control
              type="text"
              name="pincode"
              value={address.pincode}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isDefault"
              label="Set as Default Address"
              checked={address.isDefault}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            {editingAddress ? 'Update Address' : 'Save Address'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddressForm;