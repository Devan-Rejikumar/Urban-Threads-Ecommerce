import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Swal from 'sweetalert2';
import {Breadcrumb} from 'react-bootstrap';

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
                withCredentials: true,
            });
            if(response.status === 200) {
                setOffers(response.data.offers);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            toast.error('Failed to fetch offers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, offerName) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `You are about to delete the offer "${offerName}". This action cannot be undone!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await axiosInstance.delete(`/admin/offers/${id}`);
                
                await Swal.fire({
                    title: 'Deleted!',
                    text: `Offer "${offerName}" has been deleted successfully.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                fetchOffers();
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete the offer. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3085d6'
            });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mt-4">
            <Breadcrumb className="mt-3">
                <Breadcrumb.Item href="/admin-dashboard">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item active>Offers</Breadcrumb.Item>
            </Breadcrumb>
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
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => navigate(`edit/${offer._id}`)}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(offer._id, offer.name)}
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