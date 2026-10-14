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
    try {
        // We use a LEFT JOIN to ensure that orders that might somehow have no items are still listed.
        const query = `
            SELECT 
                o.*, 
                oi.menu_item_id, 
                oi.quantity, 
                oi.price AS item_price, 
                m.name AS item_name
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu_items m ON oi.menu_item_id = m.id
            ORDER BY o.created_at DESC;
        `;

        const result = await pool.query(query);

        // Structure the flat array of results into grouped order objects
        const ordersMap = new Map();

        for (const row of result.rows) {
            const orderId = row.id;

            if (!ordersMap.has(orderId)) {
                // Initialize a new order object if we haven't seen this ID yet
                ordersMap.set(orderId, {
                    ...row,
                    items: [] // Initialize an empty array for line items
                });
            }

            // Add the item details to the correct order object
            if (row.menu_item_id) {
                 ordersMap.get(orderId).items.push({
                    menuItemId: row.menu_item_id,
                    quantity: row.quantity,
                    price: row.item_price,
                    name: row.item_name
                });
            }
        }

        // Convert the Map values back into a standard array and send it
        const orders = Array.from(ordersMap.values());
        res.json(orders);

    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: 'Failed to retrieve orders.' });
    }
};


module.exports = { createOrder, getOrders };