import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CatalogPage = () => {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // ... (keep the existing useEffect to fetch books)
        const fetchBooks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/books');
                setBooks(response.data);
            } catch (error) {
                console.error("Error fetching books:", error);
            }
        };
        fetchBooks();
    }, []);

    const handlePurchase = async (book) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to purchase a book.');
            navigate('/login');
            return;
        }

        const orderDetails = {
            items: [{ book_id: book.id, quantity: 1, price: book.price }],
            totalPrice: book.price
        };

        try {
            const response = await axios.post('http://localhost:5000/api/orders', orderDetails, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert(`Purchase successful! Your order ID is ${response.data.orderId}`);
        } catch (error) {
            alert('There was an error processing your purchase.');
            console.error(error);
        }
    };

    return (
        <div className="container">
            <h1>Book Catalog</h1>
            <div className="catalog-grid">
                {books.map((book) => (
                    <div key={book.id} className="book-card">
                        <img src={book.cover_image_url || 'https://via.placeholder.com/250x300.png?text=No+Image'} alt={book.title} />
                        <h3>{book.title}</h3>
                        <p>by {book.author}</p>
                        <p>${book.price}</p>
                        <button className="submit-btn" style={{width: '80%', margin: '0 auto'}} onClick={() => handlePurchase(book)}>
                            Purchase
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CatalogPage;