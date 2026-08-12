const pool = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createOrder = async (req, res) => {
  const { items } = req.body;

  const ids = items.map(i => i.menuItemId);
  const result = await pool.query(
    'SELECT * FROM menu_items WHERE id = ANY($1)',
    [ids]
  );
  const menuItems = result.rows;

  let total = 0;
  for (const cartItem of items) {
    const menuItem = menuItems.find(m => m.id === cartItem.menuItemId);
    if (!menuItem){
      return res.status(400).json({ error: `Menu item ${cartItem.menuItemId} not found`});
    }
    total += menuItem.price * cartItem.quantity;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      'INSERT INTO orders (total, status) VALUES ($1, $2) RETURNING *',
      [total, 'pending']
    );
    const order = orderResult.rows[0];

    for (const cartItem of items) {
      const menuItem = menuItems.find(m => m.id === cartItem.menuItemId);
      await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, menuItem.id, cartItem.quantity, menuItem.price]
      );
    }

    await client.query('COMMIT');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(cartItem => {
        const menuItem = menuItems.find(m => m.id === cartItem.menuItemId);
        return {
          price_data: {
            currency: 'usd',
            product_data: { name: menuItem.name },
            unit_amount: Math.round(menuItem.price * 100),
          },
          quantity: cartItem.quantity,
        };
      }),
      mode: 'payment',
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000/cancel.html',
      metadata: { orderId: order.id },
    })

    res.status(201).json({ order, checkoutUrl: session.url });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
};

const getOrders = async (req, res) => {
  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  res.json(result.rows);
};


module.exports = { createOrder, getOrders };