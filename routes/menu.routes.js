const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { createMenuItem, getMenuItems, getAdminMenuItems, updateMenuItem, deleteMenuItem } = require('../controllers/menu.controller');

router.post('/', protect, createMenuItem);
router.get('/', getMenuItems);
router.patch('/:id', protect, updateMenuItem);
router.delete('/:id', protect, deleteMenuItem);
router.get('/admin', protect, getAdminMenuItems);

module.exports = router;