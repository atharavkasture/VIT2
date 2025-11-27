import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="container"><h2>Loading your orders...</h2></div>;
    }

    if (orders.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center' }}>
                <h2>My Orders</h2>
                <p>You haven't purchased any books yet.</p>
                <Link to="/catalog" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '10px 20px' }}>
                    Browse Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="container">
            <h2>My Orders</h2>
            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <h3>Order #{order.id}</h3>
                            <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                            <strong>Total: ${parseFloat(order.total).toFixed(2)}</strong>
                        </div>
                        <div className="order-items">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item">
                                    <img src={item.cover_image_url || 'https://via.placeholder.com/80x120.png?text=No+Image'} alt={item.title} />
                                    <div className="item-details">
                                        <h4>{item.title}</h4>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Price: ${parseFloat(item.price).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrdersPage;