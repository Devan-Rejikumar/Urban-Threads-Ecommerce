import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCoupons, setLoading, setError } from '../../redux/slices/couponSlice';

const AdminCoupon = () => {
  const dispatch = useDispatch();
  const { coupons, loading } = useSelector(state => state.coupon);
  const [activeTab, setActiveTab] = useState('list');
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: '',
    minimumPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    maxUses: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, [dispatch]);

  const fetchCoupons = async () => {
    try {
      dispatch(setLoading());
      const response = await axios.get('http://localhost:5000/api/admin/coupons', { withCredentials: true });
      dispatch(setCoupons(response.data.coupons));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/coupons/${id}`, { withCredentials: true });
      fetchCoupons();
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/coupons', formData, { withCredentials: true });
      setFormData({
        code: '',
        discountType: 'percentage',
        discountAmount: '',
        minimumPurchase: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        maxUses: ''
      });
      fetchCoupons();
      setActiveTab('list');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 ${activeTab === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Coupon List
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 ${activeTab === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Create Coupon
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="grid gap-4">
          {coupons.map(coupon => (
            <div key={coupon._id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="font-bold">{coupon.code}</h3>
                <p>{coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `₹${coupon.discountAmount}`}</p>
                <p>Valid till: {new Date(coupon.endDate).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => handleDelete(coupon._id)} 
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 max-w-md">
          <input
            type="text"
            placeholder="Coupon Code"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            className="border p-2 rounded"
          />
          <select
            value={formData.discountType}
            onChange={(e) => setFormData({...formData, discountType: e.target.value})}
            className="border p-2 rounded"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input
            type="number"
            placeholder="Discount Amount"
            value={formData.discountAmount}
            onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Minimum Purchase"
            value={formData.minimumPurchase}
            onChange={(e) => setFormData({...formData, minimumPurchase: e.target.value})}
            className="border p-2 rounded"
          />
          <input
            type="date"
            placeholder="Start Date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            className="border p-2 rounded"
          />
          <input
            type="date"
            placeholder="End Date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            className="border p-2 rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Create Coupon
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminCoupon;