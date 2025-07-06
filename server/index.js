const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: 'rzp_test_cuYR9RNqmpSXaE',
  key_secret: 'MjdWG86eDb6feQRzQJ9UhDGB'
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Simple GET route for testing Orders endpoint
app.get('/orders', (req, res) => {
  res.json({ message: 'Orders endpoint is working! Use POST to create orders.' });
});

// Orders endpoint
app.post('/orders', async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount. Amount must be greater than 0.' });
    }

    const options = {
      amount: amount, // in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    };

    console.log('Creating Razorpay order with options:', options);

    const order = await razorpay.orders.create(options);

    console.log('Order created successfully:', order);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Payments listing
app.get('/payments', async (req, res) => {
  try {
    const payments = await razorpay.payments.all();
    res.json(payments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ message: 'Failed to fetch payments', error: err });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test the server: curl http://localhost:${PORT}/test`);
});
