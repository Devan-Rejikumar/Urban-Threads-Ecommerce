import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Trash, Upload, X, Plus } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { toast } from 'react-toastify';

const EditProduct = ({ product, onClose, onUpdate, categories }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    description: product.description,
    originalPrice: product.originalPrice,
    salePrice: product.salePrice || '',
    images: product.images.length ? product.images : [null, null, null],
    variants: product.variants.length ? product.variants : [{ size: 'M', color: '#000000', stock: 0 }]
  });

  const [cropState, setCropState] = useState({
    currentImageIndex: null,
    imageToCrop: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedAreaPixels: null
  });

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropState(prev => ({
        ...prev,
        currentImageIndex: index,
        imageToCrop: reader.result,
        crop: { x: 0, y: 0 },
        zoom: 1
      }));
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCropState(prev => ({
      ...prev,
      croppedAreaPixels
    }));
  }, []);

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
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

    return canvas.toDataURL('image/jpeg');
  };

  const createImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.src = url;
  });

  const handleCropConfirm = async () => {
    if (cropState.croppedAreaPixels) {
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
        toast.error('Cropping failed');
        console.error(error);
      }
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
    updatedVariants[index][field] = field === 'stock' ? Number(value) : value;
    setFormData(prev => ({
      ...prev,
      variants: updatedVariants
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (key === 'variants') {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            value.forEach((v, index) => {
              if (v) formDataToSend.append(`${key}[${index}]`, v);
            });
          }
        } else {
          formDataToSend.append(key, value);
        }
      });

      const result = await axios.put(
        `http://localhost:5000/api/products/${product._id}`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      toast.success('Product Updated Successfully');
      onUpdate(result.data);
      onClose();
    } catch (error) {
      toast.error('Error Updating Product');
      console.error("Update Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Product</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
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
              Update Product
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>

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
                  onChange={(e) => setCropState(prev => ({ ...prev, zoom: Number(e.target.value) }))}
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
    </div>
  );
};

export default EditProduct;
