import React, { useEffect, useState } from "react"
import Layout2 from "./Layout2"
import img from './sliderImages/a.jpg'
import img2 from './sliderImages/b.jpg'
import img3 from './sliderImages/c.jpg'
import img4 from './sliderImages/d.jpg'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import firebaseAppConfig from "../../../util/firebase-config"
import { getFirestore, addDoc, collection, getDocs, query, where } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { onAuthStateChanged, getAuth } from "firebase/auth"
import axios from 'axios';

const db = getFirestore(firebaseAppConfig)
const auth = getAuth(firebaseAppConfig)

const Home = ({ Slider }) => {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [productsLoading, setProductsLoading] = useState(true)
    const [address, setAddress] = useState(null)
    const [updateUI, setUpdateUI] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setSession(user)
            }
            else {
                setSession(null)
            }
            setLoading(false)
        })

        return () => unsubscribe() // Cleanup subscription
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setProductsLoading(true)
                const snapshot = await getDocs(collection(db, 'products'))
                const temp = []
                snapshot.forEach((docs) => {
                    const allProducts = docs.data()
                    allProducts.id = docs.id
                    temp.push(allProducts)
                })
                setProducts(temp)
            } catch (err) {
                console.error('Error fetching products:', err)
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to load products',
                    text: 'Please refresh the page to try again.'
                })
            } finally {
                setProductsLoading(false)
            }
        }
        fetchProducts()
    }, [])

    useEffect(() => {
        const fetchAddress = async () => {
            if (session) {
                try {
                    const col = collection(db, 'addresses')
                    const q = query(col, where('userId', '==', session.uid))
                    const snapshot = await getDocs(q)

                    if (!snapshot.empty) {
                        snapshot.forEach((docs) => {
                            const document = docs.data()
                            setAddress(document)
                            console.log('Address found:', document)
                        })
                    } else {
                        console.log('No address found for user')
                        setAddress(null)
                    }
                } catch (error) {
                    console.error('Error fetching address:', error)
                    setAddress(null)
                }
            }
        }
        fetchAddress()
    }, [session])

    const addToCart = async (item) => {
        if (!session) {
            Swal.fire({
                icon: 'warning',
                title: 'Please login first',
                text: 'You need to be logged in to add items to cart.'
            })
            return
        }

        try {
            const cartItem = { ...item, userId: session.uid }
            await addDoc(collection(db, 'carts'), cartItem)
            setUpdateUI(!updateUI)
            Swal.fire({
                icon: 'success',
                title: 'Product Added to Cart!',
                timer: 2000,
                showConfirmButton: false
            })
        }
        catch (err) {
            console.error('Add to cart error:', err)
            Swal.fire({
                icon: 'error',
                title: 'OOPS! Something Went Wrong',
                text: err.message
            })
        }
    }

    const buyNow = async (product) => {
        if (!session) {
            Swal.fire({
                icon: 'warning',
                title: 'Please login first',
                text: 'You need to be logged in to make a purchase.'
            })
            return
        }

        // Validate product data
        if (!product.price || product.price <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Product',
                text: 'Product price is not valid.'
            })
            return
        }

        // Create a copy to avoid mutating the original product
        const orderProduct = { ...product }
        orderProduct.userId = session.uid
        orderProduct.status = 'pending'

        const amount = Math.max(0, orderProduct.price - (orderProduct.price * (orderProduct.discount || 0)) / 100)

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

            const col = collection(db, 'addresses')
            const q = query(col, where('userId', '==', session.uid))
            const snapshot = await getDocs(q)
            if (snapshot.empty) {
                new Swal({
                    icon: 'info',
                    title: 'Please Update Your Address For Accessing Payment Features !'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/Profile')
                    }
                })
                return false
            }
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
                await axios.get('https://swiftkart-is1rll31a-gururaj-krishna-sharmas-projects.vercel.app/api/razorpay'
                    , { timeout: 5000 });
            } catch (testErr) {
                throw new Error('Server is not reachable. Please make sure your backend server is running on port 8080.');
            }

            const res = await axios.post('https://swiftkart-is1rll31a-gururaj-krishna-sharmas-projects.vercel.app/api/razorpay', {
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
                description: orderProduct.title || 'Product Purchase',
                order_id: res.data.orderId,     // Must match exactly with order.id from backend
                handler: async function (response) {
                    try {
                        console.log("Payment success", response);

                        // Prepare order data
                        const orderData = {
                            ...orderProduct,
                            email: session.email || 'N/A',
                            customerName: session.displayName || session.email?.split('@')[0] || 'N/A',
                            address: address || { Mobile: 'N/A' },
                            date: new Date(), // Use Firebase Timestamp format
                            orderId: response.razorpay_order_id || 'N/A',
                            paymentId: response.razorpay_payment_id || 'N/A',
                            price: amount // Final calculated price
                        };

                        // Save order to database
                        await addDoc(collection(db, 'orders'), orderData);

                        Swal.fire({
                            icon: "success",
                            title: "Payment Successful!",
                            text: `Payment ID: ${response.razorpay_payment_id}`,
                            timer: 3000,
                            showConfirmButton: false
                        });

                        console.log('Order saved:', orderData);
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

    const calculateDiscountedPrice = (price, discount = 0) => {
        if (!price || price < 0) return 0;
        if (!discount || discount < 0) return price;
        return Math.max(0, price - (price * discount) / 100);
    }

    if (loading) {
        return (
            <Layout2>
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl">Loading...</div>
                </div>
            </Layout2>
        )
    }

    return (
        <>
            <Layout2 update={updateUI}>
                <div>
                    {
                        Slider &&
                        <header>
                            <Swiper
                                className="z-[-1]"
                                navigation={true}
                                modules={[Navigation]}
                                slidesPerView={1}
                                loop={true}
                                autoplay={{
                                    delay: 3000,
                                    disableOnInteraction: false,
                                }}
                            >
                                <SwiperSlide className="w-full">
                                    <img src={img} className="w-full h-[300px] object-cover rounded-lg" alt="Slider image 1" />
                                </SwiperSlide>
                                <SwiperSlide className="w-full">
                                    <img src={img2} className="w-full h-[300px] object-cover rounded-lg" alt="Slider image 2" />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <img src={img3} className="w-full h-[300px] object-cover rounded-lg" alt="Slider image 3" />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <img src={img4} className="w-full h-[300px] object-cover rounded-lg" alt="Slider image 4" />
                                </SwiperSlide>
                            </Swiper>
                        </header>
                    }

                    <div className="p-16">
                        <h1 className="text-3xl text-center font-bold">Latest Products</h1>
                        <p className="text-center text-sm w-6/12 mx-auto mt-2 mb-6">
                            The latest trending products include the Apple Vision Pro,
                            a cutting-edge mixed-reality headset for immersive AR/VR experiences,
                            and the Samsung Galaxy S24 Ultra,
                            featuring AI-powered enhancements and a stunning 200MP camera.
                        </p>

                        {productsLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="text-lg">Loading products...</div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No products available at the moment.
                            </div>
                        ) : (
                            <div className="p-6 w-11/12 mx-auto grid md:grid-cols-4 gap-4">
                                {products.map((item, index) => {
                                    const discountedPrice = calculateDiscountedPrice(item.price, item.discount)

                                    return (
                                        <div key={item.id || index} className="rounded-[10px] p-2 bg-white shadow-lg flex flex-col items-center">
                                            <img
                                                src={item.image}
                                                className="h-80 object-cover rounded-[10px]"
                                                alt={item.title || 'Product image'}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg'; // Add fallback image
                                                }}
                                            />
                                            <h1 className="text-xl font-semibold mt-2">{item.title || 'Untitled Product'}</h1>
                                            <p className="text-gray-600 text-center px-2">
                                                {item.description ?
                                                    (item.description.length > 45 ?
                                                        `${item.description.slice(0, 45)}...` :
                                                        item.description
                                                    ) :
                                                    'No description available'
                                                }
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <p className="font-bold">₹{discountedPrice.toFixed(2)}</p>
                                                {item.discount > 0 && (
                                                    <>
                                                        <del className="text-gray-400">₹{item.price}</del>
                                                        <p className="text-green-600">({item.discount}% OFF)</p>
                                                    </>
                                                )}
                                            </div>
                                            <button
                                                className="bg-blue-400 hover:bg-blue-500 text-white w-full p-2 font-semibold rounded-[10px] mt-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={() => buyNow(item)}
                                                disabled={!item.price || item.price <= 0}
                                            >
                                                Buy Now
                                            </button>
                                            <button
                                                className="bg-red-400 hover:bg-red-500 mt-2 text-white w-full p-2 font-semibold rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={() => addToCart(item)}
                                                disabled={!item.price || item.price <= 0}
                                            >
                                                <i className="ri-shopping-cart-2-fill mr-2"></i>
                                                Add To Cart
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Layout2>
        </>
    )
}

export default Home