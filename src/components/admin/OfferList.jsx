import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const OfferList = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/offers', {
                withCredentials : true,
             
            });
            if(response.status === 200){
                console.log("rrrrrrrrrrrrrr",response)
            setOffers(response.data.offers);
            console.log('jjjjjjjjjjjjjjjjjjjjjj',response.data.offers)
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            toast.error('Failed to fetch offers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this offer?')) return;
        
        try {
            await axiosInstance.delete(`/admin/offers/${id}`);
            toast.success('Offer deleted');
            fetchOffers();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Offers</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate('create')}
                >
                    <Plus size={18} /> New Offer
                </button>
            </div>

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Discount</th>
                           
                            {/* <th>Status</th> */}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offers.map(offer => (
                            <tr key={offer._id}>
                                <td>{offer.name}</td>
                                <td>{offer.applicableType}</td>
                                <td>
                                    {offer.discountValue}
                                    {offer.discountType === 'percentage' ? '%' : ''}
                                </td>
{/*                             
                                <td>
                                    <span className={`badge ${offer.isActive ? 'bg-success' : 'bg-danger'}`}>
                                        {offer.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td> */}
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => navigate(`edit/${offer._id}`)}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(offer._id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OfferList;