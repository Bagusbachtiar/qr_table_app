const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try{
        event = stripe.webhooks.constructEvent(req.body,
            sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', orderId]);
    }

    res.json({ received: true });
};

module.exports = { handleWebhook };