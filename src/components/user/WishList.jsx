import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromWishlist, setWishlist } from '../../redux/slices/whishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import Header from './Header';
import Footer from './Footer';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const Wishlist = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const wishlistItems = useSelector((state) => state.wishlist.items) || [];

    const fetchWishlistItems = async () => {
        try {
            const response = await axiosInstance.get('/wishlist');
            console.log('Fetched wishlist data:', response.data);
            dispatch(setWishlist(response.data));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            toast.error('Error loading wishlist items');
        }
    };

    useEffect(() => {
        fetchWishlistItems();
    }, [dispatch]);

    const handleRemoveFromWishlist = async (productId) => {
        console.log('Attempting to remove product:', productId);
        try {
            // Make the API call first
            const response = await axiosInstance.delete(`/wishlist/remove/${productId}`);
            console.log('Delete API response:', response);
    
            if (response.status === 200) {
                // First, update the Redux state immediately for optimistic UI update
                dispatch(removeFromWishlist(productId));
                
                // If the API returns an updated wishlist, use that to ensure consistency
                if (response.data.updatedWishlist) {
                    dispatch(setWishlist(response.data.updatedWishlist));
                }
                toast.success('Item removed from wishlist');
            } else {
                throw new Error('Failed to remove item');
            }
        } catch (error) {
            console.error('Error in handleRemoveFromWishlist:', error);
            toast.error('Error removing item from wishlist');
            // Optionally refresh the wishlist to ensure consistency
            fetchWishlistItems();
        }
    };

    const handleAddToCart = async (product) => {
        try {
            // Prepare the cart item data
            const cartProduct = {
                productId: product._id,
                name: product.name,
                image: product.images[0],
                price: product.salePrice || product.originalPrice,
                quantity: 1,
                selectedSize: product.variants[0]?.size || 'M',
                stock: product.variants[0]?.stock || 0,
                maxPerPerson: 5
            };
    
            // First make the API call to add to cart
            await axiosInstance.post('/cart/add', {
                productId: product._id,
                quantity: 1,
                selectedSize: cartProduct.selectedSize
            });
    
            // Then update Redux state
            dispatch(addToCart(cartProduct));
            
            // Remove from wishlist
            await handleRemoveFromWishlist(product._id);
            
            toast.success('Item added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Error adding item to cart');
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <>
            <Header />
            <div className="container py-5">
                <h1 className="mb-4 d-flex align-items-center">
                    <Heart className="me-2" />
                    My Wishlist ({wishlistItems.length} items)
                </h1>

                {wishlistItems.length === 0 ? (
                    <div className="text-center py-5">
                        <h2>Your wishlist is empty</h2>
                        <p>Add items you love to your wishlist. Review them anytime and easily move them to the cart.</p>
                        <button 
                            className="btn btn-primary mt-3"
                            onClick={() => navigate('/shop')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {wishlistItems.map((item) => (
                            <div key={item._id} className="col-md-6 col-lg-4">
                                <div className="card h-100">
                                    <div 
                                        className="position-relative cursor-pointer"
                                        onClick={() => handleProductClick(item._id)}
                                    >
                                        <img
                                            src={item.images[0]}
                                            alt={item.name}
                                            className="card-img-top"
                                            style={{ height: '300px', objectFit: 'cover' }}
                                        />
                                        <button
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFromWishlist(item._id);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">{item.name}</h5>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <span className="fs-5 fw-bold">₹{item.salePrice || item.originalPrice}</span>
                                                {item.salePrice && (
                                                    <span className="text-muted text-decoration-line-through ms-2">
                                                        ₹{item.originalPrice}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary w-100"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            <ShoppingCart size={16} className="me-2" />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Wishlist;