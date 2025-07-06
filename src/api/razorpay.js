// api/razorpay.js
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_SECRET

})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' })
  }

  const { amount } = req.body

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' })
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    })

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })
  } catch (err) {
    return res.status(500).json({ message: 'Razorpay Error', error: err.message })
  }
}
