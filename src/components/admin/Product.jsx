
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash, Upload, X, Edit2, Crop } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Product.css';
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
  variants: [{ size: 'M', color: 'Black', stock: 0 }],
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

// Image Cropper Modal Component
const ImageCropperModal = ({ imageUrl, onClose, onSave }) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    aspect: 1
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = React.useRef(null);

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
      }, 'image/jpeg', 1);
    });
  };

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    try {
      const croppedImageBase64 = await getCroppedImg(imgRef.current, completedCrop);
      onSave(croppedImageBase64);
    } catch (e) {
      console.error('Error cropping image:', e);
      toast.error('Failed to crop image');
    }
  };

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Crop Image</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Crop me"
                  style={{ maxHeight: '500px', maxWidth: '100%' }}
                />
              </ReactCrop>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!completedCrop?.width || !completedCrop?.height}
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
};

const Product = () => {
  const [showCreateProductsDialog, setShowCreateProductsDialog] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [currentFormik, setCurrentFormik] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage]);

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
      const response = await axios.get(
        `http://localhost:5000/api/products/admin/products?page=${currentPage}&limit=${itemsPerPage}`,
        { withCredentials: true }
      );
      
      if (response.data) {
        setProducts(response.data.products);
        setTotalProducts(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditingProductId(product._id);
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

  const handleImageUpload = (e, index, setFieldValue) => {
    const file = e.target.files[0];
    
    try {
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setCropImage(event.target.result);
        setSelectedImageIndex(index);
        setCurrentFormik({ setFieldValue });
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error uploading image: ' + error.message);
    }
  };

  const handleCroppedImage = (croppedImageUrl) => {
    if (!selectedImageIndex === null || !currentFormik) return;
    
    const { setFieldValue } = currentFormik;
    setFieldValue(`images[${selectedImageIndex}]`, croppedImageUrl);
    
    setShowCropper(false);
    setCropImage(null);
    setSelectedImageIndex(null);
    setCurrentFormik(null);
    
    toast.success('Image cropped successfully');
  };

  const handleCloseCropper = () => {
    setShowCropper(false);
    setCropImage(null);
    setSelectedImageIndex(null);
    setCurrentFormik(null);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setShowCreateProductsDialog(false);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (!values) {
        throw new Error('Form data is missing');
      }

      // Filter out null images and ensure proper base64 format
      const validImages = values.images.filter(img => img !== null).map(img => {
        // If the image is already a URL (for editing), return as is
        if (img.startsWith('http')) return img;
        
        // Ensure proper base64 format
        if (!img.startsWith('data:image/')) {
          throw new Error('Invalid image format');
        }
        return img;
      });

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
        images: validImages
      };

      const url = isEditing
        ? `http://localhost:5000/api/products/${editingProductId}`
        : 'http://localhost:5000/api/products';

      const response = await axios({
        method: isEditing ? 'put' : 'post',
        url: url,
        data: productData,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      toast.success(isEditing ? 'Product Updated Successfully' : 'Product Added Successfully');
      setShowCreateProductsDialog(false);
      setIsEditing(false);
      setEditingProductId(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Server error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while saving the product.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
      const delta = 1;
      const range = [];
      const rangeWithDots = [];
      let l;

      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 ||
          i === totalPages ||
          (i >= currentPage - delta && i <= currentPage + delta)
        ) {
          range.push(i);
        }
      }

      range.forEach(i => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      });

      return rangeWithDots;
    };

    return (
      <nav aria-label="Product pagination" className="d-flex justify-content-center mt-4">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous 
            </button>
          </li>

          {getPageNumbers().map((pageNumber, index) => (
            <li
              key={index}
              className={`page-item ${pageNumber === currentPage ? 'active' : ''} ${pageNumber === '...' ? 'disabled' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => pageNumber !== '...' && onPageChange(pageNumber)}
                disabled={pageNumber === '...'}
              >
                {pageNumber}
              </button>
            </li>
          ))}

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
                {product.images && product.images[0] && (
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
                    {product.salePrice && <p className="mb-1">Sale: ${product.salePrice}</p>}
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

      {products.length === 0 && (
        <div className="alert alert-info mt-4">
          No products found. Add your first product using the "Add New Product" button.
        </div>
      )}
      

      {showCreateProductsDialog && (
        <Formik
          initialValues={isEditing 
            ? products.find(p => p._id === editingProductId) 
              ? {
                  name: products.find(p => p._id === editingProductId).name || '',
                  category: products.find(p => p._id === editingProductId).category._id || '',
                  description: products.find(p => p._id === editingProductId).description || '',
                  originalPrice: products.find(p => p._id === editingProductId).originalPrice || '',
                  salePrice: products.find(p => p._id === editingProductId).salePrice || '',
                  images: [...(products.find(p => p._id === editingProductId).images || []), null, null, null].slice(0, 3),
                  variants: products.find(p => p._id === editingProductId).variants.map(v => ({
                    size: v.size || 'M',
                    color: v.color || 'Black',
                    stock: v.stock || 0
                  })),
                  isListed: products.find(p => p._id === editingProductId).isListed
                }
              : initialFormData
            : initialFormData
          }
          validationSchema={ProductSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <>
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

                        {/* Images Section */}
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
                                        style={{ maxHeight: '150px' }}
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
                                        onChange={(e) => handleImageUpload(e, index, setFieldValue)}
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

                        {/* Variants Section */}
                        <div className="mb-3">
                          <label className="form-label d-flex justify-content-between align-items-center">
                            Variants
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setFieldValue('variants', [...values.variants, { size: 'M', color: '#000000', stock: 0 }]);
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
                                      className={`form-select ${errors.variants?.[index]?.size && touched.variants?.[index]?.size ? 'is-invalid' : ''}`}
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
                                      className={`form-select ${errors.variants?.[index]?.color && touched.variants?.[index]?.color ? 'is-invalid' : ''}`}
                                      name={`variants.${index}.color`}
                                    >
                                      {colorOptions.map(color => (
                                        <option
                                          key={color.name}
                                          value={color.name}
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
                                      className={`form-control ${errors.variants?.[index]?.stock && touched.variants?.[index]?.stock ? 'is-invalid' : ''}`}
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
                                          setFieldValue(
                                            'variants',
                                            values.variants.filter((_, i) => i !== index)
                                          );
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
                          {errors.variants && typeof errors.variants === 'string' && (
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
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop show"></div>
            </>
          )}
        </Formik>
      )}

      {/* Image Cropper Modal */}
      {showCropper && cropImage && (
        <ImageCropperModal
          imageUrl={cropImage}
          onClose={handleCloseCropper}
          onSave={handleCroppedImage}
        />
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