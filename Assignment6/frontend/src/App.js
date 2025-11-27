import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/CatalogPage';
import AddBookPage from './pages/AddBookPage';
import MyOrdersPage from './pages/MyOrdersPage'; // <-- Import the new page
import './App.css';

function App() {
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

    useEffect(() => {
        const handleStorageChange = () => setUserRole(localStorage.getItem('userRole'));
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setUserRole(null);
    };

    return (
        <Router>
            <div>
                <nav className="navbar">
                    <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>BookStore</Link>
                    <div className="nav-links">
                        <Link to="/">Home</Link>
                        <Link to="/catalog">Catalog</Link>
                        
                        {userRole === 'admin' && <Link to="/add-book">Add Book</Link>}
                        
                        {!userRole ? (
                            <>
                                <Link to="/login">Login</Link>
                                <Link to="/register">Register</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/my-orders">My Orders</Link> {/* <-- Add new link here */}
                                <Link to="/login" onClick={handleLogout}>Logout</Link>
                            </>
                        )}
                    </div>
                </nav>

                <main className="container">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/login" element={<LoginPage onLoginSuccess={setUserRole} />} />
                        <Route path="/catalog" element={<CatalogPage />} />
                        
                        {/* Protected routes for logged-in users */}
                        {userRole && <Route path="/my-orders" element={<MyOrdersPage />} />} {/* <-- Add new route here */}
                        {userRole === 'admin' && <Route path="/add-book" element={<AddBookPage />} />}
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;