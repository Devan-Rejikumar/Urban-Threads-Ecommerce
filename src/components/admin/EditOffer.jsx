import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    discountValue: Yup.number()
        .required('Required')
        .positive('Must be positive'),
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
            const offerRes = await axios.get(`http://localhost:5000/api/admin/offers/${id}`, { withCredentials: true });
            console.log('Full offer response:', offerRes.data);
            const offerData = offerRes.data.offer || offerRes.data;
            let productsData = [];
            let categoriesData = [];
            
            try {
            
                const productsRes = await axios.get('http://localhost:5000/api/products', { withCredentials: true });
                productsData = productsRes.data.products || productsRes.data || [];
                console.log('Products from first endpoint:', productsData);
            } catch (err) {
                console.log('First products endpoint failed, trying alternative');
                try {
               
                    const productsRes = await axios.get('http://localhost:5000/api/admin/products', { withCredentials: true });
                    productsData = productsRes.data.products || productsRes.data || [];
                    console.log('Products from alternative endpoint:', productsData);
                } catch (innerErr) {
                    console.error('Both product endpoints failed:', innerErr);
                    toast.error('Failed to load products');
                }
            }
            
            try {
                // Try first endpoint structure
                const categoriesRes = await axios.get('http://localhost:5000/api/categories', { withCredentials: true });
                categoriesData = categoriesRes.data.categories || categoriesRes.data || [];
                console.log('Categories from first endpoint:', categoriesData);
            } catch (err) {
                console.log('First categories endpoint failed, trying alternative');
                try {
                    // Try alternative endpoint
                    const categoriesRes = await axios.get('http://localhost:5000/api/admin/categories', { withCredentials: true });
                    categoriesData = categoriesRes.data.categories || categoriesRes.data || [];
                    console.log('Categories from alternative endpoint:', categoriesData);
                } catch (innerErr) {
                    console.error('Both category endpoints failed:', innerErr);
                    toast.error('Failed to load categories');
                }
            }

      

            // Extract the startDate and endDate
            const startDate = offerData.startDate ? new Date(offerData.startDate) : null;
            const endDate = offerData.endDate ? new Date(offerData.endDate) : null;


            console.log('Raw start date from API:', offerData.startDate);
            console.log('Raw end date from API:', offerData.endDate);
            console.log('Parsed start date:', startDate);
            console.log('Parsed end date:', endDate);
            // Set the offer state, ensuring applicableId is properly extracted
            setOffer({
                ...offerData,
                startDate,
                endDate,
                applicableId: typeof offerData.applicableId === 'object' && offerData.applicableId !== null
                    ? offerData.applicableId._id
                    : offerData.applicableId || ''
            });
            
            setProducts(productsData);
            setCategories(categoriesData);
            
            console.log('Offer state set:', {
                ...offerData,
                startDate,
                endDate,
                applicableId: typeof offerData.applicableId === 'object' && offerData.applicableId !== null
                    ? offerData.applicableId._id
                    : offerData.applicableId || ''
            });
            console.log('Products state set:', productsData);
            console.log('Categories state set:', categoriesData);
            
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
            console.log('Submitting values:', values);
            // Format dates properly if they're causing issues
            const formattedValues = {
                ...values,
                startDate: values.startDate ? values.startDate.toISOString() : null,
                endDate: values.endDate ? values.endDate.toISOString() : null
            };
            console.log('Formatted values being sent:', formattedValues);
            
            const response = await axios.put(
                `http://localhost:5000/api/admin/offers/${id}`,
                formattedValues,
                { withCredentials: true }
            );
    
            console.log('Response received:', response);
            if (response.data.success) {
                toast.success('🎉 Offer updated successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                setTimeout(() => {
                    navigate('/admin-dashboard/offers');
                }, 1000);
            }
        } catch (error) {
            console.error('Full error object:', error);
            console.error('Response data if available:', error.response?.data);
            console.error('Request that was sent:', error.config);
            
            if (error.response?.status === 401) {
                toast.error('Please login to continue');
                navigate('/admin/login');
            } else {
                toast.error(error.response?.data?.message || `Update failed: ${error.message}`);
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

    // Debug what's available at render time
    console.log('Render - offer:', offer);
    console.log('Render - products:', products);
    console.log('Render - categories:', categories);

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
                    <h3>Edit Offer</h3>
                </div>
                <div className="card-body">
                    <Formik
                        initialValues={{
                            name: offer.name || '',
                            description: offer.description || '',
                            discountValue: offer.discountValue || 0,
                            applicableType: offer.applicableType || '',
                            applicableId: offer.applicableId || '',
                            startDate: offer.startDate || null,
                            endDate: offer.endDate || null,
                            isActive: offer.isActive !== undefined ? offer.isActive : true
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
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
                                        <label className="form-label">Applicable Type</label>
                                        <Field 
                                            name="applicableType" 
                                            as="select" 
                                            className="form-select"
                                            onChange={(e) => {
                                                setFieldValue('applicableType', e.target.value);
                                                // Reset the applicableId when type changes
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
                                        <label className="form-label">Applicable Item</label>
                                        <Field name="applicableId" as="select" className="form-select">
                                            <option value="">Select Item</option>
                                            {values.applicableType === 'Product' && products && products.length > 0 ? (
                                                products.map(product => (
                                                    <option key={product._id} value={product._id}>
                                                        {product.name}
                                                    </option>
                                                ))
                                            ) : null}
                                            {values.applicableType === 'Category' && categories && categories.length > 0 ? (
                                                categories.map(category => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))
                                            ) : null}
                                            {((values.applicableType === 'Product' && (!products || products.length === 0)) || 
                                             (values.applicableType === 'Category' && (!categories || categories.length === 0))) && (
                                                <option value="">No items available</option>
                                            )}
                                        </Field>
                                        <ErrorMessage name="applicableId" component="div" className="text-danger" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Start Date</label>
                                        <DatePicker
                                            selected={values.startDate}
                                            onChange={date => {
                                                console.log('New start date selected:', date);
                                                setFieldValue('startDate', date)}}
                                            className="form-control"
                                            dateFormat="dd/MM/yyyy"
                                            isClearable
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
                                            isClearable
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
                                        onClick={() => navigate('/admin-dashboard/offers')}
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