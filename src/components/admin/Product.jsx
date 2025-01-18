import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Trash, Upload, X, Edit2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cropper from 'react-easy-crop';
import './Product.css';
import AdminBreadcrumbs from '../../pages/admin/Product-Management/AdminBreadcrumbs';
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

const Product = () => {
  const [showCreateProductsDialog, setShowCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [cropState, setCropState] = useState({
    currentImageIndex: null,
    imageToCrop: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedAreaPixels: null
  });

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
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        withCredentials: true
      });
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    }
  };


  const handleEdit = (product) => {
    setIsEditing(true);
    setEditingProductId(product._id);

    const formattedVariants = product.variants.map(variant => ({
      size: variant.size || 'M',
      color: variant.color || '#000000', 
      stock: variant.stock || 0
    }));

    setFormData({
      name: product.name || '',
      category: product.category._id || '',
      description: product.description || '',
      originalPrice: product.originalPrice || '',
      salePrice: product.salePrice || '',
      images: product.images ? [...product.images] : [null, null, null],
      variants: formattedVariants,
      isListed: product.isListed
    });
    setShowCreateProductsDialog(true);
  };

  const handleToggleList = async (productId, currentStatus) => {
    console.log('Attempting to toggle product:', productId);
    
    try {
      
      const url = `http://localhost:5000/api/products/${productId}`;
      console.log('Making request to:', url);
      
      const response = await axios.patch(
        url,
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
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        productId: productId
      });
      
      toast.error('Failed to update product status');
      
     
      if (error.response?.status === 404) {
        console.log('Product not found, refreshing list...');
        fetchProducts();
      }
    }
  };
           
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropState({
          currentImageIndex: index,
          imageToCrop: reader.result,
          crop: { x: 0, y: 0 },
          zoom: 1
        });
      };
      reader.readAsDataURL(file);
    }
  };

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

  const removeVariant = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];

    if(field === 'color' && !value){
      value = '#000000'
    }
    updatedVariants[index][field] = field === 'stock' ? Number(value) : value;
    setFormData(prev => ({
      ...prev,
      variants: updatedVariants
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {

      if (!formData.variants || formData.variants.length === 0) {
        toast.error('At least one variant is required');
        return;
      }
  

      const formDataToSend = new FormData();
      

      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('originalPrice', formData.originalPrice);
      formDataToSend.append('salePrice', formData.salePrice);
      formDataToSend.append('isListed', formData.isListed);
  
      
      const sanitizedVariants = formData.variants.map(variant => ({
        size: String(variant.size || 'M'),
        color: String(variant.color || '#000000'),
        stock: Number(variant.stock || 0)
      }));
      
  
      formDataToSend.append('variants', JSON.stringify(sanitizedVariants));
  
     
      const processedImages = [];
      for (const image of formData.images) {
        if (image) {
          if (image.startsWith('data:image')) {
   
            processedImages.push(image);
          } else {
    
            processedImages.push(image);
          }
        }
      }
      

      processedImages.forEach((image) => {
        formDataToSend.append('images', image);
      });
  
      
      const url = isEditing 
        ? `http://localhost:5000/api/products/${editingProductId}`
        : 'http://localhost:5000/api/products';
        
      const response = await axios({
        method: isEditing ? 'put' : 'post',
        url: url,
        data: formDataToSend,
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
  
   
      toast.success(isEditing ? 'Product Updated Successfully' : 'Product Added Successfully');
      setShowCreateProductsDialog(false);
      setFormData(initialFormData);
      setIsEditing(false);
      setEditingProductId(null);
      fetchProducts();
    } catch (error) {
      console.error('Product Operation Error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Error processing product');
    }
  };
  

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCropState(prev => ({
      ...prev,
      croppedAreaPixels
    }));
  }, []);

  const handleCropConfirm = async () => {
    if (cropState.croppedAreaPixels && cropState.imageToCrop) {
      try {
        const croppedImageUrl = await getCroppedImg(
          cropState.imageToCrop,
          cropState.croppedAreaPixels
        );

        const updatedImages = [...formData.images];
        updatedImages[cropState.currentImageIndex] = croppedImageUrl;
        
        setFormData(prev => ({
          ...prev,
          images: updatedImages
        }));

        setCropState({
          currentImageIndex: null,
          imageToCrop: null,
          crop: { x: 0, y: 0 },
          zoom: 1,
          croppedAreaPixels: null
        });
      } catch (error) {
        toast.error('Failed to crop image');
        console.error(error);
      }
    }
  };

 
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    await new Promise((resolve) => {
      image.onload = resolve;
    });

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

    return canvas.toDataURL('image/jpeg');
  };

  return (
    <div className="product-container">
      <AdminBreadcrumbs />  
      <div className="product-header">
        <h2>Product Management</h2>
        <button 
          className="btn-primary" 
          onClick={() => {
            setIsEditing(false);
            setEditingProductId(null);
            setFormData(initialFormData);
            setShowCreateProductsDialog(true);
          }}
        >
          Add New Product
        </button>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className={`product-card ${!product.isListed ? 'unlisted' : ''}`}>
            <div className="product-image">
              {product.images[0] && (
                <img src={product.images[0]} alt={product.name} />
              )}
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
             
              <p>Orginal Price: ${product.originalPrice}</p>
              <p>Sale Price :${product.salePrice}</p>
              <p>Status: {product.isListed ? 'Listed' : 'Unlisted'}</p>
              <div className="variant-info">
                <p>Available Sizes: {product.variants.map(v => v.size).join(', ')}</p>
              </div>
            </div>
            <div className="product-actions">
              <button
                className="edit-button"
                onClick={() => handleEdit(product)}
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                className={`toggle-list-button ${product.isListed ? 'unlist' : 'list'}`}
                onClick={() => handleToggleList(product._id, product.isListed)}
              >
                {product.isListed ? 'Unlist' : 'List'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateProductsDialog && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
              <button 
                className="close-button" 
                onClick={() => {
                  setShowCreateProductsDialog(false);
                  setIsEditing(false);
                  setEditingProductId(null);
                  setFormData(initialFormData);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
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

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="originalPrice">Original Price</label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="salePrice">Sale Price</label>
                <input
                  type="number"
                  id="salePrice"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Product Images</label>
                <div className="image-upload-container">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="image-upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        id={`image-upload-${index}`}
                        onChange={(e) => handleImageUpload(index, e)}
                        className="image-input"
                      />
                      <label 
                        htmlFor={`image-upload-${index}`} 
                        className={`upload-label ${formData.images[index] ? 'has-image' : ''}`}
                      >
                        {formData.images[index] ? (
                          <>
                            <img 
                              src={formData.images[index]} 
                              alt={`Product Preview ${index + 1}`} 
                              className="image-preview" 
                            />
                            <button type="button" className="remove-image" onClick={() => removeImage(index)}>
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <div className="upload-placeholder">
                            <Upload size={24} />
                            <span>Upload Image</span>
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Variants</label>
                {formData.variants.map((variant, index) => (
                  <div key={index} className="variant-row">
                    <div className="variant-field">
                      <label htmlFor={`size-${index}`}>Size</label>
                      <select
                        id={`size-${index}`}
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      >
                        {sizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="variant-field">
                      <label htmlFor={`color-${index}`}>Color</label>
                      <input
                        type="color"
                        id={`color-${index}`}
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      />
                    </div>
                    <div className="variant-field">
                      <label htmlFor={`stock-${index}`}>Stock</label>
                      <input
                        type="number"
                        id={`stock-${index}`}
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        min="0"
                      />
                    </div>
                    {formData.variants.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-variant" 
                        onClick={() => removeVariant(index)}
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-variant" onClick={addVariant}>
                  <Plus size={16} /> Add Variant
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Update Product' : 'Add Product'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowCreateProductsDialog(false);
                    setIsEditing(false);
                    setEditingProductId(null);
                    setFormData(initialFormData);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cropState.imageToCrop && (
        <div className="crop-modal">
          <div className="crop-container">
            <div className="crop-header">
              <h3>Adjust Image</h3>
              <button 
                className="close-button"
                onClick={() => setCropState({
                  currentImageIndex: null,
                  imageToCrop: null,
                  crop: { x: 0, y: 0 },
                  zoom: 1,
                  croppedAreaPixels: null
                })}
              >
                ×
              </button>
            </div>
            <div className="cropper-wrapper">
              <Cropper
                image={cropState.imageToCrop}
                crop={cropState.crop}
                zoom={cropState.zoom}
                aspect={1}
                onCropChange={(crop) => setCropState(prev => ({ ...prev, crop }))}
                onCropComplete={onCropComplete}
                onZoomChange={(zoom) => setCropState(prev => ({ ...prev, zoom }))}
              />
            </div>
            <div className="crop-controls">
              <div className="zoom-control">
                <label>Zoom</label>
                <input 
                  type="range"
                  value={cropState.zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setCropState(prev => ({ 
                    ...prev, 
                    zoom: Number(e.target.value) 
                  }))}
                />
              </div>
              <div className="crop-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setCropState({
                    currentImageIndex: null,
                    imageToCrop: null,
                    crop: { x: 0, y: 0 },
                    zoom: 1,
                    croppedAreaPixels: null
                  })}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-primary save-crop-btn"
                  onClick={handleCropConfirm}
                >
                  Save Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Product;