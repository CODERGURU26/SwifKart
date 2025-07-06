const Razorpay = require('razorpay');

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_cuYR9RNqmpSXaE',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'MjdWG86eDb6feQRzQJ9UhDGB'
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    console.log('Received payment request:', req.body);
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        message: 'Invalid amount. Amount must be greater than 0.' 
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount), // Ensure it's an integer (paise)
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    };

    console.log('Creating Razorpay order with options:', options);

    const order = await razorpay.orders.create(options);

    console.log('Order created successfully:', order);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      success: true
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    res.status(500).json({
      message: 'Failed to create payment order',
      error: error.message,
      success: false
    });
  }
}