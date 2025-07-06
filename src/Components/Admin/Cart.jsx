import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout2 from "../Home/Layout2"

import { onAuthStateChanged, getAuth } from "firebase/auth"
import firebaseAppConfig from "../../../util/firebase-config"
import { getFirestore, getDocs, collection, query, where, doc, deleteDoc, addDoc } from "firebase/firestore"
import Swal from "sweetalert2"
import axios from "axios"
const db = getFirestore(firebaseAppConfig)

const auth = getAuth(firebaseAppConfig)
const Cart = () => {
    const [products, setProducts] = useState([])
    const [updateUI, setUpdateUI] = useState(false)
    const [session, setSession] = useState(null)
    const [address, setAddress] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setSession(user)
            }
            else {
                setSession(null)
            }
        })
    }, [])

    useEffect(() => {
        const req = async () => {
            if (session) {
                const col = collection(db, 'carts')
                const q = query(col, where('userId', '==', session.uid))
                const snapshot = await getDocs(q)
                const temp = []
                snapshot.forEach((docs) => {
                    const document = docs.data()
                    document.cartId = docs.id
                    temp.push(document)
                })
                setProducts(temp)
            }
        }
        req()
    }, [session, updateUI])

    useEffect(() => {
        const fetchAddress = async () => {
            if (session) {
                const q = query(collection(db, 'addresses'), where('userId', '==', session.uid));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setAddress(snapshot.docs[0].data());
                }
            }
        };
        fetchAddress();
    }, [session]);

    const getTotalPrice = (products) => {
        console.log(products)

        let sum = 0
        for (let item of products) {
            let amount = item.price - (item.price * item.discount) / 100
            sum += amount
        }
        return sum
    }

    const removeCart = async (id) => {
        const ref = doc(db, 'carts', id)
        await deleteDoc(ref)
        setUpdateUI(!updateUI)
    }

    const buyNow = async () => {
        if (!session) {
            Swal.fire({
                icon: 'warning',
                title: 'Please login first',
                text: 'You need to be logged in to make a purchase.'
            })
            return
        }

        // Validate product data
        if (!products.length || products.some(p => !p.price || p.price <= 0)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Product',
                text: 'One or more products have invalid prices.'
            });
            return;
        }

        // Create a copy to avoid mutating the original product
        const orderProduct = { ...products }


        const amount = getTotalPrice(products)

        // Validate amount
        if (amount <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Amount',
                text: 'Order amount must be greater than zero.'
            })
            return
        }

        try {
            // Show loading state
            Swal.fire({
                title: 'Processing...',
                text: 'Creating payment order',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            console.log('Creating order for amount:', amount)

            // First test if server is reachable
            try {
                await axios.get('/api/razorpay', { timeout: 5000 });
            } catch (testErr) {
                throw new Error('Server is not reachable. Please make sure your backend server is running on port 8080.');
            }

            const res = await axios.post('/api/razorpay', {
                amount: Math.round(amount * 100) // Convert to paise
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // 10 second timeout
            });

            console.log('Order created successfully:', res.data)
            Swal.close() // Close loading dialog

            const options = {
                key: "rzp_test_cuYR9RNqmpSXaE", // Test key from Razorpay dashboard
                amount: res.data.amount,        // Amount in paise
                currency: res.data.currency || "INR",
                name: "SwiftKart",
                description: `${products.length}` || 'Product Purchase',
                order_id: res.data.orderId,     // Must match exactly with order.id from backend
                handler: async function (response) {
                    try {
                        console.log("Payment success", response);

                        // Prepare order data
                        for (let item of products) {
                            const orderData = {
                                ...item,
                                email: session.email || 'N/A',
                                customerName: session.displayName || session.email?.split('@')[0] || 'N/A',
                                address: address || { Mobile: 'N/A' },
                                date: new Date(), // Use Firebase Timestamp format
                                orderId: response.razorpay_order_id || 'N/A',
                                paymentId: response.razorpay_payment_id || 'N/A',
                                price: amount, // Final calculated price
                                userId: session.uid,
                                status: 'pending'
                            };
                            await addDoc(collection(db, 'orders'), orderData);
                        }


                        // Save order to database


                        Swal.fire({
                            icon: "success",
                            title: "Payment Successful!",
                            text: `Payment ID: ${response.razorpay_payment_id}`,
                            timer: 3000,
                            showConfirmButton: false
                        });


                        navigate('/Profile');
                    } catch (saveError) {
                        console.error('Error saving order:', saveError);
                        Swal.fire({
                            icon: 'error',
                            title: 'Order Save Failed',
                            text: 'Payment was successful but failed to save order details.'
                        });
                    }
                },
                notes: {
                    name: session.displayName || session.email
                },
                prefill: {
                    email: session?.email || "customer@example.com",
                    contact: address?.Mobile || session?.phoneNumber || "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            console.log('Razorpay options:', options); // Debug log

            // Check if Razorpay is loaded
            if (!window.Razorpay) {
                throw new Error('Razorpay SDK not loaded. Please check your internet connection.');
            }

            const razor = new window.Razorpay(options);
            razor.open();

            razor.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Failed',
                    text: response.error.description || 'Payment could not be processed.'
                });
                navigate('/Failed');
            });

        } catch (err) {
            Swal.close() // Close loading dialog if open
            console.error('Payment error:', err);

            let errorMessage = 'Something went wrong with the payment.'
            let errorTitle = 'Payment Failed'

            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                errorTitle = 'Server Connection Failed'
                errorMessage = 'Unable to connect to payment server. Please check if the server is running.'
            } else if (err.code === 'ECONNABORTED') {
                errorTitle = 'Request Timeout'
                errorMessage = 'The request took too long. Please try again.'
            } else if (err.response) {
                errorMessage = err.response.data?.message || `Server error: ${err.response.status}`
            } else if (err.message) {
                errorMessage = err.message
            }

            Swal.fire({
                icon: 'error',
                title: errorTitle,
                text: errorMessage,
                footer: `<small>Error details: ${err.message}</small>`
            });

            navigate('/Failed');
        }
    };

    return (
        <>
            <Layout2 update={updateUI}>
                <div className="md:my-16 md:w-7/12 mx-auto bg-white p-8 shadow-lg">
                    <div className="flex items-center gap-2">
                        <i className="ri-shopping-cart-fill text-4xl font-bold"></i>
                        <h1 className="text-4xl font-bold ">Cart</h1>
                    </div>
                    <hr className="py-6" />
                    <div>
                        {
                            products.map((item, index) => {
                                return (
                                    <div key={index} className="flex gap-10">
                                        <img src={item.image} className="w-[110px]" />
                                        <div className="space-x-2" >
                                            <h1 className="text-lg font-semibold">{item.title}</h1>
                                            <label >₹{item.price - (item.price * item.discount / 100)}</label>
                                            <del>
                                                <label >₹{item.price}</label>
                                            </del>
                                            <label className="text-gray-600">({item.discount} % Off)</label>
                                            <button className=" bg-red-600 text-white p-2 font-semibold rounded-[10px] flex my-4"
                                                onClick={() => removeCart(item.cartId)}
                                            >
                                                <i className="ri-delete-bin-5-line mr-2"></i>
                                                Remove</button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <hr className="my-6" />
                    <div className="flex justify-between items-center">
                        <h1 className="font-bold text-2xl mb-4">Total : ₹{getTotalPrice(products).toLocaleString()}</h1>
                        {
                            (products.length >0) &&
                            <button className="bg-green-600 text-white font-semibold rounded-[10px] p-2"
                                onClick={() => buyNow()}
                            >
                                <i className="ri-shopping-bag-fill mr-2"></i>
                                Buy Now
                            </button>

                        }

                    </div>
                </div>
            </Layout2>

        </>
    )
}
export default Cart