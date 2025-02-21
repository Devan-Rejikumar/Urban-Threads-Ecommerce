import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    applicableType: Yup.string().required('Select type'),
    applicableId: Yup.string().required('Select item'),
    startDate: Yup.date().required('Select start date'),
    endDate: Yup.date()
        .min(Yup.ref('startDate'), 'End date must be after start date')
        .required('Select end date')
});

const CreateOffer = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offerType, setOfferType] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products', { withCredentials: true }),
                axios.get('http://localhost:5000/api/categories', { withCredentials: true })
            ]);

            if (productsRes?.data) {
                setProducts(productsRes.data);
            }

            if (categoriesRes?.data) {
                setCategories(categoriesRes.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to continue', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
                navigate('/admin/login');
            } else {
                toast.error('Error fetching data: ' + (error.response?.data?.message || error.message), {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const response = await axios.post('http://localhost:5000/api/admin/offers', values, { withCredentials: true });

            if (response.status === 201) {
                toast.success('🎉 Offer created successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    onClose: () => {
                        navigate('/admin-dashboard/offers');
                    }
                });

                // Optional: Reset form after successful submission
                resetForm();
            }
        } catch (error) {
            console.error('Error creating offer:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to continue', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
                navigate('/admin-login');
            } else {
                toast.error(error.response?.data?.message || 'Failed to create offer', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mt-4">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <div className="card">
                <div className="card-header">
                    <h3>Create New Offer</h3>
                </div>
                <div className="card-body">
                    <Formik
                        initialValues={{
                            name: '',
                            description: '',
                            discountValue: '',
                            applicableType: '',
                            applicableId: '',
                            startDate: new Date(),
                            endDate: new Date()
                        }}
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
                                        <label className="form-label">Discount Value</label>
                                        <Field name="discountValue" type="number" className="form-control" />
                                        <ErrorMessage name="discountValue" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Apply To</label>
                                        <Field
                                            name="applicableType"
                                            as="select"
                                            className="form-select"
                                            onChange={(e) => {
                                                setFieldValue('applicableType', e.target.value);
                                                setOfferType(e.target.value);
                                                setFieldValue('applicableId', '');
                                            }}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Product">Product</option>
                                            <option value="Category">Category</option>
                                        </Field>
                                        <ErrorMessage name="applicableType" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Select Item</label>
                                        <Field
                                            name="applicableId"
                                            as="select"
                                            className="form-select"
                                            disabled={!values.applicableType}
                                        >
                                            <option value="">Select...</option>
                                            {console.log('mmmmmmmmm', offerType)}
                                            {offerType === 'Product' && products.map(p => (
                                                <option key={p.id || p._id} value={p.id || p._id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                            {offerType === 'Category' && categories.map(c => (
                                                <option key={c.id || c._id} value={c.id || c._id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="applicableId" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Start Date</label>
                                        <Field name="startDate">
                                            {({ field }) => (
                                                <DatePicker
                                                    className="form-control"
                                                    selected={field.value}
                                                    onChange={date => setFieldValue('startDate', date)}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="startDate" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">End Date</label>
                                        <Field name="endDate">
                                            {({ field }) => (
                                                <DatePicker
                                                    className="form-control"
                                                    selected={field.value}
                                                    onChange={date => setFieldValue('endDate', date)}
                                                    minDate={values.startDate}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="endDate" component="div" className="text-danger" />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <button type="submit" className="btn btn-primary me-2">
                                        Create Offer
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

export default CreateOffer;