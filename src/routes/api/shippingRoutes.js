const express = require('express');
const { generateDelhiveryShipment } = require('../../controllers/api/shippingController');
const authenticate = require('../../middlewares/authenticate');
const router = express.Router();

router.post('/generate-shipment/:orderId', generateDelhiveryShipment);

module.exports = router;
