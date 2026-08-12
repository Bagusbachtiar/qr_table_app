const express = require('express');
require('dotenv').config();
const app = express();

const { handleWebhook } = require('./controllers/webhook.controller');
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
const { protect } = require('./middleware/auth.middleware');
const menuRoutes = require('./routes/menu.routes');
app.use('/api/menu', menuRoutes);
app.use(express.static('public'));
const orderRoutes = require('./routes/order.routes');
app.use('/api/orders', orderRoutes);


app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/api/admin/test', protect ,(req, res) => {
    res.json({message: 'You are authenticated', user: req.user });
});

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(3000, () => {
    console.log('server running on http://localhost:3000');
});