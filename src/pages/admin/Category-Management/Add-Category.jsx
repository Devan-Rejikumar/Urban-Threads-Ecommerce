
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddCategory = ({ onSave, onCancel, onUpdateSuccess }) => {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create preview
      setImagePreview(URL.createObjectURL(file));

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: categoryName.trim(),
        description: description.trim(),
        image: image, // base64 string
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
     
      setTimeout(() => {
        onCancel();
      }, 2000);
        
    } catch (error) {
      console.error('Category creation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create category';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Adding category...</div>;
  }

  return (
    <div className="add-category">
      <h2>Add New Category</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="categoryName">Category Name</label>
          <input
            id="categoryName"
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Type category name here..."
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type category description here..."
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Category Image</label>
          <input
            id="image"
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="file-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img 
                src={imagePreview} 
                alt="Category preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  marginTop: '10px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }} 
              />
            </div>
          )}
        </div>
        <div className="button-group">
          <button type="submit" className="btn-submit">Submit</button>
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;