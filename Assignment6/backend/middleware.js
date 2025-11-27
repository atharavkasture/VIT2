const jwt = require('jsonwebtoken');


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
        if (err) return res.sendStatus(403); // if token is no longer valid
        req.user = user;
        next(); // move on to the next middleware or the route handler
    });
}


async function isAdmin(req, res, next) {
    const db = req.db; // We will pass the db connection via req
    const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
    
    if (rows.length > 0 && rows[0].role === 'admin') {
        next();
    } else {
        res.status(403).send('Access denied. Admins only.');
    }
}

module.exports = { authenticateToken, isAdmin };