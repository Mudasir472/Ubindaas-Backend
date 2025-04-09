const axios = require('axios');
const Order = require('../../models/Order');

const generateDelhiveryShipment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('customer');
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        // Structure the shipment exactly as expected by Delhivery
        const shipmentData = {
            pickup_location: {
                name: "U Bindass"
            },
            shipments: [{
                return_name: "U Bindass",
                return_pin: "190001", 
                return_city: "Srinagar", 
                return_phone: "6006189840", 
                return_add: "Your Return Address", 
                order: order._id.toString(),
                phone: order.customer.phone || "6006189840",
                products_desc: "Clothing",
                cod_amount: order.paymentMethod === 'cod' ? order.totalAmount : "0",
                name: order.customer.name,
                country: order.shippingAddress.country || "India",
                order_date: new Date().toISOString().split('T')[0],
                pin: order.shippingAddress.pincode,
                payment_mode: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
                add: order.shippingAddress.street,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                weight: "0.5"
            }]
        };

        // Convert all values to strings as required by some APIs
        const stringifyValues = (obj) => {
            const result = {};
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    result[key] = stringifyValues(value);
                } else if (Array.isArray(value)) {
                    result[key] = value.map(item =>
                        typeof item === 'object' ? stringifyValues(item) : String(item)
                    );
                } else {
                    result[key] = String(value);
                }
            });
            return result;
        };

        const stringifiedData = stringifyValues(shipmentData);

        // URL encoded format - option 1
        const formData = new URLSearchParams();
        formData.append('format', 'json');
        formData.append('data', JSON.stringify(stringifiedData));


        const response = await axios.post(
            "https://track.delhivery.com/api/cmu/create.json",
            formData.toString(),
            {
                headers: {
                    'Authorization': `Token ${process.env.DELHIVERY_API_TOKEN}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        console.log("response", response.data);

        const waybill = response.data?.packages?.[0]?.waybill;
        console.log(waybill);

        if (waybill) {
            order.trackingInfo = {
                courier: 'Delhivery',
                trackingId: waybill,
                url: `https://www.delhivery.com/track/package/${waybill}`
            };
            order.status = 'shipped';
            await order.save();
            return res.status(200).json({ msg: 'Shipment created', trackingId: waybill });
        } else {
            return res.status(400).json({
                msg: 'Error in waybill',
                response: response.data
            });
        }
    } catch (error) {
        console.error('Delhivery Error:', error?.response?.data || error.message || error);
        res.status(500).json({
            msg: 'Delhivery shipment failed',
            error: error?.response?.data || error.message
        });
    }
};
module.exports = { generateDelhiveryShipment };
