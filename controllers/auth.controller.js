require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const {username, password} = req.body;

    if (username !== process.env.ADMIN_USERNAME) {
        return res.status(401).json({ error: 'Invalid credentials'});
    }
    
    const passwordMatches = bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH);
    
    if (!passwordMatches) {
        return res.status(401).json({ error: 'invalid credentials' });
    }

    const token = jwt.sign(
        { username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token });
};

module.exports = { login };