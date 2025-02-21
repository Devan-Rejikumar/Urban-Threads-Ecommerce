import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    discountType: Yup.string().required('Required'),
    discountValue: Yup.number()
        .required('Required')
        .positive('Must be positive')
        .when('discountType', {
            is: 'percentage',
            then: Yup.number().max(100, 'Cannot exceed 100%')
        }),
    startDate: Yup.date().required('Required'),
    endDate: Yup.date()
        .min(Yup.ref('startDate'), 'End date must be after start date')
        .required('Required'),
    applicableType: Yup.string().required('Required'),
    applicableId: Yup.string().required('Required')
});

const OfferForm = ({ initialValues, onSubmit, products, categories }) => (
    <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
    >
        {({ setFieldValue, values }) => (
            <Form>
                <div className="mb-3">
                    <label>Name</label>
                    <Field name="name" type="text" className="form-control" />
                    <ErrorMessage name="name" component="div" className="text-danger" />
                </div>

                <div className="mb-3">
                    <label>Description</label>
                    <Field name="description" as="textarea" className="form-control" />
                    <ErrorMessage name="description" component="div" className="text-danger" />
                </div>

                <div className="row mb-3">
                    <div className="col">
                        <label>Discount Type</label>
                        <Field name="discountType" as="select" className="form-select">
                            <option value="">Select Type</option>
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                        </Field>
                    </div>

                    <div className="col">
                        <label>Discount Value</label>
                        <Field name="discountValue" type="number" className="form-control" />
                        <ErrorMessage name="discountValue" component="div" className="text-danger" />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col">
                        <label>Start Date</label>
                        <DatePicker
                            selected={values.startDate}
                            onChange={date => setFieldValue('startDate', date)}
                            className="form-control"
                            minDate={new Date()}
                        />
                    </div>

                    <div className="col">
                        <label>End Date</label>
                        <DatePicker
                            selected={values.endDate}
                            onChange={date => setFieldValue('endDate', date)}
                            className="form-control"
                            minDate={values.startDate}
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col">
                        <label>Apply To</label>
                        <Field name="applicableType" as="select" className="form-select">
                            <option value="">Select Type</option>
                            <option value="Product">Product</option>
                            <option value="Category">Category</option>
                        </Field>
                    </div>

                    <div className="col">
                        <label>Select Item</label>
                        <Field name="applicableId" as="select" className="form-select">
                            <option value="">Select...</option>
                            {values.applicableType === 'Product' 
                                ? products.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))
                                : categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))
                            }
                        </Field>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </Form>
        )}
    </Formik>
);

export default OfferForm;