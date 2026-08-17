const crypto = require('crypto');
const pool = require('../config/db');

const handleWebhook = async (req, res) => {
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = req.body;
    
    const expectedSignature = crypto
    .createHash('sha512')
    .update(order_id + status_code + gross_amount + process.env.MIDTRANS_SERVER_KEY)
    .digest('hex');

    if (signature_key !== expectedSignature) {
        return res.status(401).json({error: 'Invalid signature' });
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
        const orderId= order_id.replace('order-', '');
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', orderId]);
    }

    res.json({ received: true });
};

module.exports = { handleWebhook };