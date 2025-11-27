import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddBookPage = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [cover_image_url, setCoverImageUrl] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in as an admin to add a book.');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/books', 
                { title, author, description, price: parseFloat(price), cover_image_url },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert('Book added successfully!');
            navigate('/catalog');
        } catch (error) {
            alert('Error adding book. You might not have admin rights.');
        }
    };

    return (
        <div className="form-container">
            <h1>Add a New Book</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                <div className="form-group"><label>Author</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required /></div>
                <div className="form-group"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                <div className="form-group"><label>Price</label><input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
                <div className="form-group"><label>Cover Image URL</label><input type="text" value={cover_image_url} onChange={(e) => setCoverImageUrl(e.target.value)} /></div>
                <button type="submit" className="submit-btn">Add Book</button>
            </form>
        </div>
    );
};

export default AddBookPage;