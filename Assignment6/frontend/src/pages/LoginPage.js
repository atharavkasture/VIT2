import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });
            
            // 1. Store token and role in browser's local storage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role); 
            
            // 2. Call the function passed from App.js to update the main state
            onLoginSuccess(response.data.role); 
            
            alert(response.data.message);
            navigate('/catalog'); // Redirect to catalog after login
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    return (
        <div className="form-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="submit-btn">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;