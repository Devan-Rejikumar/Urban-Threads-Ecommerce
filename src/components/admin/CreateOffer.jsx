import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import axios from 'axios';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    discountType: Yup.string().required('Select discount type'),
    discountValue: Yup.number()
        .required('Enter discount value')
        .positive('Must be positive')
        .when('discountType', (discountType, schema) => {
            console.log('Discount Typeddddddddddddddddd:', discountType); 
            if (discountType === 'percentage') {
                return schema.max(100, 'Cannot exceed 100%');
            }
            return schema;
        }),
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
                axios.get('http://localhost:5000/api/products', {withCredentials : true}),
                axios.get('http://localhost:5000/api/categories', {withCredentials : true})
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
                toast.error('Please login to continue');
                navigate('/admin/login');
            } else {
                toast.error('Error fetching data: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
          
            const response = await axios.post('http://localhost:5000/api/admin/offers', values, {withCredentials : true});
            console.log(response)
            if(response.status === 201) {
                toast.success('Offer created successfully');
            navigate('/admin-dashboard/offers');
            }
        } catch (error) {
            console.error('Error creating offer:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to continue');
                navigate('/admin-login');
            } else {
                toast.error(error.response?.data?.message || 'Failed to create offer');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">
                    <h3>Create New Offer</h3>
                </div>
                <div className="card-body">
                    <Formik
                        initialValues={{
                            name: '',
                            description: '',
                            discountType: '',
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
                                        <label className="form-label">Discount Type</label>
                                        <Field name="discountType" as="select" className="form-select">
                                            <option value="">Select Discount Type</option>
                                            <option value="percentage">Percentage Off</option>
                                            <option value="fixed">Fixed Amount Off</option>
                                        </Field>
                                        <ErrorMessage name="discountType" component="div" className="text-danger" />
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
                                            <option value="product">Product</option>
                                            <option value="category">Category</option>
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
                                            {offerType === 'product' && products.map(p => (
                                                <option key={p.id || p._id} value={p.id || p._id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                            {offerType === 'category' && categories.map(c => (
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