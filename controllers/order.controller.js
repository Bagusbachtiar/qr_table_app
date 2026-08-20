const pool = require('../config/db');
const snap = require('../config/midtrans');

const createOrder = async (req, res) => {
  const { items, table_number } = req.body;

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
      'INSERT INTO orders (total, status, table_number) VALUES ($1, $2, $3) RETURNING *',
      [total, 'pending', table_number]
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

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: `order-${order.id}`,
        gross_amount: Math.round(total),
      },
    });

    res.status(201).json({ order, checkoutUrl: transaction.redirect_url });
  } catch (err) {
    console.log(err);
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