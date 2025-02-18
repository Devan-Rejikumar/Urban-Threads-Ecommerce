import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Plus, Trash, Upload, X, Edit2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Product.css';
import Cropper from 'react-easy-crop';
import { Breadcrumb } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const initialFormData = {
  name: '',
  category: '',
  description: '',
  originalPrice: '',
  salePrice: '',
  images: [null, null, null],
  variants: [{ size: 'M', color: '#000000', stock: 0 }],
  isListed: true
};

const colorOptions = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Navy', hex: '#000080' }
];

const ProductSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Product name is required'),
  category: Yup.string()
    .required('Category is required'),
  description: Yup.string(),
  originalPrice: Yup.number()
    .positive('Original price must be greater than 0')
    .required('Original price is required'),
  salePrice: Yup.number()
    .nullable()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .positive('Sale price must be greater than 0')
    .test('less-than-original', 'Sale price must be less than original price',
      function (value) {
        return !value || value < this.parent.originalPrice;
      }),
  variants: Yup.array().of(
    Yup.object().shape({
      size: Yup.string().required('Size is required'),
      color: Yup.string().required('Color is required'),
      stock: Yup.number()
        .min(0, 'Stock must be 0 or greater')
        .required('Stock is required')
    })
  ).min(1, 'At least one variant is required'),
  images: Yup.array()
    .test('at-least-one-image', 'At least one product image is required',
      (value) => value && value.some(img => img !== null))
});


