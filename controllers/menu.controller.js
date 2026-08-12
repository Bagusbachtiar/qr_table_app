const pool = require('../config/db');


const createMenuItem = async (req, res) => {
    const { name, price, description, category, available } = req.body;

    if (!name || !price ){
    return res.status(400).json({ error: 'Name and price are required'});
    }

    const result = await pool.query(
        'INSERT INTO menu_items (name, price, description, category, available) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, price, description, category, available]
    );

    res.status(201).json(result.rows[0]);
};

const getMenuItems = async (req, res) => {
    const result = await pool.query('SELECT * FROM menu_items WHERE available = true');
    res.json(result.rows);
};

const updateMenuItem = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, category, available } = req.body;

    const result = await pool.query(
    `UPDATE menu_items SET
      name = COALESCE($1, name),
      price = COALESCE($2, price),
      description = COALESCE($3, description),
      category = COALESCE($4, category),
      available = COALESCE($5, available)
     WHERE id = $6
     RETURNING *`,
     [name, price, description, category, available, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Menu item not found'});
    }

    res.json(result.rows[0]);
};

const deleteMenuItem = async (req, res) => {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Menu item not found'});
    };

    res.json({ message: 'Menu Item Deleted '});
}

module.exports = { createMenuItem, getMenuItems, updateMenuItem, deleteMenuItem };