import React, { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ImagePlus, X } from 'lucide-react';

const AddCategory = ({ onSave, onCancel, onUpdateSuccess }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Validation Schema
  const validationSchema = Yup.object().shape({
    categoryName: Yup.string()
      .required('Category name is required')
      .min(2, 'Category name must be at least 2 characters')
      .max(50, 'Category name must not exceed 50 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must not exceed 500 characters'),
    image: Yup.mixed()
      .required('Image is required')
      .test('fileSize', 'Image size must be less than 5MB', (value) => {
        if (!value) return true;
        return value.size <= 5000000;
      })
      .test('fileType', 'Unsupported file format. Use PNG, JPEG, or JPG', (value) => {
        if (!value) return true;
        const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
        return supportedFormats.includes(value.type);
      })
  });

  const handleImageChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      setFieldValue('image', file);
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = (setFieldValue) => {
    setImagePreview(null);
    setFieldValue('image', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsLoading(true);
    setSubmitting(true);

    try {
      // Convert image to base64
      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(values.image);
      });

      const payload = {
        name: values.categoryName.trim(),
        description: values.description.trim(),
        image: base64Image,
        isActive: true
      };

      const response = await axios.post('http://localhost:5000/api/categories', payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('Category created successfully');
      onSave(response.data);
      onUpdateSuccess();

      // Clean up
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      resetForm();
      setImagePreview(null);
      
      setTimeout(() => {
        onCancel();
      }, 2000);

    } catch (error) {
      console.error('Category creation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create category';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-black">Adding category...</div>;
  }

  return (
    <div className="add-category">
      <h2 className="text-black mb-4">Add New Category</h2>
      <Formik
        initialValues={{
          categoryName: '',
          description: '',
          image: null
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form className="space-y-4">
            <div className="form-group">
              <label htmlFor="categoryName" className="block text-black mb-2">
                Category Name
              </label>
              <Field
                id="categoryName"
                name="categoryName"
                type="text"
                className="w-full p-2 border rounded text-black"
                placeholder="Type category name here..."
              />
              <ErrorMessage
                name="categoryName"
                component="div"
                className="text-red-500 mt-1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="block text-black mb-2">
                Description
              </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                className="w-full p-2 border rounded text-black"
                placeholder="Type category description here..."
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-red-500 mt-1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="image" className="block text-black mb-2">
                Category Image
              </label>
              
              {!imagePreview ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center">
                    <ImagePlus className="w-12 h-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or JPEG (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="image"
                    name="image"
                    type="file"
                    onChange={(event) => handleImageChange(event, setFieldValue)}
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="max-w-[200px] max-h-[200px] object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(setFieldValue)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <ErrorMessage
                name="image"
                component="div"
                className="text-red-500 mt-1"
              />
            </div>

            <div className="button-group space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddCategory;