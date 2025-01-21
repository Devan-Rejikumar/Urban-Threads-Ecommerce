import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../redux/slices/cartSlice';
import { Link } from 'react-router-dom';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';

const MiniCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalAmount, totalQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const handleRemoveItem = (productId, selectedSize) => {
    dispatch(removeFromCart({ productId, selectedSize }));
  };

  const handleQuantityChange = (productId, selectedSize, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    const item = items.find(item => item.productId === productId);
    if (item && newQuantity >= 1 && newQuantity <= item.stock && newQuantity <= item.maxPerPerson) {
      dispatch(updateQuantity({ productId, selectedSize, quantity: newQuantity }));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-2 hover:bg-gray-100 bg-white rounded-full"
      >
        <ShoppingCart className="text-black" />
        {totalQuantity > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {totalQuantity}
          </span>
        )}BAG
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white shadow-xl rounded-lg z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Shopping Cart ({totalQuantity})</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-auto">
            {items.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Your cart is empty
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 py-2">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity, -1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity, 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.totalPrice}</p>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">₹{totalAmount}</span>
              </div>
              <Link
                to="/cart"
                className="block w-full bg-black text-white text-center py-2 rounded-lg hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                View Cart
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MiniCart;