const Product = () => {
  const [showCreateProductsDialog, setShowCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); 
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState([]);



  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage, itemsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/categories', {
        withCredentials: true
      });
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        withCredentials: true
      });
      setProducts(response.data);
      setTotalProducts(response.data.total);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      toast.error('Failed to load products');
    }
  };



  const handleEdit = (product) => {
    setIsEditing(true);
    setEditingProductId(product._id);
    setFormData({
      name: product.name || '',
      category: product.category._id || '',
      description: product.description || '',
      originalPrice: product.originalPrice || '',
      salePrice: product.salePrice || '',
      images: product.images || [null, null, null],
      variants: product.variants.map(v => ({
        size: v.size || 'M',
        color: v.color || '#000000',
        stock: v.stock || 0
      })),
      isListed: product.isListed
    });
    setShowCreateProductsDialog(true);
  };

  const handleToggleList = async (productId, currentStatus) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/products/${productId}`,
        { isListed: !currentStatus },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product._id === productId
              ? { ...product, isListed: !currentStatus }
              : product
          )
        );
        toast.success(`Product ${currentStatus ? 'unlisted' : 'listed'} successfully`);
      }
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateImage = (dataUrl) => {
    return true;
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];

    try {

      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const dataUrl = event.target.result;
          validateImage(dataUrl);


          setImageSrc(dataUrl);
          setSelectedImageIndex(index);
        } catch (error) {
          toast.error(error.message);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        canvas.toBlob(
          (blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              resolve(reader.result);
            };
          },
          'image/jpeg',
          1
        );
      };
    });
  };

  const handleCropComplete = async () => {
    try {
      if (!croppedAreaPixels || !imageSrc) {
        throw new Error('No image to crop');
      }

      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

      const updatedImages = [...formData.images];
      updatedImages[selectedImageIndex] = croppedImage;
      setFormData(prev => ({
        ...prev,
        images: updatedImages
      }));


      setImageSrc(null);
      setSelectedImageIndex(null);
      setCroppedAreaPixels(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } catch (error) {
      console.error(error);
      toast.error('Failed to crop image');
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = null;
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: 'M', color: '#000000', stock: 0 }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };



  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    if (field === 'color') {
      const colorOption = colorOptions.find(c => c.name === value);
      value = colorOption ? colorOption.hex : value;
    }
    updatedVariants[index][field] = field === 'stock' ? Number(value) : value;
    setFormData(prev => ({
      ...prev,
      variants: updatedVariants
    }));
  };




  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (!values) {
        throw new Error('Form data is missing');
      }

      const variants = Array.isArray(values.variants)
        ? values.variants
        : [{ size: 'M', color: '#000000', stock: 0 }];

      const images = [];
      if (Array.isArray(values.images)) {
        for (let i = 0; i < values.images.length; i++) {
          const image = values.images[i];
          try {
            if (image && validateImage(image)) {
              images.push(image);
            }
          } catch (error) {
            throw new Error(`Image ${i + 1}: ${error.message}`);
          }
        }
      }
      const productData = {
        name: values.name.trim(),
        category: values.category,
        description: values.description || '',
        originalPrice: Number(values.originalPrice),
        salePrice: values.salePrice ? Number(values.salePrice) : null,
        isListed: Boolean(values.isListed),
        variants: values.variants.map(variant => ({
          size: String(variant.size),
          color: String(variant.color),
          stock: Number(variant.stock)
        })),
        images: images
      };

      const url = isEditing
        ? `http://localhost:5000/api/products/${editingProductId}`
        : 'http://localhost:5000/api/products';

      const response = await axios({
        method: isEditing ? 'put' : 'post',
        url: url,
        data: JSON.stringify(productData),
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        transformRequest: [(data) => data]
      });

      toast.success(isEditing ? 'Product Updated Successfully' : 'Product Added Successfully');
      setShowCreateProductsDialog(false);
      setFormData(initialFormData);
      setIsEditing(false);
      setEditingProductId(null);
      fetchProducts();
    } catch (error) {
      console.error('Server error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while saving the product.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setEditingProductId(null);
    setShowCreateProductsDialog(false);
  };

  const getColorName = (hexValue) => {
    const colorOption = colorOptions.find(c => c.hex === hexValue);
    return colorOption ? colorOption.name : hexValue;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(i)}
          >
            {i}
          </button>
        </li>
      );
    }

    return (
      <nav aria-label="Product pagination">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {pages}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid py-4">
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/admin-dashboard">Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item active>Product</Breadcrumb.Item>
      </Breadcrumb>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Management</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateProductsDialog(true)}>
          Add New Product
        </button>
      </div>

      <div className="row g-4">
        {products.map((product) => (
          <div key={product._id} className="col-12 col-md-6 col-lg-4">
            <div className={`card h-100 ${!product.isListed ? 'border-danger' : ''}`}>
              <div className="card-img-top" style={{ height: '200px', overflow: 'hidden' }}>
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                )}
              </div>
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">{product.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1">Price: ${product.originalPrice}</p>
                    <p className="mb-1">Sale: ${product.salePrice}</p>
                    <p className="mb-0">Status: {product.isListed ? 'Listed' : 'Unlisted'}</p>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className={`btn ${product.isListed ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleList(product._id, product.isListed)}
                    >
                      {product.isListed ? 'Unlist' : 'List'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateProductsDialog && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <div className="modal-body">
                <Formik
                  initialValues={formData}
                  validationSchema={ProductSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({ errors, touched, values, setFieldValue, isSubmitting }) => (
                    <Form>
                      <div className="mb-3">
                        <label className="form-label">Product Name</label>
                        <Field
                          type="text"
                          className={`form-control ${errors.name && touched.name ? 'is-invalid' : ''}`}
                          name="name"
                        />
                        {errors.name && touched.name && (
                          <div className="invalid-feedback">{errors.name}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        <Field
                          as="select"
                          className={`form-select ${errors.category && touched.category ? 'is-invalid' : ''}`}
                          name="category"
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </Field>
                        {errors.category && touched.category && (
                          <div className="invalid-feedback">{errors.category}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <Field
                          as="textarea"
                          className={`form-control ${errors.description && touched.description ? 'is-invalid' : ''}`}
                          name="description"
                          rows="3"
                        />
                        {errors.description && touched.description && (
                          <div className="invalid-feedback">{errors.description}</div>
                        )}
                      </div>

                      <div className="row mb-3">
                        <div className="col">
                          <label className="form-label">Original Price</label>
                          <Field
                            type="number"
                            className={`form-control ${errors.originalPrice && touched.originalPrice ? 'is-invalid' : ''}`}
                            name="originalPrice"
                            min="0"
                            step="0.01"
                          />
                          {errors.originalPrice && touched.originalPrice && (
                            <div className="invalid-feedback">{errors.originalPrice}</div>
                          )}
                        </div>
                        <div className="col">
                          <label className="form-label">Sale Price</label>
                          <Field
                            type="number"
                            className={`form-control ${errors.salePrice && touched.salePrice ? 'is-invalid' : ''}`}
                            name="salePrice"
                            min="0"
                            step="0.01"
                          />
                          {errors.salePrice && touched.salePrice && (
                            <div className="invalid-feedback">{errors.salePrice}</div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Product Images</label>
                        <div className="row g-3">
                          {[0, 1, 2].map((index) => (
                            <div key={index} className="col-4">
                              <div className="border rounded p-2 text-center">
                                {values.images[index] ? (
                                  <div className="position-relative">
                                    <img
                                      src={values.images[index]}
                                      alt={`Product ${index + 1}`}
                                      className="img-fluid mb-2"
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                      onClick={() => {
                                        const newImages = [...values.images];
                                        newImages[index] = null;
                                        setFieldValue('images', newImages);
                                      }}
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <input
                                      type="file"
                                      id={`image-${index}`}
                                      className="d-none"
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(e, index)}
                                    />
                                    <label
                                      htmlFor={`image-${index}`}
                                      className="btn btn-outline-primary"
                                    >
                                      <Upload size={24} />
                                      <div>Upload</div>
                                    </label>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {errors.images && touched.images && (
                          <div className="text-danger mt-2">{errors.images}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label d-flex justify-content-between align-items-center">
                          Variants
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              const newVariants = [...values.variants, { size: 'M', color: '#000000', stock: 0 }];
                              setFieldValue('variants', newVariants);
                            }}
                          >
                            <Plus size={16} /> Add Variant
                          </button>
                        </label>
                        {values.variants.map((variant, index) => (
                          <div key={index} className="card mb-2">
                            <div className="card-body">
                              <div className="row g-3">
                                <div className="col">
                                  <Field
                                    as="select"
                                    className={`form-select ${errors.variants?.[index]?.size && touched.variants?.[index]?.size ? 'is-invalid' : ''
                                      }`}
                                    name={`variants.${index}.size`}
                                  >
                                    {sizes.map(size => (
                                      <option key={size} value={size}>{size}</option>
                                    ))}
                                  </Field>
                                  {errors.variants?.[index]?.size && touched.variants?.[index]?.size && (
                                    <div className="invalid-feedback">{errors.variants[index].size}</div>
                                  )}
                                </div>
                                <div className="col">
                                  <Field
                                    as="select"
                                    className={`form-select ${errors.variants?.[index]?.color && touched.variants?.[index]?.color ? 'is-invalid' : ''
                                      }`}
                                    name={`variants.${index}.color`}
                                  >
                                    {colorOptions.map(color => (
                                      <option
                                        key={color.name}
                                        value={color.hex}
                                        style={{
                                          backgroundColor: color.hex,
                                          color: ['White', 'Yellow'].includes(color.name) ? 'black' : 'white'
                                        }}
                                      >
                                        {color.name}
                                      </option>
                                    ))}
                                  </Field>
                                  {errors.variants?.[index]?.color && touched.variants?.[index]?.color && (
                                    <div className="invalid-feedback">{errors.variants[index].color}</div>
                                  )}
                                </div>
                                <div className="col">
                                  <Field
                                    type="number"
                                    className={`form-control ${errors.variants?.[index]?.stock && touched.variants?.[index]?.stock ? 'is-invalid' : ''
                                      }`}
                                    name={`variants.${index}.stock`}
                                    min="0"
                                    placeholder="Stock"
                                  />
                                  {errors.variants?.[index]?.stock && touched.variants?.[index]?.stock && (
                                    <div className="invalid-feedback">{errors.variants[index].stock}</div>
                                  )}
                                </div>
                                {values.variants.length > 1 && (
                                  <div className="col-auto">
                                    <button
                                      type="button"
                                      className="btn btn-danger"
                                      onClick={() => {
                                        const newVariants = values.variants.filter((_, i) => i !== index);
                                        setFieldValue('variants', newVariants);
                                      }}
                                    >
                                      <Trash size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {errors.variants && touched.variants && (
                          <div className="text-danger">{errors.variants}</div>
                        )}
                      </div>

                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                          {isEditing ? 'Update Product' : 'Add Product'}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateProductsDialog && <div className="modal-backdrop show"></div>}

      {imageSrc && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crop Image</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setImageSrc(null);
                    setSelectedImageIndex(null);
                    setCroppedAreaPixels(null);
                    setZoom(1);
                    setCrop({ x: 0, y: 0 });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div style={{ position: 'relative', height: '400px' }}>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="mt-2">
                  <label>Zoom</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="form-range"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setImageSrc(null);
                    setSelectedImageIndex(null);
                    setCroppedAreaPixels(null);
                    setZoom(1);
                    setCrop({ x: 0, y: 0 });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCropComplete}
                >
                  Crop & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Product;
