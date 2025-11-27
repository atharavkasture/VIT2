const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, isAdmin } = require('./middleware'); // Make sure middleware.js is in the same folder

const app = express();

// --- Middleware Setup ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON request bodies

// --- Database Connection ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: 'Atharavbro@123', 
    database: 'bookstore_db'
}).promise();

// Middleware to pass the database connection object to our route handlers via the request object
app.use((req, res, next) => {
    req.db = db;
    next();
});

// --- API Routes ---

// 1. User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Check if user already exists
        const [userExists] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists!' });
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Insert new user into DB
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// 2. User Login (Returns role)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const user = users[0];
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Create JWT token with user ID and role
        const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret_key', { expiresIn: '1h' });
        res.json({ token, role: user.role, message: 'Logged in successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// 3. Get All Books (Public)
app.get('/api/books', async (req, res) => {
    try {
        const [books] = await db.query('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// 4. Add a new book (Admin Only)
app.post('/api/books', [authenticateToken, isAdmin], async (req, res) => {
    try {
        const { title, author, description, price, cover_image_url } = req.body;
        await db.query(
            'INSERT INTO books (title, author, description, price, cover_image_url) VALUES (?, ?, ?, ?, ?)',
            [title, author, description, price, cover_image_url]
        );
        res.status(201).json({ message: 'Book added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// 5. Create a new order (Logged-in Users)
app.post('/api/orders', authenticateToken, async (req, res) => {
    const { items, totalPrice } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Order must contain items.' });
    }

    try {
        // Start a transaction
        await db.beginTransaction();

        // Step 1: Create an entry in the 'orders' table
        const [orderResult] = await db.query(
            'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
            [userId, totalPrice]
        );
        const orderId = orderResult.insertId;

        // Step 2: Create entries in the 'order_items' table for each book
        const orderItemsPromises = items.map(item => {
            return db.query(
                'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.book_id, item.quantity, item.price]
            );
        });
        await Promise.all(orderItemsPromises);
        
        // If all queries were successful, commit the transaction
        await db.commit();

        res.status(201).json({ message: 'Order placed successfully!', orderId: orderId });
    } catch (error) {
        // If any query fails, roll back the transaction
        await db.rollback();
        console.error("Order placement error:", error);
        res.status(500).json({ message: 'Server error during order placement.', error });
    }
});

// --- NEW ROUTE: Get orders for the logged-in user ---
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // SQL query to get all order items for a user, joined with book details
        const query = `
            SELECT 
                o.id AS orderId,
                o.order_date,
                o.total_price AS orderTotal,
                b.title,
                b.cover_image_url,
                oi.quantity,
                oi.price AS itemPrice
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN books b ON oi.book_id = b.id
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC;
        `;

        const [rows] = await db.query(query, [userId]);

        if (rows.length === 0) {
            return res.json([]);
        }

        // Group the items by orderId to structure the data nicely for the frontend
        const orders = {};
        rows.forEach(row => {
            if (!orders[row.orderId]) {
                orders[row.orderId] = {
                    id: row.orderId,
                    date: row.order_date,
                    total: row.orderTotal,
                    items: []
                };
            }
            orders[row.orderId].items.push({
                title: row.title,
                cover_image_url: row.cover_image_url,
                quantity: row.quantity,
                price: row.itemPrice
            });
        });

        // Convert the orders object back to an array
        res.json(Object.values(orders));

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
});


// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
