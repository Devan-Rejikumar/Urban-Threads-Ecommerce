import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Plus, Trash, Upload, X, Edit2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Product.css';
import Cropper from 'react-easy-crop';

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

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

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
   
    // if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    //   throw new Error('Invalid image format. Please upload a valid image.');
    // }

    // // Check file size (max 5MB)
    // const base64String = dataUrl.split(',')[1];
    // const fileSize = (base64String.length * 3) / 4; // Approximate size in bytes
    // if (fileSize > 5 * 1024 * 1024) {
    //   throw new Error('Image size must be less than 5MB');
    // }

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


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    
    try {
      if (!formData) {
        throw new Error('Form data is missing');
      }
  
      const variants = Array.isArray(formData.variants) 
        ? formData.variants 
        : [{ size: 'M', color: '#000000', stock: 0 }];
  
      // Filter out null/invalid images and validate the remaining ones
      const images = [];
      if (Array.isArray(formData.images)) {
        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i];
          try {
            if (image && validateImage(image)) {
              images.push(image);
            }
          } catch (error) {
            throw new Error(`Image ${i + 1}: ${error.message}`);
          }
        }
      }
  

      if (images.length === 0) {
        throw new Error('At least one valid image is required');
      }
  
     
      if (!formData.name.trim()) throw new Error('Product name is required');
      if (!formData.category) throw new Error('Category is required');
      if (!formData.originalPrice) throw new Error('Original price is required');
  
      const productData = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description || '',
      originalPrice: Number(formData.originalPrice),
      salePrice: formData.salePrice ? Number(formData.salePrice) : null,
      isListed: Boolean(formData.isListed),
      variants: formData.variants.map(variant => ({
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

  return (
    <div className="container-fluid py-4">
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
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
  <label className="form-label">Category</label>
  <select
    className="form-select"
    name="category"
    value={formData.category}
    onChange={handleInputChange}
    required
  >
    <option value="">Select Category</option>
    {categories.map((cat) => (
      <option key={cat._id} value={cat._id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Original Price</label>
                      <input
                        type="number"
                        className="form-control"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Sale Price</label>
                      <input
                        type="number"
                        className="form-control"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Product Images</label>
                    <div className="row g-3">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="col-4">
                          <div className="border rounded p-2 text-center">
                            {formData.images[index] ? (
                              <div className="position-relative">
                                <img
                                  src={formData.images[index]}
                                  alt={`Product ${index + 1}`}
                                  className="img-fluid mb-2"
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                  onClick={() => removeImage(index)}
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
                  </div>
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
                  <div className="mb-3">
                    <label className="form-label d-flex justify-content-between align-items-center">
                      Variants
                      <button type="button" className="btn btn-sm btn-primary" onClick={addVariant}>
                        <Plus size={16} /> Add Variant
                      </button>
                    </label>
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="card mb-2">
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col">
                              <select
                                className="form-select"
                                value={variant.size}
                                onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                              >
                                {sizes.map(size => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col">
                              <select
                                className="form-select"
                                value={getColorName(variant.color)}
                                onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
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
                              </select>
                            </div>
                            <div className="col">
                              <input
                                type="number"
                                className="form-control"
                                value={variant.stock}
                                onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                min="0"
                                placeholder="Stock"
                              />
                            </div>
                            {formData.variants.length > 1 && (
                              <div className="col-auto">
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => removeVariant(index)}
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isEditing ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateProductsDialog && <div className="modal-backdrop show"></div>}
      <ToastContainer />
    </div>
  );
};

export default Product;
