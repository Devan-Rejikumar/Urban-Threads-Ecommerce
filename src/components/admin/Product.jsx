// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { Plus, Trash, Upload, X, Edit2 } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Cropper from 'react-easy-crop';
// import './Product.css';
// import AdminBreadcrumbs from '../../pages/admin/Product-Management/AdminBreadcrumbs';
// const initialFormData = {
//   name: '',
//   category: '',
//   description: '',
//   originalPrice: '',
//   salePrice: '',
//   images: [null, null, null],
//   variants: [{ size: 'M', color: '#000000', stock: 0 }],
//   isListed: true
// };

// const Product = () => {
//   const [showCreateProductsDialog, setShowCreateProductsDialog] = useState(false);
//   const [formData, setFormData] = useState(initialFormData);
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingProductId, setEditingProductId] = useState(null);
//   const [cropState, setCropState] = useState({
//     currentImageIndex: null,
//     imageToCrop: null,
//     crop: { x: 0, y: 0 },
//     zoom: 1,
//     croppedAreaPixels: null
//   });

//   const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/products/categories', {
//         withCredentials: true
//       });
//       if (response.status === 200) {
//         setCategories(response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       toast.error('Failed to load categories');
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/products', {
//         withCredentials: true
//       });
//       if (response.status === 200) {
//         setProducts(response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       toast.error('Failed to load products');
//       setProducts([]);
//     }
//   };


//   const handleEdit = (product) => {
//     setIsEditing(true);
//     setEditingProductId(product._id);

//     const formattedVariants = product.variants.map(variant => ({
//       size: variant.size || 'M',
//       color: variant.color || '#000000', 
//       stock: variant.stock || 0
//     }));

//     setFormData({
//       name: product.name || '',
//       category: product.category._id || '',
//       description: product.description || '',
//       originalPrice: product.originalPrice || '',
//       salePrice: product.salePrice || '',
//       images: product.images ? [...product.images] : [null, null, null],
//       variants: formattedVariants,
//       isListed: product.isListed
//     });
//     setShowCreateProductsDialog(true);
//   };

//   const handleToggleList = async (productId, currentStatus) => {
//     console.log('Attempting to toggle product:', productId);
    
//     try {
      
//       const url = `http://localhost:5000/api/products/${productId}`;
//       console.log('Making request to:', url);
      
//       const response = await axios.patch(
//         url,
//         { isListed: !currentStatus },
//         { withCredentials: true }
//       );
  
//       if (response.status === 200) {
//         setProducts(prevProducts => 
//           prevProducts.map(product => 
//             product._id === productId 
//               ? { ...product, isListed: !currentStatus }
//               : product
//           )
//         );
        
//         toast.success(`Product ${currentStatus ? 'unlisted' : 'listed'} successfully`);
//       }
//     } catch (error) {
//       console.error('Error details:', {
//         status: error.response?.status,
//         message: error.response?.data?.message,
//         productId: productId
//       });
      
