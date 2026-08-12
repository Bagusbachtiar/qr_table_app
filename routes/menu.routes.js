const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { createMenuItem, getMenuItems, updateMenuItem, deleteMenuItem } = require('../controllers/menu.controller');

router.post('/', protect, createMenuItem);
router.get('/', getMenuItems);
router.patch('/:id', protect, updateMenuItem);
router.delete('/:id', protect, deleteMenuItem);

module.exports = router;