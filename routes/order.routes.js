const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { createOrder, getOrders} = require('../controllers/order.controller');

router.get('/', protect, getOrders);
router.post('/', createOrder);

module.exports = router;