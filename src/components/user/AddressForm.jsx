import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../utils/axiosInstance';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';



const addressSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First Name is required')
    .max(50, 'First Name must be less than 50 characters'),
  lastName: Yup.string()
    .required('Last Name is required')
    .max(50, 'Last Name must be less than 50 characters'),
  phoneNumber: Yup.string()
    .required('Phone Number is required')
    .matches(/^[6-9]\d{9}$/, 'Phone number must start with 6-9 and be 10 digits')
    .test('no-repeated', 'Phone number cannot have excessive repeated digits', value => {
      if (!value) return true;
      return !/(.)\1{7,}/.test(value);
    }),
  streetAddress: Yup.string()
    .required('Street Address is required')
    .max(100, 'Street Address must be less than 100 characters'),
  city: Yup.string()
    .required('City is required')
    .max(50, 'City must be less than 50 characters'),
  state: Yup.string()
    .required('State is required')
    .max(50, 'State must be less than 50 characters'),
  pincode: Yup.string()
    .required('PIN Code is required')
    .matches(/^\d{6}$/, 'PIN Code must be exactly 6 digits'),
  isDefault: Yup.boolean(),
});

const AddressForm = ({ show, onHide, editingAddress }) => {
  const [address, setAddress] = useState('');

  const initialValues = editingAddress || {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  };


  const handleSaveAddress = async (values, { setSubmitting }) => {
    try {
      if (editingAddress) {

        await axiosInstance.put(`/auth/address/${editingAddress._id}`, values);
      } else {

        await axiosInstance.post('/auth/address', values);
      }
      onHide();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setSubmitting(false);
    }
  };


  useEffect(() => {
    if (editingAddress) {
      setAddress(editingAddress);
    } else {

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


  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editingAddress ? 'Edit Address' : 'Add New Address'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={addressSchema}
          onSubmit={handleSaveAddress}
        >
          {({ handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Field
                      name="firstName"
                      as={Form.Control}
                      type="text"
                      placeholder="Enter first name"
                    />
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Field
                      name="lastName"
                      as={Form.Control}
                      type="text"
                      placeholder="Enter last name"
                    />
                    <ErrorMessage
                      name="lastName"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Field
                  name="phoneNumber"
                  as={Form.Control}
                  type="tel"
                  placeholder="Enter phone number"
                />
                <ErrorMessage
                  name="phoneNumber"
                  component="div"
                  className="text-danger small"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Street Address</Form.Label>
                <Field
                  name="streetAddress"
                  as={Form.Control}
                  type="text"
                  placeholder="Enter street address"
                />
                <ErrorMessage
                  name="streetAddress"
                  component="div"
                  className="text-danger small"
                />
              </Form.Group>

              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Field
                      name="city"
                      as={Form.Control}
                      type="text"
                      placeholder="Enter city"
                    />
                    <ErrorMessage
                      name="city"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Field
                      name="state"
                      as={Form.Control}
                      type="text"
                      placeholder="Enter state"
                    />
                    <ErrorMessage
                      name="state"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>PIN Code</Form.Label>
                <Field
                  name="pincode"
                  as={Form.Control}
                  type="text"
                  placeholder="Enter PIN code"
                />
                <ErrorMessage
                  name="pincode"
                  component="div"
                  className="text-danger small"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Field
                  name="isDefault"
                  as={Form.Check}
                  type="checkbox"
                  label="Set as Default Address"
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={isSubmitting}
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default AddressForm;