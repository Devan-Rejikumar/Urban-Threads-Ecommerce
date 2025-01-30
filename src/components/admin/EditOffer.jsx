import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import axios from 'axios';

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

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [offerRes, productsRes, categoriesRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/admin/offers/${id}`),
                axios.get('http://localhost:5000/api/admin/products'),
                axios.get('http://localhost:5000/api/admin/categories')
            ]);

            setOffer({
                ...offerRes.data.offer,
                startDate: new Date(offerRes.data.offer.startDate),
                endDate: new Date(offerRes.data.offer.endDate)
            });
            setProducts(productsRes.data.products);
            setCategories(categoriesRes.data.categories);
        } catch (error) {
            toast.error('Failed to fetch data');
            navigate('/admin/offers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/offers/${id}`, values);
            toast.success('Offer updated successfully');
            navigate('/admin/offers');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!offer) return <div>Offer not found</div>;

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
                                        <label className="form-label">Start Date</label>
                                        <DatePicker
                                            selected={values.startDate}
                                            onChange={date => setFieldValue('startDate', date)}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">End Date</label>
                                        <DatePicker
                                            selected={values.endDate}
                                            onChange={date => setFieldValue('endDate', date)}
                                            className="form-control"
                                            minDate={values.startDate}
                                        />
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