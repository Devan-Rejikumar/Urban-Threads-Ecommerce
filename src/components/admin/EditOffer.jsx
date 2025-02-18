import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { toast } from 'react-toastify';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    discountType: Yup.string().required('Required'),
    discountValue: Yup.number()
        .required('Required')
        .positive('Must be positive')
        .when('discountType', {
            is: 'percentage',
            then: Yup.number().max(100, 'Max 100%')
        }),
    applicableType: Yup.string().required('Required'),
    applicableId: Yup.string().required('Required'),
    startDate: Yup.date().required('Required'),
    endDate: Yup.date()
        .min(Yup.ref('startDate'), 'Must be after start date')
        .required('Required')
});

const EditOffer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [offerRes, productsRes, categoriesRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/admin/offers/${id}`, { withCredentials: true }),
                axios.get('http://localhost:5000/api/admin/products', { withCredentials: true }),
                axios.get('http://localhost:5000/api/admin/categories', { withCredentials: true })
            ]);

            setOffer({
                ...offerRes.data.offer,
                startDate: new Date(offerRes.data.offer.startDate),
                endDate: new Date(offerRes.data.offer.endDate)
            });
            setProducts(productsRes.data.products);
            setCategories(categoriesRes.data.categories);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.response?.data?.message || 'Error fetching data');
            
            if (error.response?.status === 401) {
                toast.error('Please login to continue');
                navigate('/admin/login');
            } else if (error.response?.status === 404) {
                toast.error('Offer or resources not found');
                navigate('/admin/offers');
            } else {
                toast.error('Failed to fetch data: ' + (error.response?.data?.message || 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/admin/offers/${id}`,
                values,
                { withCredentials: true }
            );
            
            if (response.data.success) {
                toast.success('Offer updated successfully');
                navigate('/admin/offers');
            }
        } catch (error) {
            console.error('Error updating offer:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to continue');
                navigate('/admin/login');
            } else {
                toast.error(error.response?.data?.message || 'Update failed');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="alert alert-danger m-4" role="alert">
            {error}
        </div>
    );

    if (!offer) return (
        <div className="alert alert-warning m-4" role="alert">
            Offer not found
        </div>
    );

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">
                    <h3>Edit Offer</h3>
                </div>
                <div className="card-body">
                    <Formik
                        initialValues={offer}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ setFieldValue, values }) => (
                            <Form>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">Offer Name</label>
                                        <Field name="name" type="text" className="form-control" />
                                        <ErrorMessage name="name" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">Description</label>
                                        <Field name="description" as="textarea" className="form-control" />
                                        <ErrorMessage name="description" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Discount Type</label>
                                        <Field name="discountType" as="select" className="form-select">
                                            <option value="">Select Type</option>
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed Amount</option>
                                        </Field>
                                        <ErrorMessage name="discountType" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Discount Value</label>
                                        <Field name="discountValue" type="number" className="form-control" />
                                        <ErrorMessage name="discountValue" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Applicable Type</label>
                                        <Field name="applicableType" as="select" className="form-select">
                                            <option value="">Select Type</option>
                                            <option value="product">Product</option>
                                            <option value="category">Category</option>
                                        </Field>
                                        <ErrorMessage name="applicableType" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Applicable Item</label>
                                        <Field name="applicableId" as="select" className="form-select">
                                            <option value="">Select Item</option>
                                            {values.applicableType === 'product' && products.map(product => (
                                                <option key={product._id} value={product._id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                            {values.applicableType === 'category' && categories.map(category => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="applicableId" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Start Date</label>
                                        <DatePicker
                                            selected={values.startDate}
                                            onChange={date => setFieldValue('startDate', date)}
                                            className="form-control"
                                            dateFormat="dd/MM/yyyy"
                                            minDate={new Date()}
                                        />
                                        <ErrorMessage name="startDate" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">End Date</label>
                                        <DatePicker
                                            selected={values.endDate}
                                            onChange={date => setFieldValue('endDate', date)}
                                            className="form-control"
                                            dateFormat="dd/MM/yyyy"
                                            minDate={values.startDate || new Date()}
                                        />
                                        <ErrorMessage name="endDate" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-12">
                                        <div className="form-check">
                                            <Field
                                                type="checkbox"
                                                name="isActive"
                                                className="form-check-input"
                                            />
                                            <label className="form-check-label">Active</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <button type="submit" className="btn btn-primary me-2">
                                        Update Offer
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/admin/offers')}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default EditOffer;