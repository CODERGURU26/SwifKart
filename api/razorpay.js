// api/razorpay.js
import Razorpay from 'razorpay';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  console.log('Razorpay API called');
  console.log('Environment check:', {
    hasKeyId: !!process.env.RAZORPAY_KEY_ID,
    hasSecret: !!process.env.RAZORPAY_SECRET,
    keyId: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set',
    secret: process.env.RAZORPAY_SECRET ? 'Set' : 'Not set'
  });

  try {
    // Check if environment variables are set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
      console.error('Missing Razorpay credentials');
      return res.status(500).json({ 
        success: false, 
        message: 'Payment configuration error - missing credentials' 
      });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const { amount } = req.body;
    
    console.log('Received amount:', amount);
    
    // Validate amount
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount provided' 
      });
    }

    // Create order options
    const options = {
      amount: Math.round(amount), // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payment_capture: 1
    };

    console.log('Creating Razorpay order with options:', options);

    // Create order
    const order = await razorpay.orders.create(options);
    
    console.log('Razorpay order created successfully:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });

  } catch (error) {
    console.error('Razorpay API Error:', error);
    
    // Handle specific Razorpay errors
    if (error.statusCode) {
      console.error('Razorpay specific error:', {
        statusCode: error.statusCode,
        error: error.error
      });
      
      return res.status(error.statusCode).json({
        success: false,
        message: error.error?.description || 'Razorpay API error',
        error: error.error
      });
    }
    
    // Handle initialization errors
    if (error.message && error.message.includes('key_id')) {
      console.error('Razorpay initialization error');
      return res.status(500).json({
        success: false,
        message: 'Payment service initialization failed'
      });
    }
    
    // Handle general errors
    console.error('General error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Payment order creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}