//       toast.error('Failed to update product status');
      
     
//       if (error.response?.status === 404) {
//         console.log('Product not found, refreshing list...');
//         fetchProducts();
//       }
//     }
//   };
           
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleImageUpload = (index, e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setCropState({
//           currentImageIndex: index,
//           imageToCrop: reader.result,
//           crop: { x: 0, y: 0 },
//           zoom: 1
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeImage = (index) => {
//     const updatedImages = [...formData.images];
//     updatedImages[index] = null;
//     setFormData(prev => ({
//       ...prev,
//       images: updatedImages
//     }));
//   };


//   const addVariant = () => {
//     setFormData(prev => ({
//       ...prev,
//       variants: [...prev.variants, { size: 'M', color: '#000000', stock: 0 }]
//     }));
//   };

//   const removeVariant = (indexToRemove) => {
//     setFormData(prev => ({
//       ...prev,
//       variants: prev.variants.filter((_, index) => index !== indexToRemove)
//     }));
//   };

//   const handleVariantChange = (index, field, value) => {
//     const updatedVariants = [...formData.variants];

//     if(field === 'color' && !value){
//       value = '#000000'
//     }
//     updatedVariants[index][field] = field === 'stock' ? Number(value) : value;
//     setFormData(prev => ({
//       ...prev,
//       variants: updatedVariants
//     }));
//   };

//   const onSubmit = async (event) => {
//     event.preventDefault();
//     try {

//       if (!formData.variants || formData.variants.length === 0) {
//         toast.error('At least one variant is required');
//         return;
//       }
  

//       const formDataToSend = new FormData();
      

//       formDataToSend.append('name', formData.name);
//       formDataToSend.append('category', formData.category);
//       formDataToSend.append('description', formData.description);
//       formDataToSend.append('originalPrice', formData.originalPrice);
//       formDataToSend.append('salePrice', formData.salePrice);
//       formDataToSend.append('isListed', formData.isListed);
  
      
//       const sanitizedVariants = formData.variants.map(variant => ({
//         size: String(variant.size || 'M'),
//         color: String(variant.color || '#000000'),
//         stock: Number(variant.stock || 0)
//       }));
      
  
//       formDataToSend.append('variants', JSON.stringify(sanitizedVariants));
  
     
//       const processedImages = [];
//       for (const image of formData.images) {
//         if (image) {
//           if (image.startsWith('data:image')) {
   
//             processedImages.push(image);
//           } else {
    
//             processedImages.push(image);
//           }
//         }
//       }
      

//       processedImages.forEach((image) => {
//         formDataToSend.append('images', image);
//       });
  
      
//       const url = isEditing 
//         ? `http://localhost:5000/api/products/${editingProductId}`
//         : 'http://localhost:5000/api/products';
        
//       const response = await axios({
//         method: isEditing ? 'put' : 'post',
//         url: url,
//         data: formDataToSend,
//         headers: { 'Content-Type': 'multipart/form-data' },
//         withCredentials: true
//       });
  
   
//       toast.success(isEditing ? 'Product Updated Successfully' : 'Product Added Successfully');
//       setShowCreateProductsDialog(false);
//       setFormData(initialFormData);
//       setIsEditing(false);
//       setEditingProductId(null);
//       fetchProducts();
//     } catch (error) {
//       console.error('Product Operation Error:', error.response?.data || error);
//       toast.error(error.response?.data?.message || 'Error processing product');
//     }
//   };
  

//   const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//     setCropState(prev => ({
//       ...prev,
//       croppedAreaPixels
//     }));
//   }, []);

//   const handleCropConfirm = async () => {
//     if (cropState.croppedAreaPixels && cropState.imageToCrop) {
//       try {
//         const croppedImageUrl = await getCroppedImg(
//           cropState.imageToCrop,
//           cropState.croppedAreaPixels
//         );

//         const updatedImages = [...formData.images];
//         updatedImages[cropState.currentImageIndex] = croppedImageUrl;
        
//         setFormData(prev => ({
//           ...prev,
//           images: updatedImages
//         }));

//         setCropState({
//           currentImageIndex: null,
//           imageToCrop: null,
//           crop: { x: 0, y: 0 },
//           zoom: 1,
//           croppedAreaPixels: null
//         });
//       } catch (error) {
//         toast.error('Failed to crop image');
//         console.error(error);
//       }
//     }
//   };

 
//   const getCroppedImg = async (imageSrc, pixelCrop) => {
//     const image = new Image();
//     image.src = imageSrc;
    
//     const canvas = document.createElement('canvas');
//     canvas.width = pixelCrop.width;
//     canvas.height = pixelCrop.height;
//     const ctx = canvas.getContext('2d');

//     await new Promise((resolve) => {
//       image.onload = resolve;
//     });

//     ctx.drawImage(
//       image,
//       pixelCrop.x,
//       pixelCrop.y,
//       pixelCrop.width,
//       pixelCrop.height,
//       0,
//       0,
//       pixelCrop.width,
//       pixelCrop.height
//     );

//     return canvas.toDataURL('image/jpeg');
//   };

//   return (
//     <div className="product-container">
//       <AdminBreadcrumbs />  
//       <div className="product-header">
//         <h2>Product Management</h2>
//         <button 
//           className="btn-primary" 
//           onClick={() => {
//             setIsEditing(false);
//             setEditingProductId(null);
//             setFormData(initialFormData);
//             setShowCreateProductsDialog(true);
//           }}
//         >
//           Add New Product
//         </button>
//       </div>

//       <div className="products-grid">
//         {products.map((product) => (
//           <div key={product._id} className={`product-card ${!product.isListed ? 'unlisted' : ''}`}>
//             <div className="product-image">
//               {product.images[0] && (
//                 <img src={product.images[0]} alt={product.name} />
//               )}
//             </div>
//             <div className="product-info">
//               <h3>{product.name}</h3>
//               <p>{product.description}</p>
             
//               <p>Orginal Price: ${product.originalPrice}</p>
//               <p>Sale Price :${product.salePrice}</p>
//               <p>Status: {product.isListed ? 'Listed' : 'Unlisted'}</p>
//               <div className="variant-info">
//                 <p>Available Sizes: {product.variants.map(v => v.size).join(', ')}</p>
//               </div>
//             </div>
//             <div className="product-actions">
//               <button
//                 className="edit-button"
//                 onClick={() => handleEdit(product)}
//               >
//                 <Edit2 size={16} />
//                 Edit
//               </button>
//               <button
//                 className={`toggle-list-button ${product.isListed ? 'unlist' : 'list'}`}
//                 onClick={() => handleToggleList(product._id, product.isListed)}
//               >
//                 {product.isListed ? 'Unlist' : 'List'}
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {showCreateProductsDialog && (
//         <div className="modal">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
//               <button 
//                 className="close-button" 
//                 onClick={() => {
//                   setShowCreateProductsDialog(false);
//                   setIsEditing(false);
//                   setEditingProductId(null);
//                   setFormData(initialFormData);
//                 }}
//               >
//                 ×
//               </button>
//             </div>
//             <form onSubmit={onSubmit}>
//               <div className="form-group">
//                 <label htmlFor="name">Product Name</label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label htmlFor="category">Category</label>
//                 <select
//                   id="category"
//                   name="category"
//                   value={formData.category}
//                   onChange={handleInputChange}
//                   required
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map((cat) => (
//                     <option key={cat._id} value={cat._id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label htmlFor="description">Description</label>
//                 <textarea
//                   id="description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="originalPrice">Original Price</label>
//                 <input
//                   type="number"
//                   id="originalPrice"
//                   name="originalPrice"
//                   value={formData.originalPrice}
//                   onChange={handleInputChange}
//                   min="0"
//                   step="0.01"
//                   required
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="salePrice">Sale Price</label>
//                 <input
//                   type="number"
//                   id="salePrice"
//                   name="salePrice"
//                   value={formData.salePrice}
//                   onChange={handleInputChange}
//                   min="0"
//                   step="0.01"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Product Images</label>
//                 <div className="image-upload-container">
//                   {[0, 1, 2].map((index) => (
//                     <div key={index} className="image-upload-box">
//                       <input
//                         type="file"
//                         accept="image/*"
//                         id={`image-upload-${index}`}
//                         onChange={(e) => handleImageUpload(index, e)}
//                         className="image-input"
//                       />
//                       <label 
//                         htmlFor={`image-upload-${index}`} 
//                         className={`upload-label ${formData.images[index] ? 'has-image' : ''}`}
//                       >
//                         {formData.images[index] ? (
//                           <>
//                             <img 
//                               src={formData.images[index]} 
//                               alt={`Product Preview ${index + 1}`} 
//                               className="image-preview" 
//                             />
//                             <button type="button" className="remove-image" onClick={() => removeImage(index)}>
//                               <X size={16} />
//                             </button>
//                           </>
//                         ) : (
//                           <div className="upload-placeholder">
//                             <Upload size={24} />
//                             <span>Upload Image</span>
//                           </div>
//                         )}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>Variants</label>
//                 {formData.variants.map((variant, index) => (
//                   <div key={index} className="variant-row">
//                     <div className="variant-field">
//                       <label htmlFor={`size-${index}`}>Size</label>
//                       <select
//                         id={`size-${index}`}
//                         value={variant.size}
//                         onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
//                       >
//                         {sizes.map(size => (
//                           <option key={size} value={size}>{size}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="variant-field">
//                       <label htmlFor={`color-${index}`}>Color</label>
//                       <input
//                         type="color"
//                         id={`color-${index}`}
//                         value={variant.color}
//                         onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
//                       />
//                     </div>
//                     <div className="variant-field">
//                       <label htmlFor={`stock-${index}`}>Stock</label>
//                       <input
//                         type="number"
//                         id={`stock-${index}`}
//                         value={variant.stock}
//                         onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
//                         min="0"
//                       />
//                     </div>
//                     {formData.variants.length > 1 && (
//                       <button 
//                         type="button" 
//                         className="remove-variant" 
//                         onClick={() => removeVariant(index)}
//                       >
//                         <Trash size={16} />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <button type="button" className="add-variant" onClick={addVariant}>
//                   <Plus size={16} /> Add Variant
//                 </button>
//               </div>

//               <div className="form-actions">
//                 <button type="submit" className="btn-primary">
//                   {isEditing ? 'Update Product' : 'Add Product'}
//                 </button>
//                 <button 
//                   type="button" 
//                   className="btn-secondary" 
//                   onClick={() => {
//                     setShowCreateProductsDialog(false);
//                     setIsEditing(false);
//                     setEditingProductId(null);
//                     setFormData(initialFormData);
//                   }}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {cropState.imageToCrop && (
//         <div className="crop-modal">
//           <div className="crop-container">
//             <div className="crop-header">
//               <h3>Adjust Image</h3>
//               <button 
//                 className="close-button"
//                 onClick={() => setCropState({
//                   currentImageIndex: null,
//                   imageToCrop: null,
//                   crop: { x: 0, y: 0 },
//                   zoom: 1,
//                   croppedAreaPixels: null
//                 })}
//               >
//                 ×
//               </button>
//             </div>
//             <div className="cropper-wrapper">
//               <Cropper
//                 image={cropState.imageToCrop}
//                 crop={cropState.crop}
//                 zoom={cropState.zoom}
//                 aspect={1}
//                 onCropChange={(crop) => setCropState(prev => ({ ...prev, crop }))}
//                 onCropComplete={onCropComplete}
//                 onZoomChange={(zoom) => setCropState(prev => ({ ...prev, zoom }))}
//               />
//             </div>
//             <div className="crop-controls">
//               <div className="zoom-control">
//                 <label>Zoom</label>
//                 <input 
//                   type="range"
//                   value={cropState.zoom}
//                   min={1}
//                   max={3}
//                   step={0.1}
//                   onChange={(e) => setCropState(prev => ({ 
//                     ...prev, 
//                     zoom: Number(e.target.value) 
//                   }))}
//                 />
//               </div>
//               <div className="crop-actions">
//                 <button 
//                   type="button" 
//                   className="btn-secondary"
//                   onClick={() => setCropState({
//                     currentImageIndex: null,
//                     imageToCrop: null,
//                     crop: { x: 0, y: 0 },
//                     zoom: 1,
//                     croppedAreaPixels: null
//                   })}
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="button" 
//                   className="btn-primary save-crop-btn"
//                   onClick={handleCropConfirm}
//                 >
//                   Save Image
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       <ToastContainer />
//     </div>
//   );
// };

// export default Product;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash, Upload, X, Edit2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Product.css';

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

const Product = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
        color: v.color || 'Black',
        stock: v.stock || 0
      })),
      isListed: product.isListed
    });
    setShowModal(true);
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

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedImages = [...formData.images];
        updatedImages[index] = reader.result;
        setFormData(prev => ({
          ...prev,
          images: updatedImages
        }));
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
      variants: [...prev.variants, { size: 'M', color: 'Black', stock: 0 }]
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
      Object.keys(formData).forEach(key => {
        if (key === 'variants') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'images') {
          formData[key].forEach(image => {
            if (image) formDataToSend.append('images', image);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
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

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? 'Product Updated Successfully' : 'Product Added Successfully');
        setShowModal(false);
        setFormData(initialFormData);
        setIsEditing(false);
        setEditingProductId(null);
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing product');
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setEditingProductId(null);
    setShowModal(false);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Management</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add New Product
        </button>
      </div>

      {/* Products Grid */}
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

      {/* Add/Edit Product Modal */}
      {showModal && (
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
                                  onChange={(e) => handleImageUpload(index, e)}
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
                    value={variant.color}
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

      {showModal && <div className="modal-backdrop show"></div>}
      <ToastContainer />
    </div>
  );
};

export default Product